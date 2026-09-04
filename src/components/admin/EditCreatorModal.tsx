import React, { useState } from 'react';
import { X, User, MapPin, Calendar, Award, AlertCircle } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { updateUserProfile } from '../../services/adminService';

interface EditCreatorModalProps {
  creator: {
    uid: string;
    name: string;
    email: string;
    residentSince: string;
    location: string;
    role?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const EditCreatorModal: React.FC<EditCreatorModalProps> = ({
  creator,
  isOpen,
  onClose,
  onSaved
}) => {
  const [name, setName] = useState(creator.name);
  const [residentSince, setResidentSince] = useState(creator.residentSince || '2026');
  const [location, setLocation] = useState(creator.location || 'Kolkata, WB');
  const [role, setRole] = useState(creator.role || 'member');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Creator Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      audioSynth.playChime();
      await updateUserProfile(creator.uid, {
        name: name.trim(),
        residentSince: residentSince.trim(),
        location: location.trim(),
        role: role.trim()
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update resident profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A2B27]/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#FFF5E9] border-2 border-[#471319] rounded-xs shadow-2xl p-6 sm:p-8 my-8 text-[#3A2B27]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3A2B27]/15">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8E3E] font-bold">
              Resident Registry Audit · UID: {creator.uid.substring(0, 10)}...
            </span>
            <h3 className="font-gambetta text-2xl font-bold text-[#471319]">
              Edit Creator Credentials
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
          {/* Readonly Email */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Registered Email (Immutable Credential)
            </label>
            <input
              type="text"
              disabled
              value={creator.email}
              className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/15 bg-[#F6EADB] text-[#725C54] cursor-not-allowed font-sans text-xs"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Display / Artist Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319] text-sm font-sans"
              />
              <User className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Residency Year & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Residency Year
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={residentSince}
                  onChange={(e) => setResidentSince(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
                  placeholder="2026"
                />
                <Calendar className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Resident City / Hub
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
                  placeholder="Kolkata, WB"
                />
                <MapPin className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Role Badge / Fellowship Tier
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
              >
                <option value="member">Resident Artist / Member</option>
                <option value="fellow">Fellowship Resident</option>
                <option value="mentor">Studio Mentor / Master Craftsman</option>
                <option value="curator">Guest Curator</option>
                <option value="admin">Trustee / Admin</option>
              </select>
              <Award className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
            </div>
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
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
