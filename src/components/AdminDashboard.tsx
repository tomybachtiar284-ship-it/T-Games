import React, { useState, useEffect } from 'react';
import { Sponsor } from '../types';
import { ShieldAlert, Users, BookOpen, BarChart3, Tv, Award, ToggleLeft, ToggleRight, Plus, Ticket, Send, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { addPlayPointsByEmail, fetchCloudAllProfiles, fetchCloudSystemStats, SystemStats, setUserSubscription, SubscriptionType, isActiveSubscriber, getSubscriptionDaysRemaining } from '../utils/supabase';

interface AdminDashboardProps {
  sponsors: Sponsor[];
  onUpdateSponsors: (sponsors: Sponsor[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  sponsors,
  onUpdateSponsors,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'topup' | 'subscription' | 'sponsors' | 'ads'>('stats');

  // Real DB Stats State
  const [sysStats, setSysStats] = useState<SystemStats>({
    totalPlayers: 0,
    activePlayers: 0,
    totalQuestionsAnswered: 0,
    averageAccuracy: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  // Cloud Profiles for Topup Table
  const [cloudProfiles, setCloudProfiles] = useState<Array<{ id: string; name: string; email?: string; play_points: number; coins: number; updated_at?: string }>>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadCloudProfiles = async () => {
    setIsLoadingProfiles(true);
    const profs = await fetchCloudAllProfiles();
    setCloudProfiles(profs);
    setIsLoadingProfiles(false);
  };

  const loadRealStats = async () => {
    setIsLoadingStats(true);
    const stats = await fetchCloudSystemStats();
    setSysStats(stats);
    setIsLoadingStats(false);
  };

  useEffect(() => {
    loadRealStats();
    loadCloudProfiles();
  }, []);

  // Top-Up Form State
  const [targetEmail, setTargetEmail] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState<number>(50);
  const [topUpResult, setTopUpResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscription Management State
  const [subEmail, setSubEmail] = useState('');
  const [subType, setSubType] = useState<SubscriptionType>('basic');
  const [subDays, setSubDays] = useState<number>(30);
  const [subBonusPoints, setSubBonusPoints] = useState<number>(100);
  const [subResult, setSubResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubSubmitting, setIsSubSubmitting] = useState(false);

  const handleSetSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) { alert('Masukkan email pemain terlebih dahulu!'); return; }
    soundFx.playClick();
    setIsSubSubmitting(true);
    setSubResult(null);
    const res = await setUserSubscription(subEmail.trim(), subType, subDays, subBonusPoints);
    setIsSubSubmitting(false);
    setSubResult(res);
    if (res.success) { soundFx.playCorrect(); setSubEmail(''); loadCloudProfiles(); }
  };

  const handleQuickSubscription = async (email: string, type: SubscriptionType, days: number, bonus: number) => {
    soundFx.playClick();
    setIsSubSubmitting(true);
    const res = await setUserSubscription(email, type, days, bonus);
    setIsSubSubmitting(false);
    setSubResult(res);
    if (res.success) { soundFx.playCorrect(); loadCloudProfiles(); }
  };

  const toggleSponsor = (id: string) => {
    soundFx.playClick();
    const updated = sponsors.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    onUpdateSponsors(updated);
  };

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail) {
      alert('Masukkan email pemain terlebih dahulu!');
      return;
    }
    soundFx.playClick();
    setIsSubmitting(true);
    setTopUpResult(null);

    const res = await addPlayPointsByEmail(targetEmail, pointsToAdd);
    setIsSubmitting(false);
    setTopUpResult(res);

    if (res.success) {
      soundFx.playCorrect();
      setTargetEmail('');
      loadCloudProfiles();
    }
  };

  const handleQuickTopUp = async (email: string, points: number) => {
    soundFx.playClick();
    setIsSubmitting(true);
    const res = await addPlayPointsByEmail(email, points);
    setIsSubmitting(false);
    setTopUpResult(res);
    if (res.success) {
      soundFx.playCorrect();
      loadCloudProfiles();
    }
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
      <div className="flex flex-wrap items-center justify-center gap-2">
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
          id="btn-admin-tab-topup"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('topup');
          }}
          className={`px-4 py-2 rounded-2xl font-black text-xs border transition-all ${
            activeTab === 'topup'
              ? 'bg-red-600 text-white border-amber-300 shadow'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          🎫 Top-Up Token
        </button>

        <button
          id="btn-admin-tab-subscription"
          onClick={() => {
            soundFx.playClick();
            setActiveTab('subscription');
          }}
          className={`px-4 py-2 rounded-2xl font-black text-xs border transition-all ${
            activeTab === 'subscription'
              ? 'bg-red-600 text-white border-amber-300 shadow'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          👑 Kelola Langganan
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
          <div className="flex justify-between items-center bg-amber-50 px-4 py-2 rounded-2xl border border-amber-300">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <span>🌐</span> STATISTIK DARI DATABASE SUPABASE (REAL-TIME)
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                loadRealStats();
              }}
              disabled={isLoadingStats}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-[11px] rounded-full shadow border border-amber-200 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">TOTAL PEMAIN</span>
              <span className="font-black text-2xl text-red-600">{sysStats.totalPlayers.toLocaleString('id-ID')}</span>
              <span className="block text-[10px] font-bold text-emerald-600 mt-1">✓ Database Terdaftar</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">PEMAIN AKTIF</span>
              <span className="font-black text-2xl text-amber-600">{sysStats.activePlayers.toLocaleString('id-ID')}</span>
              <span className="block text-[10px] font-bold text-amber-600 mt-1">● Aktif 7 Hari Terakhir</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">SOAL DIJAWAB</span>
              <span className="font-black text-2xl text-blue-600">{sysStats.totalQuestionsAnswered.toLocaleString('id-ID')}</span>
              <span className="block text-[10px] font-bold text-gray-400 mt-1">Total Akumulasi Real</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">RATA-RATA AKURASI</span>
              <span className="font-black text-2xl text-emerald-600">{sysStats.averageAccuracy}%</span>
              <span className="block text-[10px] font-bold text-gray-400 mt-1">Presisi Jawaban Real</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP-UP POIN TAB */}
      {activeTab === 'topup' && (
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow space-y-4">
          <div className="flex items-center gap-2 text-red-700">
            <Ticket className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-base text-gray-800">TAMBAH POIN / TIKET BERMAIN PEMAIN</h3>
          </div>
          <p className="text-xs font-bold text-gray-500">
            Masukkan alamat email pemain yang telah melakukan transfer/pembayaran manual untuk menambahkan Poin Bermain mereka di Cloud Supabase.
          </p>

          <form onSubmit={handleTopUpSubmit} className="space-y-4 max-w-lg bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-700">Email Pemain (Google Account)</label>
              <input
                type="email"
                required
                placeholder="contoh: pemain@gmail.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-700">Jumlah Poin Ditambahkan</label>
              <div className="flex gap-2">
                {[10, 20, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPointsToAdd(num)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs border ${
                      pointsToAdd === num ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    +{num} Poin
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow border-b-2 border-emerald-800 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : `Tambah +${pointsToAdd} Poin Sekarang`}</span>
            </button>
          </form>

          {topUpResult && (
            <div className={`p-4 rounded-2xl border-2 text-xs font-black ${
              topUpResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              {topUpResult.message}
            </div>
          )}

          {/* REGISTERED PLAYERS TOKEN LIST & 1-CLICK TOP-UP TABLE */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                <h4 className="font-black text-xs sm:text-sm text-gray-800 uppercase">DAFTAR SALDO TIKET PEMAIN TERDAFTAR</h4>
              </div>
              <input
                type="text"
                placeholder="Cari email/nama pemain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="overflow-x-auto border-2 border-amber-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-100 text-amber-900 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Pemain</th>
                    <th className="p-2.5">Email Google</th>
                    <th className="p-2.5 text-center">Saldo Tiket 🎫</th>
                    <th className="p-2.5 text-center">Aksi Top-Up Cepat ⚡</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-extrabold text-gray-700">
                  {cloudProfiles
                    .filter(p => !searchQuery || (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 10)
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="p-2.5 font-black text-gray-900">{p.name}</td>
                        <td className="p-2.5 text-gray-500 font-mono text-[11px]">{p.email || 'Google Auth'}</td>
                        <td className="p-2.5 text-center font-black text-red-600 text-sm">{p.play_points ?? 10} Tiket</td>
                        <td className="p-2.5 text-center">
                          <div className="flex justify-center gap-1">
                            {[10, 20, 50, 100].map((num) => (
                              <button
                                key={num}
                                disabled={isSubmitting || !p.email}
                                onClick={() => p.email && handleQuickTopUp(p.email, num)}
                                className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-[10px] font-black rounded-lg shadow transition-transform active:scale-95"
                              >
                                +{num}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  {cloudProfiles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400 font-normal italic">
                        {isLoadingProfiles ? 'Memuat daftar akun...' : 'Gunakan form di atas untuk memasukkan email pemain.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION MANAGEMENT TAB */}
      {activeTab === 'subscription' && (
        <div className="bg-white rounded-3xl p-6 border-4 border-purple-300 shadow space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <h3 className="font-black text-base text-gray-800">KELOLA PAKET BERLANGGANAN PEMAIN</h3>
          </div>

          {/* Package info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: 'free', label: '🆓 FREE', desc: '10 Token sekali', color: 'border-gray-300 bg-gray-50 text-gray-700' },
              { type: 'basic', label: '🥈 BASIC', desc: '+100 Token/bulan\nToken dipotong normal', color: 'border-blue-300 bg-blue-50 text-blue-800' },
              { type: 'premium', label: '🥇 PREMIUM', desc: '♾️ Unlimited — Token TIDAK dipotong saat bermain!', color: 'border-amber-300 bg-amber-50 text-amber-800' },
            ].map((pkg) => (
              <div key={pkg.type} className={`p-3 rounded-2xl border-2 ${pkg.color}`}>
                <div className="font-black text-sm">{pkg.label}</div>
                <div className="text-[11px] font-bold mt-1 whitespace-pre-line opacity-80">{pkg.desc}</div>
              </div>
            ))}
          </div>

          {/* Subscription form */}
          <form onSubmit={handleSetSubscription} className="space-y-4 max-w-lg bg-purple-50 p-4 rounded-2xl border-2 border-purple-200">
            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-700">Email Pemain (Google Account)</label>
              <input
                type="email"
                required
                placeholder="contoh: pemain@gmail.com"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-purple-300 rounded-xl font-bold text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-gray-700">Paket Langganan</label>
              <div className="flex gap-2">
                {(['basic', 'premium'] as SubscriptionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSubType(t);
                      setSubBonusPoints(t === 'premium' ? 0 : 100);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs border ${subType === t ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-gray-700 border-gray-300'}`}
                  >
                    {t === 'basic' ? '🥈 Basic' : '🥇 Premium'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-black text-gray-700">Durasi</label>
                <div className="flex gap-2">
                  {[30, 60, 90].map((d) => (
                    <button key={d} type="button" onClick={() => setSubDays(d)}
                      className={`px-2.5 py-1 rounded-xl font-black text-[11px] border ${subDays === d ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      {d}h
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-gray-700">Bonus Token</label>
                <div className="flex gap-2">
                  {[0, 50, 100, 200].map((b) => (
                    <button key={b} type="button" onClick={() => setSubBonusPoints(b)}
                      className={`px-2 py-1 rounded-xl font-black text-[11px] border ${subBonusPoints === b ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      +{b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-black text-xs rounded-xl shadow border-b-2 border-purple-900 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>{isSubSubmitting ? 'Memproses...' : `Aktifkan ${subType === 'premium' ? '🥇 PREMIUM' : '🥈 BASIC'} — ${subDays} Hari${subBonusPoints > 0 ? ` (+${subBonusPoints} Token)` : ''}`}</span>
            </button>
          </form>

          {subResult && (
            <div className={`p-4 rounded-2xl border-2 text-xs font-black ${subResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}>
              {subResult.message}
            </div>
          )}

          {/* Player Subscription Status Table */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h4 className="font-black text-xs sm:text-sm text-gray-800 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              STATUS LANGGANAN SEMUA PEMAIN
            </h4>

            <div className="overflow-x-auto border-2 border-purple-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-purple-100 text-purple-900 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Pemain</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Sisa Hari</th>
                    <th className="p-2.5 text-center">Aksi Cepat ⚡</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-extrabold">
                  {cloudProfiles
                    .slice(0, 15)
                    .map((p) => {
                      const subType = (p as any).subscription_type as SubscriptionType || 'free';
                      const expiresAt = (p as any).subscription_expires_at as string | null;
                      const active = isActiveSubscriber(subType, expiresAt);
                      const days = getSubscriptionDaysRemaining(expiresAt);
                      const badgeColor = subType === 'premium' ? 'bg-amber-100 text-amber-800 border-amber-300' : subType === 'basic' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-600 border-gray-200';
                      const badgeLabel = subType === 'premium' ? '🥇 PREMIUM' : subType === 'basic' ? '🥈 BASIC' : '🆓 FREE';
                      return (
                        <tr key={p.id} className="hover:bg-purple-50/50 transition-colors">
                          <td className="p-2.5 font-black text-gray-900">{p.name}</td>
                          <td className="p-2.5 text-gray-500 font-mono text-[10px]">{p.email || '-'}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full border font-black text-[10px] ${badgeColor}`}>
                              {badgeLabel}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-black text-sm">
                            {active ? <span className="text-emerald-600">{days}h ✅</span> : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="p-2.5 text-center">
                            {p.email && (
                              <div className="flex justify-center gap-1">
                                <button
                                  disabled={isSubSubmitting}
                                  onClick={() => handleQuickSubscription(p.email!, 'basic', 30, 100)}
                                  className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-[10px] font-black rounded-lg shadow"
                                >
                                  +Basic/30h
                                </button>
                                <button
                                  disabled={isSubSubmitting}
                                  onClick={() => handleQuickSubscription(p.email!, 'premium', 30, 0)}
                                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-[10px] font-black rounded-lg shadow"
                                >
                                  +Premium/30h
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {cloudProfiles.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-400 font-normal italic">Belum ada pemain terdaftar.</td></tr>
                  )}
                </tbody>
              </table>
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
