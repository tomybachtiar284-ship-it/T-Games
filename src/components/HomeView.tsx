import React from 'react';
import { Play, Trophy, BookOpen, User, Settings, Info, ShieldAlert, Flag, Sparkles, Swords } from 'lucide-react';
import { Character, PlayerProfile } from '../types';
import { soundFx } from '../utils/audio';
import { PinangPoleView } from './PinangPoleView';

interface HomeViewProps {
  profile: PlayerProfile;
  activeCharacter: Character;
  onStartGame: () => void;
  onStartVersusMode: () => void;
  onNavigate: (page: string) => void;
  onOpenEventModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  activeCharacter,
  onStartGame,
  onStartVersusMode,
  onNavigate,
  onOpenEventModal,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* 17 AGUSTUS EVENT BANNER */}
      <div
        onClick={() => {
          soundFx.playClick();
          onOpenEventModal();
        }}
        className="w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-700 text-white p-3.5 rounded-2xl border-2 border-amber-300 shadow-lg cursor-pointer hover:scale-[1.01] transition-transform flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center font-black text-xl shadow">
            🇮🇩
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-300 font-extrabold text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Event Spesial ToBa Smart 2026</span>
            </div>
            <h3 className="font-black text-sm sm:text-base text-white uppercase">
              TOBA SMART CHALLENGE 2026 ⚡
            </h3>
          </div>
        </div>

        <button
          id="btn-event-claim-home"
          className="bg-amber-400 hover:bg-amber-300 text-red-950 font-black px-4 py-1.5 rounded-full text-xs shadow border border-amber-200 whitespace-nowrap animate-pulse"
        >
          IKUTI EVENT 🏆
        </button>
      </div>

      {/* HERO SECTION WITH TITLE & LOGO */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 bg-red-100 border border-red-300 px-3 py-1 rounded-full text-red-800 text-xs font-black shadow-xs uppercase">
          <span>⚡</span>
          <span>GAME EDUKASI & TANTANGAN MATEMATIKA REMAJA</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-red-700 tracking-tight drop-shadow-sm uppercase">
          TOBA SMART <span className="text-amber-500">CHALLENGE</span>
        </h1>

        <p className="text-sm sm:text-base font-extrabold text-gray-700 italic max-w-md mx-auto">
          “Tantangan Logika & Matematika Remaja Masa Kini!”
        </p>
      </div>

      {/* CENTERPIECE: POLE & CHARACTER PREVIEW + QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Player Card Preview */}
        <div className="md:col-span-4 bg-white p-5 rounded-3xl border-4 border-amber-300 shadow-md space-y-4 text-center">
          <div className="relative inline-block">
            <div
              className={`w-20 h-20 rounded-full ${activeCharacter.avatarBg} border-4 border-amber-300 shadow-lg flex items-center justify-center text-4xl mx-auto`}
            >
              {activeCharacter.emoji}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-red-900 font-black text-[10px] px-2 py-0.5 rounded-full border border-white">
              {activeCharacter.role.split(' ')[0]}
            </span>
          </div>

          <div>
            <h3 className="font-black text-lg text-gray-800">{profile.name}</h3>
            <p className="text-xs font-bold text-red-600">{profile.school}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="block font-bold text-gray-500 text-[10px]">REKOR SKOR</span>
              <span className="font-black text-red-600 text-sm">{profile.highestScore}</span>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="block font-bold text-gray-500 text-[10px]">LEVEL TERTINGGI</span>
              <span className="font-black text-amber-700 text-sm">Level {profile.highestLevelReached}</span>
            </div>
          </div>

          <button
            id="btn-home-change-char"
            onClick={() => {
              soundFx.playClick();
              onNavigate('profile');
            }}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors border border-gray-300"
          >
            Ganti Karakter 👦👧
          </button>
        </div>

        {/* Center Pole Preview */}
        <div className="md:col-span-4 flex justify-center">
          <PinangPoleView
            currentLevel={profile.highestLevelReached}
            character={activeCharacter}
            showDetails={true}
          />
        </div>

        {/* Right Column: MAIN MENU ACTION BUTTONS */}
        <div className="md:col-span-4 space-y-3">
          {/* PLAY MAIN BUTTON (SOLO) */}
          <button
            id="btn-home-start-game"
            onClick={() => {
              soundFx.playClick();
              onStartGame();
            }}
            className="w-full py-3 px-5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl font-black text-base sm:text-lg shadow-lg border-b-4 border-emerald-800 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="text-left">
              <span className="block leading-none">1 PEMAIN (SOLO)</span>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                Petualangan Panjat Pinang
              </span>
            </div>
          </button>

          {/* DUAL PLAYER VERSUS BUTTON */}
          <button
            id="btn-home-versus-mode"
            onClick={() => {
              soundFx.playClick();
              onStartVersusMode();
            }}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-2xl font-black text-base sm:text-lg shadow-xl border-b-4 border-red-900 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 animate-pulse"
          >
            <div className="w-9 h-9 rounded-full bg-amber-400 text-red-950 flex items-center justify-center shadow">
              <Swords className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block leading-none">2 PEMAIN (VERSUS) 🇮🇩</span>
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">
                Duel 2 Tiang di 1 Monitor!
              </span>
            </div>
          </button>

          {/* Secondary Nav Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="btn-home-leaderboard"
              onClick={() => {
                soundFx.playClick();
                onNavigate('leaderboard');
              }}
              className="p-3 bg-white hover:bg-amber-50 text-red-700 rounded-2xl font-black text-xs border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-105"
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>LEADERBOARD</span>
            </button>

            <button
              id="btn-home-question-bank"
              onClick={() => {
                soundFx.playClick();
                onNavigate('bank');
              }}
              className="p-3 bg-white hover:bg-amber-50 text-red-700 rounded-2xl font-black text-xs border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>BANK SOAL</span>
            </button>

            <button
              id="btn-home-profile"
              onClick={() => {
                soundFx.playClick();
                onNavigate('profile');
              }}
              className="p-3 bg-white hover:bg-amber-50 text-red-700 rounded-2xl font-black text-xs border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-105"
            >
              <User className="w-5 h-5 text-purple-500" />
              <span>PROFIL</span>
            </button>

            <button
              id="btn-home-settings"
              onClick={() => {
                soundFx.playClick();
                onNavigate('settings');
              }}
              className="p-3 bg-white hover:bg-amber-50 text-red-700 rounded-2xl font-black text-xs border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-105"
            >
              <Settings className="w-5 h-5 text-gray-500" />
              <span>PENGATURAN</span>
            </button>

            <button
              id="btn-home-about"
              onClick={() => {
                soundFx.playClick();
                onNavigate('about');
              }}
              className="p-3 bg-white hover:bg-amber-50 text-red-700 rounded-2xl font-black text-xs border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-105"
            >
              <Info className="w-5 h-5 text-emerald-500" />
              <span>TENTANG GAME</span>
            </button>

            <button
              id="btn-home-admin"
              onClick={() => {
                soundFx.playClick();
                onNavigate('admin');
              }}
              className="p-3 bg-red-800 hover:bg-red-900 text-amber-200 rounded-2xl font-black text-xs border-2 border-amber-400 shadow-sm flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-105"
            >
              <ShieldAlert className="w-5 h-5 text-amber-300" />
              <span>ADMIN PANEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
