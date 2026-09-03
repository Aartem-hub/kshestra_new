import React, { useState, useEffect } from 'react';
import { EventItem, Artwork, GazetteArticle, DonationRecord, TicketPurchase } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Flame, 
  Image as ImageIcon, 
  BookOpen, 
  Users, 
  Download,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { KshestraLogo } from './KshestraLogo';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'dispatches' | 'gallery' | 'donations'>('overview');
  
  // Data States
  const [events, setEvents] = useState<EventItem[]>([]);
  const [dispatches, setDispatches] = useState<GazetteArticle[]>([]);
  const [gallery, setGallery] = useState<Artwork[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [tickets, setTickets] = useState<TicketPurchase[]>([]);

  // Modals for adding content
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // New Event Form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventBengali, setNewEventBengali] = useState('');
  const [newEventDate, setNewEventDate] = useState('Saturday, Nov 14 · 6:00 PM IST');
  const [newEventTime, setNewEventTime] = useState('6:00 PM IST');
  const [newEventVenue, setNewEventVenue] = useState('Kshestra Courtyard, South Kolkata');
  const [newEventPrice, setNewEventPrice] = useState('199');
  const [newEventCategory, setNewEventCategory] = useState<string>('Live Performance & Acoustic Poetry');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventCover, setNewEventCover] = useState('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setEvents(StorageService.getEvents());
    setDispatches(StorageService.getDispatches());
    setGallery(StorageService.getGallery());
    setDonations(StorageService.getDonations());
    setTickets(StorageService.getTickets());
  };

  // Metrics
  const totalDonationAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalTicketsIssued = tickets.reduce((sum, t) => sum + (t.ticketCount || 0), 0);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    audioSynth.playChime();
    const created: EventItem = {
      id: `evt-ksh-${Date.now()}`,
      title: newEventTitle || 'New Gathering',
      date: newEventDate,
      isoDate: '2026-11-14',
      time: newEventTime,
      venue: newEventVenue,
      city: 'Kolkata',
      price: parseInt(newEventPrice, 10) || 0,
      category: newEventCategory as any,
      capacity: 80,
      availableTickets: 80,
      description: newEventDescription || 'Independent artist gathering hosted by Kshestra Cultural Trust.',
      curatorNotes: 'Sanctum entry and open circle dialogue.',
      featuredArtists: ['Kshestra Resident Artists'],
      coverImage: newEventCover,
      tags: ['Independent Art', 'Kshestra Sanctuary']
    };
    StorageService.addEvent(created);
    loadAllData();
    setShowAddEventModal(false);
    setNewEventTitle('');
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to remove this gathering from the schedule?')) {
      audioSynth.playChime();
      StorageService.deleteEvent(id);
      loadAllData();
    }
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* Header Banner */}
      <div className="sanctum-card rounded-sm p-6 sm:p-8 bg-[#F6EADB] text-[#3A2B27] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border border-[#3A2B27]/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-[#5C1D24] flex items-center justify-center p-2 shadow-xs">
            <KshestraLogo variant="white" className="w-full h-full text-[#FFF5E9]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5C1D24]" />
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#3A2B27]">
                Trustee Administration Desk
              </h2>
            </div>
            <p className="text-xs text-[#725C54] font-mono">
              Kshestra Foundation · Non-Profit Stewardship & Fiscal Ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddEventModal(true)}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase rounded-sm bg-[#5C1D24] text-[#FFF5E9] hover:bg-[#431319] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Gathering</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="sanctum-card rounded-sm p-6 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-2">
          <span className="text-[11px] font-mono uppercase text-[#725C54] font-semibold">
            Total Public Patronage
          </span>
          <div className="font-serif text-3xl font-bold text-[#5C1D24]">
            ₹{totalDonationAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#8A8E3E] font-mono">
            100% Allocated to Artist Residencies & Sanctums
          </p>
        </div>

        <div className="sanctum-card rounded-sm p-6 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-2">
          <span className="text-[11px] font-mono uppercase text-[#725C54] font-semibold">
            Gathering Passes Issued
          </span>
          <div className="font-serif text-3xl font-bold text-[#3A2B27]">
            {totalTicketsIssued} Passes
          </div>
          <p className="text-[11px] text-[#725C54] font-mono">
            Intimate Courtyard & Workshop Capacity
          </p>
        </div>

        <div className="sanctum-card rounded-sm p-6 bg-[#FFFFFF] border border-[#3A2B27]/15 space-y-2">
          <span className="text-[11px] font-mono uppercase text-[#725C54] font-semibold">
            Active Confluences
          </span>
          <div className="font-serif text-3xl font-bold text-[#8A8E3E]">
            {events.length} Gatherings
          </div>
          <p className="text-[11px] text-[#725C54] font-mono">
            Kolkata Physical Sanctum
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#3A2B27]/15 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('events')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 ${
            activeTab === 'events' ? 'border-[#5C1D24] text-[#5C1D24]' : 'border-transparent text-[#725C54]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Gatherings ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatches')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 ${
            activeTab === 'dispatches' ? 'border-[#5C1D24] text-[#5C1D24]' : 'border-transparent text-[#725C54]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Dispatches ({dispatches.length})</span>
        </button>
      </div>

      {/* Events List */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="sanctum-card rounded-sm bg-[#FFFFFF] border border-[#3A2B27]/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#5C1D24] font-bold">
                    {evt.category}
                  </span>
                  <span className="text-xs text-[#725C54]">· {evt.date}</span>
                </div>
                <h4 className="font-serif-display text-lg font-bold text-[#3A2B27]">
                  {evt.title}
                </h4>
                <p className="text-xs text-[#725C54] font-mono">
                  {evt.venue} · ₹{evt.price}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  data-cursor="pointer"
                  className="p-2 text-[#5C1D24] hover:bg-[#5C1D24]/10 rounded-sm transition-colors"
                  title="Delete Gathering"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatches List */}
      {activeTab === 'dispatches' && (
        <div className="space-y-4">
          {dispatches.map((disp) => (
            <div
              key={disp.id}
              className="sanctum-card rounded-sm bg-[#FFFFFF] border border-[#3A2B27]/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#5C1D24] font-bold">
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
                className="p-1 hover:bg-[#5C1D24] hover:text-[#FFF5E9] rounded-sm"
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
                  <label className="font-semibold block text-[#3A2B27]">Ticket Tier (₹)</label>
                  <input
                    type="number"
                    value={newEventPrice}
                    onChange={(e) => setNewEventPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm"
                  />
                </div>
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
                  className="px-5 py-2 rounded-sm bg-[#5C1D24] text-[#FFF5E9] font-bold uppercase"
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
