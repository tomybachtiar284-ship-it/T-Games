import React, { useState } from 'react';
import { MathCategory, Question } from '../types';
import { BookOpen, Plus, Search, CheckCircle2, HelpCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface QuestionBankViewProps {
  customQuestions: Question[];
  onAddQuestion: (question: Question) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  customQuestions,
  onAddQuestion,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [category, setCategory] = useState<MathCategory>('penjumlahan');
  const [explanation, setExplanation] = useState('');

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
      alert('Mohon lengkapi seluruh pertanyaan dan 4 pilihan jawaban!');
      return;
    }

    const newQ: Question = {
      id: `custom_q_${Date.now()}`,
      category,
      difficulty: 'normal',
      questionText,
      options: [optionA, optionB, optionC, optionD],
      correctAnswerIndex: correctIdx,
      explanation: explanation || 'Jawaban berdasarkan perhitungan matematika dasar.',
      points: 100,
      durationSeconds: 15,
    };

    onAddQuestion(newQ);
    soundFx.playCorrect();

    // Reset Form
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setExplanation('');
    setShowAddModal(false);
  };

  const filteredQuestions = customQuestions.filter((q) => {
    const matchesCategory = selectedCategory === 'semua' || q.category === selectedCategory;
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full text-xs font-black">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>BANK SOAL MATEMATIKA</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800">KOLEKSI SOAL & MATERI</h2>
        </div>

        <button
          id="btn-add-question-modal"
          onClick={() => {
            soundFx.playClick();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-2xl shadow-md border-b-2 border-red-800 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Soal Baru</span>
        </button>
      </div>

      {/* Filter Category & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border-4 border-amber-300 shadow">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kata kunci soal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-48 py-2 px-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
        >
          <option value="semua">📚 Semua Kategori</option>
          <option value="penjumlahan">➕ Penjumlahan</option>
          <option value="pengurangan">➖ Pengurangan</option>
          <option value="perkalian">✖️ Perkalian</option>
          <option value="pembagian">➕ Pembagian</option>
          <option value="pecahan">🍕 Pecahan</option>
          <option value="persentase">📊 Persentase</option>
          <option value="bangun_datar">📐 Bangun Datar</option>
          <option value="bangun_ruang">📦 Bangun Ruang</option>
          <option value="logika">💡 Logika</option>
        </select>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border-4 border-amber-300 text-center space-y-2">
            <HelpCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="font-black text-sm text-gray-800">Belum Ada Soal Kustom</h4>
            <p className="text-xs font-bold text-gray-500 max-w-sm mx-auto">
              Sistem secara otomatis menggenerasi ribuan soal acak saat bermain. Kamu juga dapat
              menambahkan soal buatanmu sendiri!
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div key={q.id || idx} className="bg-white p-5 rounded-3xl border-2 border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="bg-red-100 text-red-800 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  {q.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-bold text-gray-400">⏱️ {q.durationSeconds} Detik</span>
              </div>

              <h4 className="font-black text-sm text-gray-900">{q.questionText}</h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      oIdx === q.correctAnswerIndex
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-black'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span>
                      {['A', 'B', 'C', 'D'][oIdx]}. {opt}
                    </span>
                    {oIdx === q.correctAnswerIndex && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <p className="text-[11px] font-bold text-gray-500 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  💡 {q.explanation}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD QUESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border-4 border-amber-300 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-lg text-gray-900 text-center border-b pb-2">
              TAMBAH SOAL MATEMATIKA BARU
            </h3>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">Kategori Soal:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MathCategory)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  <option value="penjumlahan">➕ Penjumlahan</option>
                  <option value="pengurangan">➖ Pengurangan</option>
                  <option value="perkalian">✖️ Perkalian</option>
                  <option value="pembagian">➕ Pembagian</option>
                  <option value="pecahan">🍕 Pecahan</option>
                  <option value="persentase">📊 Persentase</option>
                  <option value="bangun_datar">📐 Bangun Datar</option>
                  <option value="bangun_ruang">📦 Bangun Ruang</option>
                  <option value="logika">💡 Logika</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">Pertanyaan / Soal:</label>
                <textarea
                  rows={2}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Contoh: Berapakah hasil dari 15 × 6 = ?"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-gray-600">Pilihan A:</label>
                  <input
                    type="text"
                    required
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-600">Pilihan B:</label>
                  <input
                    type="text"
                    required
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-600">Pilihan C:</label>
                  <input
                    type="text"
                    required
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-600">Pilihan D:</label>
                  <input
                    type="text"
                    required
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">Jawaban yang Benar:</label>
                <select
                  value={correctIdx}
                  onChange={(e) => setCorrectIdx(Number(e.target.value))}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  <option value={0}>Pilihan A</option>
                  <option value={1}>Pilihan B</option>
                  <option value={2}>Pilihan C</option>
                  <option value={3}>Pilihan D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">Penjelasan Pembahasan:</label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Contoh: 15 × 6 = 90"
                  className="w-full p-2 border border-gray-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
