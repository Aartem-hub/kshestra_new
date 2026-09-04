import React, { useState, useEffect } from 'react';
import { UserPass } from '../../types';
import { X, Ticket, Calendar, MapPin, Ban, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { fetchUserPasses, revokeUserPass } from '../../services/adminService';

interface PassAuditModalProps {
  user: {
    uid: string;
    name: string;
    email: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onPassesUpdated?: () => void;
}

export const PassAuditModal: React.FC<PassAuditModalProps> = ({
  user,
  isOpen,
  onClose,
  onPassesUpdated
}) => {
  const [passes, setPasses] = useState<UserPass[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const loadPasses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const userPasses = await fetchUserPasses(user.uid);
      setPasses(userPasses);
    } catch (err: any) {
      setError(err?.message || 'Failed to inspect user passes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPasses();
    }
  }, [isOpen, user.uid]);

  if (!isOpen) return null;

  const handleRevoke = async (passId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to revoke pass for "${eventTitle}"? This will mark the pass as cancelled in official records.`)) {
      audioSynth.playChime();
      setRevokingId(passId);
      try {
        await revokeUserPass(user.uid, passId);
        await loadPasses();
        if (onPassesUpdated) onPassesUpdated();
      } catch (err: any) {
        alert(err?.message || 'Failed to revoke pass.');
      } finally {
        setRevokingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A2B27]/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#FFF5E9] border-2 border-[#471319] rounded-xs shadow-2xl p-6 sm:p-8 my-8 text-[#3A2B27] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3A2B27]/15 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8E3E] font-bold">
              Pass Ledger Audit & Security Inspector
            </span>
            <h3 className="font-gambetta text-2xl font-bold text-[#471319]">
              {user.name} · Passes Docket
            </h3>
            <p className="text-xs font-mono text-[#725C54]">
              {user.email} (UID: {user.uid.substring(0, 12)}...)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadPasses}
              className="p-1.5 text-[#725C54] hover:text-[#471319] hover:bg-[#F6EADB] rounded-xs transition-colors"
              title="Refresh passes"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#725C54] hover:text-[#471319] hover:bg-[#F6EADB] rounded-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-mono text-[#725C54] animate-pulse">
              Auditing Firestore pass collections...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-xs text-xs font-mono text-red-800">
              {error}
            </div>
          ) : passes.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-[#FFFFFF] border border-[#3A2B27]/15 rounded-xs p-6">
              <Ticket className="w-8 h-8 text-[#8A8E3E] mx-auto opacity-50" />
              <p className="text-sm font-gambetta font-bold text-[#3A2B27]">No Passes Found</p>
              <p className="text-xs font-mono text-[#725C54]">
                This resident has not claimed or purchased any gathering passes yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passes.map((pass) => {
                const isCancelled = pass.status === 'cancelled';
                return (
                  <div 
                    key={pass.id}
                    className={`p-4 rounded-xs border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCancelled 
                        ? 'bg-red-50/50 border-red-200 opacity-75' 
                        : 'bg-[#FFFFFF] border-[#3A2B27]/20 hover:border-[#8A8E3E]'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-gambetta text-base font-bold text-[#3A2B27]">
                          {pass.eventTitle}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-xs ${
                          isCancelled 
                            ? 'bg-red-100 text-red-800 border border-red-300' 
                            : 'bg-[#8A8E3E]/20 text-[#471319] border border-[#8A8E3E]/40'
                        }`}>
                          {pass.status || 'Active'}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#F6EADB] text-[#725C54] rounded-xs border border-[#3A2B27]/10">
                          {pass.tier || (pass.isPaid ? 'Paid Pass' : 'Free RSVP')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#725C54]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8A8E3E]" />
                          {pass.eventDate}
                        </span>
                        {pass.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#8A8E3E]" />
                            {pass.venue}
                          </span>
                        )}
                        {pass.ticketCode && (
                          <span className="text-[10px] font-bold text-[#471319]">
                            Code: {pass.ticketCode}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {!isCancelled ? (
                        <button
                          type="button"
                          onClick={() => handleRevoke(pass.id, pass.eventTitle)}
                          disabled={revokingId === pass.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-red-400 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-mono text-[10px] font-bold uppercase transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3 h-3" />
                          <span>{revokingId === pass.id ? 'Revoking...' : 'Revoke Pass'}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-700 font-bold uppercase px-2 py-1 bg-red-100 rounded-xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Revoked</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#3A2B27]/15 mt-4 shrink-0 flex items-center justify-between text-xs font-mono text-[#725C54]">
          <span>Total passes tracked: {passes.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold uppercase rounded-xs border border-[#3A2B27]/20 hover:bg-[#F6EADB] transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
