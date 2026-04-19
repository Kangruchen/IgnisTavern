'use client';

import { useState } from 'react';

interface LanguageSelectorProps {
  currentLang: 'zh' | 'en';
  onChange: (lang: 'zh' | 'en') => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function LanguageSelector({
  currentLang,
  onChange,
  size = 'md',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-14 text-xs px-2 py-1',
    md: 'w-18 text-sm px-3 py-2',
    lg: 'w-24 text-base px-4 py-3',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          bg-amber-900/50 border-2 border-amber-700/50 rounded
          text-amber-100 font-medieval
          hover:bg-amber-800/50 hover:border-amber-500/50
          transition-all duration-200
          flex items-center justify-center gap-2
        `}
      >
        <span>{currentLang === 'zh' ? '中文' : 'EN'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-50">
            <div className="bg-slate-900 border-2 border-amber-700 rounded-lg shadow-2xl overflow-hidden min-w-[100px]">
              <button
                onClick={() => {
                  onChange('zh');
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left
                  hover:bg-amber-900/30 transition-colors
                  ${currentLang === 'zh' ? 'bg-amber-900/50 text-amber-400' : 'text-amber-100'}
                `}
              >
                中文
              </button>
              <button
                onClick={() => {
                  onChange('en');
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left
                  hover:bg-amber-900/30 transition-colors
                  ${currentLang === 'en' ? 'bg-amber-900/50 text-amber-400' : 'text-amber-100'}
                `}
              >
                English
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
