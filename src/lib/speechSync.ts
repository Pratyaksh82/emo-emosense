import { VisemeType } from './avatarTypes';

export class SpeechSyncEngine {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private isListeningMic: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(
    text: string,
    onVisemeChange: (viseme: VisemeType) => void,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) return;
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = this.synth.getVoices();
    const preferredVoice =
      voices.find((v) => (v.lang.includes('en-IN') || v.lang.includes('hi-IN')) && v.name.includes('Female')) ||
      voices.find((v) => v.name.includes('Female')) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    let visemeInterval: number | null = null;
    const VISEMES: VisemeType[] = ['A', 'E', 'O', 'I', 'M', 'smile', 'U'];

    utterance.onstart = () => {
      onStart?.();
      let step = 0;
      visemeInterval = window.setInterval(() => {
        step = (step + 1) % VISEMES.length;
        onVisemeChange(VISEMES[step]);
      }, 120);
    };

    utterance.onend = () => {
      if (visemeInterval) clearInterval(visemeInterval);
      onVisemeChange('idle');
      onEnd?.();
    };

    utterance.onerror = () => {
      if (visemeInterval) clearInterval(visemeInterval);
      onVisemeChange('idle');
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  public async startMicrophoneLipSync(
    onAmplitude: (level: number, viseme: VisemeType) => void,
    onError?: (err: Error) => void
  ) {
    try {
      if (this.isListeningMic) return;
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      this.isListeningMic = true;
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const loop = () => {
        if (!this.isListeningMic || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 60);

        let viseme: VisemeType = 'idle';
        if (normalized > 0.6) viseme = 'A';
        else if (normalized > 0.4) viseme = 'O';
        else if (normalized > 0.2) viseme = 'E';
        else if (normalized > 0.08) viseme = 'smile';

        onAmplitude(normalized, viseme);
        requestAnimationFrame(loop);
      };

      loop();
    } catch (err) {
      onError?.(err as Error);
    }
  }

  public stopMicrophone() {
    this.isListeningMic = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

export const speechSyncEngine = new SpeechSyncEngine();
