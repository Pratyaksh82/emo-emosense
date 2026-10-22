import os

base_dir = "C:/Users/praty/Desktop/emo-girl/emo-voice"
os.makedirs(f"{base_dir}/src/types", exist_ok=True)
os.makedirs(f"{base_dir}/src/analyzer", exist_ok=True)
os.makedirs(f"{base_dir}/src/synthesis", exist_ok=True)

# 1. Types
types_content = r'''/**
 * emo-voice Core Type Definitions
 * Acoustic Telemetry, Speech Emotion Recognition (SER), and Procedural Soundscape
 */

export interface VocalAcousticFeatures {
  f0: number;               // Fundamental frequency (pitch in Hz)
  pitchVariance: number;    // Semitone deviation across window
  rms: number;              // Root Mean Square loudness (0.0 to 1.0)
  zcr: number;              // Zero Crossing Rate (noise/unvoiced speech indicator)
  jitter: number;           // Cycle-to-cycle frequency perturbation (vocal micro-tremor)
  shimmer: number;          // Cycle-to-cycle amplitude perturbation (vocal instability)
  spectralCentroid: number; // Brightness / sharpness of voice in Hz
  pauseRatio: number;       // Ratio of silence to speech in observation window
}

export interface VoiceEmotionEstimate {
  valence: number;          // -1.0 (deep distress/sadness) to +1.0 (pure joy)
  arousal: number;          // -1.0 (exhaustion/flat affect) to +1.0 (panic/high agitation)
  stressLevel: number;      // 0.0 (deep calm) to 1.0 (acute panic/overwhelm)
  tremorDetected: boolean;  // True if involuntary vocal cords tremor is observed
  flatAffectDetected: boolean; // True if monotonous, depressed, unresponsive prosody
  primaryEmotion: "neutral" | "happy" | "sad" | "anxious" | "crisis" | "fatigued";
  confidence: number;       // 0.0 to 1.0
  timestamp: number;
}

export interface TherapeuticAudioConfig {
  enableBinauralTheta: boolean; // 432 Hz / 436 Hz -> 4 Hz theta brainwave calming tone
  thetaGain: number;            // Volume of soothing theta drone (default 0.06 - 0.10)
  warmthFilterCutoff: number;   // Cutoff frequency for soothing warmth filter (Hz)
  speed: number;                // Speech delivery rate
  pitch: number;                // Speech pitch multiplier
}
'''
with open(f"{base_dir}/src/types/index.ts", "w", encoding="utf-8") as f:
    f.write(types_content)

# 2. AudioContextManager
audio_ctx_content = r'''/**
 * Manages singleton Web Audio Context and microphone stream
 */
export class AudioContextManager {
  private static instance: AudioContextManager;
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;

  private constructor() {}

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  public getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public async startMicrophone(): Promise<{ analyser: AnalyserNode; ctx: AudioContext }> {
    const ctx = this.getContext();
    if (!this.micStream) {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // keep natural vocal dynamics for SER
          autoGainControl: false,  // preserve raw dynamic energy for emotion detection
        },
      });
    }

    if (!this.micSource) {
      this.micSource = ctx.createMediaStreamSource(this.micStream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.micSource.connect(this.analyser);
    }

    return { analyser: this.analyser!, ctx };
  }

  public stopMicrophone(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    this.analyser = null;
  }
}
'''
with open(f"{base_dir}/src/analyzer/AudioContextManager.ts", "w", encoding="utf-8") as f:
    f.write(audio_ctx_content)

# 3. PitchDetector
pitch_content = r'''/**
 * High-accuracy autocorrelation algorithm for extracting fundamental pitch (F0)
 * in the standard human vocal frequency band (65 Hz to 500 Hz).
 */
export class PitchDetector {
  public static detectPitch(buffer: Float32Array, sampleRate: number): number {
    const minF = 65;   // Deepest human bass
    const maxF = 500;  // High soprano / screaming
    const minPeriod = Math.floor(sampleRate / maxF);
    const maxPeriod = Math.floor(sampleRate / minF);

    let bestR = 0;
    let bestPeriod = -1;

    // Fast Normalized Square Difference Autocorrelation
    for (let tau = minPeriod; tau <= maxPeriod; tau++) {
      let r = 0;
      let e1 = 0;
      let e2 = 0;

      for (let i = 0; i < buffer.length - tau; i += 2) {
        r += buffer[i] * buffer[i + tau];
        e1 += buffer[i] * buffer[i];
        e2 += buffer[i + tau] * buffer[i + tau];
      }

      const denom = Math.sqrt(e1 * e2);
      if (denom > 1e-6) {
        const normR = r / denom;
        if (normR > bestR) {
          bestR = normR;
          bestPeriod = tau;
        }
      }
    }

    // Require confidence threshold to filter out silent noise
    if (bestR > 0.45 && bestPeriod > 0) {
      return sampleRate / bestPeriod;
    }

    return 0; // Unvoiced / silent
  }
}
'''
with open(f"{base_dir}/src/analyzer/PitchDetector.ts", "w", encoding="utf-8") as f:
    f.write(pitch_content)

