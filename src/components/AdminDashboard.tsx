import React, { useState, useEffect, useMemo } from 'react';
import { 
  EventItem, 
  Artwork, 
  GazetteArticle, 
  DonationRecord, 
  TicketPurchase,
  GrantRecord,
  BlogRecord,
  ArchiveRecord
} from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { isEmailAdmin } from '../services/authRoles';
import { createAdminEvent, deleteAdminEvent, subscribeToEvents } from '../services/eventsService';
import { 
  subscribeToGrants, 
  subscribeToBlogs, 
  subscribeToArchives,
  fetchGrants,
  fetchBlogs,
  fetchArchives
} from '../services/adminService';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  Lock, 
  Plus, 
  Calendar, 
  BookOpen, 
  Users, 
  X, 
  RefreshCw, 
  Ticket, 
  Receipt, 
  LogIn, 
  ArrowLeft, 
  DollarSign, 
  Feather, 
  Archive as ArchiveIcon
} from 'lucide-react';
import { KshestraLogo } from './KshestraLogo';
import { motion } from 'motion/react';

// Sub-components
import { AdminEventsTab } from './admin/AdminEventsTab';
import { AdminCreatorsTab } from './admin/AdminCreatorsTab';
import { AdminGrantsTab } from './admin/AdminGrantsTab';
import { AdminBlogsTab } from './admin/AdminBlogsTab';
import { AdminArchivesTab } from './admin/AdminArchivesTab';

interface RegisteredArtistRecord {
  uid: string;
  name: string;
  email: string;
  residentSince: string;
  location: string;
  passesCount: number;
  receiptsCount: number;
  createdAt: any;
  role: string;
  hasCustomProfile: boolean;
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

  // Active Management Tab
  const [activeTab, setActiveTab] = useState<'events' | 'artists' | 'grants' | 'blogs' | 'archives' | 'dispatches'>('events');
  
  // Live Collections States
  const [events, setEvents] = useState<EventItem[]>([]);
  const [grants, setGrants] = useState<GrantRecord[]>([]);
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  const [dispatches, setDispatches] = useState<GazetteArticle[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [tickets, setTickets] = useState<TicketPurchase[]>([]);

  // Add Event Modal
  const [showAddEventModal, setShowAddEventModal] = useState(false);
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

  // Synchronize All Live Data
  const loadAllData = () => {
    // 1. Events
    setEvents(StorageService.getEvents());
    setDispatches(StorageService.getDispatches());
    setDonations(StorageService.getDonations());
    setTickets(StorageService.getTickets());

    // 2. Registered Users from Firestore
    fetchRegisteredArtists();
  };

  useEffect(() => {
    loadAllData();

    // Listen to live events
    const unsubEvents = subscribeToEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setEvents(liveEvents);
      }
    });

    // Listen to live grants
    const unsubGrants = subscribeToGrants((liveGrants) => {
      setGrants(liveGrants);
    });

    // Listen to live blogs
    const unsubBlogs = subscribeToBlogs((liveBlogs) => {
      setBlogs(liveBlogs);
    });

    // Listen to live archives
    const unsubArchives = subscribeToArchives((liveArchives) => {
      setArchives(liveArchives);
    });

