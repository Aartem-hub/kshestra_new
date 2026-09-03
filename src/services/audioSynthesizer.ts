// Background Audio Engine for Kshestra Foundation
// Plays official score: "Main Baaki Hoon" with integrated acoustic Tanpura & Harmonium drone engine

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  src: string;
}

export const OFFICIAL_TRACK: TrackInfo = {
  title: "Main Baaki Hoon",
  artist: "Kshestra Sound Archive",
  album: "Official Background Score",
  src: "/assets/music/Main Baaki Hoon.mp3"
};

class KshestraAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.55;
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isAudioFileActive: boolean = false;

  private initAudio() {
    if (this.audio) return;
    try {
      this.audio = new Audio();
      // Support both direct and URI-encoded path
      this.audio.src = '/assets/music/Main Baaki Hoon.mp3';
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.isAudioFileActive = true;
        this.broadcastState();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.broadcastState();
      });

      this.audio.addEventListener('error', () => {
        this.isAudioFileActive = false;
      });
    } catch {
      // Audio element initialization fallback handled by drone synth
    }
  }

  // Backup acoustic Indian drone synthesis in case browser restricts MP3 loading
  private startDroneSynth() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.stopDroneSynth();

      const baseFreq = 130.81; // C3 Tanpura Sa
      const harmonics = [
        { freq: baseFreq, type: 'sawtooth' as OscillatorType, gain: 0.12 },
        { freq: baseFreq * 1.5, type: 'sine' as OscillatorType, gain: 0.14 }, // Pa
        { freq: baseFreq * 2.0, type: 'triangle' as OscillatorType, gain: 0.08 }, // High Sa
        { freq: baseFreq * 0.5, type: 'sine' as OscillatorType, gain: 0.18 } // Sub
      ];

      const now = this.ctx.currentTime;
      this.oscillators = harmonics.map(h => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = h.type;
        osc.frequency.setValueAtTime(h.freq, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(h.gain * this.volume, now + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start();
        return { osc, gain };
      });
    } catch {
      // Graceful fallback for synthetic drone engine
    }
  }

  private stopDroneSynth() {
    if (this.oscillators.length > 0 && this.ctx) {
      const now = this.ctx.currentTime;
      this.oscillators.forEach(o => {
        try {
          o.gain.gain.cancelScheduledValues(now);
          o.gain.gain.setValueAtTime(o.gain.gain.value, now);
          o.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
          setTimeout(() => {
            try { o.osc.stop(); o.osc.disconnect(); } catch {}
          }, 900);
        } catch {}
      });
      this.oscillators = [];
    }
  }

  public async play() {
    this.initAudio();
    this.isPlaying = true;
    this.broadcastState();

    if (this.audio) {
      try {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          this.isAudioFileActive = true;
          return;
        }
      } catch {
        // Fallback to acoustic drone synthesis score
      }
    }

    // If MP3 playback did not start or threw error, run synthesized acoustic background score
    this.startDroneSynth();
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.stopDroneSynth();
    this.isPlaying = false;
    this.broadcastState();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    if (this.oscillators.length > 0 && this.ctx) {
      this.oscillators.forEach(o => {
        try {
          o.gain.gain.setValueAtTime(0.12 * this.volume, this.ctx!.currentTime);
        } catch {}
      });
    }
    this.broadcastState();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getFrequencyData(): Uint8Array {
    if (this.isPlaying) {
      const dummy = new Uint8Array(16);
      const time = Date.now() * 0.006;
      for (let i = 0; i < 16; i++) {
        dummy[i] = Math.floor(110 + 90 * Math.sin(time + i * 0.45));
      }
      return dummy;
    }
    return new Uint8Array(16);
  }

  private guitarBufferCache: Map<number, AudioBuffer> = new Map();
  private lastGuitarPlayTime: number = 0;
  private guitarNoteIndex: number = 0;
  // Acoustic guitar notes (D major pentatonic fingerstyle chord tones: D3, F#3, A3, D4, E4, F#4, A4)
  private readonly GUITAR_FREQUENCIES = [146.83, 185.00, 220.00, 293.66, 329.63, 369.99, 440.00];

  private getAudioContext(): AudioContext | null {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Synthesize an authentic acoustic guitar string pluck using Karplus-Strong physical modeling
  private getGuitarBuffer(ctx: AudioContext, freq: number): AudioBuffer {
    const cached = this.guitarBufferCache.get(freq);
    if (cached) return cached;

    const sampleRate = ctx.sampleRate;
    const period = Math.max(1, Math.round(sampleRate / freq));
    const duration = 1.4; // 1.4s natural acoustic resonance decay
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // Initial string pluck attack (plectrum / fingertip impulse excitation)
    let prev = 0;
    for (let i = 0; i < period; i++) {
      const noise = (Math.random() * 2 - 1) * 0.45;
      // Low-pass filter the initial excitation to produce warm wooden string timbre
      prev = 0.65 * prev + 0.35 * noise;
      data[i] = prev;
    }

    // Karplus-Strong feedback delay loop with string loss and acoustic damping
    const feedback = 0.990;
    for (let i = period; i < totalSamples; i++) {
      const nextSample = (i - period + 1 < totalSamples) ? data[i - period + 1] : data[i - period];
      data[i] = 0.5 * (data[i - period] + nextSample) * feedback;
    }

    this.guitarBufferCache.set(freq, buffer);
    return buffer;
  }

  public playGuitarSound() {
    try {
      const nowMs = Date.now();
      // Throttle slightly to prevent ear-fatigue on rapid repeated trigger within 60ms
      if (nowMs - this.lastGuitarPlayTime < 60) return;
      this.lastGuitarPlayTime = nowMs;

      const ctx = this.getAudioContext();
      if (!ctx) return;

      const freq = this.GUITAR_FREQUENCIES[this.guitarNoteIndex % this.GUITAR_FREQUENCIES.length];
      this.guitarNoteIndex = (this.guitarNoteIndex + 1) % this.GUITAR_FREQUENCIES.length;

      const guitarBuffer = this.getGuitarBuffer(ctx, freq);
      const source = ctx.createBufferSource();
      source.buffer = guitarBuffer;

      // Acoustic guitar wooden soundbox resonance filter (peaking around 190 Hz)
      const bodyResonance = ctx.createBiquadFilter();
      bodyResonance.type = 'peaking';
      bodyResonance.frequency.setValueAtTime(190, ctx.currentTime);
      bodyResonance.Q.setValueAtTime(1.4, ctx.currentTime);
      bodyResonance.gain.setValueAtTime(3.5, ctx.currentTime);

      // Gentle high cut to keep the string acoustic, warm and pleasant
      const highCut = ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.setValueAtTime(3800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35 * Math.max(0.4, this.volume), ctx.currentTime);

      source.connect(bodyResonance);
      bodyResonance.connect(highCut);
      highCut.connect(gain);
      gain.connect(ctx.destination);

      source.start();
    } catch {
      // Graceful fallback if Web Audio is restricted
    }
  }

  public playChime() {
    this.playGuitarSound();
  }

  public start() {
    this.play();
  }

  public stop() {
    this.pause();
  }

  private broadcastState() {
    window.dispatchEvent(new CustomEvent('kshestra_audio_state', {
      detail: {
        isPlaying: this.isPlaying,
        track: OFFICIAL_TRACK,
        volume: this.volume
      }
    }));
  }
}

export const audioSynth = new KshestraAudioEngine();
export const SOUNDSCAPES = [
  {
    id: 'main_baaki_hoon',
    name: 'Main Baaki Hoon',
    raga: 'Official Background Score',
    mood: 'Soulful & Evocative',
    baseFreq: 440
  }
];
export type SoundscapeType = 'main_baaki_hoon';
