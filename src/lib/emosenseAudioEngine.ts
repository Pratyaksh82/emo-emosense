import { VoiceModulation } from './emosenseTypes';

export type SoundscapePresetId = 'drone_432' | 'rain' | 'ocean' | 'forest';

export interface SoundscapePreset {
  id: SoundscapePresetId;
  name: string;
  emoji: string;
  description: string;
  frequencyLabel: string;
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'drone_432',
    name: '432 Hz Solfeggio Theta',
    emoji: '🧘',
    description: 'Binaural carrier wave tuned to 432 Hz with a 4 Hz theta calming beat',
    frequencyLabel: '432 Hz + 4 Hz Theta'
  },
  {
    id: 'rain',
    name: 'Gentle Pink Rain',
    emoji: '🌧️',
    description: 'Continuous filtered pink noise with soft randomized raindrop ambience',
    frequencyLabel: 'Filtered Pink Noise'
  },
  {
    id: 'ocean',
    name: 'Ocean Grounding Swell',
    emoji: '🌊',
    description: 'Rhythmic low-frequency wave swells designed for parasympathetic entrainment',
    frequencyLabel: '0.1 Hz Respiratory Resonant'
  },
  {
    id: 'forest',
    name: 'Forest Canopy Wind',
    emoji: '🍃',
    description: 'Sweeping organic mountain pine breeze for grounding awareness',
    frequencyLabel: 'Swept Bandpass Noise'
  }
];

class EmoSenseAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentPreset: SoundscapePresetId | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private activeNodes: (AudioNode | AudioScheduledSourceNode)[] = [];
  private activeIntervals: number[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentPreset(): SoundscapePresetId | null {
    return this.currentPreset;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  public stop() {
    this.cleanup();
    this.isPlaying = false;
    this.currentPreset = null;
  }

  private cleanup() {
    this.activeIntervals.forEach((id) => clearInterval(id));
    this.activeIntervals = [];

    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];
  }

  public play(preset: SoundscapePresetId) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying && this.currentPreset === preset) {
      this.stop();
      return;
    }

    this.cleanup();
    this.currentPreset = preset;
    this.isPlaying = true;

    if (preset === 'drone_432') {
      this.play432HzDrone();
    } else if (preset === 'rain') {
      this.playRainSound();
    } else if (preset === 'ocean') {
      this.playOceanWaves();
    } else if (preset === 'forest') {
      this.playForestWind();
    }
  }

  private play432HzDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Carrier 432 Hz
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, this.ctx.currentTime);

    // Detuned Theta Beat 436 Hz (4 Hz difference creates binaural entrainment)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(436, this.ctx.currentTime);

    // Warm sub-harmonic 216 Hz
    const sub = this.ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(216, this.ctx.currentTime);

    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();
    const subGain = this.ctx.createGain();

    gain1.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain2.gain.setValueAtTime(0.25, this.ctx.currentTime);
    subGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    sub.connect(subGain);

    gain1.connect(filter);
    gain2.connect(filter);
    subGain.connect(filter);

    filter.connect(this.masterGain);

    osc1.start();
    osc2.start();
    sub.start();

    this.activeNodes.push(osc1, osc2, sub, gain1, gain2, subGain, filter);
  }

  private playRainSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  private playOceanWaves() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // LFO for periodic wave breathing (0.1 Hz = ~10s full wave cycle)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, filter, lfo, lfoGain);
  }

  private playForestWind() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter);
  }
}

export const globalSoundscape = new EmoSenseAudioSynthesizer();

/**
 * Computes optimal voice rate, pitch, and volume based on emotion & stress.
 */
