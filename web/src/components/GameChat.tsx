'use client';

import { useState, useEffect, useRef } from 'react';
import { DialogueEntry } from '@/lib/gameState';

interface GameChatProps {
  dialogue: DialogueEntry[];
  language: 'zh' | 'en';
  isTyping: boolean;
  onTypingComplete?: () => void;
}

// Typewriter effect component
function TypewriterText({
  text,
  speed = 30,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    indexRef.current = 0;

    const typeChar = () => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;

        // Variable typing speed for more natural feel
        const char = text[indexRef.current - 1];
        const delay = char === '。' || char === '.' || char === '!' || char === '？'
          ? speed * 6
          : char === '，' || char === ','
          ? speed * 3
          : speed;

        setTimeout(typeChar, delay);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    const timer = setTimeout(typeChar, speed);
    return () => clearTimeout(timer);
  }, [text, speed, onComplete]);

  // Handle click to skip animation
  const handleSkip = () => {
    if (!isComplete) {
      setDisplayText(text);
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <span onClick={handleSkip} className="cursor-pointer">
      {displayText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-5 bg-amber-400 ml-0.5 animate-blink" />
      )}
    </span>
  );
}

// Single dialogue entry component
function DialogueLine({
  entry,
  language,
  isLast,
  isTyping,
  onTypingComplete,
}: {
  entry: DialogueEntry;
  language: 'zh' | 'en';
  isLast: boolean;
  isTyping: boolean;
  onTypingComplete?: () => void;
}) {
  const text = language === 'zh' ? entry.text : entry.textEn;
  const speaker = language === 'zh' ? entry.speaker : entry.speakerEn;
  const isNarrator = !entry.speaker || entry.speaker === '旁白' || entry.speaker === 'Narrator';

  return (
    <div className={`
      mb-4 md:mb-6
      ${isNarrator ? 'italic' : ''}
    `}>
      {/* Speaker name */}
      {!isNarrator && speaker && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-amber-400 font-medieval text-sm md:text-base">
            {speaker}
          </span>
        </div>
      )}

      {/* Message content */}
      <div className={`
        relative pl-4 md:pl-5
        ${isNarrator ? 'text-amber-200/80' : 'text-amber-100'}
        leading-relaxed text-sm md:text-base
      `}>
        {/* Left border accent */}
        {!isNarrator && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/50 to-transparent" />
        )}

        {isLast && isTyping ? (
          <TypewriterText text={text} onComplete={onTypingComplete} />
        ) : (
          text
        )}
      </div>
    </div>
  );
}

export default function GameChat({
  dialogue,
  language,
  isTyping,
  onTypingComplete,
}: GameChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userSkip, setUserSkip] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dialogue, isTyping]);

  const handleSkipAll = () => {
    if (isTyping && !userSkip) {
      setUserSkip(true);
      onTypingComplete?.();
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Skip indicator */}
      {isTyping && (
        <button
          onClick={handleSkipAll}
          className="absolute top-2 right-2 z-10 px-2 py-1 text-xs text-amber-500/60 hover:text-amber-400
                   bg-slate-900/80 rounded transition-colors"
        >
          点击跳过
        </button>
      )}

      {/* Dialogue scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-1
                   scrollbar-thin scrollbar-thumb-amber-700/50 scrollbar-track-transparent
                   hover:scrollbar-thumb-amber-600/70"
      >
        {dialogue.map((entry, index) => (
          <DialogueLine
            key={entry.id || index}
            entry={entry}
            language={language}
            isLast={index === dialogue.length - 1}
            isTyping={isTyping && index === dialogue.length - 1 && !userSkip}
            onTypingComplete={onTypingComplete}
          />
        ))}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
}
