import React from 'react';
import { GameSettings } from '../types';
import { Settings, Volume2, VolumeX, RefreshCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SettingsViewProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
}) => {
  const toggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled, musicEnabled: !settings.soundEnabled };
    onUpdateSettings(updated);
    soundFx.setMuted(!updated.soundEnabled);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 border border-gray-300 px-3 py-1 rounded-full text-xs font-black">
          <Settings className="w-4 h-4 text-gray-600" />
          <span>PENGATURAN GAME</span>
        </div>
        <h2 className="text-3xl font-black text-gray-800">KONFIGURASI SUARA & TEMA</h2>
      </div>

      <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-xl space-y-4">
        {/* Sound Toggle */}
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div>
            <h4 className="font-black text-sm text-gray-900">Efek Suara & Musik Synthesizer</h4>
            <p className="text-xs font-bold text-gray-500">Aktifkan efek suara pemanjatan, jawaban, dan musik background.</p>
          </div>

          <button
            id="btn-settings-toggle-sound"
            onClick={toggleSound}
            className={`px-4 py-2 rounded-full font-black text-xs border transition-colors ${
              settings.soundEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {settings.soundEnabled ? '🔔 SUARA AKTIF' : '🔕 SUARA MATI'}
          </button>
        </div>

        {/* Reset Data Option */}
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
          <h4 className="font-black text-sm text-rose-900">Reset Data Permainan Local</h4>
          <p className="text-xs font-bold text-rose-700">
            Hapus skor lokal, koin, dan kustomisasi karakter untuk mengulang permainan dari awal.
          </p>

          <button
            id="btn-settings-reset-data"
            onClick={() => {
              if (confirm('Apakah kamu yakin ingin mereset seluruh data profil lokal?')) {
                onResetData();
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reset Data Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