# 4. AcousticFeatures
features_content = r'''import { VocalAcousticFeatures } from "../types";
import { PitchDetector } from "./PitchDetector";

/**
 * Extracts acoustic telemetry vectors in real time from Web Audio time and frequency domain data.
 */
export class AcousticFeatureExtractor {
  private pitchHistory: number[] = [];
  private amplitudeHistory: number[] = [];
  private silenceFrames = 0;
  private totalFrames = 0;

  public extract(
    timeDomain: Float32Array,
    frequencyDomain: Uint8Array,
    sampleRate: number
  ): VocalAcousticFeatures {
    this.totalFrames++;

    // 1. RMS Energy (Volume)
    let sumSquares = 0;
    let zeroCrossings = 0;
    for (let i = 0; i < timeDomain.length; i++) {
      sumSquares += timeDomain[i] * timeDomain[i];
      if (i > 0 && ((timeDomain[i] >= 0 && timeDomain[i - 1] < 0) || (timeDomain[i] < 0 && timeDomain[i - 1] >= 0))) {
        zeroCrossings++;
      }
    }
    const rms = Math.min(1.0, Math.sqrt(sumSquares / timeDomain.length) * 4.5);
    const zcr = zeroCrossings / timeDomain.length;

    // Silence detection for pause ratio (silence threshold < 0.02)
    const isSilent = rms < 0.02;
    if (isSilent) {
      this.silenceFrames++;
    }
    const pauseRatio = this.totalFrames > 0 ? this.silenceFrames / this.totalFrames : 0;

    // 2. Fundamental Frequency (F0)
    const f0 = isSilent ? 0 : PitchDetector.detectPitch(timeDomain, sampleRate);
    if (f0 > 0) {
      this.pitchHistory.push(f0);
      this.amplitudeHistory.push(rms);
      if (this.pitchHistory.length > 50) this.pitchHistory.shift();
      if (this.amplitudeHistory.length > 50) this.amplitudeHistory.shift();
    }

    // 3. Jitter (Micro-pitch perturbation)
    let jitter = 0;
    if (this.pitchHistory.length >= 3) {
      let diffSum = 0;
      let f0Sum = 0;
      for (let i = 1; i < this.pitchHistory.length; i++) {
        diffSum += Math.abs(this.pitchHistory[i] - this.pitchHistory[i - 1]);
        f0Sum += this.pitchHistory[i];
      }
      const meanF0 = f0Sum / this.pitchHistory.length;
      jitter = meanF0 > 0 ? (diffSum / (this.pitchHistory.length - 1)) / meanF0 : 0;
    }

    // 4. Shimmer (Micro-amplitude perturbation)
    let shimmer = 0;
    if (this.amplitudeHistory.length >= 3) {
      let ampDiff = 0;
      let ampSum = 0;
      for (let i = 1; i < this.amplitudeHistory.length; i++) {
        ampDiff += Math.abs(this.amplitudeHistory[i] - this.amplitudeHistory[i - 1]);
        ampSum += this.amplitudeHistory[i];
      }
      const meanAmp = ampSum / this.amplitudeHistory.length;
      shimmer = meanAmp > 0 ? (ampDiff / (this.amplitudeHistory.length - 1)) / meanAmp : 0;
    }

    // 5. Pitch Variance
    let pitchVariance = 0;
    if (this.pitchHistory.length >= 2) {
      const mean = this.pitchHistory.reduce((a, b) => a + b, 0) / this.pitchHistory.length;
      const variance = this.pitchHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.pitchHistory.length;
      pitchVariance = Math.sqrt(variance);
    }

    // 6. Spectral Centroid
    let weightedSum = 0;
    let totalMagnitude = 0;
    const nyquist = sampleRate / 2;
    const binSize = nyquist / frequencyDomain.length;
    for (let i = 0; i < frequencyDomain.length; i++) {
      const mag = frequencyDomain[i];
      weightedSum += i * binSize * mag;
      totalMagnitude += mag;
    }
    const spectralCentroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;

    return {
      f0,
      pitchVariance,
      rms,
      zcr,
      jitter: Math.min(1.0, jitter),
      shimmer: Math.min(1.0, shimmer),
      spectralCentroid,
      pauseRatio,
    };
  }

  public reset(): void {
    this.pitchHistory = [];
    this.amplitudeHistory = [];
    this.silenceFrames = 0;
    this.totalFrames = 0;
  }
}
'''
with open(f"{base_dir}/src/analyzer/AcousticFeatures.ts", "w", encoding="utf-8") as f:
    f.write(features_content)

