/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { ThreeArtCanvas } from './components/ThreeArtCanvas';
import { Header } from './components/Header';
import { BottomThirdEventsTicker } from './components/BottomThirdEventsTicker';
import { HeroSection } from './components/HeroSection';
import { ManifestoSection } from './components/ManifestoSection';
import { EventsSection } from './components/EventsSection';
import { GallerySection } from './components/GallerySection';
import { TeamSection } from './components/TeamSection';
import { GazetteSection } from './components/GazetteSection';
import { NewsletterSection } from './components/NewsletterSection';
import { DonationPortal } from './components/DonationPortal';
import { RazorpayModal } from './components/RazorpayModal';
import { MemberAuthModal } from './components/MemberAuthModal';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { EventItem, Artwork, UserMember } from './types';
import { StorageService } from './services/storage';
import { audioSynth } from './services/audioSynthesizer';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import Lenis from 'lenis';

export default function App() {
  const [currentView, setCurrentView] = useState<'main' | 'member-dashboard' | 'admin'>('main');

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [razorpayModalState, setRazorpayModalState] = useState<{
    isOpen: boolean;
    mode: 'ticket' | 'donation';
    event?: EventItem;
    donationAmount?: number;
    donationTierName?: string;
  }>({
    isOpen: false,
    mode: 'ticket'
  });

  const [currentUser, setCurrentUser] = useState<UserMember | null>(null);

  useEffect(() => {
    // Initialise seed storage
    StorageService.init();
    setCurrentUser(StorageService.getCurrentUser());

    // Initialize buttery-smooth Lenis kinetic momentum scrolling
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail);
      if (!e.detail && currentView === 'member-dashboard') {
        setCurrentView('main');
      }
    };

    window.addEventListener('kshestra_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('kshestra_auth_changed', handleAuthChange);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [currentView]);

  const handleBookEventTicket = (event: EventItem) => {
    audioSynth.playChime();
    setRazorpayModalState({
      isOpen: true,
      mode: 'ticket',
      event
    });
  };

  const handleInitiateDonation = (amount: number, tierId?: string, tierName?: string) => {
    audioSynth.playChime();
    setRazorpayModalState({
      isOpen: true,
      mode: 'donation',
      donationAmount: amount,
      donationTierName: tierName
    });
  };

  const handlePatronizeArtwork = (artwork: Artwork) => {
    audioSynth.playChime();
    setRazorpayModalState({
      isOpen: true,
      mode: 'donation',
      donationAmount: artwork.patronageAmount || 5000,
      donationTierName: `Patronage: "${artwork.title}"`
    });
  };

  const handleOpenAuth = () => {
    audioSynth.playChime();
    setShowAuthModal(true);
  };

  const handleOpenDashboard = () => {
    audioSynth.playChime();
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setCurrentView('member-dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenAdmin = () => {
    audioSynth.playChime();
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: UserMember) => {
    setShowAuthModal(false);
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('member-dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollTo = (sectionId: string) => {
    if (currentView !== 'main') {
      setCurrentView('main');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo(el, { offset: -60, duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
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

  return (
    <div className="min-h-screen w-full bg-[#FFF5E9] text-[#3A2B27] selection:bg-[#5C1D24] selection:text-[#FFF5E9] relative font-sans overflow-x-hidden">
      
      {/* Custom Art Cursor */}
      <CustomCursor />

      {/* Organic Terracotta, Moss & Charcoal Ambient Particle Canvas */}
      <ThreeArtCanvas />

      {/* 1. Header & Top Navigation with Smart Hide on Scroll Down */}
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenDashboard={handleOpenDashboard}
        onOpenAdmin={handleOpenAdmin}
        onOpenDonate={() => handleScrollTo('donate-portal')}
        onScrollToSection={handleScrollTo}
      />

      {/* MAIN VIEW SWITCHER - padded for fixed header */}
      <main className="relative z-10 w-full pt-[74px] sm:pt-[78px]">
        
        {/* Return to Main Home Bar when in Member or Admin Views */}
        {currentView !== 'main' && (
          <div className="bg-[#3A2B27] text-[#FFF5E9] py-2.5 px-4 sm:px-8 border-b border-[#3A2B27]">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <button
                onClick={() => {
                  audioSynth.playChime();
                  setCurrentView('main');
                }}
                data-cursor="pointer"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold hover:text-[#8A8E3E] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sanctuary</span>
              </button>

              <div className="font-mono text-xs text-[#8A8E3E] font-bold uppercase">
                {currentView === 'admin' ? 'Trustee Administration View' : 'Personalized Resident Vault'}
              </div>
            </div>
          </div>
        )}

        {/* View 1: Main Public Kshestra Foundation Platform */}
        {currentView === 'main' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* 2. HERO SECTION */}
            <HeroSection
              onExploreGatherings={() => handleScrollTo('events-section')}
              onExploreArchive={() => handleScrollTo('gallery-section')}
            />

            {/* 3. THE MANIFESTO (THE SACRED GROUND) */}
            <ManifestoSection />

            {/* 4. GATHERINGS AT THE SANCTUARY (EVENTS & TICKETING) */}
            <EventsSection onBuyTicket={handleBookEventTicket} />

            {/* 5. THE LIVING ARCHIVE (GALLERY & PROVENANCE) */}
            <GallerySection onPatronizeArtwork={handlePatronizeArtwork} />

            {/* 6. GUARDIANS OF THE SANCTUARY (THE PILLARS) */}
            <TeamSection />

            {/* 7. DISPATCHES FROM THE SANCTUARY (MAGAZINE & FIELD JOURNALS) */}
            <GazetteSection />

            {/* 8. STAY IN THE CIRCLE (NEWSLETTER & DISPATCH INTAKE) */}
            <NewsletterSection />

            {/* 9. PATRONAGE & GRANTS (PRESERVE THE FIRE / 80G GRANTS) */}
            <DonationPortal onInitiateDonation={handleInitiateDonation} />
          </motion.div>
        )}

        {/* View 2: Personalized Resident Dashboard (Passes & Calendar Sync) */}
        {currentView === 'member-dashboard' && (
          <MemberDashboard
            onExploreEvents={() => setCurrentView('main')}
            onExploreGallery={() => setCurrentView('main')}
            onMakeDonation={() => handleScrollTo('donate-portal')}
          />
        )}

        {/* View 3: Trustee Admin Dashboard */}
        {currentView === 'admin' && (
          <AdminDashboard />
        )}

      </main>

      {/* 11. BOTTOM THIRD EVENTS TICKER STRIPE */}
      {currentView === 'main' && (
        <BottomThirdEventsTicker onSelectEvent={handleBookEventTicket} />
      )}

      {/* 12. FOOTER */}
      <Footer
        onScrollToSection={handleScrollTo}
        onOpenDonate={() => handleScrollTo('donate-portal')}
      />

      {/* MODAL 1: Razorpay Payment Gateway (Tickets & Donations) */}
      <AnimatePresence>
        {razorpayModalState.isOpen && (
          <RazorpayModal
            mode={razorpayModalState.mode}
            event={razorpayModalState.event}
            donationAmount={razorpayModalState.donationAmount}
            donationTierName={razorpayModalState.donationTierName}
            onClose={() => setRazorpayModalState(prev => ({ ...prev, isOpen: false }))}
            onSuccess={() => {
              // Handled inside modal
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL 2: Member Authentication & One-Time Pass Code */}
      <AnimatePresence>
        {showAuthModal && (
          <MemberAuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
