import React, { useState } from 'react';
import { BlogRecord } from '../../types';
import { X, Feather, Image as ImageIcon, Tag, Eye, AlertCircle, Sparkles } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { createBlogRecord, updateBlogRecord } from '../../services/adminService';
import { auth } from '../../firebase';

interface BlogEditorModalProps {
  blogToEdit?: BlogRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const BlogEditorModal: React.FC<BlogEditorModalProps> = ({
  blogToEdit,
  isOpen,
  onClose,
  onSaved
}) => {
  const isEditing = Boolean(blogToEdit);

  const [title, setTitle] = useState(blogToEdit?.title || '');
  const [slug, setSlug] = useState(blogToEdit?.slug || '');
  const [author, setAuthor] = useState(blogToEdit?.author || auth.currentUser?.displayName || 'The Kshestra Editorial Desk');
  const [publishDate, setPublishDate] = useState(blogToEdit?.publishDate || 'Autumn Dispatches · 2026');
  const [excerpt, setExcerpt] = useState(blogToEdit?.excerpt || '');
  const [body, setBody] = useState(blogToEdit?.body || '');
  const [coverImage, setCoverImage] = useState(blogToEdit?.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80');
  const [tagsInput, setTagsInput] = useState(blogToEdit?.tags?.join(', ') || 'Cultural Commentary, Economic Dignity');
  const [status, setStatus] = useState<'Draft' | 'Published'>(blogToEdit?.status || 'Published');
  const [readTime, setReadTime] = useState(blogToEdit?.readTime || '4 Min Read');

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !body.trim() || !author.trim()) {
      setError('Title, Author, and Body Narrative are required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      audioSynth.playChime();
      if (isEditing && blogToEdit) {
        await updateBlogRecord(blogToEdit.id, {
          title: title.trim(),
          slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          author: author.trim(),
          publishDate: publishDate.trim(),
          excerpt: excerpt.trim(),
          body: body.trim(),
          coverImage: coverImage.trim(),
          tags,
          status,
          readTime: readTime.trim()
        });
      } else {
        await createBlogRecord({
          title: title.trim(),
          slug: slug.trim(),
          author: author.trim(),
          publishDate: publishDate.trim(),
          excerpt: excerpt.trim(),
          body: body.trim(),
          coverImage: coverImage.trim(),
          tags,
          status,
          readTime: readTime.trim()
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to preserve chronicle.');
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
              <Feather className="w-3.5 h-3.5" />
              <span>Chronicles & Broadside Editorial Suite</span>
            </span>
            <h3 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#471319]">
              {isEditing ? 'Revise Chronicle Dispatch' : 'Compose Sanctuary Dispatch'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 rounded-xs border border-[#3A2B27]/20 bg-[#F6EADB] hover:bg-[#FFFFFF] text-[#3A2B27] text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#8A8E3E]" />
              <span>{showPreview ? 'Edit Form' : 'Preview'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#725C54] hover:text-[#471319] hover:bg-[#F6EADB] rounded-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-600 rounded-xs flex items-center gap-2 text-xs text-red-800 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showPreview ? (
          /* Live Article Preview */
          <div className="mt-6 space-y-6 bg-[#FFFFFF] p-6 sm:p-8 border border-[#3A2B27]/15 rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#3A2B27]/15 pb-3">
              <span className="px-2 py-0.5 rounded-xs bg-[#8A8E3E]/20 text-[#471319] font-bold uppercase">
                {status}
              </span>
              <span className="text-[#725C54]">{publishDate} · {readTime}</span>
            </div>

            <h2 className="font-gambetta text-3xl sm:text-4xl font-bold text-[#3A2B27] leading-tight">
              {title || 'Untitled Dispatch'}
            </h2>

            <div className="text-xs font-mono text-[#8A8E3E] font-bold uppercase">
              By {author}
            </div>

            {coverImage && (
              <div className="relative aspect-video w-full rounded-xs overflow-hidden border border-[#3A2B27]/15">
                <img 
                  src={coverImage} 
                  alt={title}
                  className="w-full h-full object-cover" 
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}

            {excerpt && (
              <p className="font-serif italic text-sm text-[#725C54] border-l-2 border-[#8A8E3E] pl-4 py-1 leading-relaxed">
                "{excerpt}"
              </p>
            )}

            <div className="font-sans text-sm text-[#3A2B27]/90 leading-relaxed whitespace-pre-wrap space-y-4">
              {body || 'No chronicle narrative entered.'}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#3A2B27]/10">
              {tagsInput.split(',').map((tag, idx) => tag.trim() && (
                <span key={idx} className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#F6EADB] text-[#725C54] rounded-xs">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs font-mono">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Dispatch Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-sans text-sm font-semibold"
                  placeholder="e.g. Why We Must Dismantle the Myth of the Starving Genius"
                />
              </div>

              <div>
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Publication Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Draft')}
                    className={`flex-1 py-2 px-2 text-center rounded-xs font-bold uppercase transition-all ${
                      status === 'Draft' 
                        ? 'bg-[#8A8E3E] text-[#FFF5E9]' 
                        : 'bg-[#FFFFFF] border border-[#3A2B27]/20 text-[#725C54]'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Published')}
                    className={`flex-1 py-2 px-2 text-center rounded-xs font-bold uppercase transition-all ${
                      status === 'Published' 
                        ? 'bg-[#471319] text-[#FFF5E9]' 
                        : 'bg-[#FFFFFF] border border-[#3A2B27]/20 text-[#725C54]'
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
            </div>

            {/* Author, Date & Reading Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Author / Byline *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="Trustee Moniker or Resident"
                />
              </div>

              <div>
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Publish Date Text
                </label>
                <input
                  type="text"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="Autumn Dispatches · 2026"
                />
              </div>

              <div>
                <label className="block uppercase text-[#725C54] font-semibold mb-1">
                  Estimated Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="4 Min Read"
                />
              </div>
            </div>

            {/* Cover Image URL & Live Thumbnail Preview */}
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Cover Image Keyframe URL
              </label>
              <div className="flex gap-3 items-start">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {coverImage && (
                  <div className="w-16 h-10 rounded-xs overflow-hidden border border-[#3A2B27]/20 shrink-0 bg-[#F6EADB]">
                    <img 
                      src={coverImage} 
                      alt="Thumbnail Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Short Excerpt (Broadside Preview)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-sans text-xs leading-relaxed"
                placeholder="A compelling 1-2 sentence hook for broadsheet cards..."
              />
            </div>

            {/* Body */}
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Full Body Content (Markdown / Text Paragraphs) *
              </label>
              <textarea
                rows={8}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27] font-sans text-xs leading-relaxed"
                placeholder="Inscribe the complete narrative, field insights, or interview transcript here..."
              />
            </div>

            {/* Tags / Categories */}
            <div>
              <label className="block uppercase text-[#725C54] font-semibold mb-1">
                Tags / Categories (Comma-separated)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xs border border-[#3A2B27]/20 bg-[#FFFFFF] text-[#3A2B27]"
                  placeholder="Indigenous Craft, Preservation, Exhibitions"
                />
                <Tag className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
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
                <span>{isSubmitting ? 'Inscribing in Firestore...' : (isEditing ? 'Save Revisions' : 'Publish Dispatch')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
