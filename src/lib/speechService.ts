// ============================================================================
// Voice Engine: Speech-to-Text (STT) + Text-to-Speech (TTS) with Viseme Sync
// ============================================================================

import { globalVisemeEngine } from './visemeEngine';

export interface SpeechVoiceOption {
  voice: SpeechSynthesisVoice;
  isIndianEnglish: boolean;
}

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private visemeTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const voices = this.synth.getVoices();
    // Prioritize natural Indian English female voice (e.g. Heera, Neerja, Veena, en-IN)
    const indianFemale = voices.find(
      (v) => (v.lang === 'en-IN' || v.lang.startsWith('en_IN')) && (v.name.includes('Female') || v.name.includes('Heera') || v.name.includes('Neerja'))
    );
    const anyIndian = voices.find((v) => v.lang === 'en-IN' || v.lang.startsWith('en_IN'));
    const anyEnglishFemale = voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));

    this.selectedVoice = indianFemale || anyIndian || anyEnglishFemale || voices[0] || null;
    return voices;
  }

  public getAvailableVoices(): SpeechVoiceOption[] {
    if (!this.synth) return [];
    return this.synth.getVoices().map((v) => ({
      voice: v,
      isIndianEnglish: v.lang === 'en-IN' || v.lang.startsWith('en_IN')
    }));
  }

  /**
   * Speaks text using TTS while synchronously modulating viseme lip-sync
   */
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.synth) {
      console.warn('Speech synthesis not available');
      return;
    }

    this.synth.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.pitch = 1.05; // Friendly, warm anime heroine pitch
    utterance.rate = 0.95;  // Expressive, clear pacing

    let started = false;
    const startSpeaking = () => {
      if (started) return;
      started = true;
      if (onStart) onStart();
      // Drive viseme mouth shapes synchronously based on words and characters
      let charIndex = 0;
      const stepInterval = 90; // ~11 phonemes per second

      if (this.visemeTimer) clearInterval(this.visemeTimer);
      this.visemeTimer = window.setInterval(() => {
        if (charIndex < text.length) {
          const char = text[charIndex];
          globalVisemeEngine.synthesizePhoneme(char);
          charIndex++;
        } else {
          if (this.visemeTimer) {
            clearInterval(this.visemeTimer);
            this.visemeTimer = null;
          }
          globalVisemeEngine.synthesizePhoneme('sil');
          if (onEnd) onEnd();
        }
      }, stepInterval);
    };

    const fallbackTimeout = window.setTimeout(() => {
      startSpeaking();
    }, 120);

    utterance.onstart = () => {
      window.clearTimeout(fallbackTimeout);
      startSpeaking();
    };

    utterance.onend = () => {
      window.clearTimeout(fallbackTimeout);
      if (this.visemeTimer) {
        clearInterval(this.visemeTimer);
        this.visemeTimer = null;
      }
      globalVisemeEngine.synthesizePhoneme('sil');
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      window.clearTimeout(fallbackTimeout);
      if (this.visemeTimer) clearInterval(this.visemeTimer);
      globalVisemeEngine.synthesizePhoneme('sil');
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  /**
   * Starts Speech-to-Text (STT) voice recognition
   */
  public startSpeechRecognition(
    onResult: (transcript: string) => void,
    onError?: (err: any) => void
  ): boolean {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-IN'; // Indian English recognition

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (e: any) => {
        console.warn('STT Error:', e);
        if (onError) onError(e);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.warn('STT init failure:', e);
      return false;
    }
  }

  public stopSpeechRecognition(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const globalSpeechService = new SpeechService();
