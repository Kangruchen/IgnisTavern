'use client';

interface Choice {
  id: string;
  text: string;
  textEn: string;
  disabled?: boolean;
}

interface ChoiceMenuProps {
  choices: Choice[];
  onSelect: (choiceId: string) => void;
  language: 'zh' | 'en';
  disabled?: boolean;
}

export default function ChoiceMenu({
  choices,
  onSelect,
  language,
  disabled = false,
}: ChoiceMenuProps) {
  if (choices.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {choices.map((choice, index) => {
        const text = language === 'zh' ? choice.text : choice.textEn;
        
        return (
          <button
            key={choice.id}
            onClick={() => !choice.disabled && !disabled && onSelect(choice.id)}
            disabled={choice.disabled || disabled}
            className={`
              w-full text-left px-4 py-3.5 rounded-lg
              border transition-all duration-200
              relative overflow-hidden group
              ${choice.disabled || disabled
                ? 'bg-slate-800/30 border-slate-700/30 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800/60 border-amber-700/40 text-amber-100 hover:bg-amber-900/20 hover:border-amber-500/50 hover:pl-6 cursor-pointer'}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Hover arrow */}
            {!choice.disabled && !disabled && (
              <span className="absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500">
                ›
              </span>
            )}
            
            {/* Choice text */}
            <span className="relative z-10 font-medieval text-sm md:text-base">
              {text}
            </span>

            {/* Choice number indicator */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-600/40 font-mono">
              {index + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
