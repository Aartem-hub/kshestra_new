import React, { useEffect } from 'react';
import { TeamMember } from '../types';
import { 
  X, 
  Shield, 
  Award, 
  Globe, 
  Instagram, 
  Linkedin, 
  ExternalLink, 
  BookOpen, 
  Sparkles,
  Quote,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';

interface GuardianDetailModalProps {
  guardian: TeamMember | null;
  index: number;
  onClose: () => void;
  portraitSrc: string;
}

export const GuardianDetailModal: React.FC<GuardianDetailModalProps> = ({
  guardian,
  index,
  onClose,
  portraitSrc
}) => {
  // ESC key listener to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (guardian) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [guardian, onClose]);

  if (!guardian) return null;

  const paddedIndex = String(index + 1).padStart(2, '0');
  const roleTitle = guardian.title || guardian.role;
  const quoteText = guardian.quote;
  const bioNarrative = guardian.bio || guardian.fullBio;
  const honorsList = guardian.achievements || guardian.awards || guardian.exhibitions || [];
  const socialLinks = guardian.socialLinks || {};

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#3A2B27]/80 backdrop-blur-xs"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guardian-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#FFF5E9] border-2 border-[#8A8E3E]/40 rounded-xs shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top Decorative Gold/Terracotta Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#471319] via-[#8A8E3E] to-[#471319]" />

          {/* Modal Header Bar with Close Button */}
          <div className="px-5 sm:px-7 pt-5 pb-3 flex items-center justify-between border-b border-[#3A2B27]/10">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-[#8A8E3E] uppercase font-bold">
              <Shield className="w-3.5 h-3.5 text-[#8A8E3E]" />
              <span>Pillar {paddedIndex} · Kshestra Cultural Trust</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Profile Modal"
              className="p-1.5 rounded-xs text-[#3A2B27] hover:bg-[#471319] hover:text-[#FFF5E9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-7 space-y-6 overflow-y-auto">
            
            {/* Guardian Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 pb-5 border-b border-[#3A2B27]/10">
              {/* Portrait Thumbnail / Plaque */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xs border-2 border-[#8A8E3E] overflow-hidden bg-[#3A2B27] shrink-0 shadow-md">
                <img
                  src={portraitSrc}
                  alt={guardian.name}
                  className="w-full h-full object-cover object-[center_top] grayscale-0 contrast-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1 left-1 bg-[#471319] text-[#FFF5E9] px-1 py-0.5 rounded-2xs text-[9px] font-mono font-bold">
                  {paddedIndex}
                </div>
              </div>

              {/* Names & Designations */}
              <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#8A8E3E]/20 border border-[#8A8E3E]/40 text-[#471319] font-mono text-[10px] uppercase font-bold tracking-wider rounded-2xs">
                    Trustee & Guardian
                  </span>
                  {guardian.medium && (
                    <span className="hidden sm:inline-block text-[10px] font-mono text-[#725C54] truncate">
                      · {guardian.medium.split(',')[0]}
                    </span>
                  )}
                </div>

                <h3 
                  id="guardian-modal-title"
                  className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27] tracking-tight"
                >
                  {guardian.name}
                </h3>

                <p className="font-mono text-xs sm:text-sm text-[#8A8E3E] font-semibold tracking-wide">
                  {roleTitle}
                </p>
              </div>
            </div>

            {/* Inscribed Philosophy Quote */}
            {quoteText && (
              <div className="p-4 bg-[#FFFFFF] border-l-3 border-[#471319] border-y border-r border-[#3A2B27]/10 rounded-xs space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#471319] font-bold">
                  <Quote className="w-3 h-3 text-[#471319]" />
                  <span>Sanctuary Philosophy</span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-[#3A2B27] leading-relaxed">
                  "{quoteText}"
                </p>
              </div>
            )}

            {/* Section 1: Sanctuary Bio / Vision */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#471319]">
                <BookOpen className="w-3.5 h-3.5 text-[#8A8E3E]" />
                <span>Sanctuary Bio & Vision</span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#3A2B27]/90 leading-relaxed bg-[#FFFFFF]/60 p-4 rounded-xs border border-[#3A2B27]/10">
                {bioNarrative}
              </p>
              {guardian.fullBio && guardian.fullBio !== guardian.bio && (
                <p className="font-sans text-xs text-[#725C54] italic leading-relaxed px-1">
                  {guardian.fullBio}
                </p>
              )}
            </div>

            {/* Section 2: Honors & Past Records */}
            {honorsList.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#471319]">
                  <Award className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>Honors & Past Records</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {honorsList.map((honor, hIdx) => (
                    <div 
                      key={hIdx}
                      className="flex items-start gap-3 p-3 bg-[#FFFFFF] border border-[#3A2B27]/10 rounded-xs shadow-2xs text-xs font-sans text-[#3A2B27]"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-2xs bg-[#8A8E3E]/20 text-[#471319] font-mono text-[10px] font-bold flex items-center justify-center mt-0.5">
                        0{hIdx + 1}
                      </span>
                      <span className="leading-snug">{honor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Connect & Archival Profiles */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#471319]">
                <Layers className="w-3.5 h-3.5 text-[#8A8E3E]" />
                <span>Connect & Archival Profiles</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#471319] text-[#3A2B27] hover:text-[#FFF5E9] border border-[#3A2B27]/15 rounded-xs font-mono text-xs font-semibold transition-all shadow-2xs group"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#8A8E3E] group-hover:text-[#FFF5E9]" />
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {(socialLinks.x || socialLinks.twitter) && (
                  <a
                    href={socialLinks.x || socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#471319] text-[#3A2B27] hover:text-[#FFF5E9] border border-[#3A2B27]/15 rounded-xs font-mono text-xs font-semibold transition-all shadow-2xs group"
                  >
                    <span className="font-serif font-bold text-xs">𝕏</span>
                    <span>X / Dispatch</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#471319] text-[#3A2B27] hover:text-[#FFF5E9] border border-[#3A2B27]/15 rounded-xs font-mono text-xs font-semibold transition-all shadow-2xs group"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#8A8E3E] group-hover:text-[#FFF5E9]" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {socialLinks.website && (
                  <a
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#471319] text-[#3A2B27] hover:text-[#FFF5E9] border border-[#3A2B27]/15 rounded-xs font-mono text-xs font-semibold transition-all shadow-2xs group"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#8A8E3E] group-hover:text-[#FFF5E9]" />
                    <span>Personal Website</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                )}

                {socialLinks.archive && (
                  <a
                    href={socialLinks.archive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#471319] text-[#3A2B27] hover:text-[#FFF5E9] border border-[#3A2B27]/15 rounded-xs font-mono text-xs font-semibold transition-all shadow-2xs group"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#8A8E3E] group-hover:text-[#FFF5E9]" />
                    <span>Sanctuary Archive</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Modal Footer Docket */}
          <div className="px-5 sm:px-7 py-3 bg-[#F6EADB] border-t border-[#3A2B27]/15 flex items-center justify-between text-[11px] font-mono text-[#725C54]">
            <div className="flex items-center gap-2">
              <KshestraLogo preferAssetImage className="w-4 h-4" />
              <span>Sanctum Governing Body</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#471319] text-[#FFF5E9] font-mono text-[10px] uppercase font-bold tracking-wider rounded-xs hover:bg-[#3A2B27] transition-colors"
            >
              Dismiss Profile
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