# 5. VoiceEmotionClassifier
classifier_content = r'''import { VocalAcousticFeatures, VoiceEmotionEstimate } from "../types";

/**
 * Maps raw vocal acoustic telemetry to continuous Valence, Arousal, Stress, and Flat Affect.
 * Uses a 25-frame FIFO queue + Exponential Moving Average (EMA) and a 5-streak state-lock
 * compliant with Member 2's core stability treatise.
 */
export class VoiceEmotionClassifier {
  private readonly WINDOW_SIZE = 25;
  private readonly ALPHA = 0.25; // EMA smoothing factor
  private readonly STREAK_THRESHOLD = 5;

  private f0Queue: number[] = [];
  private rmsQueue: number[] = [];
  private jitterQueue: number[] = [];
  private shimmerQueue: number[] = [];

  private smoothedValence = 0;
  private smoothedArousal = 0;
  private smoothedStress = 0;

  private candidateEmotion: VoiceEmotionEstimate["primaryEmotion"] = "neutral";
  private candidateStreak = 0;
  private lockedEmotion: VoiceEmotionEstimate["primaryEmotion"] = "neutral";

  public classify(f: VocalAcousticFeatures): VoiceEmotionEstimate {
    // Maintain FIFO window
    this.f0Queue.push(f.f0);
    this.rmsQueue.push(f.rms);
    this.jitterQueue.push(f.jitter);
    this.shimmerQueue.push(f.shimmer);

    if (this.f0Queue.length > this.WINDOW_SIZE) this.f0Queue.shift();
    if (this.rmsQueue.length > this.WINDOW_SIZE) this.rmsQueue.shift();
    if (this.jitterQueue.length > this.WINDOW_SIZE) this.jitterQueue.shift();
    if (this.shimmerQueue.length > this.WINDOW_SIZE) this.shimmerQueue.shift();

    const avgRMS = this.rmsQueue.reduce((a, b) => a + b, 0) / this.rmsQueue.length;
    const avgJitter = this.jitterQueue.reduce((a, b) => a + b, 0) / this.jitterQueue.length;
    const avgShimmer = this.shimmerQueue.reduce((a, b) => a + b, 0) / this.shimmerQueue.length;

    // 1. Instantaneous Arousal Calculation
    // High energy (loudness) + elevated pitch + high jitter = High Arousal
    const rawArousal = Math.min(1.0, Math.max(-1.0, (avgRMS * 1.8) + (f.f0 > 240 ? 0.35 : f.f0 < 110 && f.f0 > 0 ? -0.35 : 0) - 0.5));

    // 2. Instantaneous Valence Calculation
    // Stability (low jitter/shimmer) + bright melody = Positive Valence
    // Severe jitter (tremor) + low flat pitch + tearful shimmer = Deep Negative Valence
    let rawValence = 0.0;
    if (avgJitter > 0.05 || avgShimmer > 0.12) {
      rawValence -= 0.55; // Vocal distress / trembling
    }
    if (f.f0 > 180 && f.pitchVariance > 25 && avgJitter < 0.03) {
      rawValence += 0.50; // Cheerful, melodic inflection
    }
    if (f.pitchVariance < 8 && f.f0 > 0 && f.pauseRatio > 0.35) {
      rawValence -= 0.45; // Monotone, depressed prosody
    }
    rawValence = Math.min(1.0, Math.max(-1.0, rawValence));

    // 3. Stress & Panic Index (0.0 to 1.0)
    const rawStress = Math.min(
      1.0,
      Math.max(
        0.0,
        (avgJitter * 8.0) + (avgShimmer * 3.5) + (rawArousal > 0.4 ? 0.3 : 0)
      )
    );

    // Apply Exponential Moving Average (EMA)
    this.smoothedArousal = (this.ALPHA * rawArousal) + ((1 - this.ALPHA) * this.smoothedArousal);
    this.smoothedValence = (this.ALPHA * rawValence) + ((1 - this.ALPHA) * this.smoothedValence);
    this.smoothedStress = (this.ALPHA * rawStress) + ((1 - this.ALPHA) * this.smoothedStress);

    // Flat affect detection (Psychomotor retardation marker)
    const flatAffectDetected = f.pitchVariance < 7 && f.f0 > 0 && f.pauseRatio > 0.40 && avgRMS < 0.15;
    const tremorDetected = avgJitter > 0.045 || avgShimmer > 0.10;

    // Discrete State Determination
    let currentSampleEmotion: VoiceEmotionEstimate["primaryEmotion"] = "neutral";
    if (this.smoothedStress > 0.70 || (tremorDetected && this.smoothedValence < -0.4)) {
      currentSampleEmotion = "crisis";
    } else if (this.smoothedStress > 0.45 || (this.smoothedArousal > 0.3 && this.smoothedValence < -0.1)) {
      currentSampleEmotion = "anxious";
    } else if (this.smoothedValence < -0.3 || flatAffectDetected) {
      currentSampleEmotion = "sad";
    } else if (this.smoothedValence > 0.3 && this.smoothedArousal > 0.1) {
      currentSampleEmotion = "happy";
    } else if (this.smoothedArousal < -0.4) {
      currentSampleEmotion = "fatigued";
    }

    // 5-streak state locking
    if (currentSampleEmotion === this.candidateEmotion) {
      this.candidateStreak++;
      if (this.candidateStreak >= this.STREAK_THRESHOLD) {
        this.lockedEmotion = currentSampleEmotion;
      }
    } else {
      this.candidateEmotion = currentSampleEmotion;
      this.candidateStreak = 1;
    }

    return {
      valence: Math.round(this.smoothedValence * 100) / 100,
      arousal: Math.round(this.smoothedArousal * 100) / 100,
      stressLevel: Math.round(this.smoothedStress * 100) / 100,
      tremorDetected,
      flatAffectDetected,
      primaryEmotion: this.lockedEmotion,
      confidence: Math.min(0.95, 0.5 + (this.f0Queue.length / this.WINDOW_SIZE) * 0.45),
      timestamp: Date.now(),
    };
  }

  public reset(): void {
    this.f0Queue = [];
    this.rmsQueue = [];
    this.jitterQueue = [];
    this.shimmerQueue = [];
    this.candidateStreak = 0;
    this.lockedEmotion = "neutral";
    this.smoothedValence = 0;
    this.smoothedArousal = 0;
    this.smoothedStress = 0;
  }
}
'''
with open(f"{base_dir}/src/analyzer/VoiceEmotionClassifier.ts", "w", encoding="utf-8") as f:
    f.write(classifier_content)

