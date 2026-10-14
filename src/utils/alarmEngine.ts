/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Strong, punchy, high-quality synthesized alarm engine for break expiry.
// Replaces the old TTS voice with a bold, energetic notification tone:
// - Deep notification sub-punch (warm, commanding bottom-end thump)
// - Crisp double-bell strike (pristine harmonic chime)
// - Upbeat modern console alert motif (punchy, energetic, memorable)
// - Repeated with a clean rhythmic pause until user clicks or taps anywhere on screen.

type AlarmStateListener = (state: {
  isActive: boolean;
  isBlockedByAutoplay: boolean;
  repeatCount: number;
}) => void;

class PunchyAlarmEngine {
  private isActive: boolean = false;
  private isBlockedByAutoplay: boolean = false;
  private repeatCount: number = 0;
  private loopTimeoutId: number | null = null;
  private activeNodes: { stop?: () => void; disconnect: () => void }[] = [];
  private listeners: Set<AlarmStateListener> = new Set();
  private audioCtx: AudioContext | null = null;
  public volume: number = 0.75; // 0.0 to 1.0

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVol = localStorage.getItem('break_exe_alarm_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 1.0) {
          this.volume = parsed;
        }
      }
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0.1, Math.min(1.0, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('break_exe_alarm_volume', String(this.volume));
    }
  }

  public subscribe(listener: AlarmStateListener): () => void {
    this.listeners.add(listener);
    listener({
      isActive: this.isActive,
      isBlockedByAutoplay: this.isBlockedByAutoplay,
      repeatCount: this.repeatCount,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) =>
      fn({
        isActive: this.isActive,
        isBlockedByAutoplay: this.isBlockedByAutoplay,
        repeatCount: this.repeatCount,
      })
    );
  }

  public initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch {
      // ignore
    }
    return this.audioCtx;
  }

  // Pre-warms audio during user gesture (e.g. clicking Start Break)
  public primeUserGesture() {
    this.initAudioContext();
  }

  /**
   * Synthesizes a bold, energetic, multi-layered notification alarm sequence:
   * 1. Sub-Bass Punch: 220Hz -> 85Hz resonant drop (gives deep acoustic presence)
   * 2. Crisp Bell Hit 1: 880Hz (A5) + 1320Hz (E6) harmonic strike with fast attack
   * 3. Crisp Bell Hit 2: 1174Hz (D6) + 1760Hz (A6) resonant response
   * 4. Energetic Rising Motif: 4-note snappy console chime (A4, E5, A5, C#6)
   * Total sequence duration: ~1.05s
   */
  private playAlarmBurst(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.initAudioContext();
        if (!ctx) {
          resolve();
          return;
        }

        const masterGain = ctx.createGain();
        const now = ctx.currentTime;
        const vol = this.volume;

        masterGain.gain.setValueAtTime(vol, now);
        masterGain.connect(ctx.destination);

        // -------------------------------------------------------------
        // Layer 1: Deep Notification Sub-Bass Punch (0ms to 240ms)
        // -------------------------------------------------------------
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(240, now);
        subOsc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

        subGain.gain.setValueAtTime(0.38, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        subOsc.connect(subGain);
        subGain.connect(masterGain);

        subOsc.start(now);
        subOsc.stop(now + 0.25);
        this.activeNodes.push({
          stop: () => {
            try { subOsc.stop(); } catch { /* ignore */ }
          },
          disconnect: () => {
            try {
              subOsc.disconnect();
              subGain.disconnect();
            } catch { /* ignore */ }
          },
        });

        // -------------------------------------------------------------
        // Layer 2: Crisp Double-Bell Chimes (Strike 1 at 0ms, Strike 2 at 120ms)
        // -------------------------------------------------------------
        const bellHits = [
          { time: now, freqs: [880, 1320], dur: 0.55, gain: 0.28 },
          { time: now + 0.12, freqs: [1174.66, 1760], dur: 0.65, gain: 0.32 },
        ];

        bellHits.forEach((hit) => {
          hit.freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Triangle + Sine combination for authentic metallic sparkle
            osc.type = idx === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, hit.time);

            // Crisp instant strike attack, ringing exponential decay
            gain.gain.setValueAtTime(hit.gain * (idx === 0 ? 1 : 0.65), hit.time);
            gain.gain.exponentialRampToValueAtTime(0.001, hit.time + hit.dur);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(hit.time);
            osc.stop(hit.time + hit.dur);

            this.activeNodes.push({
              stop: () => {
                try { osc.stop(); } catch { /* ignore */ }
              },
              disconnect: () => {
                try {
                  osc.disconnect();
                  gain.disconnect();
                } catch { /* ignore */ }
              },
            });
          });
        });

        // -------------------------------------------------------------
        // Layer 3: Modern Upbeat 4-Note Accent Flourish (320ms to 780ms)
        // -------------------------------------------------------------
        const motifNotes = [
          { freq: 659.25, timeOffset: 0.30 }, // E5
          { freq: 880.00, timeOffset: 0.38 }, // A5
          { freq: 1108.73, timeOffset: 0.46 }, // C#6
          { freq: 1318.51, timeOffset: 0.54 }, // E6 (final celebratory ping)
        ];

        motifNotes.forEach((note) => {
          const t = now + note.timeOffset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.freq, t);

          gain.gain.setValueAtTime(0.24, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(t);
          osc.stop(t + 0.34);

          this.activeNodes.push({
            stop: () => {
              try { osc.stop(); } catch { /* ignore */ }
            },
            disconnect: () => {
              try {
                osc.disconnect();
                gain.disconnect();
              } catch { /* ignore */ }
            },
          });
        });

        // Clean up resolved nodes after sequence completes (~1.05s)
        setTimeout(() => {
          resolve();
        }, 1050);
      } catch (err) {
        this.isBlockedByAutoplay = true;
        this.notify();
        resolve();
      }
    });
  }

  // Starts repeating alarm until dismissed
  public start() {
    if (this.isActive) return;

    this.isActive = true;
    this.isBlockedByAutoplay = false;
    this.repeatCount = 0;
    this.notify();

    this.runLoop();
  }

  private async runLoop() {
    if (!this.isActive) return;

    this.repeatCount += 1;
    this.notify();

    await this.playAlarmBurst();

    if (!this.isActive) return;

    // Short, clean rhythmic pause between bursts (~900ms)
    this.loopTimeoutId = window.setTimeout(() => {
      if (this.isActive) {
        this.runLoop();
      }
    }, 900);
  }

  // Stops alarm immediately and cuts all audio nodes
  public stop() {
    this.isActive = false;
    this.isBlockedByAutoplay = false;
    this.repeatCount = 0;

    if (this.loopTimeoutId) {
      clearTimeout(this.loopTimeoutId);
      this.loopTimeoutId = null;
    }

    // Immediately stop & disconnect all sounding oscillators
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];

    this.notify();
  }

  public getStatus() {
    return {
      isActive: this.isActive,
      isBlockedByAutoplay: this.isBlockedByAutoplay,
      repeatCount: this.repeatCount,
    };
  }
}

export const alarmEngine = new PunchyAlarmEngine();
