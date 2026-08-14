/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Character,
  Difficulty,
  GameSettings,
  LeaderboardEntry,
  MathCategory,
  MatchHistoryItem,
  PlayerProfile,
  Question,
  Sponsor,
} from './types';
import {
  addLeaderboardEntry,
  getStoredCharacters,
  getStoredCustomQuestions,
  getStoredLeaderboard,
  getStoredProfile,
  getStoredSettings,
  getStoredSponsors,
  saveStoredCharacters,
  saveStoredCustomQuestions,
  saveStoredLeaderboard,
  saveStoredProfile,
  saveStoredSettings,
  saveStoredSponsors,
} from './utils/storage';
import { soundFx } from './utils/audio';
import { HeaderNav } from './components/HeaderNav';
import { HomeView } from './components/HomeView';
import { GameModalView } from './components/GameModalView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { QuestionBankView } from './components/QuestionBankView';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { EventModal } from './components/EventModal';
import { SponsorBanner } from './components/SponsorBanner';
import { RewardedAdModal } from './components/RewardedAdModal';
import { VersusSetupModal } from './components/VersusSetupModal';
import { VersusGameView } from './components/VersusGameView';
import { SplashScreen } from './components/SplashScreen';
import { LoginRequiredModal } from './components/LoginRequiredModal';
import { DEFAULT_PROFILE } from './data/defaultData';
import { supabase, syncProfileToCloud, fetchCloudLeaderboard, pushLeaderboardToCloud, signOutUser, fetchCloudQuestions, pushQuestionToCloud, updateQuestionInCloud, deleteQuestionFromCloud, fetchCloudSponsors, updateSponsorsInCloud, fetchCloudCharacters, isAdminUser, ADMIN_EMAILS, ADMIN_WHATSAPP_NUMBER, ADMIN_EMAIL, ADMIN_NAME, isPremiumSubscriber, getSubscriptionDaysRemaining } from './utils/supabase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [profile, setProfile] = useState<PlayerProfile>(getStoredProfile());
  const [settings, setSettings] = useState<GameSettings>(getStoredSettings());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(getStoredLeaderboard());
  const [customQuestions, setCustomQuestions] = useState<Question[]>(getStoredCustomQuestions());
  const [sponsors, setSponsors] = useState<Sponsor[]>(getStoredSponsors());
  const [characters, setCharacters] = useState<Character[]>(getStoredCharacters());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [cloudUser, setCloudUser] = useState<any>(null);

  // Welcome / Splash Screen State (Active on initial load)
  const [splashState, setSplashState] = useState<{ active: boolean; message: string; subtitle: string }>({
    active: true,
    message: 'Menyiapkan Permainan & Memuat Data... ⚡',
    subtitle: 'Selamat Datang di T-Games Smart Challenge!',
  });

  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [showNoPointsModal, setShowNoPointsModal] = useState<boolean>(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState<boolean>(false);
  const [showVersusSetup, setShowVersusSetup] = useState<boolean>(false);
  const [versusConfig, setVersusConfig] = useState<{
    p1Name: string;
    p1Char: Character;
    p2Name: string;
    p2Char: Character;
    category: MathCategory;
    difficulty: Difficulty;
    matchDuration: number;
    targetLevel: number;
  } | null>(null);

  // Sync sound muted state on initial load
  useEffect(() => {
    soundFx.setMuted(!settings.soundEnabled);
  }, [settings]);

  // AIRTIGHT SECURITY GUARD: ENFORCE GOOGLE LOGIN FOR ALL MATCHES
  useEffect(() => {
    if (!cloudUser && (currentPage === 'game' || currentPage === 'versus_game')) {
      soundFx.playWrong();
      setCurrentPage('home');
      setShowVersusSetup(false);
      setShowLoginRequiredModal(true);
    }
  }, [cloudUser, currentPage]);

  // Supabase Auth Listener & Cloud Sync
  useEffect(() => {
    if (!supabase) return;

    // Fetch cloud leaderboard when connected
    fetchCloudLeaderboard().then((cloudLb) => {
      setLeaderboardData(cloudLb || []);
      saveStoredLeaderboard(cloudLb || []);
    });

    // Fetch cloud questions when connected
    fetchCloudQuestions().then((cloudQ) => {
      if (cloudQ) {
        setCustomQuestions(cloudQ);
        saveStoredCustomQuestions(cloudQ);
      }
    });

    // Fetch cloud sponsors when connected
    fetchCloudSponsors().then((cloudSp) => {
      if (cloudSp && cloudSp.length > 0) {
        setSponsors(cloudSp);
        saveStoredSponsors(cloudSp);
      }
    });

    // Fetch cloud characters when connected
    fetchCloudCharacters().then((cloudChar) => {
      if (cloudChar && cloudChar.length > 0) {
        setCharacters(cloudChar);
        saveStoredCharacters(cloudChar);
      }
    });

    // Check initial session & admin state
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setCloudUser(u || null);
      setIsAdmin(isAdminUser(u?.email));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user;
      setCloudUser(u || null);
      setIsAdmin(isAdminUser(u?.email));
      
      // Clean access_token from URL address bar if present
      if (window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      if (u) {
        const googleName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Pengguna Google';
        
        try {
          const { data: cloudData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();

          if (cloudData) {
            const finalName = (cloudData.name && cloudData.name !== 'Tomy Bachtiar') ? cloudData.name : googleName;
            const syncedProf: PlayerProfile = {
              id: u.id,
              name: finalName,
              avatar: cloudData.avatar || '🧑‍💻',
              school: cloudData.school || 'Komunitas T-Games Digital',
              selectedCharacterId: cloudData.selected_character_id || profile.selectedCharacterId || 'char_rizky',
              coins: cloudData.coins ?? 0,
              playPoints: cloudData.play_points ?? 10,
              subscriptionType: cloudData.subscription_type ?? 'free',
              subscriptionExpiresAt: cloudData.subscription_expires_at ?? null,
              totalGames: profile.totalGames,
              totalScore: cloudData.total_score ?? 0,
              highestScore: cloudData.highest_score ?? 0,
              highestLevelReached: cloudData.highest_level ?? 1,
              totalCorrect: cloudData.total_correct ?? 0,
              totalWrong: cloudData.total_wrong ?? 0,
              badges: cloudData.badges || [],
              unlockedCharacters: cloudData.unlocked_characters || profile.unlockedCharacters || ['char_rizky', 'char_nayla'],
              matchHistory: Array.isArray(cloudData.match_history) ? cloudData.match_history : (profile.matchHistory || []),
            };
            setProfile(syncedProf);
            saveStoredProfile(syncedProf);
            return;
          }
        } catch (err) {
          console.error('Error fetching cloud profile:', err);
        }

        const updatedProf: PlayerProfile = {
          ...profile,
          name: googleName,
        };
        setProfile(updatedProf);
        saveStoredProfile(updatedProf);
        syncProfileToCloud(updatedProf);
      } else {
        // LOGGED OUT: Reset to clean Pemain Tamu state
        const resetProf: PlayerProfile = {
          ...DEFAULT_PROFILE,
          name: 'Pemain Tamu',
          avatar: '👤',
          school: 'Pemain Tamu',
        };
        setProfile(resetProf);
        saveStoredProfile(resetProf);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Update Profile
  const handleUpdateProfile = (updated: PlayerProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
    syncProfileToCloud(updated);
  };

  // Update Settings
  const handleUpdateSettings = (updated: GameSettings) => {
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Update Sponsors
  const handleUpdateSponsors = (updated: Sponsor[]) => {
    setSponsors(updated);
    saveStoredSponsors(updated);
    updateSponsorsInCloud(updated);
  };

  // Add Question
  const handleAddQuestion = async (q: Question) => {
    const cloudId = await pushQuestionToCloud(q);
    const finalQ = cloudId ? { ...q, id: cloudId } : q;
    setCustomQuestions((prev) => {
      const updated = [finalQ, ...prev];
      saveStoredCustomQuestions(updated);
      return updated;
    });
  };

  // Delete Question
  const handleDeleteQuestion = (questionId: string) => {
    const targetQ = customQuestions.find((q) => q.id === questionId);
    const updated = customQuestions.filter((q) => q.id !== questionId);
    setCustomQuestions(updated);
    saveStoredCustomQuestions(updated);
    if (targetQ) {
      deleteQuestionFromCloud(targetQ);
    } else {
      deleteQuestionFromCloud(questionId);
    }
  };

  // Edit Question
  const handleEditQuestion = (updatedQ: Question) => {
    setCustomQuestions((prev) => {
      const list = prev.map((q) => (q.id === updatedQ.id ? updatedQ : q));
      saveStoredCustomQuestions(list);
      return list;
    });
    updateQuestionInCloud(updatedQ);
  };

  // Unlock Character
  const handleUnlockCharacter = (charId: string, cost: number) => {
    if (profile.coins < cost) return;

    const updatedProfile: PlayerProfile = {
      ...profile,
      coins: profile.coins - cost,
      unlockedCharacters: [...profile.unlockedCharacters, charId],
      selectedCharacterId: charId,
    };

    handleUpdateProfile(updatedProfile);

    const updatedChars = characters.map((c) =>
      c.id === charId ? { ...c, unlocked: true } : c
    );
    setCharacters(updatedChars);
    saveStoredCharacters(updatedChars);

    soundFx.playCoin();
  };

  // Game Completed Handler
  const handleGameComplete = (
    finalScore: number,
    levelReached: number,
    correctCount: number,
    wrongCount: number,
    categoryName: string
  ) => {
    const coinsWon = Math.floor(finalScore / 10);
    const newTotalScore = profile.totalScore + finalScore;
    const newHighestScore = Math.max(profile.highestScore, finalScore);
    const newHighestLevel = Math.max(profile.highestLevelReached, levelReached);

    // Badges Check
    const newBadges = [...profile.badges];
    if (!newBadges.includes('badge_pemula')) newBadges.push('badge_pemula');
    if (levelReached >= 10 && !newBadges.includes('badge_raja_pinang')) {
      newBadges.push('badge_raja_pinang');
    }
    if (finalScore >= 10000 && !newBadges.includes('badge_master')) {
      newBadges.push('badge_master');
    }

    // Record Match History Item
    const newHistoryItem: MatchHistoryItem = {
      id: `mh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      category: categoryName.replace('_', ' '),
      score: finalScore,
      levelReached,
      correctCount,
      wrongCount,
      mode: 'solo',
      isVictory: levelReached >= 10,
    };

    const updatedHistory = [newHistoryItem, ...(profile.matchHistory || [])].slice(0, 20);

    const updatedProfile: PlayerProfile = {
      ...profile,
      coins: profile.coins + coinsWon,
      totalGames: profile.totalGames + 1,
      totalScore: newTotalScore,
      highestScore: newHighestScore,
      highestLevelReached: newHighestLevel,
      totalCorrect: profile.totalCorrect + correctCount,
      totalWrong: profile.totalWrong + wrongCount,
      badges: newBadges,
      matchHistory: updatedHistory,
    };

    handleUpdateProfile(updatedProfile);

    // Add to Leaderboard
    const activeChar =
      characters.find((c) => c.id === profile.selectedCharacterId) || characters[0];

    const lbItem = {
      name: profile.name,
      school: profile.school,
      score: finalScore,
      level: levelReached,
      category: categoryName.replace('_', ' '),
      avatar: activeChar.emoji,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLb = addLeaderboardEntry(lbItem);
    setLeaderboardData(updatedLb);

    // Push to cloud if Supabase connected
    pushLeaderboardToCloud(lbItem);
  };

  // Reset Data
  const handleResetData = async () => {
    try {
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (user) {
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pemain T-Games',
              email: user.email,
              avatar: '🧑‍💻',
              school: 'Komunitas T-Games Digital',
              coins: 0,
              total_score: 0,
              highest_score: 0,
              highest_level: 1,
              total_correct: 0,
              total_wrong: 0,
              badges: [],
              updated_at: new Date().toISOString(),
            });
          await signOutUser();
        }
      }
    } catch (err) {
      console.error('Error resetting cloud profile:', err);
    }

    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    window.location.reload();
  };

  const handleStartSoloGame = () => {
    if (!cloudUser) {
      soundFx.playWrong();
      setShowLoginRequiredModal(true);
      return;
    }

    const currentPoints = profile.playPoints ?? 10;
    const isPremium = isPremiumSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt);

    if (!isPremium && currentPoints <= 0) {
      soundFx.playWrong();
      setShowNoPointsModal(true);
      return;
    }

    // Premium: token tidak dipotong. Basic/Free: potong 1 token
    if (!isPremium) {
      const updatedProfile: PlayerProfile = {
        ...profile,
        playPoints: currentPoints - 1,
      };
      handleUpdateProfile(updatedProfile);
    }

    setCurrentPage('game');
  };

  const handleStartVersusMode = () => {
    if (!cloudUser) {
      soundFx.playWrong();
      setShowLoginRequiredModal(true);
      return;
    }
    setShowVersusSetup(true);
  };

  const handleLogoutRequested = () => {
    soundFx.playClick();
    setSplashState({
      active: true,
      message: 'Mengamankan Akun & Logging Out... ⚡',
      subtitle: 'Sampai Jumpa di T-Games Smart Challenge!',
    });
    signOutUser();
  };

  const activeCharacter =
    characters.find((c) => c.id === profile.selectedCharacterId) || characters[0];

  const isMatchActive = currentPage === 'versus_game' || currentPage === 'game';

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-gradient-to-b from-red-50 via-amber-50/40 to-red-100 text-gray-800 flex flex-col justify-between font-sans selection:bg-red-500 selection:text-white">
      {/* ANIMATED BRAND SPLASH SCREEN ON LOGOUT / TRANSITION */}
      {splashState.active && (
        <SplashScreen
          message={splashState.message}
          subtitle={splashState.subtitle}
          durationSeconds={2.5}
          onComplete={() => {
            setSplashState((prev) => ({ ...prev, active: false }));
            setCurrentPage('home');
          }}
        />
      )}

      {/* Top Header Navigation (Hidden during active match for full screen space) */}
      {!isMatchActive && (
        <div className="flex-none z-40">
          <HeaderNav
            currentPage={currentPage}
            onNavigate={(p) => setCurrentPage(p)}
            profile={profile}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenEvent={() => setShowEventModal(true)}
            onLogoutRequested={handleLogoutRequested}
          />
        </div>
      )}

      {/* Main View Container */}
      <main className={isMatchActive ? "flex-1 min-h-0 w-full max-w-full p-1 sm:p-3 overflow-hidden flex flex-col" : "flex-1 min-h-0 max-w-7xl w-full mx-auto p-2 sm:p-4 overflow-y-auto custom-scrollbar flex flex-col justify-between"}>
        {currentPage === 'home' && (
          <HomeView
            profile={profile}
            activeCharacter={activeCharacter}
            onStartGame={handleStartSoloGame}
            onStartVersusMode={handleStartVersusMode}
            onNavigate={(p) => setCurrentPage(p)}
            onOpenEventModal={() => setShowEventModal(true)}
          />
        )}

        {currentPage === 'game' && (
          <GameModalView
            activeCharacter={activeCharacter}
            profile={profile}
            customQuestions={customQuestions}
            onGameComplete={handleGameComplete}
            onReturnHome={() => setCurrentPage('home')}
            onOpenAdModal={() => setShowAdModal(true)}
          />
        )}

        {currentPage === 'versus_game' && versusConfig && (
          <VersusGameView
            p1Name={versusConfig.p1Name}
            p1Char={versusConfig.p1Char}
            p2Name={versusConfig.p2Name}
            p2Char={versusConfig.p2Char}
            category={versusConfig.category}
            difficulty={versusConfig.difficulty}
            matchDuration={versusConfig.matchDuration}
            targetLevel={versusConfig.targetLevel}
            customQuestions={customQuestions}
            onReturnHome={() => setCurrentPage('home')}
            onGameComplete={(winnerName, p1Score, _p2Score) => {
              const isP1Win = winnerName === profile.name || winnerName === 'Pemain 1' || winnerName === 'P1';
              const vsHistoryItem: MatchHistoryItem = {
                id: `mh_vs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                date: new Date().toISOString(),
                category: versusConfig.category.replace('_', ' '),
                score: p1Score,
                levelReached: versusConfig.targetLevel,
                correctCount: Math.floor(p1Score / 100),
                wrongCount: 0,
                mode: 'versus',
                isVictory: isP1Win,
              };
              const updatedHistory = [vsHistoryItem, ...(profile.matchHistory || [])].slice(0, 20);
              handleUpdateProfile({
                ...profile,
                totalGames: profile.totalGames + 1,
                totalScore: profile.totalScore + p1Score,
                highestScore: Math.max(profile.highestScore, p1Score),
                matchHistory: updatedHistory,
              });
            }}
          />
        )}

        {currentPage === 'leaderboard' && (
          <LeaderboardView
            leaderboardData={leaderboardData}
            currentUserName={profile.name}
          />
        )}

        {currentPage === 'profile' && (
          <ProfileView
            profile={profile}
            characters={characters}
            onUpdateProfile={handleUpdateProfile}
            onUnlockCharacter={handleUnlockCharacter}
          />
        )}

        {currentPage === 'bank' && (
          <QuestionBankView
            customQuestions={customQuestions}
            onAddQuestion={handleAddQuestion}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        )}

        {currentPage === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              sponsors={sponsors}
              onUpdateSponsors={handleUpdateSponsors}
            />
          ) : (
            <div className="p-8 bg-white rounded-3xl border-4 border-red-400 shadow-xl text-center space-y-3 max-w-lg mx-auto">
              <div className="text-4xl">🔒</div>
              <h3 className="font-black text-xl text-red-700">AKSES TERBATAS ADMINISTRATOR</h3>
              <p className="text-xs font-bold text-gray-600">
                Halaman ini hanya dapat diakses oleh Administrator Resmi ({ADMIN_EMAILS[0]}). Silakan login dengan akun admin yang sesuai.
              </p>
              <button
                onClick={() => setCurrentPage('home')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow"
              >
                Kembali ke Menu Utama
              </button>
            </div>
          )
        )}

        {currentPage === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
          />
        )}

        {currentPage === 'about' && <AboutView />}
      </main>

      {/* Bottom Sponsor Banner (Hidden during active match for full screen space) */}
      {!isMatchActive && (
        <footer className="flex-none mt-auto">
          <SponsorBanner sponsors={sponsors} />
        </footer>
      )}

      {/* VERSUS SETUP MODAL */}
      {showVersusSetup && (
        <VersusSetupModal
          characters={characters}
          defaultP1Character={activeCharacter}
          onClose={() => setShowVersusSetup(false)}
          onStartVersus={(p1Name, p1Char, p2Name, p2Char, category, difficulty, matchDuration, targetLevel) => {
            if (!cloudUser) {
              soundFx.playWrong();
              setShowVersusSetup(false);
              setShowLoginRequiredModal(true);
              return;
            }

            const isPremium = isPremiumSubscriber(profile.subscriptionType, profile.subscriptionExpiresAt);
            const currentPoints = profile.playPoints ?? 10;

            if (!isPremium && currentPoints <= 0) {
              soundFx.playWrong();
              setShowVersusSetup(false);
              setShowNoPointsModal(true);
              return;
            }

            // Potong token hanya jika bukan Premium
            if (!isPremium) {
              handleUpdateProfile({ ...profile, playPoints: currentPoints - 1 });
            }

            setVersusConfig({
              p1Name,
              p1Char,
              p2Name,
              p2Char,
              category,
              difficulty,
              matchDuration,
              targetLevel,
            });
            setShowVersusSetup(false);
            setCurrentPage('versus_game');
          }}
        />
      )}

      {/* 17 AGUSTUS EVENT MODAL */}
      {showEventModal && (
        <EventModal
          onClose={() => setShowEventModal(false)}
          onStartEventGame={() => {
            setShowEventModal(false);
            if (!cloudUser) {
              soundFx.playWrong();
              setShowLoginRequiredModal(true);
              return;
            }
            handleStartSoloGame();
          }}
        />
      )}

      {/* REWARDED AD MODAL */}
      {showAdModal && (
        <RewardedAdModal
          onClose={() => setShowAdModal(false)}
          onAdCompleted={() => {
            setShowAdModal(false);
            soundFx.playCoin();
          }}
        />
      )}

      {/* NO POINTS / OUT OF TICKETS MODAL */}
      {showNoPointsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-red-950 via-red-900 to-amber-950 text-white w-full max-w-sm rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="text-center px-6 pt-6 pb-4 space-y-2 border-b border-amber-400/30">
              <div className="w-20 h-20 rounded-full bg-rose-700 border-4 border-rose-400 flex items-center justify-center text-4xl mx-auto shadow-xl animate-pulse">
                🎫
              </div>
              <h3 className="text-xl font-black text-amber-300 uppercase tracking-tight">TIKET BERMAIN HABIS!</h3>
              <p className="text-xs font-bold text-amber-100/80 leading-relaxed">
                Halo <span className="text-amber-300 font-black">{profile.name}</span> — Saldo Tiket Bermainmu sudah habis.<br />
                Pilih salah satu cara di bawah untuk lanjut bermain:
              </p>
            </div>

            {/* Options */}
            <div className="px-5 py-4 space-y-3">

              {/* Option 1: WA Admin */}
              <a
                href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Halo Kak ${ADMIN_NAME}! 👋\n\nSaya ingin Top-Up Tiket Bermain T-Games.\n\n📛 Nama: ${profile.name}\n🏫 Sekolah: ${profile.school}\n📧 Email Google: (email saya)\n\nMohon dibantu proses top-up tiketnya ya kak. Terima kasih! 🙏`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowNoPointsModal(false)}
                className="block w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm rounded-2xl shadow-lg border-b-4 border-emerald-800 text-center transition-transform hover:scale-[1.02] active:scale-95"
              >
                <div className="text-base">💬 Chat Admin via WhatsApp</div>
                <div className="text-[10px] font-bold opacity-80 mt-0.5">085241476413 — Pesan otomatis sudah disiapkan!</div>
              </a>

              {/* Option 1b: Email Admin */}
              <a
                href={`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent('Top-Up Tiket T-Games')}&body=${encodeURIComponent(
                  `Halo Kak ${ADMIN_NAME},\n\nSaya ingin melakukan Top-Up Tiket Bermain T-Games.\n\nData Akun Saya:\n📛 Nama: ${profile.name}\n🏫 Sekolah: ${profile.school}\n📧 Email Google: (tuliskan email Anda)\n\nMohon dibantu prosesnya. Terima kasih! 🙏`
                )}`}
                onClick={() => setShowNoPointsModal(false)}
                className="block w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-sm rounded-2xl shadow-lg border-b-4 border-blue-800 text-center transition-transform hover:scale-[1.02] active:scale-95"
              >
                <div className="text-sm">📧 Kirim Email ke Admin</div>
                <div className="text-[10px] font-bold opacity-80 mt-0.5">{ADMIN_EMAIL}</div>
              </a>

              {/* Option 2: Watch Ad for free token */}
              <button
                onClick={() => {
                  setShowNoPointsModal(false);
                  setShowAdModal(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-red-950 font-black text-sm rounded-2xl shadow-lg border-b-4 border-amber-700 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span>📺 Tonton Iklan → Dapat +1 Tiket GRATIS</span>
              </button>

              {/* Subscription promo box */}
              <div className="bg-white/10 rounded-2xl p-3 border border-amber-300/30 space-y-1.5">
                <div className="text-[10px] font-black text-amber-300 uppercase tracking-widest">💡 Solusi Lebih Hemat:</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-blue-800/50 rounded-xl p-2 border border-blue-400/40">
                    <div className="font-black text-blue-200">🥈 BASIC</div>
                    <div className="text-blue-100/80">+100 Token / Bulan</div>
                  </div>
                  <div className="bg-amber-700/50 rounded-xl p-2 border border-amber-400/40">
                    <div className="font-black text-amber-200">🥇 PREMIUM</div>
                    <div className="text-amber-100/80">♾️ Unlimited — No Deduct!</div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `Halo Kak ${ADMIN_NAME}! 👋\n\nSaya tertarik berlangganan paket T-Games.\n\n📛 Nama: ${profile.name}\n🏫 Sekolah: ${profile.school}\n\nBisa info harga paket Basic dan Premium? Terima kasih! 🙏`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowNoPointsModal(false)}
                  className="block w-full text-center py-1.5 bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-[11px] rounded-xl transition-colors"
                >
                  Tanya Info Berlangganan ke Admin →
                </a>
              </div>

              {/* Close */}
              <button
                onClick={() => setShowNoPointsModal(false)}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-xs rounded-xl border border-white/10"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY GOOGLE LOGIN REQUIRED MODAL */}
      <LoginRequiredModal
        isOpen={showLoginRequiredModal}
        onClose={() => setShowLoginRequiredModal(false)}
      />
    </div>
  );
}
