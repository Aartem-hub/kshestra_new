import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, ChevronDown, ChevronUp, Disc3 } from 'lucide-react';
import { audioSynth, OFFICIAL_TRACK } from '../services/audioSynthesizer';

export const AudioDock: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [isExpanded, setIsExpanded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    return () => {
      window.removeEventListener('kshestra_audio_state', handleAudioState);
    };
  }, []);

  // Live visualizer loop
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
        // Resting line
        ctx.beginPath();
        ctx.strokeStyle = '#5C1D24';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      const freqData = audioSynth.getFrequencyData();
      const barCount = 14;
      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i % freqData.length] || 0;
        const normalized = Math.max(3, (val / 255) * canvas.height * 0.88);
        const x = i * barWidth;
        const y = (canvas.height - normalized) / 2;

        ctx.fillStyle = i % 2 === 0 ? '#5C1D24' : '#8A8E3E';
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x + 1, y, barWidth - 2, normalized);
      }
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const togglePlayback = () => {
    audioSynth.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSynth.setVolume(val);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm w-[calc(100vw-32px)] sm:w-80 select-none">
      <div className="bg-[#FFF5E9]/95 backdrop-blur-md border border-[#3A2B27]/20 rounded-xs shadow-lg p-3 transition-all duration-300 text-[#3A2B27]">
        
        {/* Top bar with audio visualizer & quick toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <button
              id="audio-play-pause-btn"
              onClick={togglePlayback}
              data-cursor="pointer"
              title={isPlaying ? "Pause Background Music" : "Play Background Music: Main Baaki Hoon"}
              className="w-8 h-8 rounded-xs shrink-0 flex items-center justify-center bg-[#5C1D24] text-[#FFF5E9] hover:bg-[#431319] transition-colors shadow-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5" />}
            </button>

            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#3A2B27] truncate">
                <Disc3 className={`w-3.5 h-3.5 text-[#5C1D24] shrink-0 ${isPlaying ? 'animate-spin' : ''}`} />
                <span className="truncate">{OFFICIAL_TRACK.title}</span>
              </div>
              <p className="text-[10px] text-[#725C54] truncate font-mono">
                {isPlaying ? 'Kshestra Sanctuary Background Score' : 'Background Music · Tap to Play'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Real-time Oscilloscope Canvas */}
            <canvas
              ref={canvasRef}
              width={56}
              height={22}
              className="rounded-xs bg-[#F6EADB] border border-[#3A2B27]/10"
            />

            {/* Expand options */}
            <button
              id="audio-expand-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              data-cursor="pointer"
              aria-label="Toggle audio settings"
              className="p-1 hover:bg-[#F6EADB] rounded-xs text-[#725C54] hover:text-[#3A2B27] transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Volume Slider & Track Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[#3A2B27]/10 space-y-3">
            
            <div className="text-[10px] font-mono text-[#725C54] bg-[#F6EADB] p-2 rounded-xs border border-[#3A2B27]/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#3A2B27]">{OFFICIAL_TRACK.title}</div>
                <div className="text-[#5C1D24]">{OFFICIAL_TRACK.artist}</div>
              </div>
              <span className="px-1.5 py-0.5 bg-[#5C1D24]/10 text-[#5C1D24] text-[9px] font-bold rounded-xs">
                MP3 STEREO
              </span>
            </div>

            {/* Volume Control */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#725C54]">
                <span className="flex items-center gap-1">
                  {volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-[#5C1D24]" />}
                  Master Music Volume
                </span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-[#3A2B27]/20 rounded-lg appearance-none cursor-pointer accent-[#5C1D24]"
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