export function computeAdaptiveVoiceProfile(
  emotion?: string | null,
  valence?: number | null,
  stressLevel?: number | null
): VoiceModulation {
  const norm = (emotion ?? 'neutral').toLowerCase();
  const v = valence ?? 0;
  const stress = stressLevel ?? 20;

  if (stress > 65 || norm === 'tense' || norm === 'fearful' || norm === 'angry') {
    return {
      rate: 0.82,
      pitch: 0.92,
      volume: 0.90,
      styleLabel: 'Calming De-escalation',
      styleEmoji: '🧘'
    };
  }

  if (norm === 'sad' || v <= -0.5) {
    return {
      rate: 0.78,
      pitch: 0.88,
      volume: 0.82,
      styleLabel: 'Compassionate & Soft',
      styleEmoji: '💔'
    };
  }

  if (norm === 'happy' || norm === 'joy' || v >= 0.4) {
    return {
      rate: 1.06,
      pitch: 1.12,
      volume: 1.0,
      styleLabel: 'Warm & Uplifting',
      styleEmoji: '🎉'
    };
  }

  return {
    rate: 0.95,
    pitch: 1.0,
    volume: 0.95,
    styleLabel: 'Gentle Baseline',
    styleEmoji: '🌸'
  };
}

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================================
// PART 2: CLIENT-SIDE ACOUSTIC SPEECH EMOTION RECOGNITION (SER) (Item 2.1)
// ============================================================================

export interface AcousticEmotionResult {
  f0Hz: number;
  pitchJitter: number;
  spectralFlatness: number;
  isTremorDetected: boolean;
  isDistressDetected: boolean;
  affectEstimate: 'calm' | 'neutral' | 'distress' | 'happy';
  confidence: number;
}

export class AcousticSERAnalyzer {
  private historyF0: number[] = [];
  private readonly windowSize = 8;

  /**
   * Evaluates Normalized Autocorrelation Function (NACF) over 512-sample time-domain audio buffer
   */
  public analyzeFrame(timeData: Float32Array, sampleRate: number = 44100): AcousticEmotionResult {
    const N = timeData.length;
    if (N < 256) {
      return {
        f0Hz: 0,
        pitchJitter: 0,
        spectralFlatness: 0,
        isTremorDetected: false,
        isDistressDetected: false,
        affectEstimate: 'neutral',
        confidence: 0
      };
    }

    // 1. RMS Energy check
    let sumSq = 0;
    for (let i = 0; i < N; i++) {
      sumSq += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sumSq / N);
    if (rms < 0.015) {
      return {
        f0Hz: 0,
        pitchJitter: 0,
        spectralFlatness: 0,
        isTremorDetected: false,
        isDistressDetected: false,
        affectEstimate: 'neutral',
        confidence: 0.1
      };
    }

    // 2. Normalized Autocorrelation Function (NACF) for F0 extraction
    // Human vocal pitch range: 80 Hz to 400 Hz
    const minLag = Math.floor(sampleRate / 400);
    const maxLag = Math.floor(sampleRate / 80);

    let maxCorr = -1;
    let bestLag = -1;

    for (let lag = minLag; lag <= maxLag && lag < N; lag++) {
      let num = 0;
      let den1 = 0;
      let den2 = 0;
      for (let i = 0; i < N - lag; i++) {
        num += timeData[i] * timeData[i + lag];
        den1 += timeData[i] * timeData[i];
        den2 += timeData[i + lag] * timeData[i + lag];
      }
      const denom = Math.sqrt(den1 * den2);
      if (denom > 0.0001) {
        const corr = num / denom;
        if (corr > maxCorr) {
          maxCorr = corr;
          bestLag = lag;
        }
      }
    }

    let f0Hz = 0;
    if (bestLag > 0 && maxCorr > 0.45) {
      f0Hz = sampleRate / bestLag;
      this.historyF0.push(f0Hz);
      if (this.historyF0.length > this.windowSize) {
        this.historyF0.shift();
      }
    }

    // 3. Cycle-to-Cycle Pitch Jitter (J) across rolling window
    let pitchJitter = 0;
    if (this.historyF0.length >= 3) {
      let sumDiff = 0;
      let meanF0 = 0;
      for (let i = 0; i < this.historyF0.length; i++) {
        meanF0 += this.historyF0[i];
      }
      meanF0 /= this.historyF0.length;

      for (let i = 0; i < this.historyF0.length - 1; i++) {
        sumDiff += Math.abs(this.historyF0[i] - this.historyF0[i + 1]);
      }
      pitchJitter = meanF0 > 0 ? (sumDiff / (this.historyF0.length - 1)) / meanF0 : 0;
    }

    // 4. Spectral Flatness Measure (SFM) for noise-gate thresholding
    let geometricSum = 0;
    let arithmeticSum = 0;
    const K = Math.min(128, N);
    for (let i = 0; i < K; i++) {
      const mag = Math.abs(timeData[i]) + 1e-6;
      geometricSum += Math.log(mag);
      arithmeticSum += mag;
    }
    const geometricMean = Math.exp(geometricSum / K);
    const arithmeticMean = arithmeticSum / K;
    const spectralFlatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;

    // Reject white/ambient noise if SFM > 0.65
    if (spectralFlatness > 0.65) {
      return {
        f0Hz: 0,
        pitchJitter: 0,
        spectralFlatness,
        isTremorDetected: false,
        isDistressDetected: false,
        affectEstimate: 'neutral',
        confidence: 0.3
      };
    }

    // 5. Affective Classification Matrix
    const isTremorDetected = pitchJitter > 0.08 && f0Hz > 180;
    const isDistressDetected = (pitchJitter > 0.075 && f0Hz > 230) || (pitchJitter > 0.12);

    let affectEstimate: 'calm' | 'neutral' | 'distress' | 'happy' = 'neutral';
    if (isDistressDetected) {
      affectEstimate = 'distress';
    } else if (f0Hz > 240 && pitchJitter < 0.035) {
      affectEstimate = 'happy';
    } else if (pitchJitter < 0.025 && f0Hz > 90 && f0Hz < 200) {
      affectEstimate = 'calm';
    }

    return {
      f0Hz,
      pitchJitter,
      spectralFlatness,
      isTremorDetected,
      isDistressDetected,
      affectEstimate,
      confidence: Math.min(0.95, maxCorr)
    };
  }
}

