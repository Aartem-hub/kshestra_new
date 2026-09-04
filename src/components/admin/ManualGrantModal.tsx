import React, { useState } from 'react';
import { GrantRecord } from '../../types';
import { X, DollarSign, User, Mail, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { createGrantRecord } from '../../services/adminService';

interface ManualGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (grant: GrantRecord) => void;
}

export const ManualGrantModal: React.FC<ManualGrantModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [proposedProject, setProposedProject] = useState('');
  const [discipline, setDiscipline] = useState('Visual Arts & Sculpture');
  const [requestedAmount, setRequestedAmount] = useState('25000');
  const [status, setStatus] = useState<GrantRecord['status']>('Pending Review');
  const [curatorNotes, setCuratorNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!applicantName.trim() || !email.trim() || !proposedProject.trim()) {
      setError('Applicant Name, Email, and Proposed Project are required.');
      return;
    }

    const amount = parseFloat(requestedAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please provide a valid requested grant amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      audioSynth.playChime();
      const newGrant = await createGrantRecord({
        applicantName: applicantName.trim(),
        email: email.trim(),
        submissionDate: submissionDate.trim(),
        proposedProject: proposedProject.trim(),
        discipline: discipline.trim(),
        requestedAmount: amount,
        status,
        curatorNotes: curatorNotes.trim()
      });
      onCreated(newGrant);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record grant entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A2B27]/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[#FFF5E9] border-2 border-[#471319] rounded-xs shadow-2xl p-6 sm:p-8 my-8 text-[#3A2B27]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3A2B27]/15">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8E3E] font-bold">
              Kshestra Foundation Grants Docket
            </span>
            <h3 className="font-gambetta text-2xl font-bold text-[#471319]">
              Inscribe Grant Application
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
          {/* Applicant Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Applicant Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319] font-sans"
                  placeholder="e.g. Anirban Roy"
                />
                <User className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Applicant Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
                  placeholder="applicant@sanctuary.in"
                />
                <Mail className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Submission Date & Discipline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Application Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
                />
                <Calendar className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Artistic Discipline
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
              >
                <option value="Visual Arts & Sculpture">Visual Arts & Sculpture</option>
                <option value="Sound, Baul & Oral History">Sound, Baul & Oral History</option>
                <option value="Cinema & Regional Documentary">Cinema & Regional Documentary</option>
                <option value="Indigenous Craft & Textiles">Indigenous Craft & Textiles</option>
                <option value="Theatre & Vernacular Literature">Theatre & Vernacular Literature</option>
                <option value="Emergency Artist Relief">Emergency Artist Relief</option>
              </select>
            </div>
          </div>

          {/* Amount & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Requested Grant (INR) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className="w-full px-3.5 py-2 pl-8 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-bold"
                  placeholder="25000"
                />
                <span className="absolute left-3 top-2.5 text-[#725C54] font-bold">₹</span>
              </div>
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Status Designation
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-bold"
              >
                <option value="Pending Review">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Disbursed">Disbursed</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Proposed Project Title & Summary */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Proposed Project / Work Synopsis *
            </label>
            <textarea
              rows={3}
              required
              value={proposedProject}
              onChange={(e) => setProposedProject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-sans text-xs leading-relaxed"
              placeholder="Detail the creative scope, material requirements, and expected impact on the regional ecosystem..."
            />
          </div>

          {/* Curator Notes */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Curator & Trustee Review Remarks
            </label>
            <input
              type="text"
              value={curatorNotes}
              onChange={(e) => setCuratorNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-sans text-xs"
              placeholder="e.g. Approved in Session #14; studio allocation pending"
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
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Inscribing in Ledger...' : 'Log Grant Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
