import React, { useState, useEffect } from 'react';
import { UserMember, TicketPurchase, Artwork, DonationRecord } from '../types';
import { StorageService } from '../services/storage';
import { downloadICSFile, generateGoogleCalendarUrl } from '../services/calendarSync';
import { audioSynth } from '../services/audioSynthesizer';
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
  onExploreEvents: () => void;
  onExploreGallery: () => void;
  onMakeDonation: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onExploreEvents,
  onExploreGallery,
  onMakeDonation
}) => {
  const [currentUser, setCurrentUser] = useState<UserMember | null>(null);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'passes' | 'donations'>('passes');
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(StorageService.getCurrentUser());
    setAllArtworks(StorageService.getGallery());

    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail);
    };
    window.addEventListener('kshestra_auth_changed', handleAuthChange);
    return () => window.removeEventListener('kshestra_auth_changed', handleAuthChange);
  }, []);

  if (!currentUser) {
    return (
      <div className="py-24 text-center max-w-xl mx-auto px-4">
        <h3 className="font-gambetta text-3xl font-bold text-[#5C1D24] mb-3">
          Sanctum Portal Restricted
        </h3>
        <p className="font-sans text-sm text-[#725C54] mb-6">
          Please sign in to access your registered event passes, calendar sync, and patron records.
        </p>
      </div>
    );
  }

  const handleDownloadICS = (ticket: TicketPurchase) => {
    audioSynth.playChime();
    const events = StorageService.getEvents();
    const event = events.find(e => e.id === ticket.eventId) || {
      id: ticket.eventId,
      title: ticket.eventTitle,
      date: ticket.eventDate,
      isoDate: '2026-10-10',
      time: ticket.eventTime,
      venue: ticket.eventVenue,
      city: 'Kolkata',
      price: ticket.totalAmount,
      category: 'Live Gathering' as const,
      capacity: 100,
      availableTickets: 50,
      description: `Official Kshestra Confluence: ${ticket.eventTitle}`,
      curatorNotes: '',
      featuredArtists: [],
      coverImage: '',
      tags: []
    };

    downloadICSFile(event, ticket);
    setCopiedPassId(ticket.id);
    setTimeout(() => setCopiedPassId(null), 2500);
  };

  const handleGoogleCalendar = (ticket: TicketPurchase) => {
    audioSynth.playChime();
    const events = StorageService.getEvents();
    const event = events.find(e => e.id === ticket.eventId) || {
      id: ticket.eventId,
      title: ticket.eventTitle,
      date: ticket.eventDate,
      isoDate: '2026-10-10',
      time: ticket.eventTime,
      venue: ticket.eventVenue,
      city: 'Kolkata',
      price: ticket.totalAmount,
      category: 'Live Gathering' as const,
      capacity: 100,
      availableTickets: 50,
      description: `Official Kshestra Confluence: ${ticket.eventTitle}`,
      curatorNotes: '',
      featuredArtists: [],
      coverImage: '',
      tags: []
    };

    const url = generateGoogleCalendarUrl(event, ticket);
    window.open(url, '_blank');
  };

  const handleLogout = () => {
    audioSynth.playChime();
    StorageService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* 1. Header Profile Banner */}
      <div className="rounded-xs p-6 sm:p-8 bg-[#FFFFFF] border border-[#3A2B27]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xs bg-[#5C1D24] text-[#FFF5E9] flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27]">
                {currentUser.name}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-xs bg-[#8A8E3E]/10 text-[#8A8E3E] font-semibold border border-[#8A8E3E]/30">
                Verified Resident
              </span>
            </div>
            <p className="text-xs text-[#725C54] font-mono">
              {currentUser.email} · Resident Since {currentUser.memberSince} · {currentUser.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onMakeDonation}
            data-cursor="pointer"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase rounded-xs bg-[#5C1D24] hover:bg-[#431319] text-[#FFF5E9] border border-[#3A2B27]/20 transition-all shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-[#8A8E3E]" />
            <span>Support the Flame (Donate)</span>
          </button>
          <button
            onClick={handleLogout}
            data-cursor="pointer"
            className="p-2.5 text-[#725C54] hover:text-[#5C1D24] hover:bg-[#FFF5E9] rounded-xs border border-[#3A2B27]/15 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-[#3A2B27]/15 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('passes')}
          data-cursor="pointer"
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSubTab === 'passes'
              ? 'border-[#5C1D24] text-[#5C1D24]'
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Reserved Gathering Passes ({currentUser.ticketPurchases?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('donations')}
          data-cursor="pointer"
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSubTab === 'donations'
              ? 'border-[#5C1D24] text-[#5C1D24]'
              : 'border-transparent text-[#725C54] hover:text-[#3A2B27]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Patronage & 80G Receipts ({currentUser.donations?.length || 0})</span>
        </button>
      </div>

      {/* 3. Passes Tab */}
      {activeSubTab === 'passes' && (
        <div className="space-y-6">
          {(!currentUser.ticketPurchases || currentUser.ticketPurchases.length === 0) ? (
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
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase rounded-xs bg-[#5C1D24] text-[#FFF5E9]"
              >
                <span>Browse Gatherings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentUser.ticketPurchases.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-xs bg-[#FFFFFF] border border-[#3A2B27]/15 p-6 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-[#3A2B27]/10 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#5C1D24] font-bold">
                          Digital Entry Pass
                        </span>
                        <h4 className="font-gambetta text-lg font-bold text-[#3A2B27]">
                          {ticket.eventTitle}
                        </h4>
                      </div>
                      <div className="font-mono text-xs font-bold text-[#5C1D24] bg-[#F6EADB] px-2.5 py-1 rounded-xs">
                        {ticket.ticketCode}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono text-[#725C54]">
                      <div className="flex items-center gap-2 text-[#3A2B27]">
                        <Clock className="w-3.5 h-3.5 text-[#5C1D24]" />
                        <span>{ticket.eventDate}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#8A8E3E] shrink-0 mt-0.5" />
                        <span>{ticket.eventVenue}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FFF5E9] rounded-xs border border-[#3A2B27]/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#725C54] block text-[10px]">Registered Name</span>
                        <span className="font-semibold text-[#3A2B27]">{ticket.buyerName} ({ticket.ticketCount} Seat)</span>
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
                      onClick={() => handleGoogleCalendar(ticket)}
                      data-cursor="pointer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-xs bg-[#F6EADB] text-[#3A2B27] hover:bg-[#EBE2D4] transition-colors"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#5C1D24]" />
                      <span>Google Cal</span>
                    </button>
                    <button
                      onClick={() => handleDownloadICS(ticket)}
                      data-cursor="pointer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-xs bg-[#FFF5E9] text-[#3A2B27] hover:bg-[#F6EADB] border border-[#3A2B27]/15 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8A8E3E]" />
                      <span>{copiedPassId === ticket.id ? 'Exported!' : 'Apple / Outlook .ICS'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Donations Tab */}
      {activeSubTab === 'donations' && (
        <div className="space-y-6">
          {(!currentUser.donations || currentUser.donations.length === 0) ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-xs border border-[#3A2B27]/15 p-8 space-y-4">
              <Flame className="w-10 h-10 text-[#5C1D24] mx-auto opacity-50" />
              <h4 className="font-gambetta text-xl font-bold text-[#3A2B27]">
                No Patronage Grants Recorded
              </h4>
              <p className="text-xs text-[#725C54] max-w-md mx-auto">
                Help build physical sanctuaries and fund emerging artist stipends in Kolkata.
              </p>
              <button
                onClick={onMakeDonation}
                data-cursor="pointer"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase rounded-xs bg-[#5C1D24] text-[#FFF5E9]"
              >
                <span>Support the Foundation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentUser.donations.map((don) => (
                <div
                  key={don.id}
                  className="rounded-xs bg-[#FFFFFF] border border-[#3A2B27]/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-gambetta text-lg font-bold text-[#3A2B27]">
                        {don.tierName}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#8A8E3E]/10 text-[#8A8E3E] rounded-xs">
                        80G Exemption Valid
                      </span>
                    </div>
                    <p className="text-xs text-[#725C54] font-mono">
                      Donation ID: {don.paymentId} · Date: {don.date} · Donor: {don.donorName}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <div className="font-serif text-2xl font-bold text-[#5C1D24]">
                      ₹{don.amount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-[#8A8E3E] font-mono uppercase font-bold">
                      Completed & Tax Credited
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
