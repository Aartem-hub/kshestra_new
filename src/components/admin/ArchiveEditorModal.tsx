import React, { useState } from 'react';
import { ArchiveRecord } from '../../types';
import { X, Archive, Image as ImageIcon, Video, Users, Calendar, MapPin, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { createArchiveRecord, updateArchiveRecord } from '../../services/adminService';

interface ArchiveEditorModalProps {
  archiveToEdit?: ArchiveRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ArchiveEditorModal: React.FC<ArchiveEditorModalProps> = ({
  archiveToEdit,
  isOpen,
  onClose,
  onSaved
}) => {
  const isEditing = Boolean(archiveToEdit);

  const [title, setTitle] = useState(archiveToEdit?.title || '');
  const [conclaveYear, setConclaveYear] = useState(archiveToEdit?.conclaveYear || '2025');
  const [conclaveDate, setConclaveDate] = useState(archiveToEdit?.conclaveDate || 'Winter Conclave · 2025');
  const [chapter, setChapter] = useState(archiveToEdit?.chapter || 'Kolkata Sanctum 2025');
  const [retrospectiveEssay, setRetrospectiveEssay] = useState(archiveToEdit?.retrospectiveEssay || '');
  const [primaryImage, setPrimaryImage] = useState(archiveToEdit?.primaryImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80');
  const [galleryImages, setGalleryImages] = useState<string[]>(
    archiveToEdit?.galleryImages?.length ? archiveToEdit.galleryImages : ['']
  );
  const [curatorsInput, setCuratorsInput] = useState(archiveToEdit?.curators?.join(', ') || 'Oindrila, Sayan');
  const [featuredArtistsInput, setFeaturedArtistsInput] = useState(archiveToEdit?.featuredArtists?.join(', ') || 'Resident Collective');
  const [mediaEmbedUrl, setMediaEmbedUrl] = useState(archiveToEdit?.mediaEmbedUrl || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddGalleryField = () => {
    setGalleryImages([...galleryImages, '']);
  };

  const handleUpdateGalleryImage = (index: number, val: string) => {
    const updated = [...galleryImages];
    updated[index] = val;
    setGalleryImages(updated);
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated.length ? updated : ['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !retrospectiveEssay.trim() || !primaryImage.trim()) {
      setError('Title, Retrospective Essay, and Primary Archival Image are required.');
      return;
    }

    const curators = curatorsInput
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const featuredArtists = featuredArtistsInput
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    const validGallery = galleryImages
      .map(g => g.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      audioSynth.playChime();
      if (isEditing && archiveToEdit) {
        await updateArchiveRecord(archiveToEdit.id, {
          title: title.trim(),
          conclaveYear: conclaveYear.trim(),
          conclaveDate: conclaveDate.trim(),
          chapter: chapter.trim(),
          retrospectiveEssay: retrospectiveEssay.trim(),
          primaryImage: primaryImage.trim(),
          galleryImages: validGallery,
          curators,
          featuredArtists,
          mediaEmbedUrl: mediaEmbedUrl.trim()
        });
      } else {
        await createArchiveRecord({
          title: title.trim(),
          conclaveYear: conclaveYear.trim(),
          conclaveDate: conclaveDate.trim(),
          chapter: chapter.trim(),
          retrospectiveEssay: retrospectiveEssay.trim(),
          primaryImage: primaryImage.trim(),
          galleryImages: validGallery,
          curators,
          featuredArtists,
          mediaEmbedUrl: mediaEmbedUrl.trim()
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to preserve archival entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A2B27]/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#FFF5E9] border-2 border-[#471319] rounded-xs shadow-2xl p-6 sm:p-8 my-8 text-[#3A2B27] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3A2B27]/15">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8E3E] font-bold flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5" />
              <span>The Living Archive · Retrospective Curator</span>
            </span>
            <h3 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#471319]">
              {isEditing ? 'Revise Past Gathering Archive' : 'Inscribe Past Gathering Archive'}
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
              Conclave / Gathering Archive Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-sans text-sm font-semibold"
              placeholder="e.g. Kolkata Winter Conclave 2024: The Unfinished Work"
            />
          </div>

          {/* Year, Date String & Chapter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Conclave Year *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={conclaveYear}
                  onChange={(e) => setConclaveYear(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="2024"
                />
                <Calendar className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Conclave Date String
              </label>
              <input
                type="text"
                value={conclaveDate}
                onChange={(e) => setConclaveDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                placeholder="December 14–16, 2024"
              />
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Sanctum Chapter *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="Kolkata Sanctum 2024"
                />
                <MapPin className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Retrospective Essay */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Retrospective Essay / Conclave Narrative *
            </label>
            <textarea
              rows={4}
              required
              value={retrospectiveEssay}
              onChange={(e) => setRetrospectiveEssay(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-sans text-xs leading-relaxed"
              placeholder="Describe the dialogue, cross-disciplinary experiments, outcomes, and community resonance..."
            />
          </div>

          {/* Primary Archival Image */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Primary Archival Image URL *
            </label>
            <div className="flex gap-3 items-start">
              <input
                type="url"
                required
                value={primaryImage}
                onChange={(e) => setPrimaryImage(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                placeholder="https://images.unsplash.com/photo-..."
              />
              {primaryImage && (
                <div className="w-16 h-10 rounded-xs overflow-hidden border border-[#3A2B27]/20 shrink-0 bg-[#F6EADB]">
                  <img 
                    src={primaryImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Secondary Gallery Images Array */}
          <div className="p-4 bg-[#F6EADB] border border-[#3A2B27]/15 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block uppercase text-[#725C54] font-bold">
                Additional Photographic Plate URLs (Living Archive Gallery)
              </label>
              <button
                type="button"
                onClick={handleAddGalleryField}
                className="text-[10px] font-mono font-bold uppercase text-[#471319] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Plate URL</span>
              </button>
            </div>

            {galleryImages.map((imgUrl, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="url"
                  value={imgUrl}
                  onChange={(e) => handleUpdateGalleryImage(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] text-xs font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
                {imgUrl && (
                  <div className="w-8 h-8 rounded-xs overflow-hidden border border-[#3A2B27]/20 shrink-0">
                    <img src={imgUrl} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="p-1.5 text-red-700 hover:bg-red-50 rounded-xs transition-colors"
                  title="Remove plate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Curators & Featured Artists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Sanctum Curators (Comma-separated)
              </label>
              <input
                type="text"
                value={curatorsInput}
                onChange={(e) => setCuratorsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                placeholder="Oindrila, Dr. Arnab Sen, Sayan"
              />
            </div>

            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Featured Artists / Guilds (Comma-separated)
              </label>
              <input
                type="text"
                value={featuredArtistsInput}
                onChange={(e) => setFeaturedArtistsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                placeholder="Kumartuli Guild, Anirban Roy, Moumita Sen"
              />
            </div>
          </div>

          {/* Media / Video / Audio Embed URL */}
          <div>
            <label className="block uppercase text-[#725C54] font-semibold mb-1">
              Audio/Video Documentation Link (YouTube, Vimeo, Soundcloud)
            </label>
            <div className="relative">
              <input
                type="url"
                value={mediaEmbedUrl}
                onChange={(e) => setMediaEmbedUrl(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                placeholder="https://youtube.com/watch?v=..."
              />
              <Video className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
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
              className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Inscribing in Archive...' : (isEditing ? 'Update Archive Record' : 'Inscribe in Archive')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
