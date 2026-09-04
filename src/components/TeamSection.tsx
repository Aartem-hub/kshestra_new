import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { StorageService } from '../services/storage';
import { Shield, Award, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';
import { GuardianDetailModal } from './GuardianDetailModal';
import { audioSynth } from '../services/audioSynthesizer';

const getMemberImageCandidates = (member: TeamMember): string[] => {
  const nameLower = member.name.toLowerCase();
  if (nameLower.includes('tamohan')) {
    return ['/assets/Images/tamohan.png', '/assets/Images/Tamohan.png', '/assets/Images/tamohan.jpg'];
  }
  if (nameLower.includes('oindrila')) {
    return ['/assets/Images/oindrila.png', '/assets/Images/Oindrila.png', '/assets/Images/oindrila.jpg'];
  }
  if (nameLower.includes('nayanika')) {
    return ['/assets/Images/nayanika.png', '/assets/Images/Nayanika.png', '/assets/Images/nayanika.jpg'];
  }
  if (nameLower.includes('shubhadeep')) {
    return [
      '/assets/Images/shubhadeep.png',
      '/assets/Images/Shubhadeep.png',
      '/assets/Images/shubhadeep.jpg',
      '/assets/Images/Shubhadeep.jpg',
    ];
  }
  if (nameLower.includes('vireshwar') || nameLower.includes('vira')) {
    return [
      '/assets/Images/vira.png',
      '/assets/Images/Vira.png',
      '/assets/Images/vireshwar.png',
      '/assets/Images/Vireshwar.png',
      '/assets/Images/vireshwar.jpg',
      '/assets/Images/Vireshwar.jpg'
    ];
  }
  if (nameLower.includes('aryan')) {
    return ['/assets/Images/Aryan.png', '/assets/Images/aryan.png', '/assets/Images/Aryan.jpg'];
  }
  if (nameLower.includes('sayan')) {
    return [
      '/assets/Images/Sayan.png',
      '/assets/Images/sayan.png',
      '/assets/Images/Sayan.jpg',
      '/assets/Images/sayan.jpg'
    ];
  }
  return member.portrait ? [member.portrait] : [];
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const TeamSection: React.FC = () => {
  const [guardians, setGuardians] = useState<TeamMember[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [coloredMemberIds, setColoredMemberIds] = useState<Record<string, boolean>>({});
  const [selectedGuardian, setSelectedGuardian] = useState<{
    member: TeamMember;
    index: number;
    portraitSrc: string;
  } | null>(null);

  useEffect(() => {
    setGuardians(StorageService.getGuardians());
  }, []);

  const toggleMemberColor = (memberId: string) => {
    setColoredMemberIds(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const openGuardianModal = (member: TeamMember, index: number, portraitSrc: string) => {
    audioSynth.playChime();
    setSelectedGuardian({ member, index, portraitSrc });
  };

  const handleImageInteraction = (e: React.MouseEvent, member: TeamMember, index: number, portraitSrc: string) => {
    // On touchscreens / mobile screens, tapping the image directly triggers the color/active visual state
    // and stops propagation to prevent accidental modal popups while scrolling or previewing.
    const isTouchOrMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
    if (isTouchOrMobile) {
      e.stopPropagation();
      toggleMemberColor(member.id);
    } else {
      // Desktop: clicking image opens modal directly
      openGuardianModal(member, index, portraitSrc);
    }
  };

  const handleImageError = (memberId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const member = guardians.find(g => g.id === memberId);
    if (!member) return;

    const candidates = getMemberImageCandidates(member);
    const currentAttempt = parseInt(target.dataset.attempt || '0', 10);
    const nextAttempt = currentAttempt + 1;

    if (nextAttempt < candidates.length) {
      target.dataset.attempt = nextAttempt.toString();
      target.src = candidates[nextAttempt];
    } else {
      // Mark as failed to display bespoke Trustee Monogram Seal
      setFailedImages(prev => ({ ...prev, [memberId]: true }));
    }
  };

  return (
    <section id="trustees-section" className="py-16 md:py-24 px-4 sm:px-8 border-b border-[#3A2B27]/15 bg-[#FFF5E9]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#3A2B27] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8A8E3E] font-bold">
              <Shield className="w-3.5 h-3.5 text-[#8A8E3E]" />
              <span>THE PILLARS OF KSHESTRA</span>
            </div>
            <h2 className="font-gambetta text-3xl sm:text-5xl font-bold tracking-tight text-[#3A2B27]">
              Guardians of the Sanctuary
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#725C54] leading-relaxed">
              The steering committee and working artists stewarding Kshestra's non-profit cultural mission.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#725C54]">
            <span className="px-2.5 py-1 bg-[#8A8E3E] text-[#FFF5E9] font-bold uppercase rounded-xs">
              7 Pillars
            </span>
            <span className="text-[#3A2B27] font-semibold">· Kolkata Sanctum</span>
          </div>
        </div>

        {/* Compact Profile Cards Grid (Image, Name, Position & Quote) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {guardians.map((member, idx) => {
            const candidates = getMemberImageCandidates(member);
            const initialSrc = candidates[0] || '/assets/Kshestra Logo PNG.png';
            const isFailed = failedImages[member.id];
            const isColored = !!coloredMemberIds[member.id];

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onClick={() => openGuardianModal(member, idx, initialSrc)}
                className="bg-[#FFFFFF] border border-[#3A2B27]/15 rounded-xs overflow-hidden flex flex-col justify-between hover:border-[#8A8E3E] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div>
                  {/* 1:1 Square Portrait Photo OR Trustee Archival Plate */}
                  <div 
                    onClick={(e) => handleImageInteraction(e, member, idx, initialSrc)}
                    className="select-none relative aspect-square w-full bg-[#3A2B27] overflow-hidden flex items-center justify-center cursor-pointer"
                    title="Click or Tap to toggle color / view profile"
                  >
                    
                    {!isFailed ? (
                      <img
                        src={initialSrc}
                        alt={member.name}
                        data-attempt="0"
                        onError={(e) => handleImageError(member.id, e)}
                        className={`w-full h-full object-cover object-[center_top] ${isColored ? 'grayscale-0' : 'grayscale'} contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      /* Distinguished Trustee Archival Plaque when image file is awaiting upload */
                      <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-radial from-[#4A3833] to-[#3A2B27] relative select-none">
                        <div className="w-16 h-16 rounded-full border-2 border-[#8A8E3E] flex items-center justify-center bg-[#3A2B27] shadow-inner mb-2 group-hover:scale-105 transition-transform">
                          <span className="font-gambetta text-2xl font-bold text-[#8A8E3E] tracking-wider">
                            {getInitials(member.name)}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8E3E] font-bold">
                          TRUSTEE SEAL
                        </div>
                        <div className="text-[9px] font-mono text-[#FFF5E9]/60 tracking-wider uppercase mt-0.5">
                          Kolkata Pillar 0{idx + 1}
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#3A2B27]/60 via-transparent to-transparent opacity-40 pointer-events-none" />
                    
                    {/* Index Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-[#8A8E3E] text-[#FFF5E9] px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-bold shadow-xs">
                      0{idx + 1}
                    </div>

                    {/* Sanctum Crest Seal */}
                    <div className="absolute top-2.5 right-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <KshestraLogo preferAssetImage className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Lower Content Area: Name, Role, Quote & Explicit Chronicle Trigger */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      openGuardianModal(member, idx, initialSrc);
                    }}
                    className="p-4 pb-2 space-y-2 cursor-pointer select-none"
                  >
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8E3E] font-bold line-clamp-1">
                        {member.role}
                      </div>
                      <h3 className="font-gambetta text-lg sm:text-xl font-bold text-[#3A2B27] group-hover:text-[#471319] transition-colors leading-snug">
                        {member.name}
                      </h3>
                    </div>

                    {/* Quote */}
                    {member.quote && (
                      <div className="p-2.5 bg-[#FFF5E9] border-l-2 border-l-[#8A8E3E] border-t border-t-[#3A2B27]/10 text-[11px] font-serif italic text-[#3A2B27]/85 leading-snug rounded-xs">
                        "{member.quote}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Explicit Tasteful Trigger for Mobile and Scannable Desktop Access */}
                <div className="p-4 pt-1 pb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGuardianModal(member, idx, initialSrc);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-[#FFF5E9] hover:bg-[#471319] text-[#471319] hover:text-[#FFF5E9] border border-[#8A8E3E]/30 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-200 group/btn shadow-2xs"
                  >
                    <span>View Chronicle / Bio</span>
                    <span className="text-[#8A8E3E] group-hover/btn:text-[#FFF5E9] group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footnote Docket */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#725C54] pt-4 border-t border-[#3A2B27]/15">
          <div className="flex items-center gap-2">
            <KshestraLogo preferAssetImage className="w-5 h-5" />
            <span>Non-Profit Cultural Trust Charter · Kolkata Sanctum</span>
          </div>
          <span className="text-[#8A8E3E] font-bold tracking-wider">100% INDEPENDENT GOVERNANCE</span>
        </div>

      </div>

      {/* Guardian Detail Modal */}
      {selectedGuardian && (
        <GuardianDetailModal
          guardian={selectedGuardian.member}
          index={selectedGuardian.index}
          portraitSrc={selectedGuardian.portraitSrc}
          onClose={() => setSelectedGuardian(null)}
        />
      )}
    </section>
  );
};
