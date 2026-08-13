import React, { useState, useEffect, useCallback } from 'react';
import { Character, Difficulty, MathCategory, Question } from '../types';
import { generateQuestion } from '../utils/mathGenerator';
import { soundFx } from '../utils/audio';
import { PinangPoleView } from './PinangPoleView';
import { Swords, Trophy, RotateCcw, Home, Clock, AlertTriangle, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface VersusGameViewProps {
  p1Name: string;
  p1Char: Character;
  p2Name: string;
  p2Char: Character;
  category: MathCategory;
  difficulty: Difficulty;
  onReturnHome: () => void;
  onGameComplete?: (winnerName: string, p1Score: number, p2Score: number) => void;
}

const P1_KEYS = ['a', 's', 'd', 'f'];
const P2_KEYS = ['h', 'j', 'k', 'l'];
const P2_ARROWS = ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'];

export const VersusGameView: React.FC<VersusGameViewProps> = ({
  p1Name,
  p1Char,
  p2Name,
  p2Char,
  category,
  difficulty,
  onReturnHome,
  onGameComplete,
}) => {
  // GAME TIME (60 Seconds match)
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'p1' | 'p2' | 'draw' | null>(null);

  // PLAYER 1 STATE
  const [p1Level, setP1Level] = useState<number>(0);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p1Question, setP1Question] = useState<Question>(() => generateQuestion(category, difficulty));
  const [p1IsClimbing, setP1IsClimbing] = useState<boolean>(false);
  const [p1IsSlipping, setP1IsSlipping] = useState<boolean>(false);
  const [p1Feedback, setP1Feedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);

  // PLAYER 2 STATE
  const [p2Level, setP2Level] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [p2Question, setP2Question] = useState<Question>(() => generateQuestion(category, difficulty));
  const [p2IsClimbing, setP2IsClimbing] = useState<boolean>(false);
  const [p2IsSlipping, setP2IsSlipping] = useState<boolean>(false);
  const [p2Feedback, setP2Feedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);

  // COUNTDOWN TIMER
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, p1Level, p2Level, p1Score, p2Score]);

  // HANDLE MATCH FINISH WHEN TIME IS UP
  const handleTimeUp = () => {
    setIsGameOver(true);
    soundFx.playVictory();

    if (p1Level > p2Level) {
      setWinner('p1');
      if (onGameComplete) onGameComplete(p1Name, p1Score, p2Score);
    } else if (p2Level > p1Level) {
      setWinner('p2');
      if (onGameComplete) onGameComplete(p2Name, p1Score, p2Score);
    } else {
      if (p1Score > p2Score) {
        setWinner('p1');
      } else if (p2Score > p1Score) {
        setWinner('p2');
      } else {
        setWinner('draw');
      }
    }
  };

  // CHECK PEAK VICTORY (LEVEL 10 REACHED)
  const checkVictory = (player: 'p1' | 'p2', newLevel: number, currentP1Level: number, currentP2Level: number) => {
    if (newLevel >= 10) {
      setIsGameOver(true);
      setWinner(player);
      soundFx.playVictory();
      if (onGameComplete) {
        onGameComplete(player === 'p1' ? p1Name : p2Name, p1Score, p2Score);
      }
    }
  };

  // ANSWER HANDLER FOR PLAYER 1
  const handleP1Answer = useCallback(
    (selectedIndex: number) => {
      if (isGameOver || p1IsSlipping || p1IsClimbing) return;

      if (selectedIndex === p1Question.correctAnswerIndex) {
        // CORRECT
        soundFx.playCorrect();
        setP1IsClimbing(true);
        setP1Score((s) => s + 100);
        setP1Feedback({ type: 'correct', text: 'BENAR! +1 Level 🚀' });

        const nextLvl = Math.min(10, p1Level + 1);
        setP1Level(nextLvl);

        setTimeout(() => {
          setP1IsClimbing(false);
          setP1Feedback(null);
          setP1Question(generateQuestion(category, difficulty));
          checkVictory('p1', nextLvl, nextLvl, p2Level);
        }, 600);
      } else {
        // WRONG
        soundFx.playWrong();
        setP1IsSlipping(true);
        setP1Feedback({ type: 'wrong', text: 'SALAH! Terpeleset 💦' });

        const nextLvl = Math.max(0, p1Level - 1);
        setP1Level(nextLvl);

        setTimeout(() => {
          setP1IsSlipping(false);
          setP1Feedback(null);
          setP1Question(generateQuestion(category, difficulty));
        }, 1200);
      }
    },
    [isGameOver, p1IsSlipping, p1IsClimbing, p1Question, p1Level, p2Level, category, difficulty]
  );

  // ANSWER HANDLER FOR PLAYER 2
  const handleP2Answer = useCallback(
    (selectedIndex: number) => {
      if (isGameOver || p2IsSlipping || p2IsClimbing) return;

      if (selectedIndex === p2Question.correctAnswerIndex) {
        // CORRECT
        soundFx.playCorrect();
        setP2IsClimbing(true);
        setP2Score((s) => s + 100);
        setP2Feedback({ type: 'correct', text: 'BENAR! +1 Level 🚀' });

        const nextLvl = Math.min(10, p2Level + 1);
        setP2Level(nextLvl);

        setTimeout(() => {
          setP2IsClimbing(false);
          setP2Feedback(null);
          setP2Question(generateQuestion(category, difficulty));
          checkVictory('p2', nextLvl, p1Level, nextLvl);
        }, 600);
      } else {
        // WRONG
        soundFx.playWrong();
        setP2IsSlipping(true);
        setP2Feedback({ type: 'wrong', text: 'SALAH! Terpeleset 💦' });

        const nextLvl = Math.max(0, p2Level - 1);
        setP2Level(nextLvl);

        setTimeout(() => {
          setP2IsSlipping(false);
          setP2Feedback(null);
          setP2Question(generateQuestion(category, difficulty));
        }, 1200);
      }
    },
    [isGameOver, p2IsSlipping, p2IsClimbing, p2Question, p2Level, p1Level, category, difficulty]
  );

  // KEYBOARD LISTENER FOR BOTH PLAYERS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // P1 Keys (a, s, d, f or 1, 2, 3, 4)
      const p1Idx = P1_KEYS.indexOf(key.toLowerCase());
      if (p1Idx !== -1) {
        handleP1Answer(p1Idx);
        return;
      }
      if (['1', '2', '3', '4'].includes(key)) {
        handleP1Answer(parseInt(key) - 1);
        return;
      }

      // P2 Keys (h, j, k, l or Arrows)
      const p2Idx = P2_KEYS.indexOf(key.toLowerCase());
      if (p2Idx !== -1) {
        handleP2Answer(p2Idx);
        return;
      }
      const p2ArrowIdx = P2_ARROWS.indexOf(key);
      if (p2ArrowIdx !== -1) {
        handleP2Answer(p2ArrowIdx);
        return;
      }
      if (['7', '8', '9', '0'].includes(key)) {
        const numMap: { [k: string]: number } = { '7': 0, '8': 1, '9': 2, '0': 3 };
        handleP2Answer(numMap[key]);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleP1Answer, handleP2Answer]);

  // RESET MATCH
  const handleRestartMatch = () => {
    soundFx.playClick();
    setTimeLeft(60);
    setIsGameOver(false);
    setWinner(null);

    setP1Level(0);
    setP1Score(0);
    setP1IsClimbing(false);
    setP1IsSlipping(false);
    setP1Feedback(null);
    setP1Question(generateQuestion(category, difficulty));

    setP2Level(0);
    setP2Score(0);
    setP2IsClimbing(false);
    setP2IsSlipping(false);
    setP2Feedback(null);
    setP2Question(generateQuestion(category, difficulty));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-12">
      {/* MATCH HEADER BAR */}
      <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white p-3 rounded-2xl border-4 border-amber-300 shadow-xl flex items-center justify-between gap-4">
        {/* Left: Player 1 Status */}
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full ${p1Char.avatarBg} border-2 border-white flex items-center justify-center text-xl shadow`}>
            {p1Char.emoji}
          </div>
          <div>
            <div className="font-black text-xs sm:text-sm text-amber-200 uppercase leading-none">
              🔴 {p1Name}
            </div>
            <div className="text-[11px] font-extrabold text-white">
              Skor: <span className="text-amber-300">{p1Score}</span> | Level: {p1Level}/10
            </div>
          </div>
        </div>

        {/* Center: Timer & VS Badge */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-amber-300 shadow">
            <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className={`font-black text-base sm:text-lg ${timeLeft <= 10 ? 'text-red-300 animate-ping' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="text-[10px] font-black tracking-widest text-amber-200 uppercase mt-0.5">
            T-GAMES SMART CHALLENGE ⚡
          </div>
        </div>

        {/* Right: Player 2 Status */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="font-black text-xs sm:text-sm text-amber-200 uppercase leading-none">
              🟡 {p2Name}
            </div>
            <div className="text-[11px] font-extrabold text-white">
              Level: {p2Level}/10 | Skor: <span className="text-amber-300">{p2Score}</span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-full ${p2Char.avatarBg} border-2 border-white flex items-center justify-center text-xl shadow`}>
            {p2Char.emoji}
          </div>
        </div>
      </div>

      {/* DUAL PLAYER ARENA GRID (SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ==================== PEMAIN 1 (KIRI) ==================== */}
        <div className="bg-white/90 rounded-3xl border-4 border-blue-400 p-4 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
          {/* Header Tag */}
          <div className="flex items-center justify-between bg-blue-600 text-white px-3 py-1 rounded-full border border-blue-300 shadow-sm text-xs font-black">
            <span>🔴 {p1Name} (KIRI)</span>
            <span className="bg-blue-800 text-amber-300 px-2 py-0.5 rounded-full text-[10px]">
              LEVEL {p1Level}
            </span>
          </div>

          {/* Feedback Overlay */}
          {p1Feedback && (
            <div
              className={`absolute top-12 left-4 right-4 z-30 p-2 rounded-xl text-center font-black text-xs shadow-lg animate-bounce ${
                p1Feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {p1Feedback.text}
            </div>
          )}

          {/* Pinang Pole P1 */}
          <div className="w-full flex justify-center my-1">
            <PinangPoleView
              currentLevel={p1Level}
              character={p1Char}
              isClimbing={p1IsClimbing}
              isSlipping={p1IsSlipping}
              showDetails={false}
            />
          </div>

          {/* Question Box P1 */}
          <div className="bg-blue-50/80 p-3.5 rounded-2xl border-2 border-blue-300 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-black text-blue-800 border-b border-blue-200 pb-1">
              <span>🎯 SOAL PEMAIN 1</span>
              <span className="text-gray-500">Key: [A] [S] [D] [F]</span>
            </div>

            <div className="text-center font-black text-sm sm:text-base text-gray-800 py-1 min-h-[44px] flex items-center justify-center">
              {p1Question.questionText}
            </div>

            {/* Options Grid P1 */}
            <div className="grid grid-cols-2 gap-2">
              {p1Question.options.map((opt, idx) => {
                const keyLabel = P1_KEYS[idx].toUpperCase();
                return (
                  <button
                    key={idx}
                    onClick={() => handleP1Answer(idx)}
                    disabled={isGameOver || p1IsClimbing || p1IsSlipping}
                    className="p-2.5 bg-white hover:bg-blue-100 disabled:opacity-50 text-blue-950 font-black rounded-xl border-2 border-blue-300 text-xs sm:text-sm text-left flex items-center justify-between shadow-xs transition-transform active:scale-95"
                  >
                    <span className="truncate">{opt}</span>
                    <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                      {keyLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================== PEMAIN 2 (KANAN) ==================== */}
        <div className="bg-white/90 rounded-3xl border-4 border-amber-400 p-4 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
          {/* Header Tag */}
          <div className="flex items-center justify-between bg-amber-500 text-white px-3 py-1 rounded-full border border-amber-300 shadow-sm text-xs font-black">
            <span>🟡 {p2Name} (KANAN)</span>
            <span className="bg-amber-700 text-amber-200 px-2 py-0.5 rounded-full text-[10px]">
              LEVEL {p2Level}
            </span>
          </div>

          {/* Feedback Overlay */}
          {p2Feedback && (
            <div
              className={`absolute top-12 left-4 right-4 z-30 p-2 rounded-xl text-center font-black text-xs shadow-lg animate-bounce ${
                p2Feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {p2Feedback.text}
            </div>
          )}

          {/* Pinang Pole P2 */}
          <div className="w-full flex justify-center my-1">
            <PinangPoleView
              currentLevel={p2Level}
              character={p2Char}
              isClimbing={p2IsClimbing}
              isSlipping={p2IsSlipping}
              showDetails={false}
            />
          </div>

          {/* Question Box P2 */}
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border-2 border-amber-300 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-black text-amber-900 border-b border-amber-200 pb-1">
              <span>🎯 SOAL PEMAIN 2</span>
              <span className="text-gray-500">Key: [H][J][K][L] / Panah</span>
            </div>

            <div className="text-center font-black text-sm sm:text-base text-gray-800 py-1 min-h-[44px] flex items-center justify-center">
              {p2Question.questionText}
            </div>

            {/* Options Grid P2 */}
            <div className="grid grid-cols-2 gap-2">
              {p2Question.options.map((opt, idx) => {
                const keyLabel = P2_KEYS[idx].toUpperCase();
                const arrowLabel = ['←', '↑', '↓', '→'][idx];
                return (
                  <button
                    key={idx}
                    onClick={() => handleP2Answer(idx)}
                    disabled={isGameOver || p2IsClimbing || p2IsSlipping}
                    className="p-2.5 bg-white hover:bg-amber-100 disabled:opacity-50 text-amber-950 font-black rounded-xl border-2 border-amber-300 text-xs sm:text-sm text-left flex items-center justify-between shadow-xs transition-transform active:scale-95"
                  >
                    <span className="truncate">{opt}</span>
                    <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                      <span>{keyLabel}</span>
                      <span className="opacity-80">({arrowLabel})</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* VICTORY / MATCH OVER MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-amber-50 to-red-50 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-md w-full p-6 text-center space-y-6">
            {/* Trophy Icon */}
            <div className="w-20 h-20 rounded-full bg-amber-400 text-red-900 flex items-center justify-center text-4xl mx-auto shadow-xl border-4 border-white animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>HASIL DUEL T-GAMES SMART CHALLENGE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase">
                {winner === 'p1' ? (
                  <span className="text-blue-600">🔴 {p1Name} MENANG! 🎉</span>
                ) : winner === 'p2' ? (
                  <span className="text-amber-600">🟡 {p2Name} MENANG! 🎉</span>
                ) : (
                  <span className="text-gray-700">🤝 HASIL SERI!</span>
                )}
              </h2>

              <p className="text-xs font-bold text-gray-600">
                {winner === 'draw'
                  ? 'Kedua pemain memiliki pencapaian yang seimbang!'
                  : `Selamat kepada ${winner === 'p1' ? p1Name : p2Name} yang pertama berhasil menaklukan puncak pinang!`}
              </p>
            </div>

            {/* Score Comparison Box */}
            <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border-2 border-amber-200 text-xs">
              <div className={`p-2 rounded-xl ${winner === 'p1' ? 'bg-blue-100 border border-blue-400 font-black' : 'bg-gray-50'}`}>
                <div className="text-[10px] text-gray-500 uppercase">🔴 {p1Name}</div>
                <div className="text-base font-black text-blue-700">Level {p1Level}</div>
                <div className="text-[10px] text-gray-600">{p1Score} Poin</div>
              </div>

              <div className={`p-2 rounded-xl ${winner === 'p2' ? 'bg-amber-100 border border-amber-400 font-black' : 'bg-gray-50'}`}>
                <div className="text-[10px] text-gray-500 uppercase">🟡 {p2Name}</div>
                <div className="text-base font-black text-amber-700">Level {p2Level}</div>
                <div className="text-[10px] text-gray-600">{p2Score} Poin</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRestartMatch}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-red-950 font-black rounded-2xl text-xs sm:text-sm shadow-md border border-amber-200 flex items-center justify-center gap-1.5 transition-transform hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TANDING ULANG</span>
              </button>

              <button
                onClick={onReturnHome}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md border border-red-700 flex items-center justify-center gap-1.5 transition-transform hover:scale-105"
              >
                <Home className="w-4 h-4" />
                <span>BERANDA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