# 6. ProceduralSoundscape (432Hz / 436Hz -> 4Hz Theta Binaural Healing Drone)
procedural_content = r'''import { AudioContextManager } from "../analyzer/AudioContextManager";

/**
 * Procedural Audio Synthesizer (Member 3 Architecture Specification)
 * Synthesizes subtle binaural beats at 432 Hz and 436 Hz, producing a 4 Hz theta brainwave
 * entrainment tone that stimulates the parasympathetic nervous system to soothe acute distress.
 */
export class ProceduralSoundscape {
  private static instance: ProceduralSoundscape;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private isPlaying = false;

  private constructor() {}

  public static getInstance(): ProceduralSoundscape {
    if (!ProceduralSoundscape.instance) {
      ProceduralSoundscape.instance = new ProceduralSoundscape();
    }
    return ProceduralSoundscape.instance;
  }

  /**
   * Starts the 432 Hz / 436 Hz soothing theta entrainment tone with smooth exponential attack
   */
  public startThetaEntrainment(targetVolume = 0.08, attackDuration = 2.5): void {
    if (this.isPlaying) return;

    try {
      const ctx = AudioContextManager.getInstance().getContext();
      const now = ctx.currentTime;

      // Dual channel merger for true stereo binaural entrainment
      this.merger = ctx.createChannelMerger(2);
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);

      // Left Channel: 432.0 Hz (Sacred geometric resonant base)
      this.oscLeft = ctx.createOscillator();
      this.oscLeft.type = "sine";
      this.oscLeft.frequency.setValueAtTime(432.0, now);
      this.oscLeft.connect(this.merger, 0, 0);

      // Right Channel: 436.0 Hz (4.0 Hz differential -> Theta wave entrainment)
      this.oscRight = ctx.createOscillator();
      this.oscRight.type = "sine";
      this.oscRight.frequency.setValueAtTime(436.0, now);
      this.oscRight.connect(this.merger, 0, 1);

      this.merger.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);

      this.oscLeft.start(now);
      this.oscRight.start(now);

      // Smooth exponential fade-in so user does not hear sudden clicks
      this.masterGain.gain.exponentialRampToValueAtTime(targetVolume, now + attackDuration);
      this.isPlaying = true;
    } catch (err) {
      console.warn("Procedural soundscape failed to initialize:", err);
    }
  }

  /**
   * Smoothly fades out the theta entrainment tone
   */
  public stopThetaEntrainment(fadeDuration = 3.0): void {
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
          this.oscLeft?.disconnect();
          this.oscRight?.disconnect();
          this.merger?.disconnect();
          this.masterGain?.disconnect();
        } catch {}
        this.oscLeft = null;
        this.oscRight = null;
        this.merger = null;
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
with open(f"{base_dir}/src/synthesis/ProceduralSoundscape.ts", "w", encoding="utf-8") as f:
    f.write(procedural_content)

# 7. WarmthFilter (Acoustic Softening Node)
warmth_content = r'''import { AudioContextManager } from "../analyzer/AudioContextManager";

