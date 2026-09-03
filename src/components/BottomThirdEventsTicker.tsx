import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { EventItem } from '../types';
import { audioSynth, OFFICIAL_TRACK } from '../services/audioSynthesizer';
import { Play, Pause, MapPin, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { KshestraLogo } from './KshestraLogo';

interface BottomThirdEventsTickerProps {
  onSelectEvent: (event: EventItem) => void;
}

export const BottomThirdEventsTicker: React.FC<BottomThirdEventsTickerProps> = ({ onSelectEvent }) => {
  const [events] = useState<EventItem[]>(() => StorageService.getEvents());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync with audio engine state
  useEffect(() => {
    const handleAudioState = (e: any) => {
      if (e.detail) {
        setIsPlaying(e.detail.isPlaying);
        if (typeof e.detail.volume === 'number') {
          setVolume(e.detail.volume);
        }
      }
    };
    window.addEventListener('kshestra_audio_state', handleAudioState);
    return () => window.removeEventListener('kshestra_audio_state', handleAudioState);
  }, []);

  // Visualizer loop for inline canvas when playing
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWave = () => {
      animId = requestAnimationFrame(renderWave);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isPlaying) {
        ctx.fillStyle = '#8A8E3E';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
        return;
      }

      const freqData = audioSynth.getFrequencyData();
      const barCount = 5;
      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i * 3 % freqData.length] || 0;
        const barHeight = Math.max(2, (val / 255) * canvas.height);
        const x = i * barWidth;
        const y = canvas.height - barHeight;

        ctx.fillStyle = '#8A8E3E';
        ctx.globalAlpha = 0.95;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioSynth.toggle();
  };

  const handleEventClick = (event: EventItem) => {
    audioSynth.playChime();
    onSelectEvent(event);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSynth.setVolume(val);
  };

  // Duplicate events to form an uninterrupted infinite ticker
  const tickerEvents = [...events, ...events, ...events, ...events];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-40 select-none bg-[#FFF5E9] border-t border-[#3A2B27]/20 shadow-2xl">
      <div className="w-full flex items-stretch h-10 sm:h-11">
        
        {/* LEFT 1: Inline Play / Pause Button */}
        <button
          id="inline-music-player-btn"
          onClick={togglePlayback}
          data-cursor="pointer"
          title={isPlaying ? `Pause: ${OFFICIAL_TRACK.title}` : `Play: ${OFFICIAL_TRACK.title}`}
          aria-label="Toggle background score"
          className="h-full px-3 sm:px-4 bg-[#5C1D24] hover:bg-[#431319] text-[#FFF5E9] border-r border-[#3A2B27]/20 flex items-center justify-center gap-1.5 transition-colors shrink-0 focus:outline-none"
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          ) : (
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current translate-x-0.5" />
          )}
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </span>
        </button>

        {/* LEFT 2: Inline Track Badge (MAIN BAAKI HU) & Small Volume Bar Below */}
        <div className="h-full bg-[#F6EADB] border-r border-[#3A2B27]/20 px-2.5 sm:px-3 flex flex-col justify-center gap-0.5 shrink-0">
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold text-[#5C1D24] leading-tight">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8A8E3E] ${isPlaying ? 'opacity-75' : 'opacity-0'}`} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8A8E3E]" />
            </span>
            <span className="tracking-wider uppercase whitespace-nowrap font-bold">
              MAIN BAAKI HU
            </span>
            {isPlaying && (
              <canvas
                ref={canvasRef}
                width={16}
                height={8}
                className="rounded-xs hidden sm:inline-block ml-0.5 opacity-90"
              />
            )}
          </div>

          {/* Small volume bar positioned directly below MAIN BAAKI HU */}
          <div className="flex items-center gap-1 leading-none">
            <button
              onClick={() => {
                const newVol = volume === 0 ? 0.5 : 0;
                setVolume(newVol);
                audioSynth.setVolume(newVol);
              }}
              data-cursor="pointer"
              className="text-[#725C54] hover:text-[#8A8E3E] transition-colors p-0 focus:outline-none"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? (
                <VolumeX className="w-2.5 h-2.5 text-[#5C1D24]" />
              ) : (
                <Volume2 className="w-2.5 h-2.5 text-[#8A8E3E]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-14 sm:w-20 accent-[#8A8E3E] h-1 bg-[#3A2B27]/15 rounded-xs cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>

        {/* RIGHT: Extended Marquee Running Smoothly */}
        <div className="flex-1 min-w-0 flex items-center bg-[#FFFFFF] overflow-hidden relative">
          
          {/* Left & Right Soft Fade Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-[#FFFFFF] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-[#FFFFFF] to-transparent z-10 pointer-events-none" />

          {/* Infinite Continuous Marquee */}
          <div className="animate-ticker flex items-center gap-6 sm:gap-10 whitespace-nowrap py-0.5 select-none">
            {tickerEvents.map((evt, idx) => (
              <div
                key={`${evt.id}-${idx}`}
                onClick={() => handleEventClick(evt)}
                data-cursor="pointer"
                className="group flex items-center gap-2 sm:gap-3 cursor-pointer px-2 py-0.5 rounded-xs hover:bg-[#F6EADB] transition-colors shrink-0"
              >
                <div className="w-4 h-4 rounded-xs bg-[#FFF5E9] border border-[#3A2B27]/20 flex items-center justify-center p-0.5 shrink-0">
                  <KshestraLogo preferAssetImage className="w-full h-full object-contain" />
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs">
                  <span className="text-[#8A8E3E] font-bold tracking-wider uppercase">
                    [{evt.date.split('·')[0].trim()}]
                  </span>
                  <span className="font-gambetta text-xs sm:text-sm font-bold text-[#3A2B27] group-hover:text-[#5C1D24] transition-colors truncate max-w-[180px] sm:max-w-none">
                    {evt.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-[#3A2B27] bg-[#8A8E3E]/15 border border-[#8A8E3E]/30 px-1.5 py-0.5 rounded-xs shrink-0 font-medium">
                  <MapPin className="w-2.5 h-2.5 text-[#5C1D24]" />
                  <span>{evt.city}</span>
                </div>

                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#5C1D24] text-[#FFF5E9] group-hover:bg-[#431319] rounded-xs transition-colors shrink-0">
                  <span>{evt.price === 0 ? 'FREE PASS' : `PASS ₹${evt.price}`}</span>
                  <ArrowUpRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <span className="text-[#8A8E3E] text-xs font-serif pl-2">✦</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
