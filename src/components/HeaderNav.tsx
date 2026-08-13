import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Shield, Award, Sparkles, Flag, ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { PlayerProfile, GameSettings } from '../types';
import { soundFx } from '../utils/audio';

interface HeaderNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  profile: PlayerProfile;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onOpenEvent: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentPage,
  onNavigate,
  profile,
  settings,
  onUpdateSettings,
  onOpenEvent,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const toggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled, musicEnabled: !settings.soundEnabled };
    onUpdateSettings(updated);
    soundFx.setMuted(!updated.soundEnabled);
    if (updated.soundEnabled) {
      soundFx.playClick();
    }
  };

  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-md border-b-2 border-amber-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Left Logo / Back button */}
        <div className="flex items-center gap-2">
          {currentPage !== 'home' && (
            <button
              id="btn-nav-back"
              onClick={() => {
                soundFx.playClick();
                onNavigate('home');
              }}
              className="p-1.5 rounded-lg bg-red-700/80 hover:bg-red-800 text-amber-200 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          )}

          <div
            onClick={() => {
              soundFx.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center shadow-inner font-extrabold text-red-600 text-lg group-hover:scale-105 transition-transform">
              🇮🇩
            </div>
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-wide text-white drop-shadow-sm leading-none uppercase">
                T-GAMES
              </h1>
              <span className="text-[10px] sm:text-xs text-amber-200 font-bold tracking-widest block">
                SMART CHALLENGE ⚡
              </span>
            </div>
          </div>
        </div>

        {/* Center Event Ribbon */}
        <button
          id="btn-event-banner-nav"
          onClick={() => {
            soundFx.playClick();
            onOpenEvent();
          }}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-red-900 rounded-full font-black text-xs shadow-sm transition-transform hover:scale-105 animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-700" />
          <span>EVENT T-GAMES 2026</span>
          <Sparkles className="w-3.5 h-3.5 text-red-700" />
        </button>

        {/* Right Status (Coins, Profile link, Sound toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coin Badge */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigate('profile');
            }}
            className="flex items-center gap-1 bg-red-800/80 border border-amber-300/60 px-2.5 py-1 rounded-full text-xs font-black text-amber-300 cursor-pointer hover:bg-red-900 transition-colors"
          >
            <span className="text-sm">🪙</span>
            <span>{profile.coins}</span>
          </div>

          {/* Profile Shortcut */}
          <button
            id="btn-nav-profile"
            onClick={() => {
              soundFx.playClick();
              onNavigate('profile');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-800/80 hover:bg-red-900 border border-white/20 text-xs font-bold text-white transition-colors"
          >
            <span className="text-base leading-none">{profile.avatar}</span>
            <span className="hidden sm:inline max-w-[80px] truncate">{profile.name}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-nav-sound"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded-full bg-red-700 hover:bg-red-800 text-amber-200 transition-colors border border-red-400/40"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-300" />
            )}
          </button>

          {/* Fullscreen Kiosk Mode Toggle */}
          <button
            id="btn-nav-fullscreen"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Kiosk Mode Monitor Event)'}
            aria-label="Toggle Fullscreen Kiosk Mode"
            className="p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-red-950 transition-colors border border-amber-200 shadow-sm"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
