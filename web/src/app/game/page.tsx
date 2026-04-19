'use client';

import { useState, useReducer, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameChat from '@/components/GameChat';
import CharacterSheet from '@/components/CharacterSheet';
import DiceRoller from '@/components/DiceRoller';
import ChoiceMenu from '@/components/ChoiceMenu';
import LanguageSelector from '@/components/LanguageSelector';
import {
  GameState,
  createInitialGameState,
  gameStateReducer,
} from '@/lib/gameState';
import { sendChatMessage } from '@/lib/api';
import { loadGame, saveGame, deleteSave } from '@/lib/storage';

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameState, dispatch] = useReducer(
    gameStateReducer,
    createInitialGameState()
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [awaitingDice, setAwaitingDice] = useState(false);
  const [diceDifficulty, setDiceDifficulty] = useState<number | undefined>();

  // Load saved game if continuing
  useEffect(() => {
    const shouldContinue = searchParams.get('continue') === 'true';
    if (shouldContinue) {
      const saved = loadGame();
      if (saved) {
        dispatch({ type: 'SET_LANGUAGE', payload: saved.language });
      }
    }
  }, [searchParams]);

  // Save game periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame(gameState);
    }, 30000);
    return () => clearInterval(interval);
  }, [gameState]);

  const handleLanguageChange = (lang: 'zh' | 'en') => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  const handleChoiceSelect = useCallback(
    async (choiceId: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      dispatch({ type: 'SET_TYPING', payload: true });

      try {
        const response = await sendChatMessage({ gameState, choice: choiceId });
        dispatch({ type: 'ADD_DIALOGUE', payload: response.dialogue });
        if (response.choices) dispatch({ type: 'SET_CHOICES', payload: response.choices });
        if (response.requiresDice) {
          setAwaitingDice(true);
          setDiceDifficulty(response.diceDifficulty);
        }
        if (response.characterUpdate) dispatch({ type: 'UPDATE_CHARACTER', payload: response.characterUpdate });
        if (response.actChange) dispatch({ type: 'SET_ACT', payload: response.actChange });
      } catch {
        dispatch({
          type: 'ADD_DIALOGUE',
          payload: {
            id: Date.now().toString(),
            speaker: '系统',
            speakerEn: 'System',
            text: '连接失败，请重试...',
            textEn: 'Connection failed, please try again...',
          },
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [gameState, isProcessing]
  );

  const handleDiceRoll = useCallback(
    async (result: number) => {
      const success = diceDifficulty ? result >= diceDifficulty : true;
      dispatch({ type: 'SET_DICE_ROLL', payload: { result, success, difficulty: diceDifficulty || 0 } });
      setIsProcessing(true);

      try {
        const response = await sendChatMessage({
          gameState: { ...gameState, lastDiceRoll: { result, success, difficulty: diceDifficulty || 0 } },
        });
        dispatch({ type: 'ADD_DIALOGUE', payload: response.dialogue });
        if (response.choices) dispatch({ type: 'SET_CHOICES', payload: response.choices });
        setAwaitingDice(false);
        setDiceDifficulty(undefined);
      } catch (error) {
        console.error('Failed to send dice roll:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [gameState, diceDifficulty]
  );

  const handleTypingComplete = () => dispatch({ type: 'SET_TYPING', payload: false });
  const handleBackToMenu = () => { saveGame(gameState); router.push('/'); };
  const handleNewGame = () => { deleteSave(); window.location.reload(); };

  const texts = {
    zh: { back: '返回', newGame: '新游戏', act: '第 $ 幕', waitDice: '请掷骰子...', processing: '处理中...' },
    en: { back: 'Back', newGame: 'New Game', act: 'Act $', waitDice: 'Please roll...', processing: 'Processing...' },
  };
  const t = texts[gameState.language];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-amber-700/30 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToMenu}
            className="text-amber-400/70 hover:text-amber-400 transition-colors text-sm"
          >
            ← {t.back}
          </button>
          <span className="text-amber-700/50">|</span>
          <span className="text-amber-300">
            {t.act.replace('$', gameState.currentAct.toString())}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidePanel(!showSidePanel)}
            className="md:hidden text-amber-400/70 hover:text-amber-400 transition-colors px-2 py-1 border border-amber-700/30 rounded"
          >
            {gameState.language === 'zh' ? '面板' : 'Panel'}
          </button>

          <button
            onClick={handleNewGame}
            className="hidden sm:block text-amber-400/70 hover:text-amber-400 transition-colors text-sm"
          >
            {t.newGame}
          </button>

          <LanguageSelector
            currentLang={gameState.language}
            onChange={handleLanguageChange}
            size="sm"
          />
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Dialogue area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden px-4 py-4">
            <div className="h-full bg-slate-900/30 rounded-xl border border-amber-700/20 p-4">
              <GameChat
                dialogue={gameState.dialogue}
                language={gameState.language}
                isTyping={gameState.isTyping}
                onTypingComplete={handleTypingComplete}
              />
            </div>
          </div>

          {/* Choices area */}
          <div className="shrink-0 px-4 pb-4">
            {awaitingDice ? (
              <div className="text-center py-4 text-amber-300">
                ✦ {t.waitDice} ✦
              </div>
            ) : (
              <div className="max-w-2xl">
                <ChoiceMenu
                  choices={gameState.choices || []}
                  onSelect={handleChoiceSelect}
                  language={gameState.language}
                  disabled={isProcessing || gameState.isTyping}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Side panel */}
        <aside
          className={`
            fixed inset-y-0 right-0 z-40 w-80
            bg-slate-900/95 backdrop-blur-sm
            border-l border-amber-700/30
            transform transition-transform duration-300
            md:static md:transform-none md:w-[30%] md:min-w-72 md:bg-transparent md:backdrop-blur-none md:border-l-0
            ${showSidePanel ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}
        >
          <button
            onClick={() => setShowSidePanel(false)}
            className="md:hidden absolute top-4 right-4 text-amber-400/70 hover:text-amber-400"
          >
            ✕
          </button>

          <div className="h-full p-4 flex flex-col gap-4 overflow-y-auto">
            <CharacterSheet character={gameState.character} language={gameState.language} />
            <DiceRoller onRoll={handleDiceRoll} disabled={!awaitingDice || isProcessing} difficulty={diceDifficulty} />
            <div className="text-center pb-4 md:hidden">
              <span className="text-amber-700/50">Ignis Tavern</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile overlay */}
      {showSidePanel && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setShowSidePanel(false)} />
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-amber-400 text-xl animate-pulse">Loading...</div>
      </div>
    }>
      <GamePageContent />
    </Suspense>
  );
}