// ============================================================================
// PART 2: DUAL-FORMANT (F1/F2) ACOUSTIC VISEME DECODER (Item 2.3)
// ============================================================================

export type PrestonBlairViseme = 'ah' | 'ee' | 'oh' | 'half' | 'closed';

export interface FormantVisemeResult {
  viseme: PrestonBlairViseme;
  f1Hz: number;
  f2Hz: number;
  spectralCentroidHz: number;
  energyDb: number;
  isPlosiveClosure: boolean;
}

export class DualFormantVisemeExtractor {
  /**
   * Decomposes frequency bins into anatomical vocal tract resonance (F1: jaw, F2: lip width)
   */
  public extractViseme(freqData: Uint8Array, sampleRate: number = 44100): FormantVisemeResult {
    const binCount = freqData.length;
    const binWidth = (sampleRate / 2) / binCount;

    // 1. Calculate Total Energy (dB)
    let totalEnergy = 0;
    let weightedFreqSum = 0;
    let sumMagnitude = 0;

    for (let i = 0; i < binCount; i++) {
      const mag = freqData[i];
      totalEnergy += mag * mag;
      const freq = i * binWidth;
      weightedFreqSum += freq * mag;
      sumMagnitude += mag;
    }

    const energyDb = 20 * Math.log10((Math.sqrt(totalEnergy / binCount) / 255) + 1e-5);
    const spectralCentroidHz = sumMagnitude > 0 ? weightedFreqSum / sumMagnitude : 0;

    // Plosive silence / bilabial closure (/p/, /b/, /m/) when energy < -45 dB
    if (energyDb < -45) {
      return {
        viseme: 'closed',
        f1Hz: 0,
        f2Hz: 0,
        spectralCentroidHz,
        energyDb,
        isPlosiveClosure: true
      };
    }

    // 2. Locate Formant 1 (F1: 200 - 800 Hz) -> Jaw opening
    const f1MinBin = Math.floor(200 / binWidth);
    const f1MaxBin = Math.min(binCount - 1, Math.floor(800 / binWidth));
    let f1PeakMag = -1;
    let f1PeakBin = f1MinBin;

    for (let i = f1MinBin; i <= f1MaxBin; i++) {
      if (freqData[i] > f1PeakMag) {
        f1PeakMag = freqData[i];
        f1PeakBin = i;
      }
    }
    const f1Hz = f1PeakBin * binWidth;

    // 3. Locate Formant 2 (F2: 900 - 2400 Hz) -> Lip spread / rounding
    const f2MinBin = Math.floor(900 / binWidth);
    const f2MaxBin = Math.min(binCount - 1, Math.floor(2400 / binWidth));
    let f2PeakMag = -1;
    let f2PeakBin = f2MinBin;

    for (let i = f2MinBin; i <= f2MaxBin; i++) {
      if (freqData[i] > f2PeakMag) {
        f2PeakMag = freqData[i];
        f2PeakBin = i;
      }
    }
    const f2Hz = f2PeakBin * binWidth;

    // 4. Spectral Centroid Protection against Sibilants (/s/, /sh/, /f/)
    if (spectralCentroidHz > 3500) {
      return {
        viseme: 'half', // clamp mouth aperture with teeth visible
        f1Hz,
        f2Hz,
        spectralCentroidHz,
        energyDb,
        isPlosiveClosure: false
      };
    }

    // 5. Preston Blair Viseme Classification Matrix
    let viseme: PrestonBlairViseme = 'half';

    if (f1Hz >= 620 && f2Hz >= 1050 && f2Hz <= 1450) {
      // /a/ (father, calm) -> Wide open vertical jaw
      viseme = 'ah';
    } else if (f1Hz <= 420 && f2Hz >= 1850) {
      // /i/, /e/ (tree, see) -> Horizontal wide smile spread
      viseme = 'ee';
    } else if (f1Hz >= 380 && f1Hz <= 580 && f2Hz <= 1150) {
      // /o/, /u/ (boat, true) -> Rounded forward lips
      viseme = 'oh';
    } else if (energyDb > -28) {
      viseme = 'half';
    } else {
      viseme = 'closed';
    }

    return {
      viseme,
      f1Hz,
      f2Hz,
      spectralCentroidHz,
      energyDb,
      isPlosiveClosure: viseme === 'closed'
    };
  }
}