/**
 * Real-time Web Audio DSP Warmth Filter
 * Softens harsh digital high frequencies and enriches gentle vocal resonance.
 */
export class WarmthFilter {
  public static createChain(ctx: AudioContext): { inputNode: AudioNode; outputNode: AudioNode } {
    // 1. Low-Pass Shelf: Softens high-frequency digital sibilance (>3400 Hz)
    const lowPass = ctx.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.setValueAtTime(3400, ctx.currentTime);
    lowPass.Q.setValueAtTime(0.707, ctx.currentTime);

    // 2. Peaking Presence: Enriches warm chest resonance (220 Hz + 1.8dB)
    const warmPeak = ctx.createBiquadFilter();
    warmPeak.type = "peaking";
    warmPeak.frequency.setValueAtTime(220, ctx.currentTime);
    warmPeak.Q.setValueAtTime(1.0, ctx.currentTime);
    warmPeak.gain.setValueAtTime(1.8, ctx.currentTime);

    lowPass.connect(warmPeak);

    return { inputNode: lowPass, outputNode: warmPeak };
  }
}
'''
with open(f"{base_dir}/src/synthesis/WarmthFilter.ts", "w", encoding="utf-8") as f:
    f.write(warmth_content)

# 8. AdaptiveVoiceEngine (Main Facade)
engine_content = r'''import { AudioContextManager } from "./analyzer/AudioContextManager";
import { AcousticFeatureExtractor } from "./analyzer/AcousticFeatures";
import { VoiceEmotionClassifier } from "./analyzer/VoiceEmotionClassifier";
import { ProceduralSoundscape } from "./synthesis/ProceduralSoundscape";
import { WarmthFilter } from "./synthesis/WarmthFilter";
import { VoiceEmotionEstimate, VocalAcousticFeatures, TherapeuticAudioConfig } from "./types";

/**
 * AdaptiveVoiceEngine: The unified bilateral voice engine
 * Unites Speech Emotion Recognition (SER) input with closed-loop therapeutic output modulation.
 */
export class AdaptiveVoiceEngine {
  private static instance: AdaptiveVoiceEngine;
  private extractor = new AcousticFeatureExtractor();
  private classifier = new VoiceEmotionClassifier();
  private soundscape = ProceduralSoundscape.getInstance();
  private isListening = false;
  private animFrameId: number | null = null;
  private onEmotionUpdate?: (estimate: VoiceEmotionEstimate, features: VocalAcousticFeatures) => void;

