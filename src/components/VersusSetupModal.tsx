import React, { useState } from 'react';
import { Character, Difficulty, MathCategory } from '../types';
import { soundFx } from '../utils/audio';
import { Users, Swords, Award, Play } from 'lucide-react';

interface VersusSetupModalProps {
  characters: Character[];
  defaultP1Character: Character;
  onStartVersus: (
    p1Name: string,
    p1Char: Character,
    p2Name: string,
    p2Char: Character,
    category: MathCategory,
    difficulty: Difficulty
  ) => void;
  onClose: () => void;
}

const CATEGORIES: { id: MathCategory; name: string; icon: string }[] = [
  { id: 'campuran', name: 'Campuran ACAL', icon: '🎲' },
  { id: 'penjumlahan', name: 'Penjumlahan (+)', icon: '➕' },
  { id: 'pengurangan', name: 'Pengurangan (-)', icon: '➖' },
  { id: 'perkalian', name: 'Perkalian (×)', icon: '✖️' },
  { id: 'pembagian', name: 'Pembagian (÷)', icon: '➗' },
  { id: 'pecahan', name: 'Pecahan (½)', icon: '🍰' },
  { id: 'bangun_datar', name: 'Geometri Datar', icon: '📐' },
  { id: 'logika', name: 'Logika & Pola', icon: '🧠' },
];

export const VersusSetupModal: React.FC<VersusSetupModalProps> = ({
  characters,
  defaultP1Character,
  onStartVersus,
  onClose,
}) => {
  const [p1Name, setP1Name] = useState<string>('Pemain 1');
  const [p2Name, setP2Name] = useState<string>('Pemain 2');

  const availableChars = characters.length > 0 ? characters : [defaultP1Character];
  const [p1Char, setP1Char] = useState<Character>(defaultP1Character);
  const [p2Char, setP2Char] = useState<Character>(
    availableChars.find((c) => c.id !== defaultP1Character.id) || availableChars[0]
  );

  const [category, setCategory] = useState<MathCategory>('campuran');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    onStartVersus(
      p1Name.trim() || 'Pemain 1',
      p1Char,
      p2Name.trim() || 'Pemain 2',
      p2Char,
      category,
      difficulty
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-gradient-to-b from-red-50 to-amber-50 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
            <Swords className="w-4 h-4" />
            <span>MODE DUEL 2 TIANG (VERSUS)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase">
            DUEL TOBA SMART CHALLENGE ⚡
          </h2>
          <p className="text-xs sm:text-sm font-bold text-gray-600">
            2 Pemain bertanding langsung di 1 monitor layar lebar!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PLAYER SELECTION GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PLAYER 1 (KIRI) */}
            <div className="bg-white p-4 rounded-2xl border-2 border-blue-400 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-blue-100">
                <span className="font-black text-xs text-blue-700 uppercase flex items-center gap-1">
                  <span>🔴</span> PEMAIN 1 (KIRI)
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
                  Keys: A, S, D, F
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 mb-1">
                  NAMA PEMAIN 1:
                </label>
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  maxLength={12}
                  className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-xl text-xs font-bold focus:border-blue-500 focus:outline-none"
                  placeholder="Pemain 1"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 mb-1">
                  PILIH KARAKTER P1:
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-200">
                  {availableChars.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setP1Char(c);
                      }}
                      className={`p-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                        p1Char.id === c.id
                          ? 'bg-blue-500 text-white ring-2 ring-blue-400 scale-105 shadow'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-[9px] font-black truncate w-full text-center mt-0.5">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PLAYER 2 (KANAN) */}
            <div className="bg-white p-4 rounded-2xl border-2 border-amber-400 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-amber-100">
                <span className="font-black text-xs text-amber-700 uppercase flex items-center gap-1">
                  <span>🟡</span> PEMAIN 2 (KANAN)
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                  Keys: H, J, K, L / Panah
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 mb-1">
                  NAMA PEMAIN 2:
                </label>
                <input
                  type="text"
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  maxLength={12}
                  className="w-full px-3 py-1.5 border-2 border-gray-300 rounded-xl text-xs font-bold focus:border-amber-500 focus:outline-none"
                  placeholder="Pemain 2"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 mb-1">
                  PILIH KARAKTER P2:
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-200">
                  {availableChars.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setP2Char(c);
                      }}
                      className={`p-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                        p2Char.id === c.id
                          ? 'bg-amber-500 text-white ring-2 ring-amber-400 scale-105 shadow'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-[9px] font-black truncate w-full text-center mt-0.5">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GAME MATCH SETTINGS */}
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm space-y-4">
            {/* Kategori Soal */}
            <div>
              <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase">
                🎯 KATEGORI SOAL MATEMATIKA:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setCategory(cat.id);
                    }}
                    className={`p-2 rounded-xl text-left border-2 transition-all flex items-center gap-1.5 ${
                      category === cat.id
                        ? 'bg-red-600 text-white border-red-700 shadow font-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-bold'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-[11px] truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tingkat Kesulitan */}
            <div>
              <label className="block text-xs font-black text-gray-800 mb-1.5 uppercase">
                ⚡ TINGKAT KESULITAN:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['mudah', 'normal', 'sulit'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setDifficulty(d);
                    }}
                    className={`py-2 px-3 rounded-xl font-black text-xs uppercase border-2 transition-all ${
                      difficulty === d
                        ? 'bg-amber-500 text-white border-amber-600 shadow'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {d === 'mudah' ? '🟢 MUDAH' : d === 'normal' ? '🟡 NORMAL' : '🔴 SULIT'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black rounded-2xl text-xs sm:text-sm border border-gray-300 transition-colors"
            >
              BATAL
            </button>

            <button
              type="submit"
              className="flex-2 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black rounded-2xl text-sm sm:text-base shadow-xl border-b-4 border-red-900 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>MULAI DUEL 2 TIANG NOW! 🇮🇩</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
