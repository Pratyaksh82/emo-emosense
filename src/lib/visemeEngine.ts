// ============================================================================
// Real-Time Web Audio Viseme & Lip-Sync Engine
// Oculus 15-Viseme Mapping + Frequency Formant Energy Extraction
// ============================================================================

export type OculusViseme =
  | 'sil' // Silence / closed
  | 'aa'  // Open jaw (father, car)
  | 'oh'  // Rounded lips (boat, go)
  | 'ee'  // Wide stretch (tree, see)
  | 'ih'  // Mid open (bit, sit)
  | 'ou'  // Pursed (you, true)
  | 'ff'  // Upper teeth on lower lip (four, view)
  | 'th'  // Tongue tip between teeth (think, that)
  | 'dd'  // Tongue behind upper teeth (dog, top)
  | 'kk'  // Back of tongue raised (cat, go)
  | 'ch'  // Teeth together (check, judge)
  | 'ss'  // Sibilant closed (see, sun)
  | 'nn'  // Nasal (no, man)
  | 'rr'  // Retroflex (red, car)
  | 'pp'; // Bilabial stop (pat, bat, mom)

export interface VisemeState {
  currentViseme: OculusViseme;
  mouthOpen: number;   // 0.0 (closed) to 1.0 (wide open)
  mouthWidth: number;  // -1.0 (narrow/pursed) to 1.0 (wide smile)
  mouthPucker: number; // 0.0 to 1.0 (funneled lips)
  audioEnergy: number; // 0.0 to 1.0 (RMS amplitude)
}