// ============================================================================
// PART 2: CLINICAL 4-7-8 PARASYMPATHETIC BREATHING ENTRAINMENT (Item 2.4)
// ============================================================================

export class AutonomicBreathingEntrainmentSynthesizer {
  private ctx: AudioContext | null = null;
  private oscCarrier: OscillatorNode | null = null;
  private oscHarmonic: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning: boolean = false;

  public start() {
    if (this.isRunning) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    // 432 Hz Solfeggio Carrier tone
    this.oscCarrier = this.ctx.createOscillator();
    this.oscCarrier.type = 'sine';
    this.oscCarrier.frequency.setValueAtTime(432, this.ctx.currentTime);

    // 4 Hz Theta binaural beat difference (436 Hz)
    this.oscHarmonic = this.ctx.createOscillator();
    this.oscHarmonic.type = 'sine';
    this.oscHarmonic.frequency.setValueAtTime(436, this.ctx.currentTime);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);

    this.oscCarrier.connect(this.gainNode);
    this.oscHarmonic.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.oscCarrier.start();
    this.oscHarmonic.start();
    this.isRunning = true;
  }

  /**
   * Modulates frequency across the 4-7-8 breathing cycle
   * Inhale (4s): 432 Hz -> 528 Hz
   * Hold (7s): 528 Hz constant
   * Exhale (8s): 528 Hz -> 432 Hz
   */
  public updateCadence(cyclePhase: 'inhale' | 'hold' | 'exhale', phaseProgress: number) {
    if (!this.ctx || !this.oscCarrier || !this.gainNode) return;
    const t = this.ctx.currentTime;

    if (cyclePhase === 'inhale') {
      const freq = 432 + phaseProgress * 96; // 432 Hz to 528 Hz
      this.oscCarrier.frequency.setValueAtTime(freq, t);
      this.gainNode.gain.setValueAtTime(0.12 + phaseProgress * 0.10, t);
    } else if (cyclePhase === 'hold') {
      this.oscCarrier.frequency.setValueAtTime(528, t);
      this.gainNode.gain.setValueAtTime(0.22, t);
    } else if (cyclePhase === 'exhale') {
      const freq = 528 - phaseProgress * 96; // 528 Hz to 432 Hz
      this.oscCarrier.frequency.setValueAtTime(freq, t);
      this.gainNode.gain.setValueAtTime(Math.max(0.04, 0.22 - phaseProgress * 0.16), t);
    }
  }

  public stop() {
    if (!this.isRunning || !this.ctx) return;
    try {
      if (this.gainNode) {
        this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        try {
          this.oscCarrier?.stop();
          this.oscHarmonic?.stop();
          this.ctx?.close();
        } catch (e) {
          // ignore
        }
        this.isRunning = false;
      }, 600);
    } catch (e) {
      this.isRunning = false;
    }
  }
}
