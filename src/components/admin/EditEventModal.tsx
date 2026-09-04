import React, { useState } from 'react';
import { EventItem } from '../../types';
import { X, Calendar, MapPin, DollarSign, Users, AlertCircle, Sparkles } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';

interface EditEventModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: string, updatedData: {
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
  }) => Promise<void>;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time || '6:00 PM IST');
  const [venue, setVenue] = useState(event.venue);
  const [city, setCity] = useState(event.city || 'Kolkata, WB');
  const [description, setDescription] = useState(event.description || '');
  const [isPaid, setIsPaid] = useState(Boolean(event.isPaid || event.price > 0));
  const [price, setPrice] = useState(String(event.price || 0));
  const [totalSeats, setTotalSeats] = useState(String(event.totalSeats || event.capacity || 50));
  const [availableSeats, setAvailableSeats] = useState(String(event.availableSeats ?? event.availableTickets ?? 50));
  const [category, setCategory] = useState(event.category || 'Live Performance & Acoustic Poetry');
  const [coverImage, setCoverImage] = useState(event.coverImage || '');
  const [curatorNotes, setCuratorNotes] = useState(event.curatorNotes || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const parsedTotal = parseInt(totalSeats, 10);
    const parsedAvailable = parseInt(availableSeats, 10);
    const parsedPrice = isPaid ? parseFloat(price) : 0;

    if (!title.trim()) {
      setError('Event Title is required.');
      return;
    }
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setError('Total capacity must be a positive integer.');
      return;
    }
    if (isNaN(parsedAvailable) || parsedAvailable < 0) {
      setError('Available seats cannot be negative.');
      return;
    }
    if (parsedAvailable > parsedTotal) {
      setError('Available seats cannot exceed total capacity.');
      return;
    }

    setIsSubmitting(true);
    try {
      audioSynth.playChime();
      await onSave(event.id, {
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        venue: venue.trim(),
        city: city.trim(),
        description: description.trim(),
        isPaid,
        price: parsedPrice,
        totalSeats: parsedTotal,
        availableSeats: parsedAvailable,
        category,
        coverImage: coverImage.trim(),
        curatorNotes: curatorNotes.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to modify gathering record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A2B27]/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#FFF5E9] border-2 border-[#471319] rounded-xs shadow-2xl p-6 sm:p-8 my-8 text-[#3A2B27] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3A2B27]/15">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8E3E] font-bold">
              Trustee Curatorial Docket · ID: {event.id}
            </span>
            <h3 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#471319]">
              Edit Gathering Schedule
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#725C54] hover:text-[#471319] hover:bg-[#F6EADB] rounded-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-600 rounded-xs flex items-center gap-2 text-xs text-red-800 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs font-mono">
          
          {/* Title */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Gathering Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319] text-sm font-sans"
              placeholder="e.g. Baul Acoustic Circle & Vernacular Poetry"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Date String *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
                  placeholder="e.g. Saturday, Nov 14, 2026"
                />
                <Calendar className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Conclave Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
                placeholder="6:00 PM IST"
              />
            </div>
          </div>

          {/* Venue & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Hall / Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
                  placeholder="Kshestra Courtyard, South Kolkata"
                />
                <MapPin className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                City / Chapter
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
                placeholder="Kolkata, WB"
              />
            </div>
          </div>

          {/* Ticket Type, Price, Capacity & Remaining Seats */}
          <div className="p-4 bg-[#F6EADB] border border-[#3A2B27]/15 rounded-xs space-y-4">
            <div className="text-[11px] font-bold uppercase text-[#471319] tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#8A8E3E]" />
              <span>Ticketing & Real-Time Capacity Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ticket Type */}
              <div>
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Pass Structure
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaid(false);
                      setPrice('0');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-xs text-xs font-bold uppercase transition-all ${
                      !isPaid 
                        ? 'bg-[#8A8E3E] text-[#FFF5E9] border border-[#8A8E3E]' 
                        : 'bg-[#FFFFFF] text-[#725C54] border border-[#3A2B27]/20'
                    }`}
                  >
                    Free RSVP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaid(true);
                      if (price === '0') setPrice('199');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-xs text-xs font-bold uppercase transition-all ${
                      isPaid 
                        ? 'bg-[#471319] text-[#FFF5E9] border border-[#471319]' 
                        : 'bg-[#FFFFFF] text-[#725C54] border border-[#3A2B27]/20'
                    }`}
                  >
                    Paid Pass
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Pass Price (INR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    disabled={!isPaid}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-1.5 pl-8 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] disabled:opacity-50 disabled:bg-[#F6EADB]"
                    placeholder="199"
                  />
                  <span className="absolute left-3 top-2 text-[#725C54] font-bold">₹</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Total Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value)}
                  required
                  className="w-full px-3.5 py-1.5 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Available Remaining Seats
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalSeats}
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(e.target.value)}
                  required
                  className="w-full px-3.5 py-1.5 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Discipline Category */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Artistic Discipline
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
            >
              <option value="Live Performance & Acoustic Poetry">Live Performance & Acoustic Poetry</option>
              <option value="Visual Arts & Sculpture Lab">Visual Arts & Sculpture Lab</option>
              <option value="Cinema & Documentary Dialogue">Cinema & Documentary Dialogue</option>
              <option value="Folk & Oral Traditions Circle">Folk & Oral Traditions Circle</option>
              <option value="Craft, Clay & Printmaking">Craft, Clay & Printmaking</option>
              <option value="Residency Open Studio">Residency Open Studio</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Curatorial Overview & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-sans text-xs leading-relaxed"
              placeholder="Provide context, artist intentions, and gathering narrative..."
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Cover Image Keyframe URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A2B27]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase rounded-xs border border-[#3A2B27]/20 hover:bg-[#F6EADB] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Synchronizing with Firestore...' : 'Update Gathering'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
