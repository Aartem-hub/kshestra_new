import React, { useState, useEffect } from 'react';
import { audioSynth } from '../services/audioSynthesizer';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Flame, ArrowUpRight, Ticket, MapPin, Sparkles } from 'lucide-react';
import { KshestraLogo } from './KshestraLogo';

interface HeroSectionProps {
  onExploreGatherings: () => void;
  onExploreArchive: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreGatherings,
  onExploreArchive
}) => {
  const heroScripts = [
    'Kshestra',
    'ক্ষেত্র',
    'क्षेत्र',
    'க்ஷேத்ரா',
    'క్షేత్రం',
    'ക്ഷേത്രം',
    'ਖੇਤਰ',
    'କ୍ଷେତ୍ର'
  ];

  const [activeScriptIdx, setActiveScriptIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScriptIdx((prev) => (prev + 1) % heroScripts.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [heroScripts.length]);

  return (
    <section className="relative w-full pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-8 border-b border-[#3A2B27]/15 bg-[#FFF5E9] overflow-hidden">
      
      {/* Background Subtle Architectural Dotted Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15] select-none"
        style={{
          backgroundImage: 'radial-gradient(#3A2B27 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Top Eyebrow Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3A2B27]/15 pb-4 text-xs font-mono text-[#725C54]">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-[#5C1D24] text-[#FFF5E9] font-bold tracking-widest uppercase text-[10px] rounded-xs">
              EST. 2026 · A NON-PROFIT CULTURAL TRUST
            </span>
            <span className="text-[#8A8E3E] hidden sm:inline font-bold">✦</span>
            <span className="hidden sm:inline text-[#8A8E3E] font-bold uppercase tracking-wider">THE SOUL HAS A TERRITORY</span>
          </div>

          <div className="flex items-center gap-2 text-[#3A2B27]">
            <span className="w-2 h-2 rounded-full bg-[#8A8E3E] animate-pulse"></span>
            <span className="font-bold text-[11px] text-[#3A2B27]">ACTIVE SANCTUM IN KOLKATA</span>
          </div>
        </div>

        {/* Asymmetrical Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Requested Dynamic H1 Headline & Direct Copy */}
          <div className="lg:col-span-8 space-y-7">
            
            {/* H1 Headline */}
            <div className="space-y-4">
              <h1 className="font-gambetta text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-bold tracking-tight text-[#3A2B27] leading-[1.14]">
                <span>We are many. We are One.</span>
                <br className="hidden sm:block" />
                <span className="inline-flex items-baseline flex-wrap gap-x-3 mt-1 sm:mt-2">
                  <span>We are</span>
                  <span className="inline-block text-[#5C1D24]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={heroScripts[activeScriptIdx]}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="inline-block whitespace-nowrap"
                      >
                        {heroScripts[activeScriptIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </span>
              </h1>
            </div>

            {/* Exact Subheadline */}
            <div className="max-w-2xl border-l-3 border-[#8A8E3E] pl-5 sm:pl-6 py-1">
              <p className="font-sans text-base sm:text-lg text-[#3A2B27]/90 leading-relaxed font-normal">
                A dedicated physical and digital sanctuary where independent art breathes free. We provide physical studios, shared production crews, and zero-cost masterclasses in Kolkata to ensure no voice is silenced by economic compromise or fear.
              </p>
            </div>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => {
                  audioSynth.playChime();
                  onExploreGatherings();
                }}
                data-cursor="pointer"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] rounded-xs bg-[#5C1D24] hover:bg-[#431319] text-[#FFF5E9] border border-[#3A2B27]/20 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Ticket className="w-4 h-4 text-[#8A8E3E]" />
                <span>Book Upcoming Gatherings</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  audioSynth.playChime();
                  onExploreArchive();
                }}
                data-cursor="pointer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] rounded-xs bg-[#FFFFFF] hover:bg-[#F6EADB] text-[#3A2B27] border-2 border-[#8A8E3E]/40 hover:border-[#8A8E3E] shadow-xs transition-all"
              >
                <Compass className="w-4 h-4 text-[#8A8E3E]" />
                <span>Explore the Living Archive</span>
              </button>
            </div>

            {/* Trust Badges Row featuring 8A8E3E */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#8A8E3E]/15 text-[#3A2B27] border border-[#8A8E3E]/40 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A8E3E]"></span>
                <span>South Kolkata Sanctum</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#8A8E3E]/15 text-[#3A2B27] border border-[#8A8E3E]/40 font-semibold">
                <span className="text-[#8A8E3E]">✦</span>
                <span>40+ Resident Creators Supported</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#8A8E3E]/15 text-[#3A2B27] border border-[#8A8E3E]/40 font-semibold">
                <span className="text-[#8A8E3E]">✦</span>
                <span>Zero Artist Middlemen</span>
              </span>
            </div>

          </div>

          {/* Right Column: Visual Plate & Emblem */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative rounded-xs border-2 border-[#3A2B27] bg-[#3A2B27] shadow-lg overflow-hidden min-h-[320px]">
              <img
                src="/assets/Images/kshestra_puja.png"
                alt="Kshestra Puja Ceremony"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallbacks = [
                    '/kshestra_puja.png',
                    '/assets/kshestra_puja.png',
                    'kshestra_puja.png',
                    '/assets/Images/Kshestra_puja.png',
                    '/assets/Kshestra Logo PNG.png'
                  ];
                  const currentIdx = parseInt(target.dataset.fallbackIdx || '0', 10);
                  if (currentIdx < fallbacks.length) {
                    target.dataset.fallbackIdx = (currentIdx + 1).toString();
                    target.src = fallbacks[currentIdx];
                  } else {
                    target.src = '/assets/Kshestra Logo PNG.png';
                    target.className = "w-full h-80 sm:h-96 object-contain p-10 bg-[#3A2B27] filter invert opacity-90";
                  }
                }}
                className="w-full h-80 sm:h-96 object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A2B27] via-[#3A2B27]/30 to-transparent" />
              
              {/* Crest Seal */}
              <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-[#FFF5E9]/95 backdrop-blur-sm px-3 py-1.5 rounded-xs border border-[#3A2B27]/20">
                <KshestraLogo preferAssetImage className="w-6 h-6" />
                <div>
                  <div className="font-gambetta text-xs font-bold text-[#3A2B27] leading-none">
                    Kshestra Foundation
                  </div>
                  <div className="text-[9px] font-mono text-[#8A8E3E] uppercase font-bold">
                    Non-Profit Cultural Trust
                  </div>
                </div>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-4 left-4 right-4 text-[#FFF5E9] space-y-1">
                <div className="text-[10px] font-mono text-[#8A8E3E] uppercase tracking-wider">
                  KOLKATA SANCTUM · SOUTH KOLKATA
                </div>
                <div className="font-gambetta text-base font-bold leading-snug">
                  “For the Artist. By the Artist.”
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#F6EADB] border border-[#3A2B27]/15 rounded-xs flex items-center justify-between text-xs font-mono text-[#725C54]">
              <span className="text-[#5C1D24] font-bold uppercase text-[10px]">
                ZERO-COST ENTRY
              </span>
              <span className="text-[#3A2B27] font-semibold">Physical Studios & Open Labs</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
