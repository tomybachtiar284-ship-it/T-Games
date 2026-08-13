/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Character,
  GameSettings,
  LeaderboardEntry,
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
import { Difficulty, MathCategory } from './types';
import { supabase, syncProfileToCloud, fetchCloudLeaderboard, pushLeaderboardToCloud } from './utils/supabase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [profile, setProfile] = useState<PlayerProfile>(getStoredProfile());
  const [settings, setSettings] = useState<GameSettings>(getStoredSettings());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(getStoredLeaderboard());
  const [customQuestions, setCustomQuestions] = useState<Question[]>(getStoredCustomQuestions());
  const [sponsors, setSponsors] = useState<Sponsor[]>(getStoredSponsors());
  const [characters, setCharacters] = useState<Character[]>(getStoredCharacters());

  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [showVersusSetup, setShowVersusSetup] = useState<boolean>(false);
  const [versusConfig, setVersusConfig] = useState<{
    p1Name: string;
    p1Char: Character;
    p2Name: string;
    p2Char: Character;
    category: MathCategory;
    difficulty: Difficulty;
  } | null>(null);

  // Sync sound muted state on initial load
  useEffect(() => {
    soundFx.setMuted(!settings.soundEnabled);
  }, [settings]);

  // Supabase Auth Listener & Cloud Sync
  useEffect(() => {
    if (!supabase) return;

    // Fetch cloud leaderboard when connected
    fetchCloudLeaderboard().then((cloudLb) => {
      if (cloudLb && cloudLb.length > 0) {
        setLeaderboardData(cloudLb);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        // Auto sync profile on login
        const googleName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || profile.name;
        const updatedProf: PlayerProfile = {
          ...profile,
          name: googleName,
        };
        setProfile(updatedProf);
        saveStoredProfile(updatedProf);
        syncProfileToCloud(updatedProf);
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
  };

  // Add Question
  const handleAddQuestion = (q: Question) => {
    const updated = [q, ...customQuestions];
    setCustomQuestions(updated);
    saveStoredCustomQuestions(updated);
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
  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const activeCharacter =
    characters.find((c) => c.id === profile.selectedCharacterId) || characters[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-amber-50/40 to-red-100 text-gray-800 flex flex-col justify-between font-sans selection:bg-red-500 selection:text-white">
      {/* Top Header Navigation */}
      <HeaderNav
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        profile={profile}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenEvent={() => setShowEventModal(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 my-2">
        {currentPage === 'home' && (
          <HomeView
            profile={profile}
            activeCharacter={activeCharacter}
            onStartGame={() => setCurrentPage('game')}
            onStartVersusMode={() => setShowVersusSetup(true)}
            onNavigate={(p) => setCurrentPage(p)}
            onOpenEventModal={() => setShowEventModal(true)}
          />
        )}

        {currentPage === 'game' && (
          <GameModalView
            activeCharacter={activeCharacter}
            profile={profile}
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
            onReturnHome={() => setCurrentPage('home')}
            onGameComplete={(winnerName, p1Score, p2Score) => {
              // Option to record versus winner
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
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard
            sponsors={sponsors}
            onUpdateSponsors={handleUpdateSponsors}
          />
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

      {/* Bottom Sponsor Banner */}
      <footer className="mt-auto">
        <SponsorBanner sponsors={sponsors} />
      </footer>

      {/* VERSUS SETUP MODAL */}
      {showVersusSetup && (
        <VersusSetupModal
          characters={characters}
          defaultP1Character={activeCharacter}
          onClose={() => setShowVersusSetup(false)}
          onStartVersus={(p1Name, p1Char, p2Name, p2Char, category, difficulty) => {
            setVersusConfig({
              p1Name,
              p1Char,
              p2Name,
              p2Char,
              category,
              difficulty,
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
            setCurrentPage('game');
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
    </div>
  );
}
