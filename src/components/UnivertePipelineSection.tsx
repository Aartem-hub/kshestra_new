import React, { useState } from 'react';
import { audioSynth } from '../services/audioSynthesizer';
import { Compass, ArrowUpRight, Sparkles, Building2, Briefcase, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';

export const UnivertePipelineSection: React.FC = () => {
  const [showUniverteModal, setShowUniverteModal] = useState(false);

  return (
    <section id="univerte-pipeline-section" className="py-20 md:py-28 px-4 sm:px-8 border-b border-[#3A2B27]/15 bg-[#F6F0E6]">
      <div className="max-w-7xl mx-auto">
        
        <div className="border-2 border-[#3A2B27] bg-[#FFF5E9] p-8 sm:p-12 lg:p-16 rounded-xs shadow-md space-y-8 lg:flex lg:items-center lg:justify-between lg:gap-16">
          
          {/* Left / Content */}
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#5C1D24]">
              <Compass className="w-3.5 h-3.5 text-[#8A8E3E]" />
              <span>THE CAREER BRIDGE</span>
            </div>

            <h2 className="font-gambetta text-3xl sm:text-5xl font-bold tracking-tight text-[#3A2B27] leading-[1.05]">
              Sustaining the Artist: <br className="hidden sm:inline" />
              <span className="text-[#5C1D24] italic">The Univerte Pipeline</span>
            </h2>

            <p className="text-sm sm:text-base text-[#725C54] leading-relaxed font-sans">
              Kshestra is your cultural sanctuary. Here, you hone your craft, connect with your crew, and find your voice without commercial pressure. But when your portfolio is undeniable, our partner network—<strong className="text-[#3A2B27]">Univerte</strong>—bridges you directly to paying agencies, production studios, art collectors, and brand sponsorships.
            </p>

            {/* Callout quote plate */}
            <div className="border-l-3 border-[#5C1D24] pl-4 py-1 text-base sm:text-lg font-gambetta font-bold italic text-[#3A2B27]">
              "We protect and train you here. Univerte gets you hired there."
            </div>
          </div>

          {/* Right / CTA Button */}
          <div className="shrink-0 pt-4 lg:pt-0">
            <button
              onClick={() => {
                audioSynth.playChime();
                setShowUniverteModal(true);
              }}
              data-cursor="pointer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] rounded-xs bg-[#3A2B27] hover:bg-[#5C1D24] text-[#FFF5E9] border border-[#3A2B27] shadow-md transition-all whitespace-nowrap"
            >
              <span>Discover the Univerte Network</span>
              <ArrowUpRight className="w-4 h-4 text-[#8A8E3E]" />
            </button>
          </div>

        </div>

      </div>

      {/* Univerte Network Modal Detail */}
      <AnimatePresence>
        {showUniverteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3A2B27]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF5E9] rounded-xs max-w-xl w-full p-6 sm:p-8 border-2 border-[#3A2B27] shadow-2xl relative space-y-6 text-[#3A2B27]"
            >
              <button
                onClick={() => setShowUniverteModal(false)}
                data-cursor="pointer"
                className="absolute top-4 right-4 p-2 text-[#3A2B27] hover:bg-[#5C1D24] hover:text-[#FFF5E9] rounded-xs transition-colors border border-[#3A2B27]/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 border-b border-[#3A2B27]/15 pb-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C1D24]">
                  Commercial Bridge & Industry Alliance
                </div>
                <h3 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27]">
                  The Univerte Commercial Network
                </h3>
                <p className="text-xs sm:text-sm text-[#725C54] leading-relaxed">
                  Univerte acts as the external commercial conduit for graduating fellows from Kshestra Foundation.
                </p>
              </div>

              <div className="space-y-3 bg-[#F6EADB] p-4 rounded-xs border border-[#3A2B27]/10 text-xs text-[#3A2B27] font-sans">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A8E3E] shrink-0 mt-0.5" />
                  <span>Direct scouting access for top advertising agencies and production houses.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A8E3E] shrink-0 mt-0.5" />
                  <span>Standardized fair-compensation contracts with zero exploitative clauses.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A8E3E] shrink-0 mt-0.5" />
                  <span>Curated art collector showcases and regional exhibitions in Kolkata.</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowUniverteModal(false)}
                  data-cursor="pointer"
                  className="px-5 py-2.5 text-xs font-bold uppercase rounded-xs bg-[#5C1D24] text-[#FFF5E9]"
                >
                  Understood & Return to Sanctuary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

