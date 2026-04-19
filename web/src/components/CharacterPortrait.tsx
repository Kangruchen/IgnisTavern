'use client';

import { useState } from 'react';

interface CharacterPortraitProps {
  characterName: string;
  characterNameEn: string;
  size?: 'sm' | 'md' | 'lg';
  frame?: 'gold' | 'silver' | 'bronze' | 'wood';
  isAnimated?: boolean;
}

const frameColors = {
  gold: 'from-yellow-600 via-amber-500 to-yellow-600',
  silver: 'from-slate-400 via-gray-300 to-slate-400',
  bronze: 'from-orange-700 via-amber-700 to-orange-700',
  wood: 'from-amber-900 via-amber-800 to-amber-900',
};

const sizeClasses = {
  sm: 'w-16 h-16 text-xs',
  md: 'w-24 h-24 text-sm',
  lg: 'w-40 h-40 text-base md:w-48 md:h-48',
};

export default function CharacterPortrait({
  characterName,
  characterNameEn,
  size = 'md',
  frame = 'wood',
  isAnimated = false,
}: CharacterPortraitProps) {
  const [imageError, setImageError] = useState(false);

  // Generate initials for fallback
  const initials = characterName.slice(0, 2).toUpperCase();
  const gradientHue = characterName.length % 360;

  return (
    <div className="relative">
      {/* Outer glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${frameColors[frame]} rounded-lg blur-sm opacity-50`} />
      
      {/* Frame */}
      <div className={`
        relative rounded-lg p-1
        bg-gradient-to-br ${frameColors[frame]}
        shadow-lg
        ${isAnimated ? 'animate-pulse-slow' : ''}
      `}>
        {/* Inner container */}
        <div className={`
          ${sizeClasses[size]}
          rounded-md overflow-hidden
          bg-slate-800
          flex items-center justify-center
        `}>
          {imageError ? (
            // Fallback: Gradient avatar with initials
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, hsl(${gradientHue}, 60%, 30%), hsl(${gradientHue + 40}, 50%, 20%))`,
              }}
            >
              <span className="text-white font-medieval font-bold text-shadow">
                {initials}
              </span>
            </div>
          ) : (
            <img
              src={`/portraits/${characterNameEn.toLowerCase().replace(/\s+/g, '_')}.png`}
              alt={characterName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </div>

      {/* Character name label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-amber-100/80 text-xs font-medieval bg-slate-900/90 px-2 py-0.5 rounded">
          {characterName}
        </span>
      </div>
    </div>
  );
}