    return () => {
      unsubEvents();
      unsubGrants();
      unsubBlogs();
      unsubArchives();
    };
  }, []);

  // Fetch Firestore Registered Artists
  const fetchRegisteredArtists = async () => {
    setIsLoadingArtists(true);
    setArtistsError('');
    try {
      const usersColRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersColRef);
      
      const artists: RegisteredArtistRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const uid = docSnap.id;
        const name = data.name || data.displayName || 'Anonymous Creator';
        const email = data.email || 'No email recorded';
        const residentSince = data.residentSince || '2026';
        const location = data.location || 'Kolkata, WB';
        const passesCount = Array.isArray(data.passes) ? data.passes.length : 0;
        const receiptsCount = Array.isArray(data.donationReceipts) ? data.donationReceipts.length : 0;
        const createdAt = data.createdAt || null;
        const role = data.role || (isEmailAdmin(email) ? 'admin' : 'member');
        const hasCustomProfile = Boolean(data.hasCustomProfile || data.name || data.location);

        artists.push({
          uid,
          name,
          email,
          residentSince,
          location,
          passesCount,
          receiptsCount,
          createdAt,
          role,
          hasCustomProfile
        });
      });

      artists.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (typeof a.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      setRegisteredArtists(artists);
    } catch (err: any) {
      console.warn('Error querying Firestore users:', err);
      setArtistsError(err?.message || 'Unable to retrieve Firestore artist registry.');
    } finally {
      setIsLoadingArtists(false);
    }
  };

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
          className="sanctum-card rounded-xs bg-[#FFF5E9] border-2 border-[#471319]/40 p-6 sm:p-10 shadow-xl text-[#3A2B27] space-y-8"
        >
          {/* Top Seal & Monogram */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#3A2B27]/15">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xs bg-[#471319] flex items-center justify-center p-2.5 shadow-md shrink-0">
                <KshestraLogo variant="white" className="w-full h-full text-[#FFF5E9]" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-2xs bg-[#471319]/10 text-[#471319] text-[10px] font-mono uppercase font-bold tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Access Restricted</span>
                </div>
                <h2 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#471319]">
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
          <div className="p-4 sm:p-5 rounded-2xs bg-[#471319]/10 border-l-4 border-[#471319] space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-[#471319] tracking-wider">
              <AlertTriangle className="w-4 h-4 text-[#471319] shrink-0" />
              <span>Warning: Restricted Area</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3A2B27] font-medium leading-relaxed font-sans">
              Access to this administrative sanctuary desk is strictly restricted. Only verified trustees registered in official protocols possess clearance.
            </p>
            <p className="text-[11px] text-[#725C54] font-mono">
              Authorized accounts: beingenious01@gmail.com, trustees@kshestra.org, admin@kshestra.org
            </p>
          </div>

          {/* Current Session Status Card */}
          <div className="p-4 sm:p-5 rounded-xs bg-[#F6EADB] border border-[#3A2B27]/15 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] font-bold">
              Current Session Status:
            </div>
            
            {currentUserEmail ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-3.5 rounded-2xs border border-[#3A2B27]/15">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#3A2B27]">
                    Signed in as: <span className="font-mono text-[#471319] font-bold">{currentUserEmail}</span>
                  </div>
                  <div className="text-[11px] text-[#725C54] font-mono">
                    Status: Clearance Denied (Insufficient Trustee Credentials)
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#471319] font-mono font-bold px-2.5 py-1 bg-[#471319]/10 rounded-2xs self-start sm:self-auto">
                  <Lock className="w-3 h-3" />
                  <span>Clearance Denied</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-3.5 rounded-2xs border border-[#3A2B27]/15">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#3A2B27]">
                    Session Status: <span className="font-mono text-[#725C54]">Unauthenticated</span>
                  </div>
                  <div className="text-[11px] text-[#725C54] font-mono">
                    No active credentials detected in browser
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#725C54] font-mono px-2.5 py-1 bg-[#3A2B27]/5 rounded-2xs self-start sm:self-auto">
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xs bg-[#471319] text-[#FFF5E9] text-xs font-bold uppercase tracking-wider hover:bg-[#471319]/90 transition-all shadow-md font-mono"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xs border border-[#3A2B27]/20 text-[#3A2B27] text-xs font-bold uppercase tracking-wider hover:bg-[#F6EADB] transition-all font-mono"
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
    <div className="py-12 md:py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="sanctum-card rounded-xs p-6 sm:p-8 bg-[#F6EADB] text-[#3A2B27] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border border-[#3A2B27]/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xs bg-[#471319] flex items-center justify-center p-2 shadow-xs shrink-0">
            <KshestraLogo variant="white" className="w-full h-full text-[#FFF5E9]" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#471319]" />
              <h2 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27]">
                Trustee Desk & Sanctuary Administration
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-2xs bg-[#471319] text-[#FFF5E9]">
                Verified Trustee
              </span>
            </div>
            <p className="text-xs text-[#725C54] font-mono">
              Signed in: <span className="text-[#3A2B27] font-semibold">{currentUserEmail}</span> · Kshestra Cultural Trust
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              audioSynth.playChime();
              loadAllData();
            }}
            disabled={isLoadingArtists}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#3A2B27] transition-all disabled:opacity-50"
            title="Reload live Firestore records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingArtists ? 'animate-spin text-[#471319]' : ''}`} />
            <span>{isLoadingArtists ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>

          <button
            onClick={() => setShowAddEventModal(true)}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Gathering</span>
          </button>
        </div>
      </div>

      {/* Top Ledger Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="sanctum-card rounded-xs p-4 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#725C54] font-semibold">
              Live Gatherings
            </span>
            <Calendar className="w-3.5 h-3.5 text-[#471319]" />
          </div>
          <div className="font-gambetta text-2xl sm:text-3xl font-bold text-[#471319]">
            {events.length}
          </div>
          <p className="text-[10px] text-[#8A8E3E] font-mono">
            Active in /events
          </p>
        </div>

        <div className="sanctum-card rounded-xs p-4 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#725C54] font-semibold">
              Resident Creators
            </span>
            <Users className="w-3.5 h-3.5 text-[#3A2B27]" />
          </div>
          <div className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27]">
            {isLoadingArtists ? '...' : registeredArtists.length}
          </div>
          <p className="text-[10px] text-[#725C54] font-mono">
            Firestore profiles
          </p>
        </div>

        <div className="sanctum-card rounded-xs p-4 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#725C54] font-semibold">
              Grants Inscribed
            </span>
            <DollarSign className="w-3.5 h-3.5 text-[#8A8E3E]" />
          </div>
          <div className="font-gambetta text-2xl sm:text-3xl font-bold text-[#8A8E3E]">
            {grants.length}
          </div>
          <p className="text-[10px] text-[#725C54] font-mono">
            Grants Ledger
          </p>
        </div>

        <div className="sanctum-card rounded-xs p-4 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#725C54] font-semibold">
              Chronicles
            </span>
            <Feather className="w-3.5 h-3.5 text-[#471319]" />
          </div>
          <div className="font-gambetta text-2xl sm:text-3xl font-bold text-[#471319]">
            {blogs.length}
          </div>
          <p className="text-[10px] text-[#725C54] font-mono">
            Editorial Dispatches
          </p>
        </div>

        <div className="sanctum-card rounded-xs p-4 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-1 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#725C54] font-semibold">
              Living Archive
            </span>
            <ArchiveIcon className="w-3.5 h-3.5 text-[#3A2B27]" />
          </div>
          <div className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27]">
            {archives.length}
          </div>
          <p className="text-[10px] text-[#725C54] font-mono">
            Past confluences
          </p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-[#3A2B27]/15 text-xs font-mono font-bold uppercase overflow-x-auto gap-1">
        <button
          onClick={() => {
            audioSynth.playChime();
            setActiveTab('events');
          }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'events' 
              ? 'border-[#471319] text-[#471319] bg-[#FFFFFF]/60' 
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Live Events ({events.length})</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playChime();
            setActiveTab('artists');
          }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'artists' 
              ? 'border-[#471319] text-[#471319] bg-[#FFFFFF]/60' 
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Resident Directory ({registeredArtists.length})</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playChime();
            setActiveTab('grants');
          }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'grants' 
              ? 'border-[#471319] text-[#471319] bg-[#FFFFFF]/60' 
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Grants Ledger ({grants.length})</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playChime();
            setActiveTab('blogs');
          }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'blogs' 
              ? 'border-[#471319] text-[#471319] bg-[#FFFFFF]/60' 
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Feather className="w-4 h-4" />
          <span>Chronicles ({blogs.length})</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playChime();
            setActiveTab('archives');
          }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'archives' 
              ? 'border-[#471319] text-[#471319] bg-[#FFFFFF]/60' 
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <ArchiveIcon className="w-4 h-4" />
          <span>Living Archive ({archives.length})</span>
        </button>

        <button
          onClick={() => {
            audioSynth.playChime();
            setActiveTab('dispatches');
          }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'dispatches' 
              ? 'border-[#471319] text-[#471319] bg-[#FFFFFF]/60' 
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Gazette Registry</span>
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. Live Events Management */}
      {activeTab === 'events' && (
        <AdminEventsTab
          events={events}
          onRefresh={loadAllData}
          onOpenAddModal={() => setShowAddEventModal(true)}
        />
      )}

      {/* 2. Resident Creators & Pass Audit */}
      {activeTab === 'artists' && (
        <AdminCreatorsTab
          creators={registeredArtists}
          isLoading={isLoadingArtists}
          onRefresh={fetchRegisteredArtists}
        />
      )}

      {/* 3. Grants Ledger */}
      {activeTab === 'grants' && (
        <AdminGrantsTab
          grants={grants}
          onRefresh={async () => {
            const data = await fetchGrants();
            setGrants(data);
          }}
        />
      )}

      {/* 4. Chronicles & Blog Management */}
      {activeTab === 'blogs' && (
        <AdminBlogsTab
          blogs={blogs}
          onRefresh={async () => {
            const data = await fetchBlogs();
            setBlogs(data);
          }}
        />
      )}

      {/* 5. The Living Archive */}
      {activeTab === 'archives' && (
        <AdminArchivesTab
          archives={archives}
          onRefresh={async () => {
            const data = await fetchArchives();
            setArchives(data);
          }}
        />
      )}

      {/* 6. Gazette & Subscriber Broadcasts */}
      {activeTab === 'dispatches' && (
        <div className="space-y-4">
          <div className="bg-[#FFFFFF] p-5 rounded-xs border border-[#3A2B27]/15 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-gambetta text-xl font-bold text-[#3A2B27]">
                Autumn Gazette & Print Dispatches Docket
              </h3>
              <p className="text-xs font-mono text-[#725C54]">
                Physical broadside print distribution and subscriber readership registry.
              </p>
            </div>
            <span className="text-xs font-mono font-bold uppercase px-3 py-1 bg-[#F6EADB] text-[#471319] rounded-xs border border-[#3A2B27]/10">
              {dispatches.length} Seasonal Issues
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {dispatches.map((disp) => (
              <div
                key={disp.id}
                className="sanctum-card rounded-xs bg-[#FFFFFF] border border-[#3A2B27]/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#471319] font-bold">
                    {disp.category} · {disp.readTime}
                  </span>
                  <h4 className="font-gambetta text-lg font-bold text-[#3A2B27]">
                    {disp.title}
                  </h4>
                  <p className="text-xs font-mono text-[#725C54]">
                    By {disp.author} ({disp.authorRole}) · {disp.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish New Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3A2B27]/80 backdrop-blur-xs">
          <div className="bg-[#FFF5E9] rounded-xs max-w-lg w-full p-6 sm:p-8 border-2 border-[#471319] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#3A2B27]/15 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-[#8A8E3E] font-bold">
                  Curatorial Docket
                </span>
                <h3 className="font-gambetta text-xl font-bold text-[#3A2B27]">
                  Publish New Sanctum Gathering
                </h3>
              </div>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="p-1 hover:bg-[#471319] hover:text-[#FFF5E9] rounded-xs transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="font-semibold block uppercase text-[#725C54]">Gathering Title *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. The Acoustic Moonlight Confluence"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-xs font-sans text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold block uppercase text-[#725C54]">Date String</label>
                  <input
                    type="text"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block uppercase text-[#725C54]">Sanctum Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label className="font-semibold block uppercase text-[#725C54]">Access Tier</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewEventIsPaid(true)}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded-xs border transition-colors ${
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
                      className={`flex-1 py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded-xs border transition-colors ${
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
                    <label className="font-semibold block uppercase text-[#725C54]">Pass Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={newEventPrice}
                      onChange={(e) => setNewEventPrice(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-xs font-bold"
                    />
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-[#8A8E3E] pb-2 font-bold">
                    ✓ Trust sponsored admission
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold block uppercase text-[#725C54]">Venue & Location</label>
                <input
                  type="text"
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block uppercase text-[#725C54]">Description</label>
                <textarea
                  rows={3}
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Details regarding the artists, instruments, and seating."
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-xs font-sans text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#3A2B27]/15">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-xs border border-[#3A2B27]/20 text-[#3A2B27] hover:bg-[#F6EADB] uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xs bg-[#471319] text-[#FFF5E9] font-bold uppercase shadow-xs hover:bg-[#471319]/90"
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
