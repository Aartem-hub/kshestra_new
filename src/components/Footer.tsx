import React, { useState } from 'react';
import { audioSynth } from '../services/audioSynthesizer';
import { Flame, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  onOpenDonate: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollToSection,
  onOpenDonate
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleNav = (sectionId: string) => {
    audioSynth.playChime();
    onScrollToSection(sectionId);
  };

  return (
    <footer className="bg-[#471319] text-[#FFF5E9] border-t-2 border-[#3A2B27]/40 pt-16 pb-28 md:pb-24 px-4 sm:px-8 font-sans relative">
      
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Kshestra Stallion Monogram */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xs bg-[#FFF5E9] border border-[#FFF5E9]/20 flex items-center justify-center p-1 shadow-xs">
                <KshestraLogo preferAssetImage className="w-full h-full object-contain" />
              </div>
              <span className="font-gambetta text-2xl font-bold tracking-tight text-[#FFF5E9]">
                Kshestra
              </span>
            </div>

            <p className="text-xs text-[#FFF5E9]/80 leading-relaxed font-sans">
              The Soul Has a Territory. A non-profit cultural trust dedicated to providing physical studios, production gear, and zero-cost training for independent artists in Kolkata.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  audioSynth.playChime();
                  onOpenDonate();
                }}
                data-cursor="pointer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs bg-[#FFF5E9] hover:bg-[#FFF5E9]/90 text-[#471319] border border-[#FFF5E9]/30 transition-all shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 text-[#471319]" />
                <span>Support the Flame (Donate)</span>
              </button>
            </div>
          </div>

          {/* Column 1: The Sanctuary */}
          <div className="space-y-3">
            <h4 className="text-xs font-google-sans font-bold uppercase tracking-wider text-[#D18955]">
              The Sanctuary
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FFF5E9]/75 font-mono">
              <li>
                <button
                  onClick={() => handleNav('gallery-section')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  The Living Archive (Gallery)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('events-section')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  Confluences & Passes
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('events-section')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  Workshops & Labs
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('directory')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  Artist Directory & Intake
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: The Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-google-sans font-bold uppercase tracking-wider text-[#D18955]">
              The Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FFF5E9]/75 font-mono">
              <li>
                <button
                  onClick={() => handleNav('manifesto-section')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  The Manifesto & 10 Commandments
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('trustees-section')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  Guardians & Trustees
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('gazette-section')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  Dispatches & Gazette
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('transparency')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  Financial Audits & 80G
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Inquiries (Univerte removed) */}
          <div className="space-y-3">
            <h4 className="text-xs font-google-sans font-bold uppercase tracking-wider text-[#D18955]">
              Legal & Inquiries
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FFF5E9]/75 font-mono">
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  Terms of Cultural Residency
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-[#FFF5E9] hover:underline transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li className="pt-2 text-xs text-[#FFF5E9]/75 font-mono">
                Official Inquiries: <br />
                <a href="mailto:contact@kshestra.org" className="text-[#D18955] hover:underline hover:text-[#FFF5E9] transition-colors font-medium">
                  contact@kshestra.org
                </a>
              </li>
              <li className="text-[11px] text-[#FFF5E9]/60 font-mono leading-relaxed pt-1">
                Sanctuary Address: <br />
                <span className="text-[#FFF5E9]/85">91/11/1, Tollygunge, Kolkata, West Bengal 700033</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 border-t border-[#FFF5E9]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFF5E9]/65 gap-4 font-mono">
          <div>
            © 2026 Kshestra Foundation. A non-profit cultural trust for independent creation. Built by artists, for artists.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#D18955] font-semibold">KOLKATA SANCTUM · 91/11/1, TOLLYGUNGE, KOLKATA 700033</span>
          </div>
        </div>

      </div>

      {/* Info Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A2B27]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF5E9] text-[#3A2B27] rounded-xs max-w-xl w-full p-6 sm:p-8 border-2 border-[#3A2B27] shadow-2xl relative"
            >
              <button
                onClick={() => setActiveModal(null)}
                data-cursor="pointer"
                className="absolute top-4 right-4 p-1 rounded-xs hover:bg-[#3A2B27]/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#3A2B27]" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#471319] font-bold">
                  <KshestraLogo preferAssetImage className="w-4 h-4" />
                  <span>Trust Document</span>
                </div>

                <h3 className="font-gambetta text-2xl font-bold text-[#3A2B27]">
                  {activeModal === 'transparency' && 'Financial Transparency & 80G Audits'}
                  {activeModal === 'directory' && 'Artist Intake & Open Sanctuary'}
                  {activeModal === 'terms' && 'Terms of Cultural Residency'}
                  {activeModal === 'privacy' && 'Privacy Policy'}
                </h3>

                <div className="text-xs sm:text-sm text-[#725C54] leading-relaxed space-y-2 max-h-80 overflow-y-auto pr-2">
                  {activeModal === 'transparency' && (
                    <p>
                      100% of all public contributions and ticket proceeds go directly toward artist equipment grants, studio leases in Kolkata, and zero-cost training bootcamps. Audited quarterly under Indian Trust regulations with full 80G tax benefits.
                    </p>
                  )}
                  {activeModal === 'directory' && (
                    <p>
                      Any independent creator across India can apply for access to our physical spaces, camera kits, sound recording equipment, and residency grants. Applications are reviewed on rolling cycles by our Trustee Council.
                    </p>
                  )}
                  {(activeModal === 'terms' || activeModal === 'privacy') && (
                    <p>
                      All resident creators retain full copyright, publishing royalties, and exhibition sovereignty. Kshestra acts purely as an enabler and sanctuary.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2.5 bg-[#3A2B27] text-[#FFF5E9] font-mono text-xs uppercase font-bold rounded-xs mt-4 hover:bg-[#471319] transition-colors"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </footer>
  );
};
