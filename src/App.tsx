/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
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
import { isEmailAdmin } from './services/authRoles';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { IntroScreen } from './components/IntroScreen';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';

/**
 * Route Component for Resident Creator Profile (/profile/:username)
 */
function ProfileRouteView({
  onExploreEvents,
  onExploreGallery,
  onMakeDonation,
  onOpenAuth,
  onScrollToSection
}: {
  onExploreEvents: () => void;
  onExploreGallery: () => void;
  onMakeDonation: () => void;
  onOpenAuth: () => void;
  onScrollToSection: (id: string) => void;
}) {
  const { username } = useParams<{ username: string }>();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col justify-between"
    >
      <div>
        <MemberDashboard
          profileUsername={username}
          onExploreEvents={onExploreEvents}
          onExploreGallery={onExploreGallery}
          onMakeDonation={onMakeDonation}
          onOpenAuth={onOpenAuth}
        />
      </div>
      <Footer
        onScrollToSection={onScrollToSection}
        onOpenDonate={onMakeDonation}
      />
    </motion.div>
  );
}

/**
 * Route Component for Gatherings & Confluences (/events)
 */
function EventsRouteView({
  onBuyTicket,
  onInitiateDonation,
  onScrollToSection
}: {
  onBuyTicket: (event: EventItem) => void;
  onInitiateDonation: (amount: number, tierId?: string, tierName?: string) => void;
  onScrollToSection: (id: string) => void;
}) {
  useEffect(() => {
    // Scroll smoothly to events program upon navigation
    const el = document.getElementById('events-section');
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      <EventsSection onBuyTicket={onBuyTicket} />
      <DonationPortal onInitiateDonation={onInitiateDonation} />
      <Footer
        onScrollToSection={onScrollToSection}
        onOpenDonate={() => onScrollToSection('donate-portal')}
      />
    </motion.div>
  );
}

/**
 * Main Application Component with Universal Layout and Subpaths
 */
export default function App() {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic header height measurement to completely prevent awkward cutoff lines
  const [headerHeight, setHeaderHeight] = useState<number>(120);
  const headerRef = useRef<HTMLElement | null>(null);

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
    // Dynamically calculate header height for seamless padding
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();

    const ro = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      ro.observe(headerRef.current);
    }
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

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
    };
    window.addEventListener('kshestra_auth_changed', handleAuthChange);

    // Sync Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isAdmin = isEmailAdmin(fbUser.email);
        const role: 'admin' | 'member' = isAdmin ? 'admin' : 'member';

        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              uid: fbUser.uid,
              name: fbUser.displayName || 'Resident Creator',
              email: fbUser.email || '',
              role: role,
              residentSince: '2026',
              location: 'Kolkata, WB',
              createdAt: new Date().toISOString(),
              passes: [],
              receipts: []
            });
          }
        } catch (dbErr) {
          console.warn('Firestore user profile sync error:', dbErr);
        }

        const member: UserMember = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Resident Creator',
          email: fbUser.email || '',
          role: role,
          isVerified: true,
          memberSince: '2026',
          city: 'Kolkata, WB',
          ticketPurchases: StorageService.getCurrentUser()?.ticketPurchases || [],
          donations: StorageService.getCurrentUser()?.donations || []
        };
        StorageService.setCurrentUser(member);
        setCurrentUser(member);
      } else {
        const localUser = StorageService.getCurrentUser();
        if (localUser && localUser.id.startsWith('usr-firebase-')) {
          StorageService.logout();
          setCurrentUser(null);
        }
      }
    });

    // Auto-scroll on hash or click
    const handleGlobalButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const exploreBtn = target.closest('[data-action="explore-events"]');
      if (exploreBtn) {
        e.preventDefault();
        handleScrollTo('events-section');
      }
      const donateBtn = target.closest('[data-action="open-donate"]');
      if (donateBtn) {
        e.preventDefault();
        handleScrollTo('donate-portal');
      }
    };

    document.addEventListener('click', handleGlobalButtonClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalButtonClick, true);
      window.removeEventListener('kshestra_auth_changed', handleAuthChange);
      unsubscribeAuth();
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const handleExploreSanctuary = () => {
    audioSynth.play();
    setHasEntered(true);
  };

  const handleBookEventTicket = (event: EventItem) => {
    audioSynth.playChime();
    setRazorpayModalState({
      isOpen: true,
      mode: 'ticket',
      event
    });
  };

  const handleInitiateDonation = (amount: number, _tierId?: string, tierName?: string) => {
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
      const slug = currentUser.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/profile/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenAdmin = () => {
    audioSynth.playChime();
    navigate('/trustee');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: UserMember) => {
    setShowAuthModal(false);
    if (user.role === 'admin') {
      navigate('/trustee');
    } else {
      const slug = user.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/profile/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const targetSection = (location.state as any)?.scrollTo;
    if (location.pathname === '/') {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.resize();
      }

      if (targetSection) {
        navigate('/', { replace: true, state: {} });

        const performScroll = () => {
          const l = (window as any).lenis;
          if (l) {
            l.resize();
          }
          const el = document.getElementById(targetSection);
          if (el) {
            if (l) {
              l.resize();
              l.scrollTo(el, { offset: -(headerHeight || 80), duration: 1.1 });
            } else {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }
        };

        const timer = setTimeout(performScroll, 120);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo(0, 0);
      const l = (window as any).lenis;
      if (l) {
        l.scrollTo(0, { immediate: true });
        l.resize();
      }
    }
  }, [location.pathname, location.state, headerHeight, navigate]);

  const handleScrollTo = (sectionId: string) => {
    audioSynth.playChime();
    
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.resize();
    }
    const el = document.getElementById(sectionId);
    if (el) {
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(el, { offset: -(headerHeight || 80), duration: 1.1 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF5E9] text-[#3A2B27] selection:bg-[#471319] selection:text-[#FFF5E9] relative font-sans overflow-x-hidden">
      
      {/* Custom Art Cursor */}
      <CustomCursor />

      {/* Organic Terracotta, Moss & Charcoal Ambient Particle Canvas */}
      <ThreeArtCanvas />

      {/* 1. Header & Top Navigation with Smart Hide on Scroll Down & Integrated Dark Horizontal Sub-Bar */}
      <Header
        headerRef={headerRef}
        currentPath={location.pathname}
        onNavigateHome={() => {
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateEvents={() => {
          handleScrollTo('events-section');
        }}
        onOpenAuth={handleOpenAuth}
        onOpenDashboard={handleOpenDashboard}
        onOpenAdmin={handleOpenAdmin}
        onOpenDonate={() => handleScrollTo('donate-portal')}
        onScrollToSection={handleScrollTo}
      />

      {/* MAIN VIEW CONTAINER - padded mathematically with measured headerHeight to prevent any cutoffs */}
      <main 
        style={{ paddingTop: `${headerHeight}px` }} 
        className="relative z-10 w-full min-h-[calc(100vh-48px)] pb-14 sm:pb-16"
      >
        <Routes>
          {/* Route 1: Primary Homepage */}
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
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

                {/* 10. FOOTER */}
                <Footer
                  onScrollToSection={handleScrollTo}
                  onOpenDonate={() => handleScrollTo('donate-portal')}
                />
              </motion.div>
            }
          />

          {/* Route 2: Events / Gatherings View */}
          <Route
            path="/events"
            element={
              <EventsRouteView
                onBuyTicket={handleBookEventTicket}
                onInitiateDonation={handleInitiateDonation}
                onScrollToSection={handleScrollTo}
              />
            }
          />

          {/* Route 3: Trustee Administration Desk */}
          <Route
            path="/trustee"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="min-h-screen flex flex-col justify-between"
              >
                <div>
                  <AdminDashboard
                    onOpenAuth={handleOpenAuth}
                    onReturnToMain={() => {
                      navigate('/');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
                <Footer
                  onScrollToSection={handleScrollTo}
                  onOpenDonate={() => handleScrollTo('donate-portal')}
                />
              </motion.div>
            }
          />

          {/* Route 4: Resident Creator Profile */}
          <Route
            path="/profile/:username"
            element={
              <ProfileRouteView
                onExploreEvents={() => {
                  handleScrollTo('events-section');
                }}
                onExploreGallery={() => {
                  navigate('/');
                  handleScrollTo('gallery-section');
                }}
                onMakeDonation={() => handleScrollTo('donate-portal')}
                onOpenAuth={handleOpenAuth}
                onScrollToSection={handleScrollTo}
              />
            }
          />

          {/* Route 5: /profile Redirect to logged-in user or default resident */}
          <Route
            path="/profile"
            element={
              <Navigate
                to={`/profile/${currentUser ? currentUser.name.toLowerCase().replace(/\s+/g, '-') : 'rayan'}`}
                replace
              />
            }
          />

          {/* Catch-all: Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* UNIVERSAL PERSISTENT BOTTOM STICKY BAR: Audio Player & Live Events Ticker */}
      <BottomThirdEventsTicker onSelectEvent={handleBookEventTicket} />

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

      {/* INTRO SCREEN / SANCTUARY ENTRANCE */}
      <AnimatePresence>
        {!hasEntered && (
          <IntroScreen onExplore={handleExploreSanctuary} />
        )}
      </AnimatePresence>

    </div>
  );
}
