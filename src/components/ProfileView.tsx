import React, { useState, useEffect } from 'react';
import { Character, PlayerProfile } from '../types';
import { ALL_BADGES } from '../data/defaultData';
import { User, Building2, Award, Coins, Check, Lock, Edit3, Save, LogIn, Cloud, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { supabase, signInWithGoogle, signOutUser, isPremiumSubscriber, isActiveSubscriber, getSubscriptionDaysRemaining } from '../utils/supabase';

interface ProfileViewProps {
  profile: PlayerProfile;
  characters: Character[];
  onUpdateProfile: (profile: PlayerProfile) => void;
  onUnlockCharacter: (characterId: string, cost: number) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  characters,
  onUpdateProfile,
  onUnlockCharacter,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editSchool, setEditSchool] = useState(profile.school);
  const [cloudUser, setCloudUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        setCloudUser({
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email,
        });
      }
    });
  }, []);

  const handleSaveInfo = () => {
    soundFx.playClick();
    onUpdateProfile({
      ...profile,
      name: editName,
      school: editSchool,
    });
    setIsEditing(false);
  };

  const handleSelectCharacter = (charId: string) => {
    soundFx.playClick();
    onUpdateProfile({
      ...profile,
      selectedCharacterId: charId,
    });
  };

  const totalAns = profile.totalCorrect + profile.totalWrong;
  const accuracyPct = totalAns > 0 ? Math.round((profile.totalCorrect / totalAns) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full text-xs font-black">
          <User className="w-4 h-4 text-red-600" />
          <span>PROFIL PEMAIN</span>
        </div>
        <h2 className="text-3xl font-black text-gray-800">DATA & KARAKTER SAYA</h2>
      </div>

      {/* T-GAMES DIGITAL ACCOUNT BANNER */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-4 shadow-lg border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center font-black text-xl shadow">
            🛡️
          </div>
          <div>
            <div className="font-black text-sm text-amber-300 uppercase flex items-center justify-center sm:justify-start gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AKUN DIGITAL T-GAMES</span>
            </div>
            <p className="text-xs font-extrabold text-amber-100">
              {cloudUser
                ? `Terhubung: ${cloudUser.email} — Rekor & Progres Terjaga Otomatis!`
                : 'Hubungkan Akun Google Anda untuk mengamankan koin, rekor skor, dan prestasi!'}
            </p>
          </div>
        </div>

        {cloudUser ? (
          <button
            onClick={async () => {
              soundFx.playClick();
              await signOutUser();
              window.location.reload();
            }}
            className="px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white font-black text-xs rounded-full shadow border border-rose-400 whitespace-nowrap"
          >
            KELUAR AKUN
          </button>
        ) : (
          <button
            onClick={() => {
              soundFx.playClick();
              signInWithGoogle();
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs rounded-full shadow border border-amber-200 whitespace-nowrap flex items-center gap-1.5 animate-pulse"
          >
            <span>MASUK DENGAN GOOGLE 🚀</span>
          </button>
        )}
      </div>

      {/* PLAYER INFO CARD */}
      <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-amber-500 shadow-inner flex items-center justify-center text-4xl">
              {profile.avatar}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama Pemain"
                  className="px-3 py-1.5 border-2 border-amber-300 rounded-xl font-black text-sm text-gray-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  placeholder="Instansi / Komunitas / Asal"
                  className="px-3 py-1.5 border-2 border-amber-300 rounded-xl font-bold text-xs text-gray-700 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-black text-gray-900">{profile.name}</h3>
                <p className="text-xs font-extrabold text-red-600 flex items-center justify-center sm:justify-start gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{profile.school}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            {isEditing ? (
              <button
                id="btn-profile-save"
                onClick={handleSaveInfo}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan</span>
              </button>
            ) : (
              <button
                id="btn-profile-edit"
                onClick={() => {
                  soundFx.playClick();
                  setIsEditing(true);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profil</span>
              </button>
            )}
          </div>
        </div>

        {/* STATS OVERVIEW GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <span className="block text-[10px] font-bold text-gray-500 uppercase">REKOR SKOR</span>
            <span className="font-black text-lg text-red-600">{profile.highestScore}</span>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <span className="block text-[10px] font-bold text-gray-500 uppercase">LEVEL TERTINGGI</span>
            <span className="font-black text-lg text-amber-700">Level {profile.highestLevelReached}</span>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <span className="block text-[10px] font-bold text-gray-500 uppercase">AKURASI BENAR</span>
            <span className="font-black text-lg text-emerald-600">{accuracyPct}%</span>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <span className="block text-[10px] font-bold text-gray-500 uppercase">KOIN SAYA</span>
            <span className="font-black text-lg text-amber-600">🪙 {profile.coins}</span>
          </div>

          {/* Subscription Status Card */}
          <div className={`col-span-2 p-3 rounded-2xl border-2 ${
            isPremiumSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt)
              ? 'bg-amber-50 border-amber-300'
              : isActiveSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt)
              ? 'bg-blue-50 border-blue-300'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <span className="block text-[10px] font-bold text-gray-500 uppercase">PAKET BERLANGGANAN</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-black text-sm">
                {profile.subscriptionType === 'premium' && isActiveSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt)
                  ? '🥇 PREMIUM — Token Unlimited ♾️'
                  : profile.subscriptionType === 'basic' && isActiveSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt)
                  ? '🥈 BASIC — Token Dipotong Normal'
                  : '🆓 FREE — Top-Up Manual'}
              </span>
              {isActiveSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt) && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ✅ Aktif {getSubscriptionDaysRemaining(profile.subscriptionExpiresAt)} hari lagi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CHARACTER SELECTION GALLERY */}
      <div className="space-y-3">
        <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
          <span>👦👧</span>
          <span>PILIH KARAKTER PEMANJAT</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {characters.map((char) => {
            const isUnlocked = profile.unlockedCharacters.includes(char.id);
            const isSelected = profile.selectedCharacterId === char.id;

            return (
              <div
                key={char.id}
                className={`bg-white p-4 rounded-3xl border-4 text-center space-y-2 transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/50 shadow-xl scale-[1.02]'
                    : isUnlocked
                    ? 'border-gray-200 hover:border-amber-200'
                    : 'border-gray-200 opacity-75'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full ${char.avatarBg} border-2 border-white shadow-md flex items-center justify-center text-3xl mx-auto`}
                >
                  {char.emoji}
                </div>

                <h4 className="font-black text-sm text-gray-900">{char.name}</h4>
                <p className="text-[10px] font-bold text-gray-500 leading-tight">{char.description}</p>

                {isSelected ? (
                  <span className="inline-flex items-center gap-1 bg-amber-400 text-red-950 font-black text-xs px-3 py-1 rounded-full border border-amber-300">
                    <Check className="w-3.5 h-3.5" /> DIPAKAI
                  </span>
                ) : isUnlocked ? (
                  <button
                    id={`btn-char-select-${char.id}`}
                    onClick={() => handleSelectCharacter(char.id)}
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-colors"
                  >
                    Pakai Karakter
                  </button>
                ) : (
                  <button
                    id={`btn-char-unlock-${char.id}`}
                    onClick={() => {
                      if (profile.coins >= char.costCoins) {
                        onUnlockCharacter(char.id, char.costCoins);
                      } else {
                        alert(`Koin tidak cukup! Butuh 🪙 ${char.costCoins} koin.`);
                      }
                    }}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Buka 🪙 {char.costCoins}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BADGES GALLERY */}
      <div className="space-y-3">
        <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
          <span>🏆</span>
          <span>KOLEKSI BADGE PENGHARGAAN</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_BADGES.map((badge) => {
            const hasBadge = profile.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  hasBadge
                    ? 'bg-amber-50 border-amber-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <h4 className="font-black text-xs text-gray-900">{badge.title}</h4>
                  <p className="text-[10px] font-extrabold text-gray-500 leading-tight">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
