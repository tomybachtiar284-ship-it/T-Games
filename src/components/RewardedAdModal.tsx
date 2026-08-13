import React, { useState, useEffect } from 'react';
import { Tv, Heart, CheckCircle2, X } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface RewardedAdModalProps {
  onClose: () => void;
  onAdCompleted: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ onClose, onAdCompleted }) => {
  const [countdown, setCountdown] = useState(5);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsDone(true);
          soundFx.playCoin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center space-y-4 relative">
        <button
          id="btn-close-ad-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-amber-400 text-red-900 flex items-center justify-center text-3xl mx-auto shadow-md">
          📺
        </div>

        <h3 className="font-black text-xl text-gray-900">IKLAN REWARDED EDUKASI</h3>

        {/* Video Player Box Simulation */}
        <div className="w-full h-40 bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-4 text-white space-y-2 border-2 border-amber-300 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300">
            {isDone ? 'IKLAN SELESAI' : `SISA ${countdown}s`}
          </div>

          <p className="font-bold text-sm text-amber-300">🇮🇩 "Sponsors & Belajar Matematika Seru"</p>
          <p className="text-xs text-gray-300">Tonton tayangan singkat untuk mendapatkan +1 Nyawa Tambahan!</p>

          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-amber-400 h-full transition-all duration-1000"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {isDone ? (
          <button
            id="btn-claim-ad-reward"
            onClick={() => {
              soundFx.playCorrect();
              onAdCompleted();
            }}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-lg border-b-4 border-emerald-700 flex items-center justify-center gap-2 animate-bounce"
          >
            <Heart className="w-5 h-5 text-rose-200 fill-rose-200" />
            <span>KLAIM +1 NYAWA SEKARANG!</span>
          </button>
        ) : (
          <p className="text-xs font-extrabold text-gray-500">
            Menunggu iklan selesai dalam {countdown} detik...
          </p>
        )}
      </div>
    </div>
  );
};
