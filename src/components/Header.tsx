import React, { useState, useEffect, useRef } from 'react';
import { UserMember } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { 
  Flame, 
  User, 
  ShieldCheck, 
  Menu, 
  X, 
  Volume2, 
  VolumeX,
  ChevronDown,
  BookOpen,
  Users,
  Image as ImageIcon,
  Calendar,
  Feather,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { KshestraLogo } from './KshestraLogo';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onOpenDonate: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenDashboard,
  onOpenAdmin,
  onOpenDonate,
  onScrollToSection
}) => {
  const [currentUser, setCurrentUser] = useState<UserMember | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  // Smart scroll state
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const discoverRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(StorageService.getCurrentUser());
    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail);
    };
    const handleAudioState = (e: any) => {
      if (e.detail) {
        setIsPlayingAudio(e.detail.isPlaying);
      }
    };
    window.addEventListener('kshestra_auth_changed', handleAuthChange);
    window.addEventListener('kshestra_audio_state', handleAudioState);
    return () => {
      window.removeEventListener('kshestra_auth_changed', handleAuthChange);
      window.removeEventListener('kshestra_audio_state', handleAudioState);
    };
  }, []);

  // Smart Hide on Scroll Down / Show on Scroll Up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 30) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        // Scrolling down
        setIsVisible(false);
        setDiscoverOpen(false);
        setCommunityOpen(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setDiscoverOpen(false);
      }
      if (communityRef.current && !communityRef.current.contains(e.target as Node)) {
        setCommunityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavTo = (sectionId: string) => {
    audioSynth.playChime();
    setMobileMenuOpen(false);
    setDiscoverOpen(false);
    setCommunityOpen(false);
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(el, { offset: -60, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const toggleSound = () => {
    audioSynth.toggle();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-[#FFF5E9]/95 backdrop-blur-md border-b border-[#3A2B27]/15 shadow-xs transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      
      {/* 1. Cultural Trust Announcement Strip */}
      <div className="border-b border-[#3A2B27]/10 py-1.5 px-4 sm:px-8 text-[11px] font-sans flex flex-wrap items-center justify-between gap-2 text-[#725C54] bg-[#F6EADB]/70">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-wider text-[#5C1D24] uppercase text-[10px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A8E3E] animate-pulse"></span>
            <span>EST. 2026 · A NON-PROFIT CULTURAL TRUST</span>
          </span>
          <span className="text-[#8A8E3E] hidden sm:inline">✦</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#8A8E3E]/15 text-[#3A2B27] font-mono text-[10px] font-bold border border-[#8A8E3E]/30">
            KOLKATA SANCTUM
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Background Music Player Toggle */}
          <button
            onClick={toggleSound}
            data-cursor="pointer"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-xs bg-[#FFF5E9] hover:bg-[#5C1D24]/10 text-[#3A2B27] border border-[#3A2B27]/20 transition-colors"
            title="Toggle background music: Main Baaki Hoon"
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3 h-3 text-[#5C1D24] animate-pulse" />
                <span className="font-mono">Music: Playing</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3 text-[#725C54]" />
                <span className="font-mono">Play Music</span>
              </>
            )}
          </button>

          {/* Admin Switcher for Trustees */}
          <button
            onClick={onOpenAdmin}
            data-cursor="pointer"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-xs text-[#725C54] hover:text-[#5C1D24] transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-[#8A8E3E]" />
            <span className="font-mono">Trustee Desk</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Brand / Wordmark: Kshestra */}
        <button
          onClick={() => {
            audioSynth.playChime();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-left group flex items-center gap-3.5"
          data-cursor="pointer"
        >
          <div className="w-10 h-10 rounded-xs bg-[#FFF5E9] border border-[#3A2B27]/20 flex items-center justify-center p-1 shadow-xs group-hover:border-[#5C1D24] transition-all">
            <KshestraLogo preferAssetImage className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-gambetta text-xl sm:text-2xl font-bold tracking-tight text-[#3A2B27] group-hover:text-[#5C1D24] transition-colors">
                Kshestra
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-[#725C54] tracking-wide">
              The Soul Has a Territory
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links & Dropdowns */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          
          {/* Dropdown 1: Discover Kshestra */}
          <div className="relative" ref={discoverRef}>
            <button
              onClick={() => {
                setDiscoverOpen(!discoverOpen);
                setCommunityOpen(false);
              }}
              className="flex items-center gap-1 py-1 text-[#3A2B27] hover:text-[#5C1D24] transition-colors tracking-wide font-sans text-sm"
            >
              <span>Discover Kshestra</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#725C54] transition-transform ${discoverOpen ? 'rotate-180' : ''}`} />
            </button>

            {discoverOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#FFF5E9] border border-[#3A2B27]/20 shadow-lg rounded-xs p-2 space-y-1 z-50">
                <button
                  onClick={() => handleNavTo('manifesto-section')}
                  className="w-full text-left px-3 py-2 text-xs font-mono rounded-xs hover:bg-[#F6EADB] text-[#3A2B27] flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#5C1D24]" />
                  <span>The Manifesto & 10 Commandments</span>
                </button>
                <button
                  onClick={() => handleNavTo('trustees-section')}
                  className="w-full text-left px-3 py-2 text-xs font-mono rounded-xs hover:bg-[#F6EADB] text-[#3A2B27] flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>Guardians & Trustees</span>
                </button>
                <button
                  onClick={() => handleNavTo('gallery-section')}
                  className="w-full text-left px-3 py-2 text-xs font-mono rounded-xs hover:bg-[#F6EADB] text-[#3A2B27] flex items-center gap-2"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>The Living Archive (Past Works)</span>
                </button>
              </div>
            )}
          </div>

          {/* Dropdown 2: The Community */}
          <div className="relative" ref={communityRef}>
            <button
              onClick={() => {
                setCommunityOpen(!communityOpen);
                setDiscoverOpen(false);
              }}
              className="flex items-center gap-1 py-1 text-[#3A2B27] hover:text-[#5C1D24] transition-colors tracking-wide font-sans text-sm"
            >
              <span>The Community</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#725C54] transition-transform ${communityOpen ? 'rotate-180' : ''}`} />
            </button>

            {communityOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#FFF5E9] border border-[#3A2B27]/20 shadow-lg rounded-xs p-2 space-y-1 z-50">
                <button
                  onClick={() => handleNavTo('events-section')}
                  className="w-full text-left px-3 py-2 text-xs font-mono rounded-xs hover:bg-[#F6EADB] text-[#3A2B27] flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#5C1D24]" />
                  <span>Gatherings & Masterclasses (Tickets)</span>
                </button>
                <button
                  onClick={() => handleNavTo('gazette-section')}
                  className="w-full text-left px-3 py-2 text-xs font-mono rounded-xs hover:bg-[#F6EADB] text-[#3A2B27] flex items-center gap-2"
                >
                  <Feather className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>Dispatches & Perspectives (Essays)</span>
                </button>
                <button
                  onClick={() => handleNavTo('newsletter-section')}
                  className="w-full text-left px-3 py-2 text-xs font-mono rounded-xs hover:bg-[#F6EADB] text-[#3A2B27] flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>Open Calls & Creative Residencies</span>
                </button>
              </div>
            )}
          </div>

        </nav>

        {/* Navigation Actions: Support the Flame & Enter the Sanctuary */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Action 1: Support the Flame (Donate / Patronage) */}
          <button
            onClick={() => {
              audioSynth.playChime();
              onOpenDonate();
            }}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs bg-[#5C1D24] hover:bg-[#431319] text-[#FFF5E9] border border-[#3A2B27]/30 shadow-xs transition-all duration-200 hover:-translate-y-0.5"
          >
            <Flame className="w-3.5 h-3.5 text-[#8A8E3E]" />
            <span>Support the Flame (Donate)</span>
          </button>

          {/* Action 2: Enter the Sanctuary (Artist Portal / Join Free) */}
          <button
            onClick={() => {
              audioSynth.playChime();
              if (currentUser) {
                onOpenDashboard();
              } else {
                onOpenAuth();
              }
            }}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-wide rounded-xs bg-[#F6EADB] hover:bg-[#EBE2D4] text-[#3A2B27] border border-[#3A2B27]/20 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-[#8A8E3E]" />
            <span>{currentUser ? currentUser.name.split(' ')[0] : 'Enter the Sanctuary'}</span>
          </button>

        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => {
              audioSynth.playChime();
              onOpenDonate();
            }}
            className="px-3 py-1.5 text-[11px] font-bold uppercase rounded-xs bg-[#5C1D24] text-[#FFF5E9] sm:hidden"
          >
            Donate
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-cursor="pointer"
            className="p-2 rounded-xs border border-[#3A2B27]/20 text-[#3A2B27] hover:bg-[#FFF5E9]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFF5E9] border-b border-[#3A2B27]/20 px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase text-[#5C1D24] font-bold">Discover Kshestra</div>
            <div className="grid grid-cols-1 gap-1 pl-2">
              <button
                onClick={() => handleNavTo('manifesto-section')}
                className="text-left py-1.5 text-xs font-mono text-[#3A2B27] hover:text-[#5C1D24]"
              >
                ✦ The Manifesto & 10 Commandments
              </button>
              <button
                onClick={() => handleNavTo('trustees-section')}
                className="text-left py-1.5 text-xs font-mono text-[#3A2B27] hover:text-[#5C1D24]"
              >
                ✦ Guardians & Trustees
              </button>
              <button
                onClick={() => handleNavTo('gallery-section')}
                className="text-left py-1.5 text-xs font-mono text-[#3A2B27] hover:text-[#5C1D24]"
              >
                ✦ The Living Archive (Past Works)
              </button>
            </div>

            <div className="text-[10px] font-mono uppercase text-[#5C1D24] font-bold pt-2">The Community</div>
            <div className="grid grid-cols-1 gap-1 pl-2">
              <button
                onClick={() => handleNavTo('events-section')}
                className="text-left py-1.5 text-xs font-mono text-[#3A2B27] hover:text-[#5C1D24]"
              >
                ✦ Gatherings & Masterclasses (Tickets)
              </button>
              <button
                onClick={() => handleNavTo('gazette-section')}
                className="text-left py-1.5 text-xs font-mono text-[#3A2B27] hover:text-[#5C1D24]"
              >
                ✦ Dispatches & Perspectives (Essays)
              </button>
              <button
                onClick={() => handleNavTo('newsletter-section')}
                className="text-left py-1.5 text-xs font-mono text-[#3A2B27] hover:text-[#5C1D24]"
              >
                ✦ Open Calls & Creative Residencies
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#3A2B27]/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDonate();
              }}
              className="w-full py-2.5 text-center text-xs font-bold uppercase rounded-xs bg-[#5C1D24] text-[#FFF5E9] flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 text-[#8A8E3E]" />
              <span>Support the Flame (Donate)</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentUser) onOpenDashboard();
                else onOpenAuth();
              }}
              className="w-full py-2.5 text-center text-xs font-semibold rounded-xs bg-[#F6EADB] text-[#3A2B27] border border-[#3A2B27]/20"
            >
              {currentUser ? `Resident Vault (${currentUser.name})` : 'Enter the Sanctuary'}
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
