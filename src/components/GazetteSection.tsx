import React, { useState, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import { GazetteArticle, BlogRecord } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { BookOpen, Clock, User, X, Feather, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToBlogs } from '../services/adminService';
import { KshestraLogo } from './KshestraLogo';

export const GazetteSection: React.FC = () => {
  const [dispatches, setDispatches] = useState<GazetteArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<GazetteArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(3);

  useEffect(() => {
    const initial = StorageService.getDispatches();
    setDispatches(initial);

    // Live subscription to published blogs from Firestore
    const unsub = subscribeToBlogs((liveBlogs) => {
      const published = liveBlogs.filter(b => b.status === 'Published');
      if (published.length > 0) {
        const converted: GazetteArticle[] = published.map(b => {
          const articleBody = b.body || (typeof b.content === 'string' ? b.content : '') || '';
          return {
            id: b.id,
            title: b.title,
            date: b.publishDate ? new Date(b.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '2026',
            author: b.author || 'Resident Author',
            authorRole: b.author?.includes('Oindrila') ? 'Chairperson, Kshestra' : 'Kshestra Fellow',
            readTime: b.readTime || '6–8 min read',
            issueNumber: b.slug ? `Dispatch · ${b.slug.slice(0, 18)}` : 'Dispatch',
            category: (b.tags && b.tags.length > 0 ? b.tags[0] : 'Cultural Commentary'),
            excerpt: b.excerpt || '',
            content: articleBody ? articleBody.split('\n\n').filter(Boolean) : [b.excerpt || ''],
            body: articleBody,
            markdown: articleBody,
            coverImage: b.coverImage,
            tags: b.tags
          };
        });

        // Merge keeping Firestore updates prioritized without duplicate IDs
        const combined = [...converted];
        initial.forEach(d => {
          if (!combined.some(c => c.id === d.id)) {
            combined.push(d);
          }
        });
        setDispatches(combined);
      }
    });

    return () => unsub();
  }, []);

  // Compute available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    dispatches.forEach(d => {
      if (d.category) set.add(d.category);
    });
    return ['All', ...Array.from(set)];
  }, [dispatches]);

  // Filtered articles
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(d => {
      const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        d.title.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.excerpt.toLowerCase().includes(q) ||
        (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
      );
      return matchesCategory && matchesSearch;
    });
  }, [dispatches, activeCategory, searchQuery]);

  // Reset pagination to 3 when search or category filter changes
  useEffect(() => {
    setVisibleCount(3);
  }, [activeCategory, searchQuery]);

  // Lock body scroll and pause Lenis smooth scrolling while the essay reader modal is open
  useEffect(() => {
    if (selectedArticle) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.stop === 'function') {
        lenis.stop();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedArticle(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        if (lenis && typeof lenis.start === 'function') {
          lenis.start();
        }
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedArticle]);

  // Paginated articles to display
  const displayedDispatches = useMemo(() => {
    return filteredDispatches.slice(0, visibleCount);
  }, [filteredDispatches, visibleCount]);

  return (
    <section id="gazette-section" className="py-20 md:py-28 px-4 sm:px-8 border-b border-[#3A2B27]/15 bg-[#FFF5E9]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header: Journal Masthead */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#3A2B27] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#471319] font-bold">
              <Feather className="w-3.5 h-3.5 text-[#8A8E3E]" />
              <span>VOICES FROM THE FIELD</span>
            </div>
            <h2 className="font-gambetta text-4xl sm:text-6xl font-bold tracking-tight text-[#3A2B27]">
              Dispatches from the Sanctuary
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#725C54] leading-relaxed">
              Essays, field journals, behind-the-scenes production diaries, and technical insights written directly by our resident creators.
            </p>
          </div>

          <div className="text-xs font-mono text-[#725C54] self-start md:self-end">
            <span className="text-[#3A2B27] font-bold">{dispatches.length}</span> Inscribed Chronicles
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  audioSynth.playChime();
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xs transition-colors uppercase font-bold whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#471319] text-[#FFF5E9]'
                    : 'bg-[#F6EADB] text-[#725C54] hover:text-[#3A2B27] hover:bg-[#F6EADB]/80 border border-[#3A2B27]/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#8A8E3E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatches..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-xs border border-[#3A2B27]/20 bg-[#F6EADB]/50 text-[#3A2B27] focus:outline-hidden focus:border-[#471319] focus:bg-[#FFFFFF]"
            />
          </div>
        </div>

        {/* Stacked Chronicle Articles List with Big Left Image & Right Texts */}
        <div className="divide-y divide-[#3A2B27]/20 border-t border-b border-[#3A2B27]/20">
          {filteredDispatches.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#725C54] space-y-2">
              <p>No dispatches match the query "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="text-[#471319] underline font-bold"
              >
                Reset filters
              </button>
            </div>
          ) : (
            displayedDispatches.map((article) => (
              <article
                key={article.id}
                id={`dispatch-card-${article.id}`}
                onClick={() => {
                  audioSynth.playChime();
                  setSelectedArticle(article);
                }}
                className="py-8 sm:py-10 px-2 sm:px-4 cursor-pointer hover:bg-[#F6EADB]/60 transition-all duration-300 group flex flex-col md:flex-row items-stretch md:items-start gap-6 lg:gap-8 rounded-xs"
              >
                {/* Left Side: Big, Prominent Image */}
                <div className="w-full md:w-80 lg:w-96 h-52 sm:h-64 md:h-56 lg:h-60 shrink-0 rounded-xs overflow-hidden border border-[#3A2B27]/15 bg-[#F6EADB] relative shadow-xs">
                  {article.coverImage ? (
                    <img 
                      src={article.coverImage} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#725C54]/60 bg-[#F6EADB]">
                      <BookOpen className="w-8 h-8 stroke-[1.5] mb-2 text-[#8A8E3E]" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">Sanctuary Dispatch</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#3A2B27]/5 group-hover:bg-transparent transition-colors pointer-events-none" />
                </div>

                {/* Right Side: Editorial Texts & Details */}
                <div className="space-y-3 flex-1 min-w-0 flex flex-col justify-between self-stretch">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-[#725C54]">
                      <span className="text-[#8A8E3E] font-bold uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="text-[#3A2B27]/30">·</span>
                      <span>{article.issueNumber || 'Dispatch'}</span>
                      <span className="text-[#3A2B27]/30">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8A8E3E]" />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="font-gambetta text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-[#3A2B27] group-hover:text-[#471319] transition-colors leading-snug tracking-tight">
                      {article.title}
                    </h3>

                    <p className="font-sans text-sm sm:text-base text-[#725C54] leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#3A2B27]/10 text-xs font-mono text-[#725C54]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#3A2B27] font-semibold">
                        By {article.author}
                      </span>
                      {article.authorRole && (
                        <>
                          <span className="text-[#3A2B27]/30">—</span>
                          <span className="italic text-[#725C54]">{article.authorRole}</span>
                        </>
                      )}
                    </div>
                    {article.date && (
                      <span className="text-[11px] text-[#725C54]/80">{article.date}</span>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Load More Dispatches Pagination Trigger (Initial 3, loads 3 more on click) */}
        {visibleCount < filteredDispatches.length && (
          <div className="pt-6 flex flex-col items-center justify-center gap-2.5">
            <button
              id="btn-load-more-dispatches"
              onClick={() => {
                audioSynth.playChime();
                setVisibleCount(prev => prev + 3);
              }}
              data-cursor="pointer"
              className="px-8 py-3.5 border-2 border-[#3A2B27] bg-[#FFF5E9] hover:bg-[#471319] hover:text-[#FFF5E9] hover:border-[#471319] text-[#3A2B27] text-xs font-mono uppercase tracking-widest font-bold rounded-xs transition-all duration-200 shadow-xs flex items-center gap-3 active:scale-95"
            >
              <span>Load More Dispatches</span>
              <span className="text-[10px] opacity-75 font-normal">
                ({filteredDispatches.length - visibleCount} remaining)
              </span>
            </button>
            <p className="text-[11px] font-mono text-[#725C54]/80">
              Showing {Math.min(visibleCount, filteredDispatches.length)} of {filteredDispatches.length} dispatches
            </p>
          </div>
        )}

      </div>

      {/* Full Essay Modal Reader */}
      <AnimatePresence>
        {selectedArticle && (
          <div 
            id="gazette-reader-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gazette-modal-title"
            onClick={() => {
              audioSynth.playChime();
              setSelectedArticle(null);
            }}
            data-lenis-prevent
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto bg-[#3A2B27]/80 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[#FFF5E9] rounded-xs max-w-3xl w-full max-h-[88vh] overflow-y-auto overscroll-contain border-2 border-[#3A2B27] shadow-2xl p-6 sm:p-10 relative text-[#3A2B27] my-auto"
            >
              <button
                onClick={() => {
                  audioSynth.playChime();
                  setSelectedArticle(null);
                }}
                data-cursor="pointer"
                aria-label="Close Essay"
                className="absolute top-4 right-4 p-2 text-[#3A2B27] hover:bg-[#471319] hover:text-[#FFF5E9] rounded-xs transition-colors border border-[#3A2B27]/20 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="space-y-3 border-b-2 border-[#3A2B27] pb-4 pr-10">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#471319]">
                    {selectedArticle.category} · {selectedArticle.issueNumber || 'Dispatch'}
                  </div>
                  <h2 id="gazette-modal-title" className="font-gambetta text-3xl sm:text-4xl font-bold text-[#3A2B27] leading-tight">
                    {selectedArticle.title}
                  </h2>
                  <div className="text-xs text-[#725C54] font-mono">
                    {selectedArticle.readTime} · Written by {selectedArticle.author} ({selectedArticle.authorRole}) · {selectedArticle.date}
                  </div>
                </div>

                {selectedArticle.coverImage && (
                  <div className="w-full h-56 sm:h-72 rounded-xs overflow-hidden border border-[#3A2B27]/20 bg-[#F6EADB]">
                    <img
                      src={selectedArticle.coverImage}
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}

                <div className="space-y-4 text-base text-[#3A2B27] leading-relaxed font-sans prose prose-neutral max-w-none [&>h2]:font-gambetta [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-[#3A2B27] [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:font-gambetta [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[#471319] [&>h3]:mt-4 [&>h3]:mb-1.5 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>blockquote]:border-l-4 [&>blockquote]:border-[#471319] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#471319] [&>blockquote]:my-4 [&>hr]:my-6 [&>hr]:border-[#3A2B27]/20">
                  {selectedArticle.body || selectedArticle.markdown ? (
                    <div>
                      <Markdown>{selectedArticle.body || selectedArticle.markdown || ''}</Markdown>
                    </div>
                  ) : (
                    selectedArticle.content.map((paragraph, pIdx) => (
                      <p key={pIdx} className={pIdx === 0 ? 'drop-cap' : ''}>
                        {paragraph}
                      </p>
                    ))
                  )}
                </div>

                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#3A2B27]/10">
                    {selectedArticle.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#F6EADB] text-[#725C54] rounded-2xs border border-[#3A2B27]/10">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-[#3A2B27]/15 flex items-center justify-between text-xs text-[#725C54] font-mono">
                  <span>Kshestra Sovereign Dispatches · 2026</span>
                  <button
                    onClick={() => {
                      audioSynth.playChime();
                      setSelectedArticle(null);
                    }}
                    data-cursor="pointer"
                    className="px-4 py-2 text-xs font-bold uppercase rounded-xs bg-[#3A2B27] text-[#FFF5E9] hover:bg-[#471319] transition-colors"
                  >
                    Close Essay
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

