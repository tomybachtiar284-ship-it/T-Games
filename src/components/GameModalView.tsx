import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ActiveGameState, Character, Difficulty, MathCategory, PlayerProfile, Question } from '../types';
import { generateQuestion } from '../utils/mathGenerator';
import { soundFx } from '../utils/audio';
import { PinangPoleView } from './PinangPoleView';
import { QuestionCard } from './QuestionCard';
import { Trophy, RefreshCw, Home, Zap, Star, ShieldCheck, Flame, Tv } from 'lucide-react';

interface GameModalViewProps {
  activeCharacter: Character;
  profile: PlayerProfile;
  onGameComplete: (
    finalScore: number,
    levelReached: number,
    correctCount: number,
    wrongCount: number,
    categoryName: string
  ) => void;
  onReturnHome: () => void;
  onOpenAdModal: () => void;
}

export const GameModalView: React.FC<GameModalViewProps> = ({
  activeCharacter,
  profile,
  onGameComplete,
  onReturnHome,
  onOpenAdModal,
}) => {
  // Game Setup State
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const [selectedCategory, setSelectedCategory] = useState<MathCategory>('penjumlahan');
  const [gameMode, setGameMode] = useState<'campaign' | 'custom'>('campaign');

  // Active Gameplay State
  const [activeState, setActiveState] = useState<ActiveGameState>({
    currentLevel: 1,
    targetLevel: 10,
    score: 0,
    lives: 3,
    maxLives: 3,
    comboCount: 0,
    maxCombo: 0,
    questionsAnswered: 0,
    correctCount: 0,
    wrongCount: 0,
    startTime: Date.now(),
    timeSpentSeconds: 0,
    difficulty: 'normal',
    category: 'penjumlahan',
    mode: 'campaign',
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isClimbing, setIsClimbing] = useState(false);
  const [isSlipping, setIsSlipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get category mapped to campaign level
  const getCategoryForLevel = (lvl: number): MathCategory => {
    const levelMap: Record<number, MathCategory> = {
      1: 'penjumlahan',
      2: 'pengurangan',
      3: 'perkalian',
      4: 'pembagian',
      5: 'campuran',
      6: 'pecahan',
      7: 'persentase',
      8: 'bangun_datar',
      9: 'logika',
      10: 'campuran',
    };
    return levelMap[lvl] || 'campuran';
  };

  // Start Playing Game
  const handleStartPlaying = () => {
    soundFx.playClick();
    const initialCategory = gameMode === 'campaign' ? getCategoryForLevel(1) : selectedCategory;

    setActiveState({
      currentLevel: 1,
      targetLevel: 10,
      score: 0,
      lives: 3,
      maxLives: 3,
      comboCount: 0,
      maxCombo: 0,
      questionsAnswered: 0,
      correctCount: 0,
      wrongCount: 0,
      startTime: Date.now(),
      timeSpentSeconds: 0,
      difficulty: selectedDifficulty,
      category: initialCategory,
      mode: gameMode,
    });

    const firstQ = generateQuestion(initialCategory, selectedDifficulty);
    setCurrentQuestion(firstQ);
    setGameState('playing');
  };

  // Handle Answer
  const handleAnswer = (selectedIdx: number, isTimeOut: boolean = false) => {
    if (!currentQuestion || isSubmitting) return;
    setIsSubmitting(true);

    const isCorrect = !isTimeOut && selectedIdx === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      // Correct!
      setIsClimbing(true);
      soundFx.playClimb();

      setActiveState((prev) => {
        const nextCombo = prev.comboCount + 1;
        const comboBonus = Math.min(nextCombo, 5) * 20;
        const pointsWon = currentQuestion.points + comboBonus;
        const nextLevel = Math.min(10, prev.currentLevel + 1);

        return {
          ...prev,
          currentLevel: nextLevel,
          score: prev.score + pointsWon,
          comboCount: nextCombo,
          maxCombo: Math.max(prev.maxCombo, nextCombo),
          questionsAnswered: prev.questionsAnswered + 1,
          correctCount: prev.correctCount + 1,
        };
      });

      setTimeout(() => {
        setIsClimbing(false);
        setIsSubmitting(false);

        // Check victory condition (Reached Peak Level 10)
        if (activeState.currentLevel >= 10) {
          triggerVictory();
        } else {
          loadNextQuestion();
        }
      }, 1200);
    } else {
      // Wrong or Timeout!
      setIsSlipping(true);

      setActiveState((prev) => {
        const nextLives = Math.max(0, prev.lives - 1);
        const nextLevel = Math.max(1, prev.currentLevel - 1);

        return {
          ...prev,
          currentLevel: nextLevel,
          lives: nextLives,
          comboCount: 0,
          questionsAnswered: prev.questionsAnswered + 1,
          wrongCount: prev.wrongCount + 1,
        };
      });

      setTimeout(() => {
        setIsSlipping(false);
        setIsSubmitting(false);

        // Check defeat condition (Out of lives)
        if (activeState.lives <= 1) {
          triggerDefeat();
        } else {
          loadNextQuestion();
        }
      }, 1200);
    }
  };

  const loadNextQuestion = () => {
    const nextLvl = activeState.currentLevel;
    const cat = gameMode === 'campaign' ? getCategoryForLevel(nextLvl) : selectedCategory;
    const q = generateQuestion(cat, selectedDifficulty);
    setCurrentQuestion(q);
  };

  const triggerVictory = () => {
    soundFx.playVictory();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    const elapsed = Math.floor((Date.now() - activeState.startTime) / 1000);

    onGameComplete(
      activeState.score + 1000, // Peak bonus
      10,
      activeState.correctCount,
      activeState.wrongCount,
      activeState.category
    );

    setGameState('result');
  };

  const triggerDefeat = () => {
    soundFx.playWrong();
    const elapsed = Math.floor((Date.now() - activeState.startTime) / 1000);

    onGameComplete(
      activeState.score,
      activeState.currentLevel,
      activeState.correctCount,
      activeState.wrongCount,
      activeState.category
    );

    setGameState('result');
  };

  // 1. SETUP STAGE (Choose Mode, Category & Difficulty)
  if (gameState === 'setup') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-block bg-red-100 text-red-800 text-xs font-black px-3 py-0.5 rounded-full border border-red-300 uppercase">
            PERSIAPAN PANJAT PINANG
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800">PILIH MODE PERMAINAN</h2>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-mode-campaign"
            onClick={() => setGameMode('campaign')}
            className={`p-4 rounded-2xl border-2 font-black text-xs sm:text-sm text-center transition-all ${
              gameMode === 'campaign'
                ? 'bg-red-600 text-white border-amber-300 shadow-lg scale-[1.02]'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50'
            }`}
          >
            <span className="block text-lg mb-1">🏁 PETUALANGAN 10 LEVEL</span>
            <span className="text-[10px] font-bold opacity-90">Panjat dari Level 1 sampai Puncak</span>
          </button>

          <button
            id="btn-mode-custom"
            onClick={() => setGameMode('custom')}
            className={`p-4 rounded-2xl border-2 font-black text-xs sm:text-sm text-center transition-all ${
              gameMode === 'custom'
                ? 'bg-red-600 text-white border-amber-300 shadow-lg scale-[1.02]'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50'
            }`}
          >
            <span className="block text-lg mb-1">🎯 LATIHAN BEBAS</span>
            <span className="text-[10px] font-bold opacity-90">Bebas pilih materi & kesulitan</span>
          </button>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
            Tingkat Kesulitan Soal:
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              id="btn-diff-mudah"
              onClick={() => setSelectedDifficulty('mudah')}
              className={`p-3 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all ${
                selectedDifficulty === 'mudah'
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              🟢 MUDAH
              <span className="block text-[10px] font-bold opacity-80">20 Detik</span>
            </button>

            <button
              id="btn-diff-normal"
              onClick={() => setSelectedDifficulty('normal')}
              className={`p-3 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all ${
                selectedDifficulty === 'normal'
                  ? 'bg-amber-500 text-white border-amber-600 shadow'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              🟡 NORMAL
              <span className="block text-[10px] font-bold opacity-80">15 Detik</span>
            </button>

            <button
              id="btn-diff-sulit"
              onClick={() => setSelectedDifficulty('sulit')}
              className={`p-3 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all ${
                selectedDifficulty === 'sulit'
                  ? 'bg-rose-600 text-white border-rose-700 shadow'
                  : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
              }`}
            >
              🔴 SULIT
              <span className="block text-[10px] font-bold opacity-80">10 Detik</span>
            </button>
          </div>
        </div>

        {/* Category Picker (if Custom mode) */}
        {gameMode === 'custom' && (
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
              Kategori Soal Matematika:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border rounded-2xl">
              {[
                { id: 'penjumlahan', label: '➕ Penjumlahan' },
                { id: 'pengurangan', label: '➖ Pengurangan' },
                { id: 'perkalian', label: '✖️ Perkalian' },
                { id: 'pembagian', label: '➕ Pembagian' },
                { id: 'pecahan', label: '🍕 Pecahan' },
                { id: 'persentase', label: '📊 Persentase' },
                { id: 'bangun_datar', label: '📐 Bangun Datar' },
                { id: 'bangun_ruang', label: '📦 Bangun Ruang' },
                { id: 'logika', label: '💡 Logika' },
                { id: 'campuran', label: '🎲 Campuran' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  id={`btn-cat-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id as MathCategory)}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white border-amber-300 font-black'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="pt-2 flex gap-3">
          <button
            id="btn-setup-back-home"
            onClick={onReturnHome}
            className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-2xl border border-gray-300"
          >
            Batal
          </button>
          <button
            id="btn-setup-start-game"
            onClick={handleStartPlaying}
            className="w-2/3 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-base rounded-2xl shadow-xl border-b-4 border-red-800 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>PANJAT SEKARANG! 🧗‍♂️</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. ACTIVE PLAYING STAGE
  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Bamboo Pole Visual */}
        <div className="md:col-span-5">
          <PinangPoleView
            currentLevel={activeState.currentLevel}
            character={activeCharacter}
            isClimbing={isClimbing}
            isSlipping={isSlipping}
          />
        </div>

        {/* Right: Active Math Question Board */}
        <div className="md:col-span-7">
          <QuestionCard
            question={currentQuestion}
            questionNumber={activeState.questionsAnswered + 1}
            totalQuestions={10}
            score={activeState.score}
            lives={activeState.lives}
            maxLives={activeState.maxLives}
            comboCount={activeState.comboCount}
            onAnswer={handleAnswer}
            isSubmitting={isSubmitting}
            onOpenAdModal={onOpenAdModal}
          />
        </div>
      </div>
    );
  }

  // 3. END GAME RESULT STAGE
  const isWon = activeState.currentLevel >= 10;
  const accuracy =
    activeState.questionsAnswered > 0
      ? Math.round((activeState.correctCount / activeState.questionsAnswered) * 100)
      : 0;

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center space-y-6">
      {/* Result Header Banner */}
      <div className="space-y-2">
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg border-4 ${
            isWon
              ? 'bg-amber-400 text-white border-amber-200 animate-bounce'
              : 'bg-rose-100 border-rose-300 text-rose-600'
          }`}
        >
          {isWon ? '🏆' : '💦'}
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-gray-800">
          {isWon ? 'SELAMAT! KANTAK PUNCAK!' : 'KAMU TERPELESET!'}
        </h2>

        <p className="text-xs sm:text-sm font-extrabold text-gray-600">
          {isWon
            ? 'Hebat! Kamu berhasil menjawab soal dan mencapai Puncak Pohon Pinang!'
            : 'Pantang menyerah! Asah terus kemampuan matematikamu dan coba lagi!'}
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 text-left">
        <div>
          <span className="block text-[10px] font-bold text-gray-500 uppercase">SKOR AKHIR</span>
          <span className="font-black text-lg text-red-600">{activeState.score}</span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-500 uppercase">LEVEL DICAPAI</span>
          <span className="font-black text-lg text-amber-700">Level {activeState.currentLevel}</span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-500 uppercase">AKURASI</span>
          <span className="font-black text-lg text-emerald-600">{accuracy}%</span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-500 uppercase">JAWABAN BENAR</span>
          <span className="font-black text-sm text-emerald-700">✅ {activeState.correctCount} Soal</span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-500 uppercase">JAWABAN SALAH</span>
          <span className="font-black text-sm text-rose-700">❌ {activeState.wrongCount} Soal</span>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-gray-500 uppercase">COMBO TERTINGGI</span>
          <span className="font-black text-sm text-orange-600">⚡ ×{activeState.maxCombo}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          id="btn-result-retry"
          onClick={handleStartPlaying}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg border-b-4 border-emerald-800 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
          <span>MAIN LAGI</span>
        </button>

        <button
          id="btn-result-home"
          onClick={onReturnHome}
          className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm sm:text-base rounded-2xl border border-gray-300 flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span>KEMBALI KE HOME</span>
        </button>
      </div>
    </div>
  );
};
