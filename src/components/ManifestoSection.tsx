import React, { useState } from 'react';
import { KSHESTRA_MANIFESTO } from '../data/initialData';
import { 
  Feather, Shield, CheckCircle2, Flame, BookOpen, Users, 
  Sparkles, HeartHandshake, ShieldCheck, HandHeart, Globe2, Eye, Compass,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';
import { audioSynth } from '../services/audioSynthesizer';

const STATUTE_METADATA = [
  { icon: Flame, tag: "RESOURCE EQUITY", theme: "Production & Studio Access" },
  { icon: BookOpen, tag: "OPEN PEDAGOGY", theme: "Zero-Cost Skill Sharing" },
  { icon: Users, tag: "DECENTRALIZED COMMUNION", theme: "Anti-Hierarchy Guilds" },
  { icon: Sparkles, tag: "RAW EXPERIMENTATION", theme: "Demo & Draft Sanctuaries" },
  { icon: HeartHandshake, tag: "AFFIRMATIVE ACCESS", theme: "Grassroots Stipends" },
  { icon: ShieldCheck, tag: "UNFILTERED EXPRESSION", theme: "Censorship-Free Curation" },
  { icon: HandHeart, tag: "MUTUAL PRESERVATION", theme: "Emergency Micro-Grants" },
  { icon: Globe2, tag: "CIVIC RESONANCE", theme: "Public Art & Interventions" },
  { icon: Eye, tag: "OPEN-LEDGER TRUST", theme: "100% Fiscal Transparency" },
  { icon: Compass, tag: "INTERGENERATIONAL FIRE", theme: "Alumni Torchbearer Circles" }
];

export const ManifestoSection: React.FC = () => {
  const [activeStatute, setActiveStatute] = useState<number | null>(0);
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  const handleStatuteClick = (idx: number) => {
    audioSynth.playChime();
    setActiveStatute(prev => (prev === idx ? null : idx));
  };

  return (
    <section id="manifesto-section" className="py-20 md:py-32 border-b border-[#3A2B27]/15 bg-[#FFF5E9] relative overflow-hidden">
      
      {/* Background Subtle Watermark */}
      <div className="absolute top-20 right-8 pointer-events-none opacity-[0.02] select-none hidden lg:block font-gambetta text-[28vw] font-bold text-[#3A2B27] leading-none">
        X
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16 relative z-10">
        
        {/* Editorial Section Masthead */}
        <div className="border-b-2 border-[#3A2B27] pb-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#5C1D24] font-bold tracking-widest uppercase">
              <Feather className="w-4 h-4 text-[#5C1D24]" />
              <span>THE SACRED CHARTER · RATIFIED 2026</span>
            </div>
            <div className="text-[#725C54] uppercase tracking-wider">
              SANCTUARY COVENANT · KOLKATA TRUST
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-gambetta text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#3A2B27] leading-[1.08]">
                The 10 Commandments
              </h2>
              <p className="font-serif italic text-lg sm:text-2xl text-[#5C1D24] leading-snug max-w-3xl">
                "{KSHESTRA_MANIFESTO.ourBelief}"
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right font-mono text-xs text-[#725C54] space-y-2 border-l-2 lg:border-l-0 lg:border-r-2 border-[#5C1D24] pl-4 lg:pl-0 lg:pr-4 py-1">
              <p className="font-bold text-[#3A2B27] uppercase tracking-wider">
                A Binding Covenant For Free Art
              </p>
              <p>
                Ten sequential statutes governing residency, shared tools, dignity, and collective protection.
              </p>
            </div>
          </div>
        </div>

        {/* STACKED SEQUENTIAL LEDGER (Rich, Interactive, Not Boring) */}
        <div className="border-t-2 border-[#3A2B27] divide-y divide-[#3A2B27]/20">
          {KSHESTRA_MANIFESTO.principles.map((p, idx) => {
            const isActive = activeStatute === idx;
            const roman = romanNumerals[idx] || `${idx + 1}`;
            const meta = STATUTE_METADATA[idx] || { icon: Shield, tag: "STATUTE", theme: "Core Principle" };
            const IconComponent = meta.icon;

            return (
              <motion.article
                key={p.num}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                onClick={() => handleStatuteClick(idx)}
                data-cursor="pointer"
                className={`py-6 sm:py-8 px-3 sm:px-6 transition-all duration-300 rounded-xs cursor-pointer group ${
                  isActive 
                    ? 'bg-[#F6EADB] border-l-4 border-l-[#8A8E3E] shadow-xs' 
                    : 'hover:bg-[#F6EADB]/60 hover:border-l-2 hover:border-l-[#8A8E3E]/60'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
                  
                  {/* Left Rail: Roman Numeral, Icon & Tag */}
                  <div className="md:col-span-3 lg:col-span-3 flex md:flex-col items-baseline md:items-start justify-between md:justify-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xs flex items-center justify-center transition-colors ${
                        isActive ? 'bg-[#8A8E3E] text-[#FFF5E9]' : 'bg-[#3A2B27]/10 text-[#5C1D24] group-hover:bg-[#8A8E3E] group-hover:text-[#FFF5E9]'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-gambetta text-3xl sm:text-4xl font-bold text-[#5C1D24] tracking-tight leading-none">
                        {roman}
                      </span>
                    </div>

                    <div className="space-y-0.5 mt-1">
                      <div className="text-[10px] font-mono tracking-widest text-[#8A8E3E] uppercase font-bold">
                        {meta.tag}
                      </div>
                      <div className="text-[10px] font-mono text-[#725C54] hidden md:block">
                        {meta.theme}
                      </div>
                    </div>
                  </div>

                  {/* Right Main Column: Title, Quote & Tangible Mechanism */}
                  <div className="md:col-span-9 lg:col-span-9 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-gambetta text-xl sm:text-2xl lg:text-3xl font-bold text-[#3A2B27] group-hover:text-[#5C1D24] transition-colors">
                        {p.title}
                      </h3>
                      <span className="text-xs font-mono text-[#725C54] flex items-center gap-1 shrink-0">
                        <span className="hidden sm:inline text-[10px] uppercase font-semibold text-[#8A8E3E]">
                          {isActive ? 'Fold' : 'Doctrine'}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-[#8A8E3E] transition-transform duration-300 ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                      </span>
                    </div>

                    {/* Creed Statement */}
                    <div className="border-l-3 border-[#8A8E3E]/80 pl-4 py-1">
                      <p className="font-serif italic text-base sm:text-lg text-[#3A2B27] font-semibold leading-snug">
                        "{p.statement}"
                      </p>
                    </div>

                    {/* Sanctuary Action Mechanism (Expanded details when active or on hover) */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pt-3 overflow-hidden"
                        >
                          <div className="p-4 bg-[#FFFFFF] rounded-xs border border-[#3A2B27]/15 space-y-2 shadow-xs">
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8A8E3E] uppercase tracking-wider">
                              <Shield className="w-3.5 h-3.5 text-[#8A8E3E]" />
                              <span>SANCTUARY ACTION & LIVING DELIVERABLE:</span>
                            </div>
                            <p className="text-xs sm:text-sm font-sans text-[#3A2B27]/90 leading-relaxed pl-5">
                              {p.tangibleMechanism}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                </div>
              </motion.article>
            );
          })}
        </div>

        {/* The Sovereign Promise Bottom Banner */}
        <div className="border-2 border-[#3A2B27] bg-[#F6EADB] p-8 sm:p-10 rounded-xs shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#3A2B27]/15 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs bg-[#5C1D24] flex items-center justify-center text-[#FFF5E9] p-2">
                <KshestraLogo preferAssetImage className="w-full h-full object-contain filter invert" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#5C1D24]">
                  THE SOVEREIGN PLEDGE
                </span>
                <h4 className="font-gambetta text-xl sm:text-2xl font-bold text-[#3A2B27]">
                  Kshestra Foundation Oath
                </h4>
              </div>
            </div>

            <div className="px-4 py-1.5 bg-[#5C1D24] text-[#FFF5E9] font-mono text-xs font-bold uppercase tracking-widest rounded-xs self-start md:self-auto">
              MANTRA: CREATE · SHARE · REBEL · UPLIFT · REPEAT
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {KSHESTRA_MANIFESTO.ourPromise.map((promise, pIdx) => (
              <div key={pIdx} className="flex items-start gap-3 bg-[#FFFFFF] p-4 rounded-xs border border-[#3A2B27]/15 hover:border-[#5C1D24]/40 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-[#5C1D24] shrink-0 mt-0.5" />
                <span className="font-sans text-xs sm:text-sm text-[#3A2B27] font-medium leading-snug">
                  {promise}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