export class VisemeEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing: boolean = false;

  public state: VisemeState = {
    currentViseme: 'sil',
    mouthOpen: 0,
    mouthWidth: 0,
    mouthPucker: 0,
    audioEnergy: 0
  };

  /**
   * Initializes the Web Audio Analyser node
   */
  public async initAudio(): Promise<boolean> {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.55;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      return true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
      return false;
    }
  }

  /**
   * Attaches microphone input for live speech viseme sync
   */
  public async startMicrophone(): Promise<boolean> {
    await this.initAudio();
    if (!this.audioCtx || !this.analyser) return false;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      source.connect(this.analyser);
      this.isAnalyzing = true;
      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      return false;
    }
  }

  /**
   * Stops microphone input
   */
  public stopMicrophone(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.isAnalyzing = false;
    this.state = {
      currentViseme: 'sil',
      mouthOpen: 0,
      mouthWidth: 0,
      mouthPucker: 0,
      audioEnergy: 0
    };
  }

  /**
   * Connects any HTMLAudioElement or MediaElement to the viseme analyzer (e.g. for TTS playback)
   */
  public connectMediaElement(element: HTMLMediaElement): void {
    if (!this.audioCtx || !this.analyser) return;
    try {
      const source = this.audioCtx.createMediaElementSource(element);
      source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.isAnalyzing = true;
    } catch (e) {
      console.warn('Media element already connected or error:', e);
    }
  }

  /**
   * Processes a single audio frame (call this in requestAnimationFrame)
   * Analyzes low/mid/high frequency bands to detect vowel formants and consonant energy
   */
  public updateFrame(): VisemeState {
    if (!this.analyser || !this.dataArray || !this.isAnalyzing) {
      // Smooth decay to neutral
      this.state.mouthOpen *= 0.85;
      this.state.mouthWidth *= 0.85;
      this.state.mouthPucker *= 0.85;
      this.state.audioEnergy *= 0.85;
      if (this.state.mouthOpen < 0.02) {
        this.state.currentViseme = 'sil';
        this.state.mouthOpen = 0;
      }
      return this.state;
    }

    (this.analyser as any).getByteFrequencyData(this.dataArray);

    const binCount = this.dataArray.length;
    let totalEnergy = 0;
    let lowEnergy = 0;   // 100Hz - 600Hz (Vowel fundamental)
    let midEnergy = 0;   // 600Hz - 2500Hz (Formants F1 & F2)
    let highEnergy = 0;  // 2500Hz - 8000Hz (Fricatives, Sibilants, 's', 'f', 'ch')

    const lowEnd = Math.floor(binCount * 0.12);
    const midEnd = Math.floor(binCount * 0.45);

    for (let i = 0; i < binCount; i++) {
      const val = this.dataArray[i] / 255;
      totalEnergy += val;
      if (i < lowEnd) lowEnergy += val;
      else if (i < midEnd) midEnergy += val;
      else highEnergy += val;
    }

    const avgEnergy = totalEnergy / binCount;
    const avgLow = lowEnergy / lowEnd;
    const avgMid = midEnergy / (midEnd - lowEnd);
    const avgHigh = highEnergy / (binCount - midEnd);

    this.state.audioEnergy = avgEnergy;

    // Threshold noise floor
    if (avgEnergy < 0.05) {
      this.state.currentViseme = 'sil';
      this.state.mouthOpen *= 0.82;
      this.state.mouthWidth *= 0.85;
      this.state.mouthPucker *= 0.85;
      return this.state;
    }

    // Heuristic Formant Ratio Mapping
    // 1. Dominant Low + Mid with high volume = 'aa' (Open jaw)
    // 2. High energy dominant = 'ss' / 'ch' / 'ff'
    // 3. Strong low energy with low mid/high = 'oh' / 'ou' (Rounded lips)
    // 4. Balanced mid with high = 'ee' (Wide smile)

    if (avgHigh > avgMid * 1.3 && avgHigh > 0.18) {
      this.state.currentViseme = 'ch';
      this.state.mouthOpen = 0.25;
      this.state.mouthWidth = 0.4;
      this.state.mouthPucker = 0.1;
    } else if (avgLow > avgMid * 1.6 && avgMid < 0.25) {
      this.state.currentViseme = 'ou';
      this.state.mouthOpen = 0.45;
      this.state.mouthWidth = -0.6; // Narrow/pursed
      this.state.mouthPucker = 0.85;
    } else if (avgMid > avgLow * 1.1) {
      this.state.currentViseme = 'ee';
      this.state.mouthOpen = 0.4;
      this.state.mouthWidth = 0.75; // Wide stretch
      this.state.mouthPucker = 0;
    } else if (avgLow > 0.25) {
      this.state.currentViseme = 'aa';
      this.state.mouthOpen = Math.min(1.0, avgLow * 2.2);
      this.state.mouthWidth = 0.1;
      this.state.mouthPucker = 0.2;
    } else {
      this.state.currentViseme = 'ih';
      this.state.mouthOpen = 0.3;
      this.state.mouthWidth = 0.2;
      this.state.mouthPucker = 0;
    }

    return this.state;
  }

  /**
   * Simulates synthetic viseme rhythm for speech simulation (when no mic/audio is playing)
   */
  public synthesizePhoneme(char: string): VisemeState {
    const c = char.toLowerCase();
    let viseme: OculusViseme = 'sil';
    let mouthOpen = 0;
    let mouthWidth = 0;
    let mouthPucker = 0;

    if (['a', 'á', 'à', 'ah'].includes(c)) {
      viseme = 'aa';
      mouthOpen = 0.85;
      mouthWidth = 0.2;
    } else if (['o', 'ó', 'ow', 'oh'].includes(c)) {
      viseme = 'oh';
      mouthOpen = 0.65;
      mouthPucker = 0.8;
      mouthWidth = -0.5;
    } else if (['e', 'i', 'ee'].includes(c)) {
      viseme = 'ee';
      mouthOpen = 0.35;
      mouthWidth = 0.8;
    } else if (['u', 'oo'].includes(c)) {
      viseme = 'ou';
      mouthOpen = 0.3;
      mouthPucker = 0.9;
      mouthWidth = -0.7;
    } else if (['m', 'b', 'p'].includes(c)) {
      viseme = 'pp';
      mouthOpen = 0.02;
      mouthWidth = 0;
    } else if (['f', 'v'].includes(c)) {
      viseme = 'ff';
      mouthOpen = 0.2;
      mouthWidth = 0.3;
    } else {
      viseme = 'ih';
      mouthOpen = 0.4;
      mouthWidth = 0.1;
    }

    this.state = {
      currentViseme: viseme,
      mouthOpen,
      mouthWidth,
      mouthPucker,
      audioEnergy: mouthOpen * 0.7
    };
    return this.state;
  }
}

// Global singleton instance for app-wide audio reactivity
export const globalVisemeEngine = new VisemeEngine();
