import React, { useState, useMemo } from 'react';
import { GrantRecord } from '../../types';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Mail, 
  User, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  CheckCheck, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { updateGrantStatus, deleteGrantRecord } from '../../services/adminService';
import { ManualGrantModal } from './ManualGrantModal';

interface AdminGrantsTabProps {
  grants: GrantRecord[];
  onRefresh: () => void;
}

export const AdminGrantsTab: React.FC<AdminGrantsTabProps> = ({
  grants,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredGrants = useMemo(() => {
    let list = grants;
    if (statusFilter !== 'all') {
      list = list.filter(g => g.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(g => 
        g.applicantName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.proposedProject.toLowerCase().includes(q) ||
        g.discipline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [grants, searchQuery, statusFilter]);

  const totalDisbursed = useMemo(() => {
    return grants
      .filter(g => g.status === 'Disbursed')
      .reduce((sum, g) => sum + (g.requestedAmount || 0), 0);
  }, [grants]);

  const totalCommitted = useMemo(() => {
    return grants
      .filter(g => g.status === 'Approved' || g.status === 'Disbursed')
      .reduce((sum, g) => sum + (g.requestedAmount || 0), 0);
  }, [grants]);

  const handleStatusChange = async (grantId: string, newStatus: GrantRecord['status']) => {
    audioSynth.playChime();
    setUpdatingId(grantId);
    try {
      await updateGrantStatus(grantId, newStatus);
      setFeedback(`Grant #${grantId.substring(0, 7)} updated to "${newStatus}".`);
      setTimeout(() => setFeedback(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to update grant status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (grant: GrantRecord) => {
    if (confirm(`Are you sure you wish to dissolve the grant record for "${grant.applicantName}"?`)) {
      audioSynth.playChime();
      setDeletingId(grant.id);
      try {
        await deleteGrantRecord(grant.id);
        setFeedback(`Grant record dissolved.`);
        setTimeout(() => setFeedback(null), 3000);
        onRefresh();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete grant record.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Ledger Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-xs border border-[#3A2B27]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#725C54] font-semibold">
            Total Inscribed Submissions
          </span>
          <div className="font-gambetta text-2xl font-bold text-[#3A2B27]">
            {grants.length} Applications
          </div>
          <p className="text-[10px] text-[#8A8E3E] font-mono">
            {grants.filter(g => g.status === 'Pending Review').length} awaiting curatorial review
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-xs border border-[#3A2B27]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#725C54] font-semibold">
            Funds Disbursed to Date
          </span>
          <div className="font-gambetta text-2xl font-bold text-[#471319]">
            ₹{totalDisbursed.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-[#725C54] font-mono">
            Released directly to creators
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-xs border border-[#3A2B27]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#725C54] font-semibold">
            Total Committed Capital
          </span>
          <div className="font-gambetta text-2xl font-bold text-[#8A8E3E]">
            ₹{totalCommitted.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-[#725C54] font-mono">
            Approved & Disbursed grants
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#FFFFFF] p-5 rounded-xs border border-[#3A2B27]/15 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-gambetta text-xl font-bold text-[#3A2B27]">
              Kshestra Community & Artist Grants Ledger
            </h3>
            <p className="text-xs font-mono text-[#725C54] mt-0.5">
              Live grant tracking synchronized directly with Firestore (`grants` collection).
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Grant Record</span>
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by applicant, email, project, or discipline..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#8A8E3E] shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-mono rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] text-[#3A2B27]"
            >
              <option value="all">All Statuses ({grants.length})</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs flex items-center gap-2 text-xs text-emerald-800 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Ledger Table / Card View */}
      <div className="space-y-4">
        {filteredGrants.map((grant) => {
          const isPending = grant.status === 'Pending Review';
          const isApproved = grant.status === 'Approved';
          const isDisbursed = grant.status === 'Disbursed';
          const isDeclined = grant.status === 'Declined';

          return (
            <div
              key={grant.id}
              className="sanctum-card rounded-xs bg-[#FFFFFF] p-5 border border-[#3A2B27]/20 hover:border-[#8A8E3E] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-gambetta text-lg font-bold text-[#3A2B27]">
                    {grant.applicantName}
                  </span>
                  <span className="text-xs font-mono text-[#725C54] bg-[#F6EADB] px-2 py-0.5 rounded-xs border border-[#3A2B27]/10">
                    {grant.email}
                  </span>
                  <span className="text-[10px] font-mono text-[#471319] bg-[#471319]/10 px-2 py-0.5 rounded-xs font-bold uppercase">
                    {grant.discipline}
                  </span>
                </div>

                <p className="font-sans text-xs text-[#3A2B27] font-medium leading-relaxed">
                  {grant.proposedProject}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#725C54]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8A8E3E]" />
                    Applied: {grant.submissionDate}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#471319]">
                    Requested: ₹{grant.requestedAmount?.toLocaleString('en-IN')}
                  </span>
                  {grant.curatorNotes && (
                    <span className="text-[11px] text-[#725C54] italic">
                      Remarks: "{grant.curatorNotes}"
                    </span>
                  )}
                </div>
              </div>

              {/* Status Controls & Deletion */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-[#3A2B27]/10 w-full lg:w-auto justify-end">
                {/* Status Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#725C54] font-bold">
                    Status:
                  </span>
                  <select
                    disabled={updatingId === grant.id}
                    value={grant.status}
                    onChange={(e) => handleStatusChange(grant.id, e.target.value as any)}
                    className={`px-3 py-1.5 rounded-xs text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                      isDisbursed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : isApproved
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : isPending
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-red-50 text-red-800 border-red-300'
                    }`}
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Disbursed">Disbursed</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>

                {/* Delete Record */}
                <button
                  onClick={() => handleDelete(grant)}
                  disabled={deletingId === grant.id}
                  className="p-1.5 rounded-xs border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                  title="Dissolve grant entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Grant Modal */}
      {showAddModal && (
        <ManualGrantModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setFeedback('Manual grant inscribed in official ledger.');
            setTimeout(() => setFeedback(null), 3000);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
