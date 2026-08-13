import React from 'react';
import { Flag, Award, Sparkles, X, Trophy } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface EventModalProps {
  onClose: () => void;
  onStartEventGame: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ onClose, onStartEventGame }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border-4 border-amber-300 relative space-y-4 text-center">
        {/* Close Button */}
        <button
          id="btn-close-event-modal"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Flag Icon Header */}
        <div className="w-16 h-16 rounded-full bg-red-600 border-4 border-amber-300 shadow-lg flex items-center justify-center text-3xl mx-auto animate-bounce">
          🇮🇩
        </div>

        <div>
          <div className="inline-flex items-center gap-1 text-amber-600 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EVENT SPESIAL T-GAMES 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-red-700 uppercase">
            T-GAMES SMART CHALLENGE
          </h2>
          <p className="text-xs font-bold text-gray-600">Berlangsung: Periode Spesial 2026</p>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 text-left space-y-2 text-xs font-bold text-gray-700">
          <p className="flex items-start gap-2">
            <span>🏆</span>
            <span>
              <strong>Puncak Peringkat:</strong> Pemain dengan skor tertinggi di event ini akan mendapatkan
              <strong> Badge T-Games Master</strong> dan masuk ke Hall of Fame Juara!
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span>🎁</span>
            <span>
              <strong>Bonus Koin 2x:</strong> Dapatkan koin berlipat ganda setiap kali berhasil menjawab soal matematika di event ini.
            </span>
          </p>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            id="btn-event-cancel"
            onClick={onClose}
            className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl"
          >
            Tutup
          </button>
          <button
            id="btn-event-start-now"
            onClick={() => {
              soundFx.playClick();
              onStartEventGame();
            }}
            className="w-2/3 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-2xl shadow-lg border-b-4 border-red-800 animate-pulse"
          >
            IKUTI EVENT T-GAMES ⚡
          </button>
        </div>
      </div>
    </div>
  );
};
