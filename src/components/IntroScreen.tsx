import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroScreenProps {
  onExplore: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onExplore }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Smooth minimalist acoustic tuning progress
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1600; // 1.6s smooth tuning sequence

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
        }, 250);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      id="intro-sanctuary-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)', scale: 0.99 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF5E9] text-[#3A2B27] px-6 overflow-hidden select-none"
    >
      {/* Subtle organic breathing ambiance */}
      <motion.div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.18, 0.32, 0.18],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(209, 137, 85, 0.22) 0%, rgba(92, 29, 36, 0.06) 40%, transparent 70%)'
        }}
      />

      {/* Slim Line Boundary Frame with Architectural Corner Crosshairs */}
      <div 
        aria-hidden="true" 
        className="absolute inset-4 sm:inset-8 border border-[#3A2B27]/15 rounded-xs pointer-events-none flex flex-col justify-between p-4 sm:p-6"
      >
        {/* Subtle corner ticks */}
        <span className="absolute -top-1.5 -left-1.5 text-xs text-[#3A2B27]/30 font-mono leading-none select-none">┼</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-[#3A2B27]/30 font-mono leading-none select-none">┼</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#3A2B27]/30 font-mono leading-none select-none">┼</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#3A2B27]/30 font-mono leading-none select-none">┼</span>

        <div className="flex justify-between items-center text-[10px] sm:text-xs font-google-sans uppercase tracking-[0.25em] text-[#3A2B27]/45">
          <span>क्षेत्र · Kshestra</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#471319]/40 animate-pulse" />
            Sanctuary Gate
          </span>
        </div>
        <div className="flex justify-between items-center text-[10px] sm:text-xs font-google-sans uppercase tracking-[0.25em] text-[#3A2B27]/45">
          <span>Non-Profit Cultural Trust</span>
          <span>Kolkata · India</span>
        </div>
      </div>

      {/* Minimal Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-4 min-h-[140px] justify-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-creative"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Minimal acoustic string harmonic bars */}
              <div className="flex items-center gap-1.5 h-7">
                {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((heightScale, idx) => (
                  <motion.span
                    key={idx}
                    className="w-[1.5px] rounded-full bg-[#471319]/60"
                    animate={{
                      scaleY: [heightScale * 0.4, heightScale, heightScale * 0.3],
                      opacity: [0.4, 0.9, 0.4]
                    }}
                    transition={{
                      duration: 0.8 + (idx % 3) * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: idx * 0.08
                    }}
                    style={{ height: '24px', transformOrigin: 'center' }}
                  />
                ))}
              </div>

              {/* Poetic minimal tuning text with percentage */}
              <div className="flex items-center gap-2 font-google-sans text-[11px] sm:text-xs tracking-[0.25em] uppercase text-[#3A2B27]/60">
                <span>Tuning acoustic sanctuary</span>
                <span className="text-[#471319] font-medium tracking-normal w-9 text-right font-mono">
                  {progress}%
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="welcome-creative"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm sm:text-base md:text-lg font-serif text-[#3A2B27]/85 tracking-wide">
                  Welcome to the sanctuary of arts and living heritage.
                </p>
                <div className="w-8 h-[1px] bg-[#3A2B27]/20" />
              </div>

              <button
                id="explore-sanctuary-btn"
                data-no-sound="true"
                onClick={onExplore}
                data-cursor="pointer"
                className="group relative font-google-sans px-7 sm:px-9 py-2.5 sm:py-3 border border-[#5C1D24] bg-[#5C1D24] text-[#FFF5E9] text-xs tracking-[0.22em] uppercase overflow-hidden hover:border-[#5C1D24] transition-all duration-300 shadow-xs hover:shadow-md"
              >
                {/* Subtle fill inversion animation on hover */}
                <span className="absolute inset-0 bg-[#FFF5E9] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#5C1D24] transition-colors duration-300">
                  <span>EXPLORE THE SANCTUARY</span>
                  <span className="text-[10px] tracking-normal transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

