import React, { useState, useEffect } from 'react';
import { GazetteArticle } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { BookOpen, Clock, User, ArrowRight, X, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';

export const GazetteSection: React.FC = () => {
  const [dispatches, setDispatches] = useState<GazetteArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<GazetteArticle | null>(null);

  useEffect(() => {
    setDispatches(StorageService.getDispatches());
  }, []);

  const leadArticle = dispatches[0];
  const sideArticles = dispatches.slice(1);

  return (
    <section id="gazette-section" className="py-20 md:py-28 px-4 sm:px-8 border-b border-[#3A2B27]/15 bg-[#FFF5E9]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header: Journal Masthead */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#3A2B27] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#5C1D24] font-bold">
              <Feather className="w-3.5 h-3.5 text-[#8A8E3E]" />
              <span>VOICES FROM THE FIELD</span>
            </div>
            <h2 className="font-gambetta text-4xl sm:text-6xl font-bold tracking-tight text-[#3A2B27]">
              Dispatches from the Sanctuary
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#725C54] leading-relaxed">
              Essays, field journals, behind-the-scenes production diaries, and technical insights written directly by our resident creators.
            </p>
          </div>
        </div>

        {/* Broadsheet Journal Grid (1 Lead Feature + Stacked Chronicle Stream) */}
        {leadArticle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Lead Editorial Feature (Left 7 Cols) */}
            <div 
              onClick={() => {
                audioSynth.playChime();
                setSelectedArticle(leadArticle);
              }}
              className="lg:col-span-7 bg-[#FFFFFF] border-2 border-[#3A2B27] hover:border-[#8A8E3E] p-6 sm:p-10 rounded-xs space-y-6 cursor-pointer hover:shadow-md transition-all group relative"
            >
              <div className="flex items-center justify-between text-xs font-mono border-b border-[#3A2B27]/15 pb-3">
                <span className="font-bold uppercase tracking-wider text-[#8A8E3E]">{leadArticle.category}</span>
                <span className="text-[#725C54]">{leadArticle.issueNumber} · {leadArticle.readTime}</span>
              </div>

              <h3 className="font-gambetta text-2xl sm:text-4xl font-bold text-[#3A2B27] group-hover:text-[#5C1D24] transition-colors leading-tight">
                {leadArticle.title}
              </h3>

              <div className="flex items-center gap-2 text-xs font-mono text-[#725C54]">
                <span className="text-[#3A2B27] font-bold">{leadArticle.author}</span>
                <span>— {leadArticle.authorRole}</span>
              </div>

              <p className="drop-cap font-sans text-sm sm:text-base text-[#3A2B27]/85 leading-relaxed">
                {leadArticle.excerpt}
              </p>

              <div className="pt-4 border-t border-[#3A2B27]/15 flex items-center justify-between text-xs font-mono">
                <span className="text-[#8A8E3E] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                  Read Full Dispatch <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[#725C54]">ARCHIVAL ESSAY</span>
              </div>
            </div>

            {/* Stacked Chronicle Articles (Right 5 Cols with Hairline Dividers) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#8A8E3E] font-bold pb-1 border-b border-[#3A2B27]/20">
                LATEST ESSAYS & DISPATCHES
              </div>

              <div className="divide-y divide-[#3A2B27]/20 border-b border-[#3A2B27]/20">
                {sideArticles.map((article, idx) => (
                  <div
                    key={article.id}
                    onClick={() => {
                      audioSynth.playChime();
                      setSelectedArticle(article);
                    }}
                    className="py-5 space-y-2 cursor-pointer hover:bg-[#F6EADB]/50 px-3 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#725C54]">
                      <span className="text-[#8A8E3E] font-bold uppercase">{article.category}</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h4 className="font-gambetta text-lg sm:text-xl font-bold text-[#3A2B27] group-hover:text-[#5C1D24] transition-colors leading-snug">
                      {article.title}
                    </h4>

                    <p className="text-xs text-[#725C54] font-sans line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>

                    <div className="text-[11px] font-mono text-[#725C54] pt-1">
                      By {article.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Full Essay Modal Reader */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3A2B27]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF5E9] rounded-xs max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#3A2B27] shadow-2xl p-6 sm:p-10 relative text-[#3A2B27]"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                data-cursor="pointer"
                className="absolute top-4 right-4 p-2 text-[#3A2B27] hover:bg-[#5C1D24] hover:text-[#FFF5E9] rounded-xs transition-colors border border-[#3A2B27]/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="space-y-3 border-b-2 border-[#3A2B27] pb-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#5C1D24]">
                    {selectedArticle.category} · {selectedArticle.issueNumber}
                  </div>
                  <h2 className="font-gambetta text-3xl sm:text-4xl font-bold text-[#3A2B27] leading-tight">
                    {selectedArticle.title}
                  </h2>
                  <div className="text-xs text-[#725C54] font-mono">
                    {selectedArticle.readTime} · Written by {selectedArticle.author} ({selectedArticle.authorRole})
                  </div>
                </div>

                <div className="space-y-4 text-base text-[#3A2B27] leading-relaxed font-sans">
                  {selectedArticle.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className={pIdx === 0 ? 'drop-cap' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#3A2B27]/15 flex items-center justify-between text-xs text-[#725C54] font-mono">
                  <span>Kshestra Sovereign Dispatches · 2026</span>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    data-cursor="pointer"
                    className="px-4 py-2 text-xs font-bold uppercase rounded-xs bg-[#3A2B27] text-[#FFF5E9]"
                  >
                    Close Essay
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

