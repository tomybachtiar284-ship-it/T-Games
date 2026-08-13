import React, { useEffect, useState } from 'react';
import { Question } from '../types';
import { soundFx } from '../utils/audio';
import { Heart, Clock, Zap, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  lives: number;
  maxLives: number;
  comboCount: number;
  onAnswer: (selectedIdx: number, isTimeOut?: boolean) => void;
  isSubmitting: boolean;
  onOpenAdModal?: () => void;
  onRestartGame?: () => void;
  onReturnHome?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  score,
  lives,
  maxLives,
  comboCount,
  onAnswer,
  isSubmitting,
  onOpenAdModal,
  onRestartGame,
  onReturnHome,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(question.durationSeconds);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Timer Countdown Effect
  useEffect(() => {
    setTimeLeft(question.durationSeconds);
    setSelectedOption(null);
    setFeedback(null);
    setIsPaused(false);
  }, [question]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question, isPaused]);

  const handleTimeOut = () => {
    if (selectedOption !== null || feedback !== null) return;
    setFeedback('timeout');
    soundFx.playWrong();
    setTimeout(() => {
      onAnswer(-1, true);
    }, 1500);
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || feedback !== null || isSubmitting) return;

    setSelectedOption(index);
    const isCorrect = index === question.correctAnswerIndex;

    if (isCorrect) {
      setFeedback('correct');
      soundFx.playCorrect();
    } else {
      setFeedback('wrong');
      soundFx.playWrong();
    }

    setTimeout(() => {
      onAnswer(index, false);
    }, 1400);
  };

  const timerPercentage = (timeLeft / question.durationSeconds) * 100;
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-amber-300 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Top Bar: Hearts, Level & Score */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
        {/* Lives / Hearts */}
        <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          <span className="text-xs font-bold text-rose-700">NYAWA:</span>
          <div className="flex gap-1">
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform ${
                  i < lives
                    ? 'text-red-500 fill-red-500 animate-pulse'
                    : 'text-gray-300 fill-gray-200'
                }`}
              />
            ))}
          </div>
          {lives === 0 && onOpenAdModal && (
            <button
              id="btn-ad-extra-life-question"
              onClick={onOpenAdModal}
              className="ml-1 text-[10px] bg-amber-400 text-red-900 font-extrabold px-2 py-0.5 rounded-full hover:bg-amber-300 animate-bounce"
            >
              +1 📺
            </button>
          )}
        </div>

        {/* Combo Multiplier Badge */}
        {comboCount >= 2 && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-bounce">
            <Zap className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
            <span>COMBO ×{comboCount}</span>
          </div>
        )}

        {/* Current Score Badge */}
        <div className="bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1 font-black text-xs text-amber-900">
          <span>SKOR:</span>
          <span className="text-red-600 text-sm">{score}</span>
        </div>
      </div>

      {/* Timer Progress Bar & Control Buttons */}
      <div className="my-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-1">
          <span className="flex items-center gap-1 text-red-600">
            <Clock className="w-3.5 h-3.5" /> Waktu Jawab
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`font-black ${
                timeLeft <= 5 ? 'text-red-600 animate-ping' : 'text-gray-700'
              }`}
            >
              ⏱️ {timeLeft}s
            </span>

            {/* PAUSE / RUN TOGGLE BUTTON */}
            <button
              id="btn-solo-toggle-pause"
              onClick={() => {
                soundFx.playClick();
                setIsPaused(!isPaused);
              }}
              title={isPaused ? "Lanjutkan Pertandingan (Run)" : "Jeda Pertandingan (Pause)"}
              className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-[10px] sm:text-xs rounded-full shadow border border-amber-300 transition-transform active:scale-95"
            >
              {isPaused ? '▶️ RUN' : '⏸️ PAUSE'}
            </button>

            {/* RESTART (ULANGI) BUTTON */}
            {onRestartGame && (
              <button
                id="btn-solo-restart"
                onClick={() => {
                  soundFx.playClick();
                  setIsPaused(false);
                  onRestartGame();
                }}
                title="Ulangi Pertandingan (Restart)"
                className="px-2 py-0.5 bg-red-700 hover:bg-red-800 text-white font-black text-[10px] sm:text-xs rounded-full shadow border border-red-500 transition-transform active:scale-95"
              >
                🔄 ULANGI
              </button>
            )}
          </div>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-gray-300">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              timeLeft <= 5 ? 'bg-red-600' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${timerPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* PAUSE OVERLAY FOR SOLO GAME */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-red-900 via-red-800 to-amber-950 text-white w-full max-w-sm rounded-3xl border-4 border-amber-300 shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-amber-400 text-red-950 flex items-center justify-center text-3xl mx-auto shadow-lg border-2 border-white">
              ⏸️
            </div>
            <div>
              <h3 className="text-2xl font-black text-amber-300 uppercase tracking-tight">PERMAINAN DIJEDA</h3>
              <p className="text-xs font-bold text-amber-100/90 leading-relaxed">
                Waktu jawab &amp; kontrol permainan sedang dihentikan sementara.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* RUN / RESUME BUTTON */}
              <button
                id="btn-solo-pause-run"
                onClick={() => {
                  soundFx.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm rounded-2xl shadow-lg border-b-4 border-emerald-800 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span>▶️ LANJUTKAN (RUN)</span>
              </button>

              {/* RESTART BUTTON */}
              {onRestartGame && (
                <button
                  id="btn-solo-pause-restart"
                  onClick={() => {
                    soundFx.playClick();
                    setIsPaused(false);
                    onRestartGame();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-red-950 font-black text-sm rounded-2xl shadow-lg border-b-4 border-amber-700 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <span>🔄 ULANGI PERTANDINGAN</span>
                </button>
              )}

              {/* RETURN HOME BUTTON */}
              {onReturnHome && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onReturnHome();
                  }}
                  className="w-full py-2.5 bg-red-950 hover:bg-red-900 text-amber-200 font-bold text-xs rounded-xl border border-red-400/40"
                >
                  🏠 KELUAR KE MENU UTAMA
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question Header & Category */}
      <div className="my-2">
        <div className="flex items-center justify-between mb-2">
          <span className="bg-red-100 text-red-800 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-red-200">
            {question.category.replace('_', ' ')}
          </span>
          <span className="text-xs font-extrabold text-gray-500">
            Soal #{questionNumber} dari {totalQuestions}
          </span>
        </div>

        {/* Question Text Display */}
        <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border-2 border-amber-200 shadow-sm min-h-[90px] flex items-center justify-center">
          <h2 className="text-lg sm:text-2xl font-black text-gray-800 text-center leading-relaxed">
            {question.questionText}
          </h2>
        </div>
      </div>

      {/* Choices Options Grid (A, B, C, D) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrectChoice = idx === question.correctAnswerIndex;
          let btnStyle = 'bg-gray-50 hover:bg-amber-100 border-gray-200 text-gray-800';

          if (feedback) {
            if (isCorrectChoice) {
              btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-[1.02]';
            } else if (isSelected && !isCorrectChoice) {
              btnStyle = 'bg-red-500 text-white border-red-600 animate-shake';
            } else {
              btnStyle = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              id={`btn-option-${idx}`}
              disabled={feedback !== null || isSubmitting}
              onClick={() => handleSelectOption(idx)}
              className={`p-3.5 rounded-2xl border-2 font-bold text-left text-sm sm:text-base flex items-center justify-between transition-all duration-200 active:scale-95 ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-xl font-extrabold flex items-center justify-center text-xs sm:text-sm border ${
                    feedback && isCorrectChoice
                      ? 'bg-white text-emerald-600 border-white'
                      : feedback && isSelected && !isCorrectChoice
                      ? 'bg-white text-red-600 border-white'
                      : 'bg-amber-200 text-red-900 border-amber-300'
                  }`}
                >
                  {optionLetters[idx]}
                </span>
                <span className="font-extrabold">{option}</span>
              </div>

              {/* Feedback Icons */}
              {feedback && isCorrectChoice && (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
              {feedback && isSelected && !isCorrectChoice && (
                <XCircle className="w-5 h-5 text-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Alert Overlay Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl border-2 text-center font-black text-xs sm:text-sm animate-fade-in ${
            feedback === 'correct'
              ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
              : 'bg-red-100 border-red-400 text-red-900'
          }`}
        >
          {feedback === 'correct' && (
            <div className="flex items-center justify-center gap-1.5">
              <span>✅ BENAR! Karakter Memanjat Naik!</span>
              <span className="text-emerald-700 font-extrabold">+100 Poin</span>
            </div>
          )}
          {feedback === 'wrong' && (
            <div>
              <p className="flex items-center justify-center gap-1 text-red-700 font-black">
                ❌ BELUM TEPAT! Karakter Terpeleset!
              </p>
              {question.explanation && (
                <p className="text-[11px] font-semibold text-red-800 mt-1">
                  💡 {question.explanation}
                </p>
              )}
            </div>
          )}
          {feedback === 'timeout' && (
            <div>
              <p className="text-red-700 font-black">⏰ WAKTU HABIS! Karakter Turun Tingkat!</p>
              {question.explanation && (
                <p className="text-[11px] font-semibold text-red-800 mt-1">
                  💡 {question.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
