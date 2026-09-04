import React, { useState, useEffect, useMemo } from 'react';
import { EventItem, Artwork, GazetteArticle, DonationRecord, TicketPurchase } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { isEmailAdmin } from '../services/authRoles';
import { createAdminEvent, deleteAdminEvent, subscribeToEvents } from '../services/eventsService';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  Lock, 
  Plus, 
  Trash2, 
  Calendar, 
  BookOpen, 
  Users, 
  Check, 
  X, 
  Search, 
  RefreshCw, 
  Ticket, 
  Receipt, 
  MapPin, 
  Mail, 
  LogIn, 
  ArrowLeft, 
  Copy, 
  LayoutGrid, 
  Table as TableIcon 
} from 'lucide-react';
import { KshestraLogo } from './KshestraLogo';
import { motion } from 'motion/react';

interface RegisteredArtistRecord {
  uid: string;
  name: string;
  email: string;
  residentSince: string;
  location: string;
  passesCount: number;
  receiptsCount: number;
  createdAt: any;
  role?: string;
}

interface AdminDashboardProps {
  onOpenAuth?: () => void;
  onReturnToMain?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onOpenAuth, 
  onReturnToMain 
}) => {
  // Authentication & RBAC states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAuthResolving, setIsAuthResolving] = useState<boolean>(true);
  
  // Registered Artists from Firestore
  const [registeredArtists, setRegisteredArtists] = useState<RegisteredArtistRecord[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState<boolean>(false);
  const [artistsError, setArtistsError] = useState<string>('');
  const [artistSearchQuery, setArtistSearchQuery] = useState<string>('');
  const [artistViewMode, setArtistViewMode] = useState<'table' | 'cards'>('table');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'artists' | 'events' | 'dispatches'>('artists');
  
  // Existing Sanctuary Data States
  const [events, setEvents] = useState<EventItem[]>([]);
  const [dispatches, setDispatches] = useState<GazetteArticle[]>([]);
  const [gallery, setGallery] = useState<Artwork[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [tickets, setTickets] = useState<TicketPurchase[]>([]);

  // Modals for adding content
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // New Event Form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('Saturday, Nov 14 · 6:00 PM IST');
  const [newEventTime, setNewEventTime] = useState('6:00 PM IST');
  const [newEventVenue, setNewEventVenue] = useState('Kshestra Courtyard, South Kolkata');
  const [newEventPrice, setNewEventPrice] = useState('199');
  const [newEventCapacity, setNewEventCapacity] = useState('60');
  const [newEventIsPaid, setNewEventIsPaid] = useState(true);
  const [newEventCategory, setNewEventCategory] = useState<string>('Live Performance & Acoustic Poetry');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventCover, setNewEventCover] = useState('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80');

  // Determine dynamic admin status from auth.currentUser?.email
  const currentUserEmail = currentUser?.email || null;
  const isAuthorizedAdmin = Boolean(currentUserEmail && isEmailAdmin(currentUserEmail));

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Firestore users ONLY if verified authorized admin
  useEffect(() => {
    if (isAuthorizedAdmin) {
      fetchRegisteredArtists();
      loadAllData();

      // Subscribe to real-time events
      const unsubEvents = subscribeToEvents((liveEvents) => {
        setEvents(liveEvents);
      });
      return () => unsubEvents();
    } else {
      setRegisteredArtists([]);
    }
  }, [isAuthorizedAdmin]);

  const loadAllData = () => {
    setEvents(StorageService.getEvents());
    setDispatches(StorageService.getDispatches());
    setGallery(StorageService.getGallery());
    setDonations(StorageService.getDonations());
    setTickets(StorageService.getTickets());
  };

  const fetchRegisteredArtists = async () => {
    // Strict Guard: Prevent loading full user list if unauthenticated or lacking administrative clearance
    if (!auth.currentUser || !isEmailAdmin(auth.currentUser.email)) {
      setRegisteredArtists([]);
      setIsLoadingArtists(false);
      return;
    }

    setIsLoadingArtists(true);
    setArtistsError('');
    try {
      const usersCol = collection(db, 'users');
      const snapshot = await getDocs(usersCol);
      const artists: RegisteredArtistRecord[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        artists.push({
          uid: docSnap.id,
          name: data.name || data.displayName || 'Resident Artist',
          email: data.email || 'No email registered',
          residentSince: data.residentSince || '2026',
          location: data.location || data.city || 'Kolkata, WB',
          passesCount: Array.isArray(data.passes) 
            ? data.passes.length 
            : (Array.isArray(data.ticketPurchases) ? data.ticketPurchases.length : 0),
          receiptsCount: Array.isArray(data.receipts) 
            ? data.receipts.length 
            : (Array.isArray(data.donations) ? data.donations.length : 0),
          createdAt: data.createdAt || null,
          role: data.role || (isEmailAdmin(data.email) ? 'admin' : 'member')
        });
      });

      // Sort newest registration first
      artists.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setRegisteredArtists(artists);
    } catch (err: any) {
      console.error('Error querying Firestore users:', err);
      setArtistsError(err?.message || 'Unable to retrieve Firestore artist registry.');
    } finally {
      setIsLoadingArtists(false);
    }
  };

  // Filter artists by search query
  const filteredArtists = useMemo(() => {
    if (!artistSearchQuery.trim()) return registeredArtists;
    const q = artistSearchQuery.toLowerCase().trim();
    return registeredArtists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.uid.toLowerCase().includes(q)
    );
  }, [registeredArtists, artistSearchQuery]);

  const handleCopyUid = async (uid: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(uid);
      }
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid(null), 2000);
    } catch {
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid(null), 2000);
    }
  };

  const formatDate = (val: any): string => {
    if (!val) return 'Recent';
    if (typeof val === 'string') {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return val;
      } catch {
        return val;
      }
    }
    if (val?.toDate && typeof val.toDate === 'function') {
      return val.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (val?.seconds) {
      return new Date(val.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return 'Recent';
  };

  // Metrics
  const totalDonationAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalTicketsIssued = tickets.reduce((sum, t) => sum + (t.ticketCount || 0), 0);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    audioSynth.playChime();
    const cap = parseInt(newEventCapacity, 10) || 60;
    const priceVal = newEventIsPaid ? (parseInt(newEventPrice, 10) || 0) : 0;

    const created: EventItem = {
      id: `evt-ksh-${Date.now()}`,
      title: newEventTitle || 'New Gathering',
      date: newEventDate,
      isoDate: '2026-11-14',
      time: newEventTime,
      venue: newEventVenue,
      city: 'Kolkata',
      price: priceVal,
      category: newEventCategory as any,
      capacity: cap,
      availableTickets: cap,
      totalSeats: cap,
      availableSeats: cap,
      isPaid: priceVal > 0,
      tier: priceVal > 0 ? 'paid' : 'free',
      description: newEventDescription || 'Independent artist gathering hosted by Kshestra Cultural Trust.',
      curatorNotes: 'Sanctum entry and open circle dialogue.',
      featuredArtists: ['Kshestra Resident Artists'],
      coverImage: newEventCover,
      tags: ['Independent Art', 'Kshestra Sanctuary']
    };

    try {
      if (auth.currentUser && isAuthorizedAdmin) {
        await createAdminEvent({
          title: created.title,
          date: created.date,
          time: created.time,
          venue: created.venue,
          description: created.description,
          isPaid: priceVal > 0,
          price: priceVal,
          totalSeats: cap,
          category: created.category,
          coverImage: created.coverImage
        });
      } else {
        StorageService.addEvent(created);
      }
    } catch (err) {
      console.warn('Fallback to local storage event creation:', err);
      StorageService.addEvent(created);
    }

    loadAllData();
    setShowAddEventModal(false);
    setNewEventTitle('');
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to remove this gathering from the schedule?')) {
      audioSynth.playChime();
      try {
        if (auth.currentUser && isAuthorizedAdmin) {
          await deleteAdminEvent(id);
        }
      } catch (err) {
        console.warn('Firestore event delete notice:', err);
      }
      StorageService.deleteEvent(id);
      loadAllData();
    }
  };

  // -------------------------------------------------------------
  // GUARD: Access Restriction (Clearance Denied & Warning)
  // -------------------------------------------------------------
  if (!isAuthResolving && !isAuthorizedAdmin) {
    return (
      <div className="py-16 md:py-24 px-4 sm:px-8 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="sanctum-card rounded-sm bg-[#FFF5E9] border-2 border-[#471319]/40 p-6 sm:p-10 shadow-xl text-[#3A2B27] space-y-8"
        >
          {/* Top Seal & Monogram */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#3A2B27]/15">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-sm bg-[#471319] flex items-center justify-center p-2.5 shadow-md shrink-0">
                <KshestraLogo variant="white" className="w-full h-full text-[#FFF5E9]" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-[#471319]/10 text-[#471319] text-[10px] font-mono uppercase font-bold tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Access Restricted</span>
                </div>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#471319]">
                  Clearance Denied
                </h2>
              </div>
            </div>

            {onReturnToMain && (
              <button
                onClick={onReturnToMain}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#725C54] hover:text-[#471319] transition-colors self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sanctuary Home</span>
              </button>
            )}
          </div>

          {/* Security Warning Box */}
          <div className="p-4 sm:p-5 rounded-xs bg-[#471319]/10 border-l-4 border-[#471319] space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-[#471319] tracking-wider">
              <AlertTriangle className="w-4 h-4 text-[#471319] shrink-0" />
              <span>Warning: Restricted Area</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3A2B27] font-medium leading-relaxed">
              Access to this administrative section is strictly restricted. You do not possess the required clearance credentials.
            </p>
            <p className="text-[11px] text-[#725C54] font-mono">
              All unauthorized access attempts are monitored and recorded.
            </p>
          </div>

          {/* Current Session Status Card */}
          <div className="p-4 sm:p-5 rounded-sm bg-[#F6EADB] border border-[#3A2B27]/15 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] font-bold">
              Current Session Status:
            </div>
            
            {currentUserEmail ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-3.5 rounded-xs border border-[#3A2B27]/15">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#3A2B27]">
                    Signed in as: <span className="font-mono text-[#471319] font-bold">{currentUserEmail}</span>
                  </div>
                  <div className="text-[11px] text-[#725C54] font-mono">
                    Status: Clearance Denied (Insufficient Permissions)
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#471319] font-mono font-bold px-2.5 py-1 bg-[#471319]/10 rounded-xs self-start sm:self-auto">
                  <Lock className="w-3 h-3" />
                  <span>Clearance Denied</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-3.5 rounded-xs border border-[#3A2B27]/15">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#3A2B27]">
                    Session Status: <span className="font-mono text-[#725C54]">Unauthenticated</span>
                  </div>
                  <div className="text-[11px] text-[#725C54] font-mono">
                    No active credentials detected
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#725C54] font-mono px-2.5 py-1 bg-[#3A2B27]/5 rounded-xs self-start sm:self-auto">
                  <Lock className="w-3 h-3" />
                  <span>Unauthenticated</span>
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => {
                audioSynth.playChime();
                if (onOpenAuth) onOpenAuth();
              }}
              data-cursor="pointer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xs bg-[#471319] text-[#FFF5E9] text-xs font-bold uppercase tracking-wider hover:bg-[#471319]/90 transition-all shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate Credentials</span>
            </button>

            {onReturnToMain && (
              <button
                onClick={() => {
                  audioSynth.playChime();
                  onReturnToMain();
                }}
                data-cursor="pointer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xs border border-[#3A2B27]/20 text-[#3A2B27] text-xs font-bold uppercase tracking-wider hover:bg-[#F6EADB] transition-all"
              >
                <span>Return to Public Sanctum</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED ACCESS VIEW: Full Trustee Administration Desk
  // -------------------------------------------------------------
  return (
    <div className="py-12 md:py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* Header Banner */}
      <div className="sanctum-card rounded-sm p-6 sm:p-8 bg-[#F6EADB] text-[#3A2B27] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border border-[#3A2B27]/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-[#471319] flex items-center justify-center p-2 shadow-xs shrink-0">
            <KshestraLogo variant="white" className="w-full h-full text-[#FFF5E9]" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#471319]" />
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#3A2B27]">
                Trustee Administration Desk
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9]">
                Verified Trustee
              </span>
            </div>
            <p className="text-xs text-[#725C54] font-mono">
              Signed in: <span className="text-[#3A2B27] font-semibold">{currentUserEmail}</span> · Kshestra Foundation Ledger
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchRegisteredArtists}
            disabled={isLoadingArtists}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase rounded-sm border border-[#3A2B27]/20 bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#3A2B27] transition-all disabled:opacity-50"
            title="Reload live Firestore records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingArtists ? 'animate-spin text-[#471319]' : ''}`} />
            <span>{isLoadingArtists ? 'Syncing...' : 'Refresh Registry'}</span>
          </button>

          <button
            onClick={() => setShowAddEventModal(true)}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-sm bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Gathering</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="sanctum-card rounded-sm p-5 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#725C54] font-semibold">
              Registered Artists
            </span>
            <Users className="w-4 h-4 text-[#471319]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#471319]">
            {isLoadingArtists ? '...' : registeredArtists.length}
          </div>
          <p className="text-[11px] text-[#8A8E3E] font-mono">
            Live Firestore Directory
          </p>
        </div>

        <div className="sanctum-card rounded-sm p-5 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#725C54] font-semibold">
              Public Patronage
            </span>
            <Receipt className="w-4 h-4 text-[#3A2B27]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#3A2B27]">
            ₹{totalDonationAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#725C54] font-mono">
            Allocated to Residencies
          </p>
        </div>

        <div className="sanctum-card rounded-sm p-5 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#725C54] font-semibold">
              Passes Issued
            </span>
            <Ticket className="w-4 h-4 text-[#3A2B27]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#3A2B27]">
            {totalTicketsIssued}
          </div>
          <p className="text-[11px] text-[#725C54] font-mono">
            Courtyard Gatherings
          </p>
        </div>

        <div className="sanctum-card rounded-sm p-5 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#725C54] font-semibold">
              Confluences
            </span>
            <Calendar className="w-4 h-4 text-[#8A8E3E]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#8A8E3E]">
            {events.length}
          </div>
          <p className="text-[11px] text-[#725C54] font-mono">
            Physical Sanctums
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#3A2B27]/15 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('artists')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'artists' ? 'border-[#471319] text-[#471319]' : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Artists ({registeredArtists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'events' ? 'border-[#471319] text-[#471319]' : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Gatherings ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatches')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'dispatches' ? 'border-[#471319] text-[#471319]' : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Dispatches ({dispatches.length})</span>
        </button>
      </div>

      {/* TAB 1: Registered Artists (Firestore live users collection) */}
      {activeTab === 'artists' && (
        <div className="space-y-5">
          {/* Controls Bar: Search & View Mode */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-sm border border-[#3A2B27]/15 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#725C54]" />
              <input
                type="text"
                value={artistSearchQuery}
                onChange={(e) => setArtistSearchQuery(e.target.value)}
                placeholder="Search registered artists by name, email, location, or UID..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF5E9]/50 border border-[#3A2B27]/20 rounded-xs focus:outline-none focus:border-[#471319] text-[#3A2B27] placeholder:text-[#725C54]/60"
              />
              {artistSearchQuery && (
                <button
                  onClick={() => setArtistSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#725C54] hover:text-[#3A2B27] text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-mono text-[#725C54]">
                Showing {filteredArtists.length} of {registeredArtists.length}
              </span>

              <div className="flex border border-[#3A2B27]/20 rounded-xs overflow-hidden">
                <button
                  onClick={() => setArtistViewMode('table')}
                  className={`p-1.5 transition-colors ${
                    artistViewMode === 'table' ? 'bg-[#471319] text-[#FFF5E9]' : 'bg-[#FFFFFF] text-[#725C54] hover:text-[#3A2B27]'
                  }`}
                  title="Table view"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setArtistViewMode('cards')}
                  className={`p-1.5 transition-colors ${
                    artistViewMode === 'cards' ? 'bg-[#471319] text-[#FFF5E9]' : 'bg-[#FFFFFF] text-[#725C54] hover:text-[#3A2B27]'
                  }`}
                  title="Card grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message if query failed */}
          {artistsError && (
            <div className="p-4 bg-[#471319]/10 border border-[#471319]/30 rounded-sm text-xs text-[#471319] flex items-center justify-between gap-3">
              <span>{artistsError}</span>
              <button
                onClick={fetchRegisteredArtists}
                className="px-3 py-1 bg-[#471319] text-[#FFF5E9] rounded-xs font-mono uppercase text-[10px]"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoadingArtists && (
            <div className="py-16 text-center space-y-3 bg-[#FFFFFF] rounded-sm border border-[#3A2B27]/10 p-8">
              <RefreshCw className="w-6 h-6 animate-spin text-[#471319] mx-auto" />
              <p className="text-xs font-mono text-[#725C54]">
                Querying live Firestore user registry (collection: 'users')...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingArtists && filteredArtists.length === 0 && (
            <div className="py-16 text-center space-y-3 bg-[#FFFFFF] rounded-sm border border-[#3A2B27]/10 p-8">
              <Users className="w-8 h-8 text-[#725C54]/50 mx-auto" />
              <h4 className="font-serif-display text-lg font-bold text-[#3A2B27]">
                {artistSearchQuery ? 'No Matching Artists Found' : 'No Artists Registered Yet'}
              </h4>
              <p className="text-xs text-[#725C54] max-w-md mx-auto">
                {artistSearchQuery 
                  ? `No records match "${artistSearchQuery}". Try clearing the search query.`
                  : 'New creators registering through the sanctuary portal will populate here in real time.'}
              </p>
            </div>
          )}

          {/* TABLE VIEW */}
          {!isLoadingArtists && filteredArtists.length > 0 && artistViewMode === 'table' && (
            <div className="bg-[#FFFFFF] rounded-sm border border-[#3A2B27]/15 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F6EADB] border-b border-[#3A2B27]/15 text-[#3A2B27] font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Artist Name & Email</th>
                      <th className="py-3 px-4 font-bold">Residency & Location</th>
                      <th className="py-3 px-4 font-bold">Passes & Receipts</th>
                      <th className="py-3 px-4 font-bold">Registered / UID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A2B27]/10">
                    {filteredArtists.map((artist) => {
                      const isArtistAdmin = isEmailAdmin(artist.email);
                      return (
                        <tr key={artist.uid} className="hover:bg-[#FFF5E9]/50 transition-colors">
                          {/* Column 1: Name & Email */}
                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif-display font-bold text-sm text-[#3A2B27]">
                                {artist.name}
                              </span>
                              {isArtistAdmin && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#471319] text-[#FFF5E9] rounded-xs font-bold">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  <span>Trustee</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[#725C54] font-mono text-[11px]">
                              <Mail className="w-3 h-3 text-[#725C54]" />
                              <span>{artist.email}</span>
                            </div>
                          </td>

                          {/* Column 2: Residency Year & Location */}
                          <td className="py-3.5 px-4 space-y-1">
                            <div className="text-xs font-semibold text-[#3A2B27]">
                              Resident Since: <span className="font-mono text-[#8A8E3E] font-bold">{artist.residentSince}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#725C54] text-[11px]">
                              <MapPin className="w-3 h-3 text-[#725C54]" />
                              <span>{artist.location}</span>
                            </div>
                          </td>

                          {/* Column 3: Passes & Receipts */}
                          <td className="py-3.5 px-4 space-y-1 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFF5E9] border border-[#3A2B27]/15 rounded-xs text-[#3A2B27] text-[11px]">
                                <Ticket className="w-3 h-3 text-[#471319]" />
                                <span>{artist.passesCount} Passes</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFF5E9] border border-[#3A2B27]/15 rounded-xs text-[#3A2B27] text-[11px]">
                                <Receipt className="w-3 h-3 text-[#8A8E3E]" />
                                <span>{artist.receiptsCount} Receipts</span>
                              </span>
                            </div>
                          </td>

                          {/* Column 4: Registration Date / UID */}
                          <td className="py-3.5 px-4 space-y-1 font-mono">
                            <div className="text-[11px] text-[#3A2B27]">
                              {formatDate(artist.createdAt)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <code className="text-[10px] text-[#725C54] bg-[#F6EADB] px-1.5 py-0.5 rounded-xs truncate max-w-[120px]">
                                {artist.uid}
                              </code>
                              <button
                                onClick={() => handleCopyUid(artist.uid)}
                                className="text-[#725C54] hover:text-[#471319] p-0.5"
                                title="Copy UID"
                              >
                                {copiedUid === artist.uid ? (
                                  <Check className="w-3 h-3 text-[#8A8E3E]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARD GRID VIEW */}
          {!isLoadingArtists && filteredArtists.length > 0 && artistViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArtists.map((artist) => {
                const isArtistAdmin = isEmailAdmin(artist.email);
                return (
                  <div
                    key={artist.uid}
                    className="sanctum-card rounded-sm bg-[#FFFFFF] border border-[#3A2B27]/15 p-5 space-y-4 shadow-xs hover:border-[#471319]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-serif-display font-bold text-base text-[#3A2B27]">
                          {artist.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[#725C54] font-mono text-xs">
                          <Mail className="w-3.5 h-3.5 text-[#725C54]" />
                          <span className="truncate">{artist.email}</span>
                        </div>
                      </div>

                      {isArtistAdmin && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-0.5 bg-[#471319] text-[#FFF5E9] rounded-xs font-bold shrink-0">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Trustee</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#3A2B27]/10">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#725C54] block">Residency Year</span>
                        <span className="font-semibold text-[#8A8E3E] font-mono">{artist.residentSince}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#725C54] block">Location</span>
                        <span className="text-[#3A2B27] truncate block">{artist.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#3A2B27]/10 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#471319]">
                          <Ticket className="w-3 h-3" />
                          <span>{artist.passesCount} Passes</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8A8E3E]">
                          <Receipt className="w-3 h-3" />
                          <span>{artist.receiptsCount} Receipts</span>
                        </span>
                      </div>

                      <span className="text-[10px] text-[#725C54]">
                        {formatDate(artist.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#725C54] bg-[#F6EADB]/50 -mx-5 -mb-5 px-5 py-2 rounded-b-sm border-t border-[#3A2B27]/10">
                      <span className="truncate max-w-[180px]">UID: {artist.uid}</span>
                      <button
                        onClick={() => handleCopyUid(artist.uid)}
                        className="hover:text-[#471319] flex items-center gap-1 font-semibold"
                      >
                        {copiedUid === artist.uid ? (
                          <>
                            <Check className="w-3 h-3 text-[#8A8E3E]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy UID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Scheduled Gatherings List */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono text-[#725C54] uppercase tracking-wider">
              Published Gatherings on Sanctuary Schedule
            </span>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase text-[#471319] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Gathering</span>
            </button>
          </div>

          {events.map((evt) => (
            <div
              key={evt.id}
              className="sanctum-card rounded-sm bg-[#FFFFFF] border border-[#3A2B27]/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#471319] font-bold">
                    {evt.category}
                  </span>
                  <span className="text-xs text-[#725C54]">· {evt.date}</span>
                </div>
                <h4 className="font-serif-display text-lg font-bold text-[#3A2B27]">
                  {evt.title}
                </h4>
                <p className="text-xs text-[#725C54] font-mono">
                  {evt.venue} · ₹{evt.price} · Available: {evt.availableTickets}/{evt.capacity}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  data-cursor="pointer"
                  className="p-2 text-[#471319] hover:bg-[#471319]/10 rounded-sm transition-colors"
                  title="Delete Gathering"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Dispatches List */}
      {activeTab === 'dispatches' && (
        <div className="space-y-4">
          <div className="pb-2">
            <span className="text-xs font-mono text-[#725C54] uppercase tracking-wider">
              Sanctuary Cultural Gazette & Field Journals
            </span>
          </div>

          {dispatches.map((disp) => (
            <div
              key={disp.id}
              className="sanctum-card rounded-sm bg-[#FFFFFF] border border-[#3A2B27]/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#471319] font-bold">
                  {disp.category} · {disp.readTime}
                </span>
                <h4 className="font-serif-display text-lg font-bold text-[#3A2B27]">
                  {disp.title}
                </h4>
                <p className="text-xs text-[#725C54]">
                  By {disp.author} ({disp.authorRole})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3A2B27]/80 backdrop-blur-sm">
          <div className="bg-[#FFF5E9] rounded-sm max-w-lg w-full p-6 sm:p-8 border border-[#3A2B27]/20 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#3A2B27]/15 pb-3">
              <h3 className="font-serif-display text-xl font-bold text-[#3A2B27]">
                Publish New Sanctum Gathering
              </h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="p-1 hover:bg-[#471319] hover:text-[#FFF5E9] rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold block text-[#3A2B27]">Gathering Title</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. The Acoustic Moonlight Confluence"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold block text-[#3A2B27]">Date & Time</label>
                  <input
                    type="text"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-[#3A2B27]">Sanctuary Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label className="font-semibold block text-[#3A2B27]">Access Tier</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewEventIsPaid(true)}
                      className={`flex-1 py-2 px-2 text-[11px] font-mono font-bold uppercase rounded-xs border transition-colors ${
                        newEventIsPaid
                          ? 'bg-[#471319] text-[#FFF5E9] border-[#471319]'
                          : 'bg-[#FFFFFF] text-[#3A2B27] border-[#3A2B27]/20'
                      }`}
                    >
                      Paid Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewEventIsPaid(false);
                        setNewEventPrice('0');
                      }}
                      className={`flex-1 py-2 px-2 text-[11px] font-mono font-bold uppercase rounded-xs border transition-colors ${
                        !newEventIsPaid
                          ? 'bg-[#471319] text-[#FFF5E9] border-[#471319]'
                          : 'bg-[#FFFFFF] text-[#3A2B27] border-[#3A2B27]/20'
                      }`}
                    >
                      Free RSVP
                    </button>
                  </div>
                </div>

                {newEventIsPaid ? (
                  <div className="space-y-1">
                    <label className="font-semibold block text-[#3A2B27]">Pass Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={newEventPrice}
                      onChange={(e) => setNewEventPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm"
                    />
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-[#8A8E3E] pb-2">
                    ✓ Trust sponsored admission
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-[#3A2B27]">Venue & Location</label>
                <input
                  type="text"
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-[#3A2B27]">Description</label>
                <textarea
                  rows={3}
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Details regarding the artists, instruments, and seating."
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-sm border border-[#3A2B27]/20 text-[#3A2B27]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-[#471319] text-[#FFF5E9] font-bold uppercase"
                >
                  Publish Gathering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
