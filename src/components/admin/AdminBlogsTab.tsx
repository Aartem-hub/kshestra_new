import React, { useState, useMemo } from 'react';
import { BlogRecord } from '../../types';
import { 
  Feather, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Tag, 
  RefreshCw 
} from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import { deleteBlogRecord, updateBlogRecord, seedAllBlogEntries } from '../../services/adminService';
import { KSHESTRA_BLOG_ENTRIES } from '../../data/kshestraBlogs';
import { BlogEditorModal } from './BlogEditorModal';

interface AdminBlogsTabProps {
  blogs: BlogRecord[];
  onRefresh: () => void;
}

export const AdminBlogsTab: React.FC<AdminBlogsTabProps> = ({
  blogs,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Published' | 'Draft'>('all');
  const [editingBlog, setEditingBlog] = useState<BlogRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedAll = async () => {
    setIsSeeding(true);
    audioSynth.playChime();
    try {
      const seeded = await seedAllBlogEntries(false);
      setFeedback(`Seeded ${seeded} documented Sanctuary dispatches into Firestore!`);
      setTimeout(() => setFeedback(null), 4000);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to seed dispatches.');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredBlogs = useMemo(() => {
    let list = blogs;
    if (statusFilter !== 'all') {
      list = list.filter(b => b.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [blogs, searchQuery, statusFilter]);

  const handleToggleStatus = async (blog: BlogRecord) => {
    const nextStatus = blog.status === 'Published' ? 'Draft' : 'Published';
    audioSynth.playChime();
    try {
      await updateBlogRecord(blog.id, { status: nextStatus });
      setFeedback(`Dispatch status changed to "${nextStatus}".`);
      setTimeout(() => setFeedback(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (blog: BlogRecord) => {
    if (confirm(`Are you sure you wish to delete the dispatch "${blog.title}"?`)) {
      audioSynth.playChime();
      setDeletingId(blog.id);
      try {
        await deleteBlogRecord(blog.id);
        setFeedback('Dispatch removed.');
        setTimeout(() => setFeedback(null), 3000);
        onRefresh();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete dispatch.');
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
              Kshestra Dispatches & Chronicles Editorial Suite
            </h3>
            <p className="text-xs font-mono text-[#725C54] mt-0.5">
              Publish and edit essays, field notes, and cultural commentary synced directly with the public Gazette.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={handleSeedAll}
              disabled={isSeeding}
              data-cursor="pointer"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#3A2B27] transition-all shadow-2xs disabled:opacity-50"
              title="Populate or restore all documented sanctuary essays into Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#8A8E3E] ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Seeding Firestore...' : `Seed Documented (${KSHESTRA_BLOG_ENTRIES.length})`}</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              data-cursor="pointer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase rounded-xs bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]/90 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Compose New Dispatch</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8A8E3E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatches by headline, author, excerpt, or tags..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] text-[#3A2B27] focus:outline-hidden focus:border-[#471319]"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#471319] text-[#FFF5E9]'
                  : 'bg-[#FFF5E9] text-[#725C54] border border-[#3A2B27]/20'
              }`}
            >
              All ({blogs.length})
            </button>
            <button
              onClick={() => setStatusFilter('Published')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-all ${
                statusFilter === 'Published'
                  ? 'bg-[#471319] text-[#FFF5E9]'
                  : 'bg-[#FFF5E9] text-[#725C54] border border-[#3A2B27]/20'
              }`}
            >
              Published ({blogs.filter(b => b.status === 'Published').length})
            </button>
            <button
              onClick={() => setStatusFilter('Draft')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-all ${
                statusFilter === 'Draft'
                  ? 'bg-[#8A8E3E] text-[#FFF5E9]'
                  : 'bg-[#FFF5E9] text-[#725C54] border border-[#3A2B27]/20'
              }`}
            >
              Drafts ({blogs.filter(b => b.status === 'Draft').length})
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs flex items-center gap-2 text-xs text-emerald-800 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Dispatches List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBlogs.map((blog) => {
          const isPublished = blog.status === 'Published';

          return (
            <div
              key={blog.id}
              className="sanctum-card rounded-xs bg-[#FFFFFF] p-5 border border-[#3A2B27]/20 hover:border-[#8A8E3E] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs"
            >
              <div className="flex gap-4 items-start flex-1">
                {blog.coverImage && (
                  <div className="w-24 h-20 rounded-xs overflow-hidden border border-[#3A2B27]/20 shrink-0 bg-[#F6EADB] hidden sm:block">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title}
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-gambetta text-lg font-bold text-[#3A2B27]">
                      {blog.title}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(blog)}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-xs transition-colors ${
                        isPublished 
                          ? 'bg-[#471319] text-[#FFF5E9]' 
                          : 'bg-[#8A8E3E] text-[#FFF5E9]'
                      }`}
                      title="Click to toggle Draft / Published"
                    >
                      {blog.status}
                    </button>
                    {blog.readTime && (
                      <span className="text-[10px] font-mono text-[#725C54]">
                        · {blog.readTime}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-mono text-[#725C54]">
                    By <strong className="text-[#3A2B27]">{blog.author}</strong> · {blog.publishDate}
                  </p>

                  {blog.excerpt && (
                    <p className="text-xs text-[#3A2B27]/80 line-clamp-2 font-sans pt-0.5">
                      {blog.excerpt}
                    </p>
                  )}

                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {blog.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-[#F6EADB] text-[#725C54] rounded-2xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-[#3A2B27]/10 w-full md:w-auto justify-end">
                <button
                  onClick={() => {
                    audioSynth.playChime();
                    setEditingBlog(blog);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-[#3A2B27]/20 bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#3A2B27] text-xs font-mono font-bold uppercase transition-all"
                  title="Revise dispatch"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(blog)}
                  disabled={deletingId === blog.id}
                  className="p-1.5 rounded-xs border border-red-200 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete dispatch"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal */}
      {(showCreateModal || editingBlog) && (
        <BlogEditorModal
          blogToEdit={editingBlog}
          isOpen={showCreateModal || Boolean(editingBlog)}
          onClose={() => {
            setShowCreateModal(false);
            setEditingBlog(null);
          }}
          onSaved={() => {
            setFeedback('Dispatch preserved in Firestore.');
            setTimeout(() => setFeedback(null), 3000);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
