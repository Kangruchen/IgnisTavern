'use client';

import { useState, useCallback, useEffect } from 'react';
import { calculateRollResult, type DiceRollResult } from '@/lib/diceMachine';

interface InlineDiceCheckProps {
  onRoll: (result: number) => void;
  disabled: boolean;
  difficulty: number;
  checkLabel: string;
  statValue: number;
  diceState: 'idle' | 'awaiting_roll' | 'roll_resolved';
  language: 'zh' | 'en';
}

export default function InlineDiceCheck({
  onRoll,
  disabled = false,
  difficulty,
  checkLabel,
  statValue,
  diceState,
  language = 'zh',
}: InlineDiceCheckProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<DiceRollResult | null>(null);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [rollPhase, setRollPhase] = useState<'waiting' | 'rolling' | 'done'>('waiting');

  // Reset when entering awaiting_roll state (new check from DM)
  useEffect(() => {
    if (diceState === 'awaiting_roll') {
      setResult(null);
      setDisplayNumber(null);
      setRollPhase('waiting');
    }
  }, [diceState]);

  const modifier = Math.floor((statValue - 10) / 2);

  const rollDice = useCallback(() => {
    if (diceState !== 'awaiting_roll' || disabled || isRolling) return;

    setIsRolling(true);
    setRollPhase('rolling');
    setResult(null);

    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        setDisplayNumber(Math.floor(Math.random() * 20) + 1);
        const delay = 50 + Math.pow(progress, 3) * 200;
        setTimeout(animate, delay);
      } else {
        // Final roll — this is the real result
        const finalRoll = Math.floor(Math.random() * 20) + 1;
        setDisplayNumber(finalRoll);

        const rollResult = calculateRollResult(finalRoll, statValue, difficulty);
        setResult(rollResult);
        setIsRolling(false);
        setRollPhase('done');

        // Notify parent with raw d20 roll; parent computes final total once.
        onRoll?.(finalRoll);
      }
    };

    animate();
  }, [diceState, isRolling, disabled, statValue, difficulty, onRoll]);

  // Don't render when idle
  if (diceState === 'idle') return null;

  // Determine if player can interact
  const canRoll = diceState === 'awaiting_roll' && !disabled && !isRolling;

  return (
    <div className={`my-2 p-3 rounded-xl border transition-all duration-300 ${
      result?.success
        ? 'bg-green-900/15 border-green-600/30'
        : result && !result.success
        ? 'bg-red-900/15 border-red-600/30'
        : 'bg-amber-900/15 border-amber-600/30'
    }`}>
      {/* Check header: label + DC */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-amber-300 text-sm font-medium">
          🎲 {checkLabel || (language === 'zh' ? '检定' : 'Check')} DC {difficulty}
        </span>
      </div>

      {/* Dice + action row */}
      <div className="flex items-center gap-4">
        {/* Dice face — always visible */}
        <div className={`relative w-16 h-16 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
          result?.success ? 'border-green-500/50 shadow-green-500/20' 
          : result && !result.success ? 'border-red-500/50 shadow-red-500/20' 
          : 'border-amber-600/40'
        } ${rollPhase === 'rolling' ? 'scale-95' : canRoll ? 'hover:scale-105 cursor-pointer' : ''}`}>
          <span className={`text-3xl font-bold transition-colors duration-300 ${
            result?.success ? 'text-green-400' 
            : result && !result.success ? 'text-red-400' 
            : displayNumber ? 'text-amber-100' : 'text-slate-500'
          }`}>
            {displayNumber ?? '?'}
          </span>
        </div>

        {/* Right side: button or result */}
        {rollPhase === 'waiting' && !result && (
          <button
            onClick={rollDice}
            disabled={!canRoll}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              !canRoll
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-700 to-orange-600 text-white hover:from-amber-600 hover:to-orange-500 hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-900/30 animate-pulse cursor-pointer'
            }`}
          >
            🎲 {language === 'zh' ? `掷骰 (DC${difficulty})` : `Roll (DC${difficulty})`}
          </button>
        )}

        {rollPhase === 'rolling' && (
          <div className="flex-1 text-center">
            <span className="text-amber-300/60 text-sm animate-pulse">
              {language === 'zh' ? '投掷中...' : 'Rolling...'}
            </span>
          </div>
        )}

        {rollPhase === 'done' && result && (
          <div className="flex-1">
            {/* Success / Failure */}
            <div className={`text-lg font-bold mb-1 ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.success
                ? (language === 'zh' ? '✅ 成功！' : '✅ Success!')
                : (language === 'zh' ? '❌ 失败' : '❌ Failure')}
            </div>
            {/* Full formula */}
            <div className="text-xs text-amber-200/70 font-mono">
              d20={result.roll} {modifier >= 0 ? '+' : ''}{modifier} = {result.total} vs DC{result.dc}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
