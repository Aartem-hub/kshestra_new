import React, { useState, useEffect } from 'react';
import { Artwork } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { Image as ImageIcon, Eye, ArrowRight, X, Heart, Sparkles, Flame, Bookmark, Download, Film, Play, Maximize2, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';

interface GallerySectionProps {
  onPatronizeArtwork?: (artwork: Artwork) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onPatronizeArtwork }) => {
  const [galleryItems, setGalleryItems] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Event Gallery Media Modal State
  const [eventGalleryItem, setEventGalleryItem] = useState<Artwork | null>(null);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption: string; tag?: string } | null>(null);

  useEffect(() => {
    setGalleryItems(StorageService.getGallery());
    const handleUpdate = (e: any) => {
      setGalleryItems(e.detail);
    };
    window.addEventListener('kshestra_gallery_updated', handleUpdate);
    return () => window.removeEventListener('kshestra_gallery_updated', handleUpdate);
  }, []);

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());

  const leadItem = filteredItems[0];
  const remainingItems = filteredItems.slice(1);

  return (
    <section id="gallery-section" className="py-20 md:py-28 px-4 sm:px-8 border-b border-[#3A2B27]/15 bg-[#FFF5E9] relative">
      
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header: Museum Curatorial Docket */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-[#3A2B27] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#471319] font-bold">
              <ImageIcon className="w-3.5 h-3.5 text-[#8A8E3E]" />
              <span>VISUAL MEMORY</span>
            </div>

            <h2 className="font-gambetta text-4xl sm:text-6xl font-bold tracking-tight text-[#3A2B27]">
              The Living Archive
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#725C54] leading-relaxed">
              A glimpse into past gatherings, pop-up sanctuaries, and the raw work produced within our walls.
            </p>
          </div>

          {/* Curatorial Disciplines */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {['all', 'Visual Arts', 'Cinema', 'Performing Arts', 'Literature & Theatre'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  audioSynth.playChime();
                  setActiveCategory(cat);
                }}
                data-cursor="pointer"
                className={`px-3.5 py-1.5 rounded-xs uppercase tracking-wider transition-all font-semibold ${
                  activeCategory === cat
                    ? 'bg-[#8A8E3E] text-[#FFF5E9] border border-[#8A8E3E]'
                    : 'bg-[#F6EADB] text-[#3A2B27] hover:bg-[#EBE2D4] border border-[#8A8E3E]/30 hover:border-[#8A8E3E]'
                }`}
              >
                {cat === 'all' ? 'All Archive' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* ASYMMETRIC SALON WALL LAYOUT */}
        {leadItem && (
          <div className="space-y-10">
            
            {/* Monumental Lead Piece (Horizontal Asymmetric Split) */}
            <div 
              onClick={() => {
                audioSynth.playChime();
                setSelectedArtwork(leadItem);
              }}
              className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 bg-[#FFFFFF] border-2 border-[#3A2B27] hover:border-[#8A8E3E] shadow-md rounded-xs overflow-hidden transition-colors"
            >
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[420px] bg-[#3A2B27] overflow-hidden">
                <img
                  src={leadItem.image}
                  alt={leadItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-[#FFF5E9] text-[#3A2B27] px-3 py-1 text-xs font-mono uppercase tracking-widest font-bold rounded-xs border border-[#3A2B27]/20 flex items-center gap-2">
                  <KshestraLogo preferAssetImage className="w-4 h-4" />
                  <span>PRIMARY ACCESSION RECORD</span>
                </div>
                
                {/* Event Gallery Button on Card Image */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audioSynth.playChime();
                      setEventGalleryItem(leadItem);
                    }}
                    className="bg-[#471319] hover:bg-[#350d12] text-[#FFF5E9] px-3.5 py-1.5 text-xs font-mono font-bold rounded-xs flex items-center gap-2 shadow-lg border border-[#FFF5E9]/30 transition-all hover:scale-105"
                  >
                    <Film className="w-3.5 h-3.5 text-[#8A8E3E]" />
                    <span>EVENT GALLERY & MEDIA</span>
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 bg-[#FFF5E9] text-[#3A2B27] px-3 py-1.5 text-xs font-mono font-bold rounded-xs flex items-center gap-1.5 shadow-md">
                  <Eye className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>INSPECT FULL PROVENANCE</span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#FFF5E9]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono border-b border-[#3A2B27]/15 pb-2">
                    <span className="font-bold uppercase tracking-wider text-[#8A8E3E]">{leadItem.category}</span>
                    <span className="text-[#725C54]">{leadItem.provenance}</span>
                  </div>

                  <h3 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27] group-hover:text-[#471319] transition-colors leading-tight">
                    "{leadItem.title}"
                  </h3>

                  {leadItem.bengaliTitle && (
                    <div className="font-bengali text-sm text-[#471319] font-semibold">
                      {leadItem.bengaliTitle}
                    </div>
                  )}

                  <p className="font-sans text-sm text-[#3A2B27]/80 leading-relaxed">
                    {leadItem.description}
                  </p>

                  {/* Prominent Gallery Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audioSynth.playChime();
                        setEventGalleryItem(leadItem);
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xs bg-[#471319] hover:bg-[#350d12] text-[#FFF5E9] shadow-xs transition-all border border-[#3A2B27]/20"
                    >
                      <Film className="w-4 h-4 text-[#8A8E3E]" />
                      <span>View Event Gallery (Images & Videos)</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#3A2B27]/15 flex items-center justify-between text-xs font-mono text-[#725C54]">
                  <span>Creator: <strong className="text-[#3A2B27]">{leadItem.artist}</strong></span>
                  <span className="text-[#8A8E3E] font-bold">Living Trust Collection</span>
                </div>
              </div>
            </div>

            {/* Staggered Remaining Gallery Grid */}
            {remainingItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
                {remainingItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      audioSynth.playChime();
                      setSelectedArtwork(item);
                    }}
                    className="group cursor-pointer bg-[#FFFFFF] border border-[#3A2B27]/20 hover:border-[#8A8E3E] rounded-xs overflow-hidden transition-all hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-56 sm:h-64 bg-[#3A2B27] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-[#3A2B27]/85 text-[#FFF5E9] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-xs border border-[#8A8E3E]/40">
                          {item.provenance}
                        </div>

                        {/* Direct Event Gallery trigger over thumbnail */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            audioSynth.playChime();
                            setEventGalleryItem(item);
                          }}
                          className="absolute bottom-3 left-3 bg-[#471319]/90 hover:bg-[#471319] text-[#FFF5E9] px-2.5 py-1 text-[10px] font-mono font-bold rounded-xs flex items-center gap-1.5 shadow-md border border-[#FFF5E9]/20 transition-all hover:scale-105"
                          title="Open Event Media Gallery"
                        >
                          <Film className="w-3 h-3 text-[#8A8E3E]" />
                          <span>Event Gallery</span>
                        </button>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8E3E] font-bold">
                          <span>{item.category}</span>
                          {item.bengaliTitle && <span className="font-bengali text-xs text-[#725C54]">{item.bengaliTitle}</span>}
                        </div>

                        <h4 className="font-gambetta text-xl font-bold text-[#3A2B27] group-hover:text-[#471319] transition-colors leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-xs text-[#725C54] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-4 pt-2 border-t border-[#3A2B27]/10 flex items-center justify-between text-xs font-mono text-[#725C54]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audioSynth.playChime();
                          setEventGalleryItem(item);
                        }}
                        className="inline-flex items-center gap-1.5 text-[#471319] font-bold hover:underline"
                      >
                        <Film className="w-3 h-3 text-[#8A8E3E]" />
                        <span>Gallery & Media →</span>
                      </button>
                      <span className="text-[#8A8E3E] group-hover:translate-x-0.5 transition-transform font-bold">Inspect →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* 1. Curatorial Provenance Inspection Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3A2B27]/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF5E9] rounded-xs max-w-4xl w-full border-2 border-[#3A2B27] shadow-2xl overflow-hidden relative text-[#3A2B27]"
            >
              {/* Modal Header */}
              <div className="bg-[#3A2B27] text-[#FFF5E9] p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <KshestraLogo preferAssetImage className="w-6 h-6" />
                  <div>
                    <h3 className="font-gambetta text-lg sm:text-xl font-bold">
                      {selectedArtwork.title}
                    </h3>
                    <p className="text-[10px] text-[#FFF5E9]/70 font-mono">
                      Accession Record: {selectedArtwork.provenance}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArtwork(null)}
                  data-cursor="pointer"
                  className="p-1.5 hover:bg-[#471319] rounded-xs text-[#FFF5E9] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
                <div className="relative rounded-xs overflow-hidden bg-[#3A2B27] border border-[#3A2B27]/20 max-h-96 flex items-center justify-center">
                  <img
                    src={selectedArtwork.image}
                    alt={selectedArtwork.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#471319] font-bold">
                        {selectedArtwork.category} · {selectedArtwork.provenance}
                      </span>
                      <h4 className="font-gambetta text-2xl font-bold text-[#3A2B27]">
                        {selectedArtwork.title}
                      </h4>
                      {selectedArtwork.bengaliTitle && (
                        <p className="font-bengali text-sm text-[#471319]">
                          {selectedArtwork.bengaliTitle}
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#725C54] leading-relaxed font-sans">
                      {selectedArtwork.description}
                    </p>

                    <div className="p-3 bg-[#F6EADB] rounded-xs border border-[#3A2B27]/10 text-xs font-mono space-y-1">
                      <div>Artist: <strong className="text-[#3A2B27]">{selectedArtwork.artist}</strong></div>
                      <div>Curator Note: Preserved under Kshestra Living Archive Trust.</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {/* Launch Event Gallery Button */}
                    <button
                      onClick={() => {
                        const target = selectedArtwork;
                        setSelectedArtwork(null);
                        setEventGalleryItem(target);
                      }}
                      className="w-full py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-xs bg-[#F6EADB] hover:bg-[#471319] text-[#3A2B27] hover:text-[#FFF5E9] border border-[#3A2B27]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Film className="w-4 h-4 text-[#8A8E3E]" />
                      <span>View Event Media Gallery (Images & Videos)</span>
                    </button>

                    {onPatronizeArtwork && (
                      <button
                        onClick={() => {
                          const work = selectedArtwork;
                          setSelectedArtwork(null);
                          onPatronizeArtwork(work);
                        }}
                        data-cursor="pointer"
                        className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xs bg-[#471319] hover:bg-[#350d12] text-[#FFF5E9] transition-all flex items-center justify-center gap-2"
                      >
                        <Flame className="w-4 h-4 text-[#8A8E3E]" />
                        <span>Patronize / Support This Work</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. DEDICATED EVENT MEDIA GALLERY MODAL (IMAGES & VIDEOS) */}
      <AnimatePresence>
        {eventGalleryItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#3A2B27]/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#FFF5E9] rounded-xs max-w-5xl w-full border-2 border-[#3A2B27] shadow-2xl overflow-hidden relative text-[#3A2B27] my-auto"
            >
              {/* Modal Top Strip */}
              <div className="bg-[#3A2B27] text-[#FFF5E9] p-4 sm:p-5 flex items-center justify-between border-b border-[#3A2B27]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xs bg-[#471319] text-[#FFF5E9]">
                    <Film className="w-5 h-5 text-[#8A8E3E]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8E3E] font-bold">
                        DOCUMENTARY EVENT ARCHIVE
                      </span>
                      <span className="text-[10px] text-[#FFF5E9]/50 font-mono">·</span>
                      <span className="text-[10px] font-mono text-[#FFF5E9]/80">
                        {eventGalleryItem.eventGallery?.date || '2026 Archive'}
                      </span>
                    </div>
                    <h3 className="font-gambetta text-lg sm:text-2xl font-bold">
                      {eventGalleryItem.eventGallery?.eventName || eventGalleryItem.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setEventGalleryItem(null)}
                  data-cursor="pointer"
                  className="p-1.5 hover:bg-[#471319] rounded-xs text-[#FFF5E9] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Location & Description Bar */}
              <div className="bg-[#F6EADB] px-6 py-3 border-b border-[#3A2B27]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#725C54]">
                <div>
                  Venue: <strong className="text-[#3A2B27]">{eventGalleryItem.eventGallery?.venue || eventGalleryItem.dimensions}</strong>
                </div>
                <div>
                  Lead: <strong className="text-[#3A2B27]">{eventGalleryItem.artist}</strong>
                </div>
              </div>

              {/* Media Controls / Filter Tabs */}
              <div className="px-6 pt-5 pb-3 flex flex-wrap items-center justify-between gap-4 border-b border-[#3A2B27]/10">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <button
                    onClick={() => setMediaFilter('all')}
                    className={`px-3 py-1.5 rounded-xs uppercase font-bold transition-colors ${
                      mediaFilter === 'all'
                        ? 'bg-[#471319] text-[#FFF5E9]'
                        : 'bg-[#F6EADB] text-[#3A2B27] hover:bg-[#EBE2D4]'
                    }`}
                  >
                    All Media ({((eventGalleryItem.eventGallery?.images?.length || 0) + (eventGalleryItem.eventGallery?.videos?.length || 0))})
                  </button>
                  <button
                    onClick={() => setMediaFilter('photos')}
                    className={`px-3 py-1.5 rounded-xs uppercase font-bold transition-colors flex items-center gap-1.5 ${
                      mediaFilter === 'photos'
                        ? 'bg-[#471319] text-[#FFF5E9]'
                        : 'bg-[#F6EADB] text-[#3A2B27] hover:bg-[#EBE2D4]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#8A8E3E]" />
                    <span>Photographs ({eventGalleryItem.eventGallery?.images?.length || 0})</span>
                  </button>
                  <button
                    onClick={() => setMediaFilter('videos')}
                    className={`px-3 py-1.5 rounded-xs uppercase font-bold transition-colors flex items-center gap-1.5 ${
                      mediaFilter === 'videos'
                        ? 'bg-[#471319] text-[#FFF5E9]'
                        : 'bg-[#F6EADB] text-[#3A2B27] hover:bg-[#EBE2D4]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-[#8A8E3E]" />
                    <span>Video Content ({eventGalleryItem.eventGallery?.videos?.length || 0})</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-[#725C54]">
                  Click on images to inspect in full resolution
                </div>
              </div>

              {/* Media Scrollable Content Area */}
              <div className="p-6 max-h-[65vh] overflow-y-auto space-y-8">
                
                {/* Event Narrative Excerpt */}
                {eventGalleryItem.eventGallery?.description && (
                  <div className="p-4 bg-[#FFFFFF] rounded-xs border border-[#3A2B27]/15">
                    <p className="font-sans text-xs sm:text-sm text-[#3A2B27] leading-relaxed">
                      {eventGalleryItem.eventGallery.description}
                    </p>
                  </div>
                )}

                {/* 1. Video Footage Section */}
                {(mediaFilter === 'all' || mediaFilter === 'videos') && eventGalleryItem.eventGallery?.videos && eventGalleryItem.eventGallery.videos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#471319] font-bold">
                      <Video className="w-4 h-4 text-[#8A8E3E]" />
                      <span>Event Video Archives & Footage</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {eventGalleryItem.eventGallery.videos.map((vid, idx) => (
                        <div key={idx} className="bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-xs overflow-hidden shadow-xs space-y-3 p-3">
                          <div className="relative rounded-xs overflow-hidden bg-black aspect-video flex items-center justify-center">
                            <video
                              controls
                              playsInline
                              preload="metadata"
                              poster={vid.poster}
                              className="w-full h-full object-cover"
                            >
                              <source src={vid.url} type="video/mp4" />
                              Your browser does not support video streaming.
                            </video>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs font-mono">
                              <h4 className="font-gambetta font-bold text-sm text-[#3A2B27]">
                                {vid.title}
                              </h4>
                              {vid.duration && (
                                <span className="px-1.5 py-0.5 rounded-xs bg-[#F6EADB] text-[#725C54] text-[10px]">
                                  {vid.duration}
                                </span>
                              )}
                            </div>
                            {vid.description && (
                              <p className="text-xs text-[#725C54] mt-1 line-clamp-2">
                                {vid.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Event Photographs Section */}
                {(mediaFilter === 'all' || mediaFilter === 'photos') && eventGalleryItem.eventGallery?.images && eventGalleryItem.eventGallery.images.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#471319] font-bold">
                      <ImageIcon className="w-4 h-4 text-[#8A8E3E]" />
                      <span>Documentary Photographs</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {eventGalleryItem.eventGallery.images.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxImage(photo)}
                          className="group cursor-pointer bg-[#FFFFFF] border border-[#3A2B27]/15 hover:border-[#471319] rounded-xs overflow-hidden transition-all shadow-xs"
                        >
                          <div className="relative aspect-4/3 bg-[#3A2B27] overflow-hidden">
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            {photo.tag && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-xs bg-[#3A2B27]/80 text-[#FFF5E9] text-[9px] font-mono uppercase font-bold tracking-wider">
                                {photo.tag}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-[#3A2B27]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-2.5 py-1 rounded-xs bg-[#FFF5E9] text-[#3A2B27] text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                                <Eye className="w-3.5 h-3.5 text-[#8A8E3E]" />
                                <span>Inspect</span>
                              </span>
                            </div>
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs text-[#3A2B27] font-sans line-clamp-2 leading-snug">
                              {photo.caption}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="bg-[#F6EADB] px-6 py-3 border-t border-[#3A2B27]/15 flex items-center justify-between text-xs font-mono">
                <span className="text-[#725C54]">
                  Sanctuary Archive Record: {eventGalleryItem.provenance}
                </span>
                <button
                  onClick={() => setEventGalleryItem(null)}
                  className="px-4 py-1.5 rounded-xs bg-[#3A2B27] text-[#FFF5E9] hover:bg-[#471319] font-bold uppercase transition-colors"
                >
                  Close Gallery
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. High-Res Photo Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl w-full bg-[#FFF5E9] rounded-xs overflow-hidden border border-[#3A2B27]/20 text-[#3A2B27]"
            >
              <div className="relative max-h-[75vh] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.caption}
                  className="max-h-[75vh] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-[#471319] text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-between bg-[#FFF5E9] border-t border-[#3A2B27]/15">
                <div>
                  {lightboxImage.tag && (
                    <span className="text-[10px] font-mono uppercase text-[#471319] font-bold block">
                      {lightboxImage.tag}
                    </span>
                  )}
                  <p className="text-sm font-sans text-[#3A2B27] font-medium">
                    {lightboxImage.caption}
                  </p>
                </div>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-[#3A2B27] text-white rounded-xs hover:bg-[#471319] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};


