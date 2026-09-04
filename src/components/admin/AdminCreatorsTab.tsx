import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Edit, 
  Ticket, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Award,
  RefreshCw 
} from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { EditCreatorModal } from './EditCreatorModal';
import { PassAuditModal } from './PassAuditModal';

interface CreatorItem {
  uid: string;
  name: string;
  email: string;
  createdAt: any;
  residentSince: string;
  location: string;
  role: string;
  hasCustomProfile: boolean;
}

interface AdminCreatorsTabProps {
  creators: CreatorItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminCreatorsTab: React.FC<AdminCreatorsTabProps> = ({
  creators,
  isLoading,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const [editingCreator, setEditingCreator] = useState<CreatorItem | null>(null);
  const [auditingUser, setAuditingUser] = useState<{ uid: string; name: string; email: string } | null>(null);

  const filteredCreators = useMemo(() => {
    let list = creators;

    if (roleFilter !== 'all') {
      list = list.filter((c) => {
        if (roleFilter === 'admin') return c.role === 'admin';
        if (roleFilter === 'fellow') return c.role === 'fellow';
        if (roleFilter === 'member') return c.role === 'member' || !c.role;
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.uid.toLowerCase().includes(q)
      );
    }

    return list;
  }, [creators, searchQuery, roleFilter]);

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

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-[#FFFFFF] p-5 rounded-xs border border-[#3A2B27]/15 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-gambetta text-xl font-bold text-[#3A2B27]">
              Resident Creator & User Directory
            </h3>
            <p className="text-xs font-mono text-[#725C54] mt-0.5">
              Verified resident artists, passholders, and curatorial fellows recorded in Firestore (`users` collection).
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#3A2B27] transition-all disabled:opacity-50 shrink-0 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#471319]' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Reload Directory'}</span>
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creator by name, email, location, or UID..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#8A8E3E] shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-mono rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] text-[#3A2B27]"
            >
              <option value="all">All Roles ({creators.length})</option>
              <option value="member">Resident Artists / Members</option>
              <option value="fellow">Fellowship Residents</option>
              <option value="admin">Trustees & Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Creators Cards / Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCreators.map((creator) => (
          <div
            key={creator.uid}
            className="sanctum-card rounded-xs bg-[#FFFFFF] p-5 border border-[#3A2B27]/20 hover:border-[#8A8E3E] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-gambetta text-lg font-bold text-[#3A2B27]">
                  {creator.name}
                </span>
                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-xs ${
                  creator.role === 'admin' 
                    ? 'bg-[#471319] text-[#FFF5E9]' 
                    : creator.role === 'fellow'
                    ? 'bg-[#8A8E3E] text-[#FFF5E9]'
                    : 'bg-[#F6EADB] text-[#725C54] border border-[#3A2B27]/10'
                }`}>
                  {creator.role || 'Member'}
                </span>
                <span className="text-[10px] font-mono text-[#725C54] bg-[#FFF5E9] px-2 py-0.5 rounded-xs border border-[#3A2B27]/10">
                  {creator.email}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#725C54]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  {creator.location || 'Kolkata, WB'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  Resident Since {creator.residentSince || '2026'}
                </span>
                <button
                  onClick={() => handleCopyUid(creator.uid)}
                  className="flex items-center gap-1 text-[10px] font-mono hover:text-[#471319] transition-colors"
                  title="Copy Firestore UID"
                >
                  {copiedUid === creator.uid ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">UID Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#8A8E3E]" />
                      <span>UID: {creator.uid.substring(0, 8)}...</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions: Edit Creator & Audit Passes */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-[#3A2B27]/10 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  audioSynth.playChime();
                  setAuditingUser({
                    uid: creator.uid,
                    name: creator.name,
                    email: creator.email
                  });
                }}
                data-cursor="pointer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs border border-[#3A2B27]/20 bg-[#F6EADB] hover:bg-[#FFFFFF] text-[#3A2B27] text-xs font-mono font-bold uppercase transition-all"
                title="View and revoke gathering passes"
              >
                <Ticket className="w-3.5 h-3.5 text-[#8A8E3E]" />
                <span>Audit Passes</span>
              </button>

              <button
                onClick={() => {
                  audioSynth.playChime();
                  setEditingCreator(creator);
                }}
                data-cursor="pointer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs border border-[#471319]/30 bg-[#FFF5E9] hover:bg-[#471319] text-[#471319] hover:text-[#FFF5E9] text-xs font-mono font-bold uppercase transition-all"
                title="Modify creator profile in Firestore"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Creator</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCreator && (
        <EditCreatorModal
          creator={editingCreator}
          isOpen={Boolean(editingCreator)}
          onClose={() => setEditingCreator(null)}
          onSaved={onRefresh}
        />
      )}

      {/* Pass Audit Modal */}
      {auditingUser && (
        <PassAuditModal
          user={auditingUser}
          isOpen={Boolean(auditingUser)}
          onClose={() => setAuditingUser(null)}
          onPassesUpdated={onRefresh}
        />
      )}
    </div>
  );
};