  private constructor() {}

  public static getInstance(): AdaptiveVoiceEngine {
    if (!AdaptiveVoiceEngine.instance) {
      AdaptiveVoiceEngine.instance = new AdaptiveVoiceEngine();
    }
    return AdaptiveVoiceEngine.instance;
  }

  /**
   * Starts listening and analyzing microphone telemetry for vocal emotion in real time
   */
  public async startVoiceEmotionAnalysis(
    onUpdate?: (estimate: VoiceEmotionEstimate, features: VocalAcousticFeatures) => void
  ): Promise<void> {
    if (this.isListening) return;
    this.onEmotionUpdate = onUpdate;
    this.extractor.reset();
    this.classifier.reset();

    const { analyser, ctx } = await AudioContextManager.getInstance().startMicrophone();
    this.isListening = true;

    const timeDomain = new Float32Array(analyser.fftSize);
    const frequencyDomain = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      if (!this.isListening) return;
      analyser.getFloatTimeDomainData(timeDomain);
      analyser.getByteFrequencyData(frequencyDomain);

      const features = this.extractor.extract(timeDomain, frequencyDomain, ctx.sampleRate);
      const estimate = this.classifier.classify(features);

      this.onEmotionUpdate?.(estimate, features);

      // Closed-loop trigger: If acute crisis or extreme anxiety detected in voice, auto-prime calming soundscape
      if (estimate.primaryEmotion === "crisis" || (estimate.stressLevel > 0.65 && estimate.tremorDetected)) {
        if (!this.soundscape.isActive()) {
          this.soundscape.startThetaEntrainment(0.07, 2.0);
        }
      } else if (estimate.primaryEmotion === "happy" || estimate.stressLevel < 0.25) {
        if (this.soundscape.isActive()) {
          this.soundscape.stopThetaEntrainment(3.5);
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  public stopVoiceEmotionAnalysis(): void {
    this.isListening = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    AudioContextManager.getInstance().stopMicrophone();
  }

  /**
   * Generates therapeutic audio configuration based on user emotion
   */
  public getTherapeuticConfig(emotion: string): TherapeuticAudioConfig {
    const e = emotion.toLowerCase();
    switch (e) {
      case "crisis":
      case "sad":
        return {
          enableBinauralTheta: true,
          thetaGain: 0.08,
          warmthFilterCutoff: 3100,
          speed: 0.88,
          pitch: 0.92,
        };
      case "anxious":
      case "stress":
        return {
          enableBinauralTheta: true,
          thetaGain: 0.06,
          warmthFilterCutoff: 3300,
          speed: 0.92,
          pitch: 0.95,
        };
      case "happy":
      case "joy":
        return {
          enableBinauralTheta: false,
          thetaGain: 0,
          warmthFilterCutoff: 4000,
          speed: 1.05,
          pitch: 1.08,
        };
      default:
        return {
          enableBinauralTheta: false,
          thetaGain: 0,
          warmthFilterCutoff: 3500,
          speed: 0.97,
          pitch: 1.0,
        };
    }
  }

  public getSoundscape(): ProceduralSoundscape {
    return this.soundscape;
  }
}
'''
with open(f"{base_dir}/src/AdaptiveVoiceEngine.ts", "w", encoding="utf-8") as f:
    f.write(engine_content)

# 9. Main Index Barrel
index_content = r'''export * from "./types";
export * from "./analyzer/AudioContextManager";
export * from "./analyzer/PitchDetector";
export * from "./analyzer/AcousticFeatures";
export * from "./analyzer/VoiceEmotionClassifier";
export * from "./synthesis/ProceduralSoundscape";
export * from "./synthesis/WarmthFilter";
export * from "./AdaptiveVoiceEngine";
'''
with open(f"{base_dir}/src/index.ts", "w", encoding="utf-8") as f:
    f.write(index_content)

# 10. package.json for emo-voice module
pkg_content = r'''{
  "name": "emo-voice",
  "version": "1.0.0",
  "description": "Bilateral Speech Emotion Recognition (SER) and Closed-Loop Procedural Therapeutic Audio Engine",
  "main": "src/index.ts",
  "author": "EmoSense AI",
  "license": "MIT"
}
'''
with open(f"{base_dir}/package.json", "w", encoding="utf-8") as f:
    f.write(pkg_content)

print("emo-voice module created successfully with all components!")
