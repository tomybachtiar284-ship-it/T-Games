import React from 'react';
import { ShieldAlert, LogIn, Sparkles, X } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { signInWithGoogle } from '../utils/supabase';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-red-900 via-red-800 to-amber-950 text-white w-full max-w-md rounded-3xl border-4 border-amber-300 shadow-2xl p-5 sm:p-6 relative text-center space-y-5 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-red-950/60 hover:bg-red-950 text-amber-300 transition-colors border border-amber-400/40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon Badge */}
        <div className="relative inline-block mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-4 border-white shadow-xl flex items-center justify-center text-3xl sm:text-4xl text-red-900 animate-pulse">
            🛡️
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/40 px-3 py-0.5 rounded-full text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SISTEM DENGAN TIKET TOKEN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight uppercase">
            LOGIN GOOGLE WAJIB!
          </h2>
          <p className="text-xs sm:text-sm font-bold text-amber-100/90 leading-relaxed max-w-xs mx-auto">
            Sesuai skema token & keabsahan skor, Anda wajib masuk menggunakan Akun Google terlebih dahulu sebelum bermain.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="bg-red-950/70 border border-amber-400/40 rounded-2xl p-3.5 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-200">
            <span className="text-amber-400 font-black">✔</span>
            <span>Menjaga keamanan transaksi Tiket Token Anda</span>
          </div>
          <div className="flex items-center gap-2 text-amber-200">
            <span className="text-amber-400 font-black">✔</span>
            <span>Menyimpan rekor skor nasional & klaim hadiah event</span>
          </div>
          <div className="flex items-center gap-2 text-amber-200">
            <span className="text-amber-400 font-black">✔</span>
            <span>Mencegah manipulasi akun anonim/dummy</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            id="btn-modal-google-login-now"
            onClick={() => {
              soundFx.playClick();
              signInWithGoogle();
            }}
            className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-black text-base rounded-2xl shadow-xl border-2 border-amber-300 flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>MASUK DENGAN GOOGLE 🚀</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-full py-2 text-xs font-bold text-amber-200/80 hover:text-white transition-colors"
          >
            Batal / Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};
