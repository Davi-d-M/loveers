/**
 * Web Audio API Synthesizer for EverGift Ambient Themes
 * Generates soft, ethereal, relaxing background chord progressions
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: any = null;
  private masterGain: GainNode | null = null;
  private currentTrack: string = "piano";

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15; // Soft volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playTrack(trackName: string = "piano") {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying) {
      this.stop();
    }

    this.currentTrack = trackName;
    if (trackName === "none") return;

    this.isPlaying = true;

    // Frequencies for soothing chord progressions (C major / A minor pentatonic / F maj7)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C maj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // F maj7
      [196.00, 246.94, 293.66, 392.00], // G
    ];

    let chordIndex = 0;

    const playChordLoop = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const chord = chords[chordIndex % chords.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      const duration = 4.5;

      chord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        // Waveform based on track
        if (trackName === "celestial-bells") {
          osc.type = "sine";
        } else if (trackName === "lofi-nostalgia") {
          osc.type = "triangle";
        } else {
          osc.type = "sine";
        }

        // Slight detune for warmth
        osc.frequency.value = freq + (i % 2 === 0 ? 0.8 : -0.8);

        // Envelope: soft attack and long gentle release
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04 + i * 0.01, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration - 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.15); // Staggered arpeggio effect
        osc.stop(now + duration);
      });

      this.timerId = setTimeout(playChordLoop, 4200);
    };

    playChordLoop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(trackName: string = "piano"): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.playTrack(trackName);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public playChime() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.6);
    });
  }
}

export const ambientAudio = new AmbientAudioEngine();
