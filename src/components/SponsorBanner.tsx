import React from 'react';
import { Sponsor } from '../types';

interface SponsorBannerProps {
  sponsors: Sponsor[];
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ sponsors }) => {
  const activeSponsors = sponsors.filter((s) => s.active);

  if (activeSponsors.length === 0) return null;

  return (
    <div className="w-full bg-white/90 backdrop-blur-xs border-t-2 border-amber-300 py-2 px-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
          <span>🇮🇩 DIDUKUNG OLEH MITRA KEMERDEKAAN:</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {activeSponsors.map((sp) => (
            <div key={sp.id} className="flex items-center gap-1.5 group cursor-pointer" title={sp.slogan}>
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span className="font-black text-xs text-red-900 group-hover:text-red-600 transition-colors">
                {sp.logoText}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
