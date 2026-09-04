import React, { useState, useMemo } from 'react';
import { ArchiveRecord } from '../../types';
import { 
  Archive, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  Video, 
  Users 
} from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { deleteArchiveRecord } from '../../services/adminService';
import { ArchiveEditorModal } from './ArchiveEditorModal';

interface AdminArchivesTabProps {
  archives: ArchiveRecord[];
  onRefresh: () => void;
}

export const AdminArchivesTab: React.FC<AdminArchivesTabProps> = ({
  archives,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArchive, setEditingArchive] = useState<ArchiveRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredArchives = useMemo(() => {
    let list = archives;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.chapter.toLowerCase().includes(q) ||
        a.conclaveYear.toLowerCase().includes(q) ||
        (a.retrospectiveEssay && a.retrospectiveEssay.toLowerCase().includes(q)) ||
        (a.curators && a.curators.some(c => c.toLowerCase().includes(q))) ||
        (a.featuredArtists && a.featuredArtists.some(fa => fa.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [archives, searchQuery]);

  const handleDelete = async (archive: ArchiveRecord) => {
    if (confirm(`Are you sure you wish to dissolve the archive entry for "${archive.title}"?`)) {
      audioSynth.playChime();
      setDeletingId(archive.id);
      try {
        await deleteArchiveRecord(archive.id);
        setFeedback('Archival record dissolved.');
        setTimeout(() => setFeedback(null), 3000);
        onRefresh();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete archival record.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-[#FFFFFF] p-5 rounded-xs border border-[#3A2B27]/15 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-gambetta text-xl font-bold text-[#3A2B27]">
              The Living Archive & Conclave Retrospective Suite
            </h3>
            <p className="text-xs font-mono text-[#725C54] mt-0.5">
              Preserve past gatherings, photographic plates, and curatorial retrospectives syncing with the Living Archive.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            data-cursor="pointer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Archive Past Gathering</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full pt-1">
          <Search className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archives by conclave title, year, chapter, curators, or featured artists..."
            className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs flex items-center gap-2 text-xs text-emerald-800 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Archives Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredArchives.map((archive) => (
          <div
            key={archive.id}
            className="sanctum-card rounded-xs bg-[#FFFFFF] p-5 border border-[#3A2B27]/20 hover:border-[#8A8E3E] transition-all flex flex-col md:flex-row gap-5 shadow-xs"
          >
            {/* Primary Archival Image */}
            <div className="w-full md:w-48 h-36 rounded-xs overflow-hidden border border-[#3A2B27]/20 shrink-0 bg-[#F6EADB]">
              <img
                src={archive.primaryImage}
                alt={archive.title}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>

            {/* Information */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-gambetta text-lg font-bold text-[#3A2B27]">
                  {archive.title}
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-xs bg-[#8A8E3E]/20 text-[#471319] border border-[#8A8E3E]/40">
                  {archive.conclaveYear}
                </span>
                <span className="text-[10px] font-mono text-[#725C54] bg-[#F6EADB] px-2 py-0.5 rounded-xs">
                  {archive.chapter}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#725C54]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  {archive.conclaveDate || archive.conclaveYear}
                </span>
                {archive.galleryImages && archive.galleryImages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#8A8E3E]" />
                    {archive.galleryImages.length} Photographic Plates
                  </span>
                )}
                {archive.mediaEmbedUrl && (
                  <span className="flex items-center gap-1 text-[#471319]">
                    <Video className="w-3.5 h-3.5" />
                    Audio/Visual Documentation Attached
                  </span>
                )}
              </div>

              {archive.retrospectiveEssay && (
                <p className="text-xs text-[#3A2B27]/85 line-clamp-2 font-sans leading-relaxed pt-0.5">
                  {archive.retrospectiveEssay}
                </p>
              )}

              {/* Credits */}
              <div className="flex flex-wrap gap-4 text-[11px] font-mono pt-1 text-[#725C54]">
                {archive.curators && archive.curators.length > 0 && (
                  <span>
                    Curators: <strong className="text-[#3A2B27]">{archive.curators.join(', ')}</strong>
                  </span>
                )}
                {archive.featuredArtists && archive.featuredArtists.length > 0 && (
                  <span>
                    Artists: <strong className="text-[#3A2B27]">{archive.featuredArtists.join(', ')}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center md:flex-col justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#3A2B27]/10">
              <button
                onClick={() => {
                  audioSynth.playChime();
                  setEditingArchive(archive);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#3A2B27] text-xs font-mono font-bold uppercase transition-all w-full justify-center"
                title="Edit archival entry"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#8A8E3E]" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(archive)}
                disabled={deletingId === archive.id}
                className="p-1.5 rounded-xs border border-red-200 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Dissolve archival entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Archive Modal */}
      {(showCreateModal || editingArchive) && (
        <ArchiveEditorModal
          archiveToEdit={editingArchive}
          isOpen={showCreateModal || Boolean(editingArchive)}
          onClose={() => {
            setShowCreateModal(false);
            setEditingArchive(null);
          }}
          onSaved={() => {
            setFeedback('Past gathering inscribed in Living Archive.');
            setTimeout(() => setFeedback(null), 3000);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
