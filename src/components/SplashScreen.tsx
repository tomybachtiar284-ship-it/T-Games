import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shield, Trophy } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SplashScreenProps {
  message?: string;
  subtitle?: string;
  onComplete?: () => void;
  durationSeconds?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  message = 'Mengamankan Akun & Menyiapkan Permainan...',
  subtitle = 'Tantangan Logika & Matematika Remaja Masa Kini',
  onComplete,
  durationSeconds = 2.5,
}) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    soundFx.playClick();
    const startTime = Date.now();
    const totalMs = durationSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / totalMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationSeconds]);

  const handleEnterGame = () => {
    soundFx.playVictory();
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.4 } }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-red-950 via-red-900 to-amber-950 text-white flex flex-col items-center justify-center p-6 overflow-hidden select-none"
      >
        {/* Background Ambient Glow & Particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Animated Background Sparkles */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 text-amber-400 opacity-50 text-4xl pointer-events-none"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-1/4 right-1/4 text-amber-300 opacity-50 text-3xl pointer-events-none"
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/3 text-red-400 opacity-40 text-2xl pointer-events-none"
        >
          ⚡
        </motion.div>

        {/* CENTERPIECE BRAND LOGO EMBLEM */}
        <div className="relative flex flex-col items-center z-10 space-y-6 max-w-md w-full text-center">
          {/* Animated Glowing Logo Wrapper */}
          <div className="relative">
            {/* Outer Glowing Pulse Ring */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 1, 0.6],
                rotate: [0, 180, 360],
              }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400 via-red-500 to-amber-300 opacity-75 blur-md"
            />

            {/* Logo Badge Container */}
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white border-4 border-amber-300 shadow-2xl p-2 flex items-center justify-center overflow-hidden"
            >
              <img
                src="/logo.png"
                alt="Logo Brand T-Games"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <span className="hidden text-6xl">🇮🇩</span>
            </motion.div>
          </div>

          {/* BRAND TITLE & SUBTITLE */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/40 px-3.5 py-1 rounded-full text-amber-300 text-xs font-black tracking-widest uppercase shadow">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>T-GAMES OFFICIAL STUDIO</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 tracking-tight drop-shadow-md uppercase">
              T-GAMES <span className="text-amber-400">SMART CHALLENGE</span>
            </h1>

            <p className="text-xs sm:text-sm font-extrabold text-amber-200/90 italic max-w-sm mx-auto">
              “{subtitle}”
            </p>
          </motion.div>

          {/* PROGRESS BAR OR ENTER BUTTON */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full space-y-3 pt-2"
          >
            {!isReady ? (
              <>
                {/* Progress Bar Container */}
                <div className="w-full h-3 bg-red-950/80 rounded-full border border-amber-400/40 p-0.5 shadow-inner overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-400 rounded-full shadow"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-black text-amber-200/80 px-1">
                  <span className="flex items-center gap-1">
                    <span>⚡</span>
                    <span>{message}</span>
                  </span>
                  <span className="text-amber-300 font-mono">{progress}%</span>
                </div>
              </>
            ) : (
              /* ENTER GAME BUTTON (TAMPIL SETELAH READY / PROSES SELESAI) */
              <motion.button
                id="btn-splash-enter-game"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnterGame}
                className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-red-950 font-black text-base sm:text-xl rounded-2xl shadow-2xl border-b-4 border-amber-700 flex items-center justify-center gap-3 transition-all animate-bounce"
              >
                <span>MASUK PERMAINAN 🚀</span>
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
