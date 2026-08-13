import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Search, Award, Medal, Flag } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LeaderboardViewProps {
  leaderboardData: LeaderboardEntry[];
  currentUserName: string;
}

type TabType = 'nasional' | 'sekolah' | 'teman' | 'harian' | 'mingguan' | 'event';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboardData,
  currentUserName,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('nasional');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = leaderboardData.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.school.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const topThree = filteredEntries.slice(0, 3);
  const remainingList = filteredEntries.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-black">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>PAPAN PERINGKAT JUARA</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-red-700 uppercase tracking-tight">
          LEADERBOARD T-GAMES SMART CHALLENGE
        </h2>
        <p className="text-xs sm:text-sm font-extrabold text-gray-600">
          Peringkat skor tantangan matematika remaja terbaik se-Indonesia!
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'nasional', label: '🌎 Nasional' },
          { id: 'sekolah', label: '🏢 Komunitas / Instansi' },
          { id: 'teman', label: '👥 Teman' },
          { id: 'harian', label: '📅 Harian' },
          { id: 'mingguan', label: '🗓️ Mingguan' },
          { id: 'event', label: '🇮🇩 Event Kemerdekaan' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`btn-lb-tab-${tab.id}`}
            onClick={() => {
              soundFx.playClick();
              setActiveTab(tab.id as TabType);
            }}
            className={`px-3.5 py-2 rounded-full font-black text-xs whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-red-600 text-white border-amber-300 shadow-md scale-105'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nama pemain, instansi, atau komunitas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-amber-300 rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* PODIUM TOP 3 DISPLAY */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
          {/* Rank 2 (Silver) */}
          {topThree[1] ? (
            <div className="bg-white p-3 rounded-2xl border-2 border-slate-300 shadow text-center space-y-1 transform hover:scale-105 transition-transform">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-xl sm:text-3xl mx-auto shadow-inner">
                {topThree[1].avatar}
              </div>
              <div className="bg-slate-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full inline-block">
                🥈 RANK 2
              </div>
              <h4 className="font-black text-xs sm:text-sm text-gray-800 truncate">{topThree[1].name}</h4>
              <span className="block text-[10px] font-bold text-gray-500 truncate">{topThree[1].school}</span>
              <span className="block font-black text-xs sm:text-sm text-red-600">{topThree[1].score} Pts</span>
            </div>
          ) : <div />}

          {/* Rank 1 (Gold - Center & Highest) */}
          {topThree[0] && (
            <div className="bg-amber-50 p-4 rounded-3xl border-4 border-amber-400 shadow-xl text-center space-y-1 transform scale-105 -translate-y-2 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-red-900 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow border border-white">
                👑 JUARA 1
              </div>
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-amber-300 border-4 border-amber-500 flex items-center justify-center text-3xl sm:text-4xl mx-auto shadow-md">
                {topThree[0].avatar}
              </div>
              <h4 className="font-black text-sm sm:text-base text-gray-900 truncate">{topThree[0].name}</h4>
              <span className="block text-[10px] font-bold text-gray-600 truncate">{topThree[0].school}</span>
              <span className="block font-black text-sm sm:text-base text-red-600">{topThree[0].score} Pts</span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] ? (
            <div className="bg-white p-3 rounded-2xl border-2 border-amber-600 shadow text-center space-y-1 transform hover:scale-105 transition-transform">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-amber-100 border-2 border-amber-700 flex items-center justify-center text-xl sm:text-3xl mx-auto shadow-inner">
                {topThree[2].avatar}
              </div>
              <div className="bg-amber-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full inline-block">
                🥉 RANK 3
              </div>
              <h4 className="font-black text-xs sm:text-sm text-gray-800 truncate">{topThree[2].name}</h4>
              <span className="block text-[10px] font-bold text-gray-500 truncate">{topThree[2].school}</span>
              <span className="block font-black text-xs sm:text-sm text-red-600">{topThree[2].score} Pts</span>
            </div>
          ) : <div />}
        </div>
      )}

      {/* LEADERBOARD RANK LIST TABLE */}
      <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-lg overflow-hidden">
        <div className="p-4 bg-red-600 text-white font-black text-xs flex justify-between items-center border-b border-amber-300">
          <span>DAFTAR PERINGKAT PEMANJAT</span>
          <span>{filteredEntries.length} Pemain</span>
        </div>

        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold text-xs">
              Belum ada data pemain untuk kategori ini.
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const isCurrentUser = entry.name.toLowerCase() === currentUserName.toLowerCase();

              return (
                <div
                  key={entry.id || idx}
                  className={`p-3.5 flex items-center justify-between gap-3 text-xs font-bold transition-colors ${
                    isCurrentUser ? 'bg-amber-100/90 border-l-4 border-red-600' : 'hover:bg-amber-50/50'
                  }`}
                >
                  {/* Rank Number & Avatar */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border ${
                        idx === 0
                          ? 'bg-amber-400 text-red-950 border-amber-500'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900 border-slate-400'
                          : idx === 2
                          ? 'bg-amber-700 text-white border-amber-800'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <span className="text-2xl">{entry.avatar}</span>

                    <div>
                      <h4 className="font-black text-gray-800 text-sm flex items-center gap-1.5">
                        <span>{entry.name}</span>
                        {isCurrentUser && (
                          <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                            KAMU
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] font-extrabold text-gray-500">{entry.school}</p>
                    </div>
                  </div>

                  {/* Level & Score */}
                  <div className="text-right">
                    <span className="block font-black text-sm text-red-600">{entry.score} Pts</span>
                    <span className="text-[10px] font-extrabold text-amber-700">
                      Level {entry.level} ({entry.category})
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
