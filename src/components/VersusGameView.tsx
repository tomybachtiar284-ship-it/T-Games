import React, { useState, useEffect, useCallback } from 'react';
import { Character, Difficulty, MathCategory, Question } from '../types';
import { generateQuestion } from '../utils/mathGenerator';
import { soundFx } from '../utils/audio';
import { PinangPoleView } from './PinangPoleView';
import { Swords, Trophy, RotateCcw, Home, Clock, AlertTriangle, Sparkles, CheckCircle2, XCircle, Maximize, Minimize } from 'lucide-react';

interface VersusGameViewProps {
  p1Name: string;
  p1Char: Character;
  p2Name: string;
  p2Char: Character;
  category: MathCategory;
  difficulty: Difficulty;
  matchDuration?: number; // 30, 60, 90, 120, or 0 (unlimited)
  targetLevel?: number; // Target level / number of correct answers to reach peak
  customQuestions?: Question[];
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
  matchDuration = 60,
  targetLevel = 10,
  customQuestions = [],
  onReturnHome,
  onGameComplete,
}) => {
  // GAME TIME
  const [timeLeft, setTimeLeft] = useState<number>(matchDuration);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'p1' | 'p2' | 'draw' | null>(null);

  // PLAYER 1 STATE
  const [p1Level, setP1Level] = useState<number>(0);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p1Question, setP1Question] = useState<Question>(() => generateQuestion(category, difficulty, customQuestions));
  const [p1IsClimbing, setP1IsClimbing] = useState<boolean>(false);
  const [p1IsSlipping, setP1IsSlipping] = useState<boolean>(false);
  const [p1Feedback, setP1Feedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);

  // PLAYER 2 STATE
  const [p2Level, setP2Level] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [p2Question, setP2Question] = useState<Question>(() =>
    generateQuestion(category, difficulty, customQuestions, p1Question?.questionText)
  );
  const [p2IsClimbing, setP2IsClimbing] = useState<boolean>(false);
  const [p2IsSlipping, setP2IsSlipping] = useState<boolean>(false);
  const [p2Feedback, setP2Feedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const [isPaused, setIsPaused] = useState<boolean>(false);

  // COUNTDOWN TIMER
  useEffect(() => {
    if (isGameOver || isPaused || matchDuration === 0) return;

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
  }, [isGameOver, isPaused, matchDuration, p1Level, p2Level, p1Score, p2Score]);

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

  // CHECK PEAK VICTORY (TARGET LEVEL REACHED)
  const checkVictory = (player: 'p1' | 'p2', newLevel: number, currentP1Level: number, currentP2Level: number) => {
    if (newLevel >= targetLevel) {
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
      if (isGameOver || isPaused || p1IsSlipping || p1IsClimbing) return;

      if (selectedIndex === p1Question.correctAnswerIndex) {
        // CORRECT
        soundFx.playCorrect();
        setP1IsClimbing(true);
        setP1Score((s) => s + 100);
        setP1Feedback({ type: 'correct', text: 'BENAR! +1 Level 🚀' });

        const nextLvl = Math.min(targetLevel, p1Level + 1);
        setP1Level(nextLvl);

        setTimeout(() => {
          setP1IsClimbing(false);
          setP1Feedback(null);
          setP1Question(generateQuestion(category, difficulty, customQuestions, p2Question.questionText));
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
          setP1Question(generateQuestion(category, difficulty, customQuestions, p2Question.questionText));
        }, 1200);
      }
    },
    [isGameOver, isPaused, p1IsSlipping, p1IsClimbing, p1Question, p2Question, p1Level, p2Level, category, difficulty, customQuestions]
  );

  // ANSWER HANDLER FOR PLAYER 2
  const handleP2Answer = useCallback(
    (selectedIndex: number) => {
      if (isGameOver || isPaused || p2IsSlipping || p2IsClimbing) return;

      if (selectedIndex === p2Question.correctAnswerIndex) {
        // CORRECT
        soundFx.playCorrect();
        setP2IsClimbing(true);
        setP2Score((s) => s + 100);
        setP2Feedback({ type: 'correct', text: 'BENAR! +1 Level 🚀' });

        const nextLvl = Math.min(targetLevel, p2Level + 1);
        setP2Level(nextLvl);

        setTimeout(() => {
          setP2IsClimbing(false);
          setP2Feedback(null);
          setP2Question(generateQuestion(category, difficulty, customQuestions, p1Question.questionText));
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
          setP2Question(generateQuestion(category, difficulty, customQuestions, p1Question.questionText));
        }, 1200);
      }
    },
    [isGameOver, isPaused, p2IsSlipping, p2IsClimbing, p2Question, p1Question, p2Level, p1Level, category, difficulty, customQuestions]
  );

  // KEYBOARD LISTENER FOR BOTH PLAYERS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isGameOver) return;
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
    setTimeLeft(matchDuration);
    setIsGameOver(false);
    setWinner(null);

    setP1Level(0);
    setP1Score(0);
    setP1IsClimbing(false);
    setP1IsSlipping(false);
    setP1Feedback(null);
    const newP1Q = generateQuestion(category, difficulty, customQuestions);
    const newP2Q = generateQuestion(category, difficulty, customQuestions, newP1Q.questionText);
    setP1Question(newP1Q);

    setP2Level(0);
    setP2Score(0);
    setP2IsClimbing(false);
    setP2IsSlipping(false);
    setP2Feedback(null);
    setP2Question(newP2Q);
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-between space-y-2 sm:space-y-3 p-1 overflow-hidden">
      {/* MATCH HEADER BAR */}
      <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-amber-300 shadow-md flex items-center justify-between gap-2 flex-none">
        {/* Left: Player 1 Status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full ${p1Char.avatarBg} border-2 border-white flex items-center justify-center text-sm sm:text-xl shadow flex-none`}>
            {p1Char.emoji}
          </div>
          <div>
            <div className="font-black text-[10px] sm:text-sm text-amber-200 uppercase leading-none truncate">
              🔴 {p1Name}
            </div>
            <div className="text-[9px] sm:text-[11px] font-extrabold text-white">
              Skor: <span className="text-amber-300">{p1Score}</span> | LV: {p1Level}/{targetLevel}
            </div>
          </div>
        </div>

        {/* Center: Timer & Match Control Buttons (Pause, Run, Ulangi) */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 bg-black/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-amber-300 shadow">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300 animate-pulse" />
            <span className={`font-black text-xs sm:text-lg ${timeLeft <= 10 && matchDuration !== 0 ? 'text-red-300 animate-ping' : 'text-white'}`}>
              {matchDuration === 0 ? '♾️' : `${timeLeft}s`}
            </span>

            {/* PAUSE / RUN TOGGLE BUTTON */}
            <button
              id="btn-versus-toggle-pause"
              onClick={() => {
                soundFx.playClick();
                setIsPaused(!isPaused);
              }}
              title={isPaused ? "Lanjutkan Pertandingan (Run)" : "Jeda Pertandingan (Pause)"}
              className="ml-1 p-1 bg-amber-400 hover:bg-amber-300 text-red-950 rounded-full font-black text-[10px] sm:text-xs shadow flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            >
              {isPaused ? <span className="px-1 text-[10px]">▶️ RUN</span> : <span className="px-1 text-[10px]">⏸️ PAUSE</span>}
            </button>

            {/* RESTART (ULANGI) BUTTON */}
            <button
              id="btn-versus-restart"
              onClick={() => {
                soundFx.playClick();
                handleRestartMatch();
                setIsPaused(false);
              }}
              title="Ulangi Pertandingan (Restart)"
              className="p-1 bg-red-700 hover:bg-red-800 text-white rounded-full font-black text-[10px] sm:text-xs shadow flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            >
              <span className="px-1 text-[10px]">🔄 ULANGI</span>
            </button>
          </div>
          <div className="text-[8px] sm:text-[10px] font-black tracking-widest text-amber-200 uppercase hidden sm:block">
            T-GAMES SMART CHALLENGE ⚡
          </div>
        </div>

        {/* Right: Player 2 Status & Fullscreen Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-right">
          <div>
            <div className="font-black text-[10px] sm:text-sm text-amber-200 uppercase leading-none truncate">
              🟡 {p2Name}
            </div>
            <div className="text-[9px] sm:text-[11px] font-extrabold text-white">
              LV: {p2Level}/{targetLevel} | Skor: <span className="text-amber-300">{p2Score}</span>
            </div>
          </div>
          <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full ${p2Char.avatarBg} border-2 border-white flex items-center justify-center text-sm sm:text-xl shadow flex-none`}>
            {p2Char.emoji}
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1 sm:p-2 bg-black/30 hover:bg-black/50 text-white rounded-lg sm:rounded-xl border border-amber-300 shadow transition-transform active:scale-95 ml-0.5"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh (Fullscreen)"}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />}
          </button>
        </div>
      </div>

      {/* DUAL PLAYER ARENA GRID (SIDE-BY-SIDE ON ALL DEVICES INCLUDING MOBILE) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 flex-1 min-h-0 overflow-hidden items-stretch">
        {/* ==================== PEMAIN 1 (KIRI) ==================== */}
        <div className="bg-white/90 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-blue-400 p-1.5 sm:p-4 shadow-lg space-y-1.5 sm:space-y-3 flex flex-col justify-between relative overflow-hidden">
          {/* Header Tag */}
          <div className="flex items-center justify-between bg-blue-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-blue-300 shadow-xs text-[10px] sm:text-xs font-black flex-none">
            <span className="truncate">🔴 {p1Name}</span>
            <span className="bg-blue-800 text-amber-300 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] flex-none">
              LV {p1Level}
            </span>
          </div>

          {/* Feedback Overlay */}
          {p1Feedback && (
            <div
              className={`absolute top-8 sm:top-12 left-2 right-2 sm:left-4 sm:right-4 z-30 p-1 sm:p-2 rounded-xl text-center font-black text-[10px] sm:text-xs shadow-lg animate-bounce ${
                p1Feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {p1Feedback.text}
            </div>
          )}

          {/* Player 1 Main Area (Vertical on desktop/portrait, Horizontal on mobile landscape) */}
          <div className="flex-1 min-h-0 flex flex-col landscape:flex-row sm:flex-col items-center justify-between gap-1.5 sm:gap-2">
            {/* Pinang Pole P1 */}
            <div className="w-full landscape:w-2/5 sm:w-full flex justify-center my-0.5 flex-1 min-h-0 h-full">
              <PinangPoleView
                currentLevel={p1Level}
                character={p1Char}
                isClimbing={p1IsClimbing}
                isSlipping={p1IsSlipping}
                showDetails={false}
              />
            </div>

            {/* Question Box P1 */}
            <div className="w-full landscape:w-3/5 sm:w-full bg-blue-50/90 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border border-blue-300 space-y-1 sm:space-y-2 flex-none">
              <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-black text-blue-800 border-b border-blue-200 pb-0.5">
                <span>🎯 SOAL P1</span>
                <span className="text-gray-500 hidden sm:inline">Key: [A][S][D][F]</span>
              </div>

              <div className="text-center font-black text-[11px] sm:text-sm md:text-base text-gray-800 py-0.5 min-h-[30px] sm:min-h-[40px] flex items-center justify-center">
                {p1Question.questionText}
              </div>

              {/* Options Grid P1 */}
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                {p1Question.options.map((opt, idx) => {
                  const keyLabel = P1_KEYS[idx].toUpperCase();
                  return (
                    <button
                      key={idx}
                      onClick={() => handleP1Answer(idx)}
                      disabled={isGameOver || p1IsClimbing || p1IsSlipping}
                      className="p-1 sm:p-2.5 bg-white hover:bg-blue-100 disabled:opacity-50 text-blue-950 font-black rounded-lg sm:rounded-xl border border-blue-300 text-[9px] sm:text-xs text-left flex items-center justify-between shadow-2xs transition-transform active:scale-95"
                    >
                      <span className="truncate">{opt}</span>
                      <span className="bg-blue-600 text-white text-[8px] sm:text-[10px] font-black px-1 py-0.5 rounded shadow flex-none ml-0.5">
                        {keyLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== PEMAIN 2 (KANAN) ==================== */}
        <div className="bg-white/90 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-amber-400 p-1.5 sm:p-4 shadow-lg space-y-1.5 sm:space-y-3 flex flex-col justify-between relative overflow-hidden">
          {/* Header Tag */}
          <div className="flex items-center justify-between bg-amber-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-amber-300 shadow-xs text-[10px] sm:text-xs font-black flex-none">
            <span className="truncate">🟡 {p2Name}</span>
            <span className="bg-amber-700 text-amber-200 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] flex-none">
              LV {p2Level}
            </span>
          </div>

          {/* Feedback Overlay */}
          {p2Feedback && (
            <div
              className={`absolute top-8 sm:top-12 left-2 right-2 sm:left-4 sm:right-4 z-30 p-1 sm:p-2 rounded-xl text-center font-black text-[10px] sm:text-xs shadow-lg animate-bounce ${
                p2Feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {p2Feedback.text}
            </div>
          )}

          {/* Player 2 Main Area (Vertical on desktop/portrait, Horizontal on mobile landscape) */}
          <div className="flex-1 min-h-0 flex flex-col landscape:flex-row sm:flex-col items-center justify-between gap-1.5 sm:gap-2">
            {/* Pinang Pole P2 */}
            <div className="w-full landscape:w-2/5 sm:w-full flex justify-center my-0.5 flex-1 min-h-0 h-full">
              <PinangPoleView
                currentLevel={p2Level}
                character={p2Char}
                isClimbing={p2IsClimbing}
                isSlipping={p2IsSlipping}
                showDetails={false}
              />
            </div>

            {/* Question Box P2 */}
            <div className="w-full landscape:w-3/5 sm:w-full bg-amber-50/90 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-300 space-y-1 sm:space-y-2 flex-none">
              <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-black text-amber-900 border-b border-amber-200 pb-0.5">
                <span>🎯 SOAL P2</span>
                <span className="text-gray-500 hidden sm:inline">Key: [H][J][K][L]</span>
              </div>

              <div className="text-center font-black text-[11px] sm:text-sm md:text-base text-gray-800 py-0.5 min-h-[30px] sm:min-h-[40px] flex items-center justify-center">
                {p2Question.questionText}
              </div>

              {/* Options Grid P2 */}
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                {p2Question.options.map((opt, idx) => {
                  const keyLabel = P2_KEYS[idx].toUpperCase();
                  return (
                    <button
                      key={idx}
                      onClick={() => handleP2Answer(idx)}
                      disabled={isGameOver || p2IsClimbing || p2IsSlipping}
                      className="p-1 sm:p-2.5 bg-white hover:bg-amber-100 disabled:opacity-50 text-amber-950 font-black rounded-lg sm:rounded-xl border border-amber-300 text-[9px] sm:text-xs text-left flex items-center justify-between shadow-2xs transition-transform active:scale-95"
                    >
                      <span className="truncate">{opt}</span>
                      <span className="bg-amber-600 text-white text-[8px] sm:text-[10px] font-black px-1 py-0.5 rounded shadow flex-none ml-0.5">
                        {keyLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
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

      {/* PAUSE & GAMEPLAY CONTROL OVERLAY */}
      {isPaused && !isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-red-900 via-red-800 to-amber-950 text-white w-full max-w-sm rounded-3xl border-4 border-amber-300 shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-amber-400 text-red-950 flex items-center justify-center text-3xl mx-auto shadow-lg border-2 border-white">
              ⏸️
            </div>
            <div>
              <h3 className="text-2xl font-black text-amber-300 uppercase tracking-tight">PERTANDINGAN DIJEDA</h3>
              <p className="text-xs font-bold text-amber-100/90 leading-relaxed">
                Waktu &amp; kontrol permainan sedang dihentikan sementara.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* RUN / RESUME BUTTON */}
              <button
                id="btn-versus-pause-run"
                onClick={() => {
                  soundFx.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm rounded-2xl shadow-lg border-b-4 border-emerald-800 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span>▶️ LANJUTKAN PERTANDINGAN (RUN)</span>
              </button>

              {/* RESTART BUTTON */}
              <button
                id="btn-versus-pause-restart"
                onClick={() => {
                  soundFx.playClick();
                  handleRestartMatch();
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-red-950 font-black text-sm rounded-2xl shadow-lg border-b-4 border-amber-700 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span>🔄 ULANGI PERTANDINGAN</span>
              </button>

              {/* RETURN HOME BUTTON */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onReturnHome();
                }}
                className="w-full py-2.5 bg-red-950 hover:bg-red-900 text-amber-200 font-bold text-xs rounded-xl border border-red-400/40"
              >
                🏠 KELUAR KE MENU UTAMA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
