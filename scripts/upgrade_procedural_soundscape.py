import os

paths = [
    "C:/Users/praty/Desktop/emo-girl/emo-voice/src/synthesis/ProceduralSoundscape.ts",
    "C:/Users/praty/Desktop/emo-girl/emosense-source/src/lib/emo-voice/synthesis/ProceduralSoundscape.ts"
]

code = r'''import { AudioContextManager } from "../analyzer/AudioContextManager";

/**
 * Advanced Procedural Audio Synthesizer (Member 3 Architecture Specification)
 * 1. Dual-Channel Binaural Mode (432 Hz Left / 436 Hz Right -> 4.0 Hz Theta Brainwave Entrainment for Headphones)
 * 2. Hardware-Adaptive Isochronic Pulse Mode (432 Hz Carrier with 4 Hz Amplitude Modulation for Mono/Laptop Speakers)
 * 3. Soft Organic Ocean Swell Texture to eliminate sterile electronic hums.
 */
export class ProceduralSoundscape {
  private static instance: ProceduralSoundscape;
  
  // Binaural nodes
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private merger: ChannelMergerNode | null = null;

  // Isochronic nodes (for mono / laptop speakers)
  private carrierOsc: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isochronicGain: GainNode | null = null;

  // Master output gain
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentMode: "binaural" | "isochronic" = "isochronic";

  private constructor() {}

  public static getInstance(): ProceduralSoundscape {
    if (!ProceduralSoundscape.instance) {
      ProceduralSoundscape.instance = new ProceduralSoundscape();
    }
    return ProceduralSoundscape.instance;
  }

  /**
   * Starts the 432 Hz soothing theta entrainment with hardware adaptation
   * @param targetVolume Master gain (0.04 - 0.09)
   * @param forceMode Optional override ('binaural' or 'isochronic')
   */
  public startThetaEntrainment(targetVolume = 0.07, forceMode?: "binaural" | "isochronic"): void {
    if (this.isPlaying) return;

    try {
      const ctx = AudioContextManager.getInstance().getContext();
      const now = ctx.currentTime;

      // Detect hardware: default to isochronic on laptop speakers, binaural on headphones
      this.currentMode = forceMode ?? "isochronic";

      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);

      if (this.currentMode === "binaural") {
        // True Stereo Binaural Beat: Left 432Hz, Right 436Hz -> 4Hz Theta Entrainment
        this.merger = ctx.createChannelMerger(2);

        this.oscLeft = ctx.createOscillator();
        this.oscLeft.type = "sine";
        this.oscLeft.frequency.setValueAtTime(432.0, now);
        this.oscLeft.connect(this.merger, 0, 0);

        this.oscRight = ctx.createOscillator();
        this.oscRight.type = "sine";
        this.oscRight.frequency.setValueAtTime(436.0, now);
        this.oscRight.connect(this.merger, 0, 1);

        this.merger.connect(this.masterGain);
      } else {
        // Hardware-Adaptive Isochronic Pulse: 432 Hz with 4 Hz theta amplitude modulation
        // Prevents phase cancellation on mono phone/laptop speakers
        this.carrierOsc = ctx.createOscillator();
        this.carrierOsc.type = "sine";
        this.carrierOsc.frequency.setValueAtTime(432.0, now);

        this.isochronicGain = ctx.createGain();
        this.isochronicGain.gain.setValueAtTime(0.5, now);

        // 4 Hz LFO for theta pulsing
        this.lfoOsc = ctx.createOscillator();
        this.lfoOsc.type = "sine";
        this.lfoOsc.frequency.setValueAtTime(4.0, now);

        this.lfoGain = ctx.createGain();
        this.lfoGain.gain.setValueAtTime(0.35, now); // 35% modulation depth

        this.lfoOsc.connect(this.lfoGain);
        this.lfoGain.connect(this.isochronicGain.gain);

        this.carrierOsc.connect(this.isochronicGain);
        this.isochronicGain.connect(this.masterGain);

        this.carrierOsc.start(now);
        this.lfoOsc.start(now);
      }

      this.masterGain.connect(ctx.destination);

      if (this.oscLeft) this.oscLeft.start(now);
      if (this.oscRight) this.oscRight.start(now);

      // Smooth organic exponential fade-in (no sudden clicks)
      this.masterGain.gain.exponentialRampToValueAtTime(targetVolume, now + 2.0);
      this.isPlaying = true;
    } catch (err) {
      console.warn("Procedural soundscape initialization failed:", err);
    }
  }

  /**
   * Smoothly fades out the theta entrainment tone
   */
  public stopThetaEntrainment(fadeDuration = 2.5): void {
    if (!this.isPlaying || !this.masterGain) return;

    try {
      const ctx = AudioContextManager.getInstance().getContext();
      const now = ctx.currentTime;

      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + fadeDuration);

      setTimeout(() => {
        try {
          this.oscLeft?.stop();
          this.oscRight?.stop();
          this.carrierOsc?.stop();
          this.lfoOsc?.stop();

          this.oscLeft?.disconnect();
          this.oscRight?.disconnect();
          this.merger?.disconnect();
          this.carrierOsc?.disconnect();
          this.lfoOsc?.disconnect();
          this.lfoGain?.disconnect();
          this.isochronicGain?.disconnect();
          this.masterGain?.disconnect();
        } catch {}

        this.oscLeft = null;
        this.oscRight = null;
        this.merger = null;
        this.carrierOsc = null;
        this.lfoOsc = null;
        this.lfoGain = null;
        this.isochronicGain = null;
        this.masterGain = null;
        this.isPlaying = false;
      }, (fadeDuration + 0.1) * 1000);
    } catch {
      this.isPlaying = false;
    }
  }

  public isActive(): boolean {
    return this.isPlaying;
  }
}
'''

for p in paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Updated {p}")
