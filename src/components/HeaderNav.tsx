import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Shield, Award, Sparkles, Flag, ArrowLeft, Maximize, Minimize, LogIn, LogOut } from 'lucide-react';
import { PlayerProfile, GameSettings } from '../types';
import { soundFx } from '../utils/audio';
import { supabase, signInWithGoogle, signOutUser, isPremiumSubscriber, isActiveSubscriber, getSubscriptionDaysRemaining } from '../utils/supabase';

interface HeaderNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  profile: PlayerProfile;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onOpenEvent: () => void;
  onLogoutRequested?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentPage,
  onNavigate,
  profile,
  settings,
  onUpdateSettings,
  onOpenEvent,
  onLogoutRequested,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cloudUser, setCloudUser] = useState<{ email?: string; name?: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // Listen to Supabase Auth State
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        setCloudUser({
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email,
          avatarUrl: u.user_metadata?.avatar_url,
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        setCloudUser({
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email,
          avatarUrl: u.user_metadata?.avatar_url,
        });
      } else {
        setCloudUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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
            <div className="w-9 h-9 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center shadow-inner font-extrabold text-red-600 text-lg group-hover:scale-105 transition-transform overflow-hidden relative">
              <img
                src="/logo.png"
                alt="Logo Brand"
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <span className="hidden w-full h-full items-center justify-center">🇮🇩</span>
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

        {/* Right Status (Play Points, Coins, Profile link, Sound toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ticket / Play Points Badge */}
          {(() => {
            const pts = profile.playPoints ?? 10;
            const isPrem = isPremiumSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt);
            const isLow = !isPrem && pts <= 2 && pts > 0;
            const isEmpty = !isPrem && pts <= 0;
            return (
              <div
                onClick={() => { soundFx.playClick(); onNavigate('profile'); }}
                title={isPrem ? 'Premium: Token Unlimited ♾️' : `Sisa ${pts} Tiket Bermain`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black cursor-pointer border shadow-sm transition-colors ${
                  isEmpty
                    ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                    : isLow
                    ? 'bg-orange-400 border-orange-300 text-red-950'
                    : 'bg-amber-400 border-amber-200 text-red-950 hover:bg-amber-300'
                }`}
              >
                <span className="text-sm">{isEmpty ? '🛑' : isLow ? '⚠️' : '🎫'}</span>
                <span>{isPrem ? '♾️' : pts}</span>
                {isLow && <span className="hidden sm:inline text-[9px] font-black">HAMPIR HABIS</span>}
                {isEmpty && <span className="hidden sm:inline text-[9px] font-black">HABIS!</span>}
              </div>
            );
          })()}

          {/* Subscription Status Badge */}
          {isActiveSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt) && (
            <div
              onClick={() => { soundFx.playClick(); onNavigate('profile'); }}
              title={`Berlangganan ${profile.subscriptionType?.toUpperCase()} — ${getSubscriptionDaysRemaining(profile.subscriptionExpiresAt)} hari lagi`}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black cursor-pointer shadow border transition-colors ${
                profile.subscriptionType === 'premium'
                  ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                  : 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
              }`}
            >
              <span>{profile.subscriptionType === 'premium' ? '🥇' : '🥈'}</span>
              <span className="hidden sm:inline">{profile.subscriptionType?.toUpperCase()}</span>
            </div>
          )}

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

          {/* GOOGLE AUTH BUTTON / STATUS */}
          {cloudUser ? (
            <button
              id="btn-nav-google-logout"
              onClick={() => {
                soundFx.playClick();
                if (onLogoutRequested) {
                  onLogoutRequested();
                } else {
                  signOutUser();
                }
              }}
              title={`Logged in as ${cloudUser.email}. Klik untuk Logout`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700 hover:bg-emerald-800 border border-emerald-300 text-xs font-bold text-white transition-colors shadow-sm"
            >
              {cloudUser.avatarUrl ? (
                <img src={cloudUser.avatarUrl} alt="Google Avatar" className="w-4 h-4 rounded-full border border-white" />
              ) : (
                <span className="text-xs">🌐</span>
              )}
              <span className="hidden md:inline text-[11px] font-black max-w-[70px] truncate">
                {cloudUser.name?.split(' ')[0]}
              </span>
              <LogOut className="w-3.5 h-3.5 text-emerald-200" />
            </button>
          ) : (
            <button
              id="btn-nav-google-login"
              onClick={() => {
                soundFx.playClick();
                signInWithGoogle();
              }}
              title="Login dengan Akun Google untuk simpan rekor online!"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-gray-100 border border-amber-300 text-xs font-black text-gray-800 transition-transform hover:scale-105 shadow"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>
          )}

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
