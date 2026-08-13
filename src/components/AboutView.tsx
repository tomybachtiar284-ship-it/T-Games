import React from 'react';
import { Info, ShieldCheck, Heart, Flag, Sparkles, BookOpen } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-black">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>TENTANG GAME</span>
        </div>
        <h2 className="text-3xl font-black text-gray-800">TOBA SMART CHALLENGE</h2>
        <p className="text-xs font-extrabold text-gray-600 italic">
          “Tantangan Logika & Matematika Remaja Masa Kini!”
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-xl space-y-5 text-gray-800 text-xs sm:text-sm leading-relaxed">
        <div className="space-y-2">
          <h3 className="font-black text-base text-red-700 flex items-center gap-2">
            <span>⚡</span>
            <span>KONSEP & TEMA PERMAINAN REMAJA</span>
          </h3>
          <p className="font-bold text-gray-700">
            <strong>ToBa Smart Challenge</strong> adalah aplikasi game edukasi matematika & logika interaktif
            yang dirancang khusus untuk remaja dan pelajar. Menggabungkan dinamika permainan kompetitif
            dengan tantangan berhitung cepat, penalaran logika, dan mode duel 2 tiang di 1 monitor layar lebar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 space-y-1">
            <h4 className="font-black text-xs text-red-900 flex items-center gap-1">
              <span>🧗‍♂️</span> Mekanisme Panjat Pinang
            </h4>
            <p className="text-[11px] font-bold text-gray-600">
              Jawab soal dengan benar untuk memanjat ke tingkat berikutnya. Jika salah atau kehabisan waktu,
              karakter akan tergelincir turun!
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 space-y-1">
            <h4 className="font-black text-xs text-red-900 flex items-center gap-1">
              <span>🧠</span> 10 Kategori Matematika
            </h4>
            <p className="text-[11px] font-bold text-gray-600">
              Mencakup Penjumlahan, Pengurangan, Perkalian, Pembagian, Pecahan, Persentase, Bangun Datar, Bangun
              Ruang, dan Logika!
            </p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h3 className="font-black text-sm text-gray-900">VERSI & PENGEMBANGAN FUTURE READY</h3>
          <ul className="list-disc list-inside font-bold text-gray-600 space-y-1 text-xs">
            <li>Dapat dijalankan sebagai PWA (Progressive Web App) offline & mobile.</li>
            <li>Siap terhubung dengan database Supabase PostgreSQL untuk Leaderboard Nasional online.</li>
            <li>Dilengkapi sistem Ad Monetization (Rewarded Ads & Non-intrusive Banners) dan Sponsor mitra.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
