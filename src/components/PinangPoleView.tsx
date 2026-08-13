import React from 'react';
import { Character } from '../types';

interface PinangPoleViewProps {
  currentLevel: number; // 0 to 10 (0 = ground, 10 = peak)
  character: Character;
  isClimbing?: boolean;
  isSlipping?: boolean;
  showDetails?: boolean;
}

const PRIZES = [
  { emoji: '🏆', name: 'Tropi Emas', level: 10 },
  { emoji: '🚲', name: 'Sepeda Gunung', level: 10 },
  { emoji: '🍳', name: 'Panci Wajan', level: 10 },
  { emoji: '🌀', name: 'Kipas Angin', level: 10 },
  { emoji: '📻', name: 'Radio Portable', level: 10 },
  { emoji: '🩴', name: 'Sandal Swallow', level: 10 },
  { emoji: '🇮🇩', name: 'Bendera Merah Putih', level: 10 },
];

export const PinangPoleView: React.FC<PinangPoleViewProps> = ({
  currentLevel,
  character,
  isClimbing = false,
  isSlipping = false,
  showDetails = true,
}) => {
  const totalLevels = 10;
  // Calculate percentage from bottom (0 = 8%, 10 = 88%)
  const positionPercentage = Math.min(88, Math.max(8, (currentLevel / totalLevels) * 80 + 8));

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto h-full min-h-[220px] sm:min-h-[320px] bg-gradient-to-b from-sky-200 via-blue-100 to-emerald-100 rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 shadow-inner border-2 sm:border-4 border-amber-300 flex flex-col justify-between">
      {/* Top Banner / Sky */}
      {showDetails && (
        <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center z-10 pointer-events-none">
          <div className="bg-red-600/90 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 sm:py-1 rounded-full border border-amber-300 shadow flex items-center gap-1">
            <span>🏆</span>
            <span>PUNCAK T-GAMES</span>
          </div>
          <div className="bg-white/90 text-red-700 text-[10px] sm:text-xs font-black px-2 py-0.5 sm:py-1 rounded-full border border-red-300 shadow">
            TINGKAT {currentLevel} / {totalLevels}
          </div>
        </div>
      )}

      {/* Cloud Decoration */}
      <div className="absolute top-6 left-3 text-white/80 text-xl sm:text-3xl select-none opacity-80 animate-pulse">☁️</div>
      <div className="absolute top-10 right-4 text-white/80 text-lg sm:text-2xl select-none opacity-80">☁️</div>

      {/* Main Pole Area */}
      <div className="relative flex-1 w-full flex justify-center items-end mt-4 mb-2">
        {/* TOP PRIZE WHEEL (PUNCAK) */}
        <div className="absolute top-1 z-20 flex flex-col items-center">
          {/* Bamboo Wheel Circle */}
          <div className="relative w-28 sm:w-36 h-8 sm:h-11 bg-amber-800 rounded-full border-2 sm:border-4 border-amber-600 shadow-lg flex items-center justify-around px-1.5">
            {/* Dangling Prizes */}
            {PRIZES.map((prize, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer"
                title={prize.name}
              >
                <div className="text-sm sm:text-xl hover:scale-125 transition-transform animate-bounce" style={{ animationDelay: `${idx * 0.15}s` }}>
                  {prize.emoji}
                </div>
                {/* Ribbon */}
                <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-red-600 mx-auto -mt-0.5 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Red and White Flag Peak */}
          <div className="relative -mt-1 flex flex-col items-center">
            <div className="w-6 sm:w-8 h-4 sm:h-5 bg-gradient-to-b from-red-600 to-white border border-gray-300 shadow-md rounded-xs transform -rotate-6 animate-pulse"></div>
            <div className="w-1 sm:w-1.5 h-4 sm:h-6 bg-amber-900 rounded-t-full"></div>
          </div>
        </div>

        {/* VERTICAL BAMBOO POLE */}
        <div className="relative w-8 sm:w-12 h-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-t-full border-x-2 border-amber-900 shadow-xl flex flex-col justify-between items-center py-2 sm:py-4">
          {/* Oily Slippery Sheen Effect Lines */}
          <div className="absolute inset-y-0 left-0.5 w-1 sm:w-1.5 bg-white/30 rounded-full blur-[0.5px]"></div>
          <div className="absolute inset-y-0 right-1 w-0.5 sm:w-1 bg-black/20 rounded-full"></div>

          {/* Red-White Spiral Ribbons around the Pole */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-1 sm:h-1.5 bg-gradient-to-r from-red-500 via-white to-red-500 opacity-65 transform -rotate-12 my-1.5 shadow-xs"
            ></div>
          ))}

          {/* CHECKPOINT MARKERS along the Pole */}
          {Array.from({ length: totalLevels }).map((_, idx) => {
            const lvl = totalLevels - idx; // 10 down to 1
            const isActive = currentLevel >= lvl;
            const isCurrent = currentLevel === lvl;

            return (
              <div
                key={lvl}
                className={`absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center transition-all ${
                  isCurrent ? 'scale-110 sm:scale-125' : ''
                }`}
                style={{ bottom: `${(lvl / totalLevels) * 80}%` }}
              >
                <div
                  className={`px-1 sm:px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black shadow border ${
                    isCurrent
                      ? 'bg-amber-400 text-red-900 border-white ring-1 sm:ring-2 ring-red-500 animate-bounce'
                      : isActive
                      ? 'bg-red-600 text-white border-amber-300'
                      : 'bg-amber-900/80 text-amber-200 border-amber-700 opacity-80'
                  }`}
                >
                  L{lvl}
                </div>
              </div>
            );
          })}
        </div>

        {/* CLIMBING CHARACTER FIGURE */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ease-out flex flex-col items-center ${
            isClimbing ? 'animate-bounce' : ''
          } ${isSlipping ? 'animate-ping text-red-600' : ''}`}
          style={{ bottom: `${positionPercentage}%` }}
        >
          {/* Sweating or Sparkle Particles */}
          {isSlipping && (
            <div className="absolute -top-5 text-red-600 font-extrabold text-[9px] sm:text-xs animate-bounce bg-white/90 px-1.5 py-0.5 rounded-full shadow border border-red-500 whitespace-nowrap">
              TERPELESET! 💦
            </div>
          )}
          {isClimbing && (
            <div className="absolute -top-5 text-amber-800 font-extrabold text-[9px] sm:text-xs animate-pulse bg-amber-300 px-1.5 py-0.5 rounded-full shadow border border-amber-500 whitespace-nowrap">
              NAIK!! 🧗‍♂️
            </div>
          )}

          {/* Character Container */}
          <div className="relative group">
            {/* Character Avatar Emoji & Badge */}
            <div
              className={`w-9 h-9 sm:w-14 sm:h-14 rounded-full ${character.avatarBg} border-2 border-white shadow-xl flex items-center justify-center text-xl sm:text-3xl relative transform ${
                isSlipping ? 'rotate-12 scale-110' : isClimbing ? '-rotate-6 scale-110' : ''
              }`}
            >
              {character.emoji}
              {/* Hands holding the pole */}
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs">✊</span>
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs">✊</span>
            </div>

            {/* Character Name Label */}
            {showDetails && (
              <div className="mt-0.5 bg-red-700/90 text-white font-black text-[8px] sm:text-xs px-1.5 py-0.5 rounded-full shadow border border-amber-300 text-center whitespace-nowrap">
                {character.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ground Grass & Crowd Support Area */}
      <div className="relative w-full h-7 sm:h-11 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-b-xl sm:rounded-b-2xl border-t-2 sm:border-t-4 border-amber-600 flex items-center justify-between px-2 sm:px-3 z-10 shadow-lg flex-none">
        <div className="text-[9px] sm:text-xs font-black text-amber-200 flex items-center gap-1">
          <span>🚩</span>
          <span>TANAH LAPANGAN</span>
        </div>
        <div className="flex gap-1 text-xs sm:text-sm animate-pulse">
          <span>👏</span>
          <span>🇮🇩</span>
          <span>🎉</span>
        </div>
      </div>
    </div>
  );
};
