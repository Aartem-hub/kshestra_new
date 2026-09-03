import React, { useState, useEffect } from 'react';
import { UserMember, TicketPurchase, Artwork, DonationRecord } from '../types';
import { StorageService } from '../services/storage';
import { downloadICSFile, generateGoogleCalendarUrl } from '../services/calendarSync';
import { audioSynth } from '../services/audioSynthesizer';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  User, 
  Calendar, 
  Ticket, 
  Flame, 
  CalendarPlus, 
  Download, 
  Clock, 
  MapPin,
  LogOut,
  ArrowRight
} from 'lucide-react';

interface MemberDashboardProps {
  profileUsername?: string;
  onExploreEvents: () => void;
  onExploreGallery: () => void;
  onMakeDonation: () => void;
  onOpenAuth?: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  profileUsername,
  onExploreEvents,
  onExploreGallery,
  onMakeDonation,
  onOpenAuth
}) => {
  const [currentUser, setCurrentUser] = useState<UserMember | null>(() => StorageService.getCurrentUser());
  const [firestoreRecord, setFirestoreRecord] = useState<{
    name?: string;
    email?: string;
    location?: string;
    residentSince?: string;
    passes?: any[];
    receipts?: any[];
  } | null>(null);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'passes' | 'donations'>('passes');
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);

  // Format username nicely: e.g. "rayan" -> "Rayan", "sourav-ganguly" -> "Sourav Ganguly"
  const formattedUsername = profileUsername 
    ? profileUsername.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    : '';

  // Look for user matching this username
  const matchedUser = profileUsername
    ? StorageService.getAllUsers().find(u => 
        u.name.toLowerCase().replace(/\s+/g, '-') === profileUsername.toLowerCase() ||
        u.name.toLowerCase() === profileUsername.toLowerCase() ||
        u.email.toLowerCase().startsWith(profileUsername.toLowerCase())
      )
    : null;

  const isOwner = Boolean(
    currentUser && (
      !profileUsername ||
      currentUser.name.toLowerCase().replace(/\s+/g, '-') === profileUsername.toLowerCase() ||
      currentUser.name.toLowerCase() === profileUsername.toLowerCase() ||
      currentUser.email.toLowerCase().startsWith(profileUsername.toLowerCase())
    )
  );

  useEffect(() => {
    setCurrentUser(StorageService.getCurrentUser());
    setAllArtworks(StorageService.getGallery());

    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail);
    };
    window.addEventListener('kshestra_auth_changed', handleAuthChange);
    return () => window.removeEventListener('kshestra_auth_changed', handleAuthChange);
  }, []);

  // Dynamically listen to real Firestore record at users/{uid}
  useEffect(() => {
    const uid = auth.currentUser?.uid || (currentUser?.id && !currentUser.id.startsWith('usr-') ? currentUser.id : null);
    if (!uid) {
      setFirestoreRecord(null);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirestoreRecord({
            name: data.name || auth.currentUser?.displayName || currentUser?.name || 'Resident Creator',
            email: data.email || auth.currentUser?.email || currentUser?.email || '',
            location: data.location || currentUser?.city || 'Kolkata, WB',
            residentSince: data.residentSince || currentUser?.memberSince || '2026',
            passes: Array.isArray(data.passes) ? data.passes : [],
            receipts: Array.isArray(data.receipts) ? data.receipts : []
          });
        }
      }, (err) => {
        console.warn('Firestore snapshot listener notice:', err);
      });

      return () => unsubscribe();
    } catch (listenerErr) {
      console.warn('Could not establish Firestore listener:', listenerErr);
    }
  }, [currentUser?.id]);

  if (!currentUser && !auth.currentUser && !profileUsername) {
    return (
      <div className="py-24 text-center max-w-xl mx-auto px-4 space-y-5">
        <h3 className="font-gambetta text-3xl font-bold text-[#471319]">
          Sanctum Portal Restricted
        </h3>
        <p className="font-sans text-sm text-[#725C54]">
          Please sign in to access your registered event passes, calendar sync, and patron records.
        </p>
        {onOpenAuth && (
          <button
            onClick={() => {
              audioSynth.playChime();
              onOpenAuth();
            }}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] shadow-xs hover:bg-[#3A2B27] transition-colors"
          >
            <span>Sign In to Sanctuary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Dynamic values bound to real Firestore record with local state fallback
  const displayName = profileUsername
    ? (matchedUser?.name || formattedUsername)
    : (firestoreRecord?.name || currentUser?.name || auth.currentUser?.displayName || 'Resident Creator');
  const displayEmail = isOwner
    ? (firestoreRecord?.email || currentUser?.email || auth.currentUser?.email || '')
    : (matchedUser?.email || `${(profileUsername || 'creator').toLowerCase()}@kshestra.community`);
  const displayLocation = (isOwner ? (firestoreRecord?.location || currentUser?.city) : matchedUser?.city) || 'Kolkata, WB';
  const displayResidentSince = (isOwner ? (firestoreRecord?.residentSince || currentUser?.memberSince) : matchedUser?.memberSince) || '2026';
  const displayPasses: any[] = isOwner
    ? (firestoreRecord?.passes !== undefined ? firestoreRecord.passes : (currentUser?.ticketPurchases || []))
    : (matchedUser?.ticketPurchases || []);
  const displayReceipts: any[] = isOwner
    ? (firestoreRecord?.receipts !== undefined ? firestoreRecord.receipts : (currentUser?.donations || []))
    : (matchedUser?.donations || []);

  const handleDownloadICS = (pass: any) => {
    audioSynth.playChime();
    const events = StorageService.getEvents();
    const event = events.find(e => e.id === pass.eventId) || {
      id: pass.eventId || 'evt-01',
      title: pass.eventTitle || pass.title || 'Sanctuary Confluence',
      date: pass.eventDate || pass.date || 'October 2026',
      isoDate: '2026-10-10',
      time: pass.eventTime || pass.time || '18:00 IST',
      venue: pass.eventVenue || pass.venue || 'Kshestra Main Stage',
      city: 'Kolkata',
      price: pass.totalAmount || 0,
      category: 'Live Gathering' as const,
      capacity: 100,
      availableTickets: 50,
      description: `Official Kshestra Confluence: ${pass.eventTitle || pass.title || 'Sanctuary Confluence'}`,
      curatorNotes: '',
      featuredArtists: [],
      coverImage: '',
      tags: []
    };

    const ticketObj: TicketPurchase = {
      id: pass.id || `pass-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      buyerName: pass.buyerName || displayName,
      buyerEmail: pass.buyerEmail || displayEmail,
      buyerPhone: pass.buyerPhone || '',
      ticketCount: pass.ticketCount || 1,
      totalAmount: pass.totalAmount || 0,
      purchaseDate: pass.purchaseDate || new Date().toISOString().split('T')[0],
      ticketCode: pass.ticketCode || pass.code || 'KSH-PASS',
      qrData: pass.qrData || pass.ticketCode || 'KSH',
      paymentId: pass.paymentId || 'pay_confirmed',
      status: 'confirmed'
    };

    downloadICSFile(event, ticketObj);
    setCopiedPassId(ticketObj.id);
    setTimeout(() => setCopiedPassId(null), 2500);
  };

  const handleGoogleCalendar = (pass: any) => {
    audioSynth.playChime();
    const events = StorageService.getEvents();
    const event = events.find(e => e.id === pass.eventId) || {
      id: pass.eventId || 'evt-01',
      title: pass.eventTitle || pass.title || 'Sanctuary Confluence',
      date: pass.eventDate || pass.date || 'October 2026',
      isoDate: '2026-10-10',
      time: pass.eventTime || pass.time || '18:00 IST',
      venue: pass.eventVenue || pass.venue || 'Kshestra Main Stage',
      city: 'Kolkata',
      price: pass.totalAmount || 0,
      category: 'Live Gathering' as const,
      capacity: 100,
      availableTickets: 50,
      description: `Official Kshestra Confluence: ${pass.eventTitle || pass.title || 'Sanctuary Confluence'}`,
      curatorNotes: '',
      featuredArtists: [],
      coverImage: '',
      tags: []
    };

    const ticketObj: TicketPurchase = {
      id: pass.id || `pass-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      buyerName: pass.buyerName || displayName,
      buyerEmail: pass.buyerEmail || displayEmail,
      buyerPhone: pass.buyerPhone || '',
      ticketCount: pass.ticketCount || 1,
      totalAmount: pass.totalAmount || 0,
      purchaseDate: pass.purchaseDate || new Date().toISOString().split('T')[0],
      ticketCode: pass.ticketCode || pass.code || 'KSH-PASS',
      qrData: pass.qrData || pass.ticketCode || 'KSH',
      paymentId: pass.paymentId || 'pay_confirmed',
      status: 'confirmed'
    };

    const url = generateGoogleCalendarUrl(event, ticketObj);
    window.open(url, '_blank');
  };

  const handleLogout = async () => {
    audioSynth.playChime();
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase signOut error:', err);
    }
    StorageService.logout();
    setCurrentUser(null);
    setFirestoreRecord(null);
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* 1. Header Profile Banner */}
      <div className="rounded-xs p-6 sm:p-8 bg-[#FFFFFF] border border-[#3A2B27]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xs bg-[#471319] text-[#FFF5E9] flex items-center justify-center font-serif text-2xl font-bold shadow-xs shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27]">
                {displayName}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-xs bg-[#8A8E3E]/10 text-[#8A8E3E] font-semibold border border-[#8A8E3E]/30">
                Verified Resident
              </span>
            </div>
            <p className="text-xs text-[#725C54] font-mono">
              {displayEmail} · Resident Since {displayResidentSince} · {displayLocation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onMakeDonation}
            data-cursor="pointer"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase rounded-xs bg-[#471319] hover:bg-[#471319] text-[#FFF5E9] border border-[#3A2B27]/20 transition-all shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-[#8A8E3E]" />
            <span>Support the Flame (Donate)</span>
          </button>
          {isOwner ? (
            <button
              onClick={handleLogout}
              data-cursor="pointer"
              className="p-2.5 text-[#725C54] hover:text-[#471319] hover:bg-[#FFF5E9] rounded-xs border border-[#3A2B27]/15 transition-colors"
              title="Log Out (Sign Out)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : onOpenAuth && (
            <button
              onClick={() => {
                audioSynth.playChime();
                onOpenAuth();
              }}
              data-cursor="pointer"
              className="p-2.5 text-[#3A2B27] hover:text-[#471319] hover:bg-[#FFF5E9] rounded-xs border border-[#3A2B27]/15 transition-colors text-xs font-mono font-bold uppercase"
              title="Sign in to your Sanctuary account"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-[#3A2B27]/15 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('passes')}
          data-cursor="pointer"
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSubTab === 'passes'
              ? 'border-[#471319] text-[#471319]'
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Reserved Gathering Passes ({displayPasses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('donations')}
          data-cursor="pointer"
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSubTab === 'donations'
              ? 'border-[#471319] text-[#471319]'
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Patronage & 80G Receipts ({displayReceipts.length})</span>
        </button>
      </div>

      {/* 3. Passes Tab */}
      {activeSubTab === 'passes' && (
        <div className="space-y-6">
          {displayPasses.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-xs border border-[#3A2B27]/15 p-8 space-y-4">
              <Ticket className="w-10 h-10 text-[#725C54] mx-auto opacity-50" />
              <h4 className="font-gambetta text-xl font-bold text-[#3A2B27]">
                No Passes Reserved Yet
              </h4>
              <p className="text-xs text-[#725C54] max-w-md mx-auto">
                Reserve your seat at our intimate performances, collaborative mixers, and production labs in Kolkata.
              </p>
              <button
                onClick={onExploreEvents}
                data-cursor="pointer"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9]"
              >
                <span>Browse Gatherings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayPasses.map((pass: any, idx: number) => {
                const passId = pass.id || `pass-${idx}`;
                const passTitle = pass.eventTitle || pass.title || 'Sanctuary Confluence';
                const passCode = pass.ticketCode || pass.code || `KSH-${1000 + idx}`;
                const passDate = pass.eventDate || pass.date || 'October 2026';
                const passVenue = pass.eventVenue || pass.venue || 'Kshestra Main Stage';
                const passName = pass.buyerName || pass.name || displayName;
                const passSeats = pass.ticketCount || pass.count || 1;

                return (
                  <div
                    key={passId}
                    className="rounded-xs bg-[#FFFFFF] border border-[#3A2B27]/15 p-6 space-y-4 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between border-b border-[#3A2B27]/10 pb-3">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#471319] font-bold">
                            Digital Entry Pass
                          </span>
                          <h4 className="font-gambetta text-lg font-bold text-[#3A2B27]">
                            {passTitle}
                          </h4>
                        </div>
                        <div className="font-mono text-xs font-bold text-[#471319] bg-[#F6EADB] px-2.5 py-1 rounded-xs">
                          {passCode}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono text-[#725C54]">
                        <div className="flex items-center gap-2 text-[#3A2B27]">
                          <Clock className="w-3.5 h-3.5 text-[#471319]" />
                          <span>{passDate}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#8A8E3E] shrink-0 mt-0.5" />
                          <span>{passVenue}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#FFF5E9] rounded-xs border border-[#3A2B27]/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[#725C54] block text-[10px]">Registered Name</span>
                          <span className="font-semibold text-[#3A2B27]">{passName} ({passSeats} Seat{passSeats > 1 ? 's' : ''})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#725C54] block text-[10px]">Pass Status</span>
                          <span className="font-bold text-[#8A8E3E] uppercase">Confirmed</span>
                        </div>
                      </div>
                    </div>

                    {/* Pass Actions: Calendar & ICS */}
                    <div className="pt-3 border-t border-[#3A2B27]/10 flex gap-2">
                      <button
                        onClick={() => handleGoogleCalendar(pass)}
                        data-cursor="pointer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-xs bg-[#F6EADB] text-[#3A2B27] hover:bg-[#EBE2D4] transition-colors"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-[#471319]" />
                        <span>Google Cal</span>
                      </button>
                      <button
                        onClick={() => handleDownloadICS(pass)}
                        data-cursor="pointer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-xs bg-[#FFF5E9] text-[#3A2B27] hover:bg-[#F6EADB] border border-[#3A2B27]/15 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#8A8E3E]" />
                        <span>{copiedPassId === passId ? 'Exported!' : 'Apple / Outlook .ICS'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Donations Tab */}
      {activeSubTab === 'donations' && (
        <div className="space-y-6">
          {displayReceipts.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-xs border border-[#3A2B27]/15 p-8 space-y-4">
              <Flame className="w-10 h-10 text-[#471319] mx-auto opacity-50" />
              <h4 className="font-gambetta text-xl font-bold text-[#3A2B27]">
                No Patronage Grants Recorded
              </h4>
              <p className="text-xs text-[#725C54] max-w-md mx-auto">
                Help build physical sanctuaries and fund emerging artist stipends in Kolkata.
              </p>
              <button
                onClick={onMakeDonation}
                data-cursor="pointer"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9]"
              >
                <span>Support the Foundation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayReceipts.map((don: any, idx: number) => {
                const receiptId = don.id || `don-${idx}`;
                const tier = don.tierName || don.tier || 'Sanctuary Contribution';
                const donAmount = Number(don.amount) || 0;
                const paymentId = don.paymentId || don.receiptNumber || `pay_${receiptId}`;
                const donDate = don.date || '2026';
                const donor = don.donorName || don.name || displayName;

                return (
                  <div
                    key={receiptId}
                    className="rounded-xs bg-[#FFFFFF] border border-[#3A2B27]/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-gambetta text-lg font-bold text-[#3A2B27]">
                          {tier}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#8A8E3E]/10 text-[#8A8E3E] rounded-xs">
                          80G Exemption Valid
                        </span>
                      </div>
                      <p className="text-xs text-[#725C54] font-mono">
                        Donation ID: {paymentId} · Date: {donDate} · Donor: {donor}
                      </p>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <div className="font-serif text-2xl font-bold text-[#471319]">
                        ₹{donAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-[#8A8E3E] font-mono uppercase font-bold">
                        Completed & Tax Credited
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
