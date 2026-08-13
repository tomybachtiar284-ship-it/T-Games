import React, { useState } from 'react';
import { Sponsor } from '../types';
import { ShieldAlert, Users, BookOpen, BarChart3, Tv, Award, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AdminDashboardProps {
  sponsors: Sponsor[];
  onUpdateSponsors: (sponsors: Sponsor[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  sponsors,
  onUpdateSponsors,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'sponsors' | 'ads'>('stats');

  const toggleSponsor = (id: string) => {
    soundFx.playClick();
    const updated = sponsors.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    onUpdateSponsors(updated);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-red-800 text-amber-200 border border-amber-400 px-3 py-1 rounded-full text-xs font-black">
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          <span>DASHBOARD ADMINISTRATOR</span>
        </div>
        <h2 className="text-3xl font-black text-gray-800">SISTEM & STATISTIK GAME</h2>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center justify-center gap-2">
        <button
          id="btn-admin-tab-stats"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('stats');
          }}
          className={`px-4 py-2 rounded-2xl font-black text-xs border transition-all ${
            activeTab === 'stats'
              ? 'bg-red-600 text-white border-amber-300 shadow'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          📊 Statistik Permainan
        </button>

        <button
          id="btn-admin-tab-sponsors"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('sponsors');
          }}
          className={`px-4 py-2 rounded-2xl font-black text-xs border transition-all ${
            activeTab === 'sponsors'
              ? 'bg-red-600 text-white border-amber-300 shadow'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          🤝 Kelola Sponsor
        </button>

        <button
          id="btn-admin-tab-ads"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('ads');
          }}
          className={`px-4 py-2 rounded-2xl font-black text-xs border transition-all ${
            activeTab === 'ads'
              ? 'bg-red-600 text-white border-amber-300 shadow'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          📺 Monetisasi & Iklan
        </button>
      </div>

      {/* STATS OVERVIEW TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">TOTAL PEMAIN</span>
              <span className="font-black text-2xl text-red-600">12,840</span>
              <span className="block text-[10px] font-bold text-emerald-600 mt-1">↑ +15% Minggu Ini</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">PEMAIN AKTIF</span>
              <span className="font-black text-2xl text-amber-600">1,420</span>
              <span className="block text-[10px] font-bold text-emerald-600 mt-1">● Online Sekarang</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">SOAL DIJAWAB</span>
              <span className="font-black text-2xl text-blue-600">385,200</span>
              <span className="block text-[10px] font-bold text-gray-400 mt-1">Total akumulasi</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">RATA-RATA AKURASI</span>
              <span className="font-black text-2xl text-emerald-600">78.4%</span>
              <span className="block text-[10px] font-bold text-gray-400 mt-1">Tingkat keberhasilan</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border-4 border-amber-300 shadow space-y-3">
            <h4 className="font-black text-sm text-gray-800">LEVEL PALING POPULER DIMAINKAN</h4>
            <div className="space-y-2 text-xs font-bold">
              {[
                { name: 'Level 1: Penjumlahan Dasar', pct: 95 },
                { name: 'Level 3: Perkalian Cepat', pct: 82 },
                { name: 'Level 5: Operasi Campuran', pct: 68 },
                { name: 'Level 7: Persentase', pct: 45 },
                { name: 'Level 10: Master Matematika', pct: 28 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-black text-red-600">{item.pct}% Pemain</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SPONSOR MANAGER TAB */}
      {activeTab === 'sponsors' && (
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow space-y-4">
          <h3 className="font-black text-base text-gray-800">PENGATURAN SPONSOR DAN MITRA EDUKASI</h3>
          <p className="text-xs font-bold text-gray-500">
            Sponsor yang aktif akan ditampilkan pada halaman Home, Event Kemerdekaan, dan Leaderboard.
          </p>

          <div className="divide-y divide-gray-100">
            {sponsors.map((sp) => (
              <div key={sp.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-gray-900">{sp.name}</h4>
                  <p className="text-xs font-bold text-gray-500">{sp.slogan}</p>
                </div>

                <button
                  id={`btn-toggle-sponsor-${sp.id}`}
                  onClick={() => toggleSponsor(sp.id)}
                  className={`px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5 transition-colors ${
                    sp.active
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {sp.active ? (
                    <>
                      <ToggleRight className="w-4 h-4" /> Aktif
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" /> Nonaktif
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONETIZATION & ADS TAB */}
      {activeTab === 'ads' && (
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow space-y-4">
          <h3 className="font-black text-base text-gray-800">PENGATURAN MONETISASI & IKLAN</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-2">
              <span className="inline-block bg-amber-400 text-red-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                REWARDED ADS
              </span>
              <h4 className="font-black text-sm text-gray-900">Tonton Iklan (+1 Nyawa)</h4>
              <p className="text-xs font-bold text-gray-600">
                Pemain dapat menonton video singkat saat kehabisan nyawa untuk melanjutkan pendakian.
              </p>
              <span className="text-xs font-black text-emerald-600 block">Status: ✅ Siap Digunakan</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-2">
              <span className="inline-block bg-amber-400 text-red-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                BANNER ADS
              </span>
              <h4 className="font-black text-sm text-gray-900">Banner Non-Intrusif</h4>
              <p className="text-xs font-bold text-gray-600">
                Hanya muncul di halaman Home dan Leaderboard. Tidak pernah menggangu saat menjawab soal.
              </p>
              <span className="text-xs font-black text-emerald-600 block">Status: ✅ Dipasang di Footer</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
