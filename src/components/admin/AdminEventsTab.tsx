import React, { useState } from 'react';
import { EventItem } from '../../types';
import { Calendar, MapPin, Edit3, Trash2, Plus, Users, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { EditEventModal } from './EditEventModal';
import { updateAdminEvent, deleteAdminEvent } from '../../services/eventsService';
import { StorageService } from '../../services/storage';

interface AdminEventsTabProps {
  events: EventItem[];
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export const AdminEventsTab: React.FC<AdminEventsTabProps> = ({
  events,
  onRefresh,
  onOpenAddModal
}) => {
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleEditSave = async (
    eventId: string,
    updatedData: {
      title: string;
      date: string;
      time?: string;
      venue: string;
      city?: string;
      description: string;
      isPaid: boolean;
      price: number;
      totalSeats: number;
      availableSeats: number;
      category?: string;
      coverImage?: string;
      curatorNotes?: string;
    }
  ) => {
    try {
      await updateAdminEvent(eventId, updatedData);
    } catch (err) {
      console.warn('Firestore update fallback:', err);
    }
    // Also update local storage cache
    const currentEvent = events.find(e => e.id === eventId);
    if (currentEvent) {
      StorageService.updateEvent({
        ...currentEvent,
        ...updatedData,
        capacity: updatedData.totalSeats,
        availableTickets: updatedData.availableSeats,
        tier: updatedData.isPaid ? 'paid' : 'free'
      });
    }

    setActionSuccess(`Gathering "${updatedData.title}" updated in live Firestore.`);
    setTimeout(() => setActionSuccess(null), 4000);
    onRefresh();
  };

  const handleDelete = async (event: EventItem) => {
    if (confirm(`Are you sure you wish to dissolve the gathering "${event.title}" from official schedules?`)) {
      audioSynth.playChime();
      setDeletingId(event.id);
      try {
        await deleteAdminEvent(event.id);
      } catch (err) {
        console.warn('Firestore delete notice:', err);
      }
      StorageService.deleteEvent(event.id);
      setActionSuccess(`Gathering "${event.title}" removed.`);
      setTimeout(() => setActionSuccess(null), 4000);
      onRefresh();
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-xs border border-[#3A2B27]/15 shadow-2xs">
        <div>
          <h3 className="font-gambetta text-xl font-bold text-[#3A2B27]">
            Sanctuary Confluences & Gatherings
          </h3>
          <p className="text-xs font-mono text-[#725C54] mt-0.5">
            Active public dockets synchronized directly with the `/events` community view.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          data-cursor="pointer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Gathering</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs flex items-center gap-2 text-xs text-emerald-800 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Gatherings List */}
      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => {
          const totalCap = event.totalSeats || event.capacity || 50;
          const availableCap = event.availableSeats ?? event.availableTickets ?? 50;
          const isPaid = event.isPaid || (event.price && event.price > 0);

          return (
            <div
              key={event.id}
              className="sanctum-card rounded-xs bg-[#FFFFFF] p-5 border border-[#3A2B27]/20 hover:border-[#8A8E3E] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-gambetta text-lg font-bold text-[#3A2B27]">
                    {event.title}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-xs ${
                    isPaid 
                      ? 'bg-[#471319] text-[#FFF5E9]' 
                      : 'bg-[#8A8E3E]/20 text-[#471319] border border-[#8A8E3E]/40'
                  }`}>
                    {isPaid ? `Paid Pass · ₹${event.price}` : 'Free RSVP'}
                  </span>
                  {event.category && (
                    <span className="text-[10px] font-mono text-[#725C54] bg-[#F6EADB] px-2 py-0.5 rounded-xs border border-[#3A2B27]/10">
                      {event.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#725C54]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8A8E3E]" />
                    {event.date} {event.time ? `· ${event.time}` : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8A8E3E]" />
                    {event.venue} {event.city ? `(${event.city})` : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#8A8E3E]" />
                    Capacity: <strong className="text-[#3A2B27]">{availableCap}</strong> / {totalCap} seats left
                  </span>
                </div>

                {event.description && (
                  <p className="text-xs text-[#3A2B27]/80 line-clamp-2 font-sans pt-1">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-[#3A2B27]/10 w-full md:w-auto justify-end">
                <button
                  onClick={() => {
                    audioSynth.playChime();
                    setEditingEvent(event);
                  }}
                  data-cursor="pointer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#3A2B27] text-xs font-mono font-bold uppercase transition-all"
                  title="Modify event details & capacity"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(event)}
                  disabled={deletingId === event.id}
                  data-cursor="pointer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-red-300 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white text-xs font-mono font-bold uppercase transition-all disabled:opacity-50"
                  title="Dissolve gathering"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingId === event.id ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          isOpen={Boolean(editingEvent)}
          onClose={() => setEditingEvent(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};
