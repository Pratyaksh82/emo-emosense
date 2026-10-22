import os

target_path = 'C:/Users/praty/Desktop/emo-girl/emosense-source/src/lib/speech.ts'

code = r'''import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "emosense_voice_enabled";

export interface VoiceModulation {
  rate: number;       // speech rate: 0.75 - 1.25
  pitch: number;      // pitch multiplier: 0.85 - 1.2
  volume: number;     // volume: 0.7 - 1.0
  styleLabel: string; // e.g. "Calming & Grounding", "Compassionate & Soft"
  styleEmoji: string; // e.g. 🌊, 💙, ✨, 🧘
}

export type SpeakOptions = {
  slow?: boolean;
  signal?: AbortSignal;
  emotion?: string | null;
  valence?: number | null;
  riskLevel?: string | null;
};

/**
 * Computes the optimal voice cadence, pitch, and volume based on detected facial emotion & risk.
 */
export function computeAdaptiveVoiceProfile(
  emotion?: string | null,
  valence?: number | null,
  riskLevel?: string | null
): VoiceModulation {
  const normEmotion = (emotion ?? "neutral").toLowerCase();
  const v = valence ?? 0;
  const isHighRisk = (riskLevel ?? "").toLowerCase() === "high";

  // 1. Crisis / Acute Despair: Slow, deep grounding tone, gentle volume
  if (isHighRisk || normEmotion === "sad" || normEmotion === "crisis" || v <= -0.7) {
    return {
      rate: 0.78,
      pitch: 0.88,
      volume: 0.80,
      styleLabel: "Compassionate & Soft",
      styleEmoji: "💙",
    };
  }

  // 2. Anxiety / Tense / High Stress: Soothing, de-escalating pace, lower pitch to stimulate parasympathetic entrainment
  if (
    normEmotion === "fearful" ||
    normEmotion === "tense" ||
    normEmotion === "anxious" ||
    normEmotion === "stress" ||
    normEmotion === "angry" ||
    v <= -0.2
  ) {
    return {
      rate: 0.84,
      pitch: 0.92,
      volume: 0.85,
      styleLabel: "Calming De-escalation",
      styleEmoji: "🌊",
    };
  }

  // 3. Joy / Celebratory: Uplifting, brighter resonance, slightly faster cadence
  if (normEmotion === "happy" || normEmotion === "joy" || v >= 0.4) {
    return {
      rate: 1.08,
      pitch: 1.14,
      volume: 1.0,
      styleLabel: "Bright & Celebratory",
      styleEmoji: "✨",
    };
  }

  // 4. Baseline Calm / Neutral: Steady, relaxed conversational cadence
  return {
    rate: 0.95,
    pitch: 1.0,
    volume: 0.95,
    styleLabel: "Gentle Baseline",
    styleEmoji: "🧘",
  };
}

/** Strips markdown, URLs, and attachment tags to make spoken sentences completely natural. */
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\[\[emosense-attachments:[\s\S]*?\]\]/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Chunks text by punctuation for smooth streaming audio playback */
export function chunkSentenceList(text: string, firstChunkMax = 160, subsequentMax = 420): string[] {
  const matches = text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  const getCap = () => (chunks.length === 0 ? firstChunkMax : subsequentMax);

  for (const sentence of matches) {
    if (current && (current + sentence).length > getCap()) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// Dedicated audio element
let el: HTMLAudioElement | null = null;
const getEl = () => {
  if (!el) {
    el = new Audio();
    el.preload = "auto";
  }
  return el;
};

// Cached guest token for anonymous / guest users
let cachedGuestToken: string | null = null;
async function getVoiceAuthToken(): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.access_token) {
      return sessionData.session.access_token;
    }
  } catch {}

  if (cachedGuestToken) return cachedGuestToken;

  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "guest_voice_client@emosense.ai",
        password: "EmoSenseVoice2026!",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      cachedGuestToken = data.access_token;
      return cachedGuestToken;
    }
  } catch (err) {
    console.warn("Could not obtain guest voice token:", err);
  }
  return null;
}

/** Primary: Fetch neural audio segment from Supabase Edge Function (OpenAI Coral voice) */
async function fetchNeuralSegment(text: string, slow: boolean, signal?: AbortSignal): Promise<Blob> {
  const token = await getVoiceAuthToken();
  if (!token) throw new Error("Voice auth token not available");

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speak`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    },
    body: JSON.stringify({ text, slow }),
    signal,
  });

  if (!res.ok) {
    let message = `Voice failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {}
    throw new Error(message);
  }

  const blob = await res.blob();
  if (!blob.size) throw new Error("Voice returned no audio.");
  return blob;
}

function playAudioBlob(blob: Blob, signal?: AbortSignal): Promise<void> {
  const objectUrl = URL.createObjectURL(blob);
  const audio = getEl();
  audio.pause();
  audio.src = objectUrl;
  audio.currentTime = 0;

  return new Promise<void>((resolve, reject) => {
    const done = () => {
      detach();
      URL.revokeObjectURL(objectUrl);
      resolve();
    };
    const fail = () => {
      detach();
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Audio playback was blocked by the browser."));
    };
    const onAbort = () => {
      audio.pause();
      done();
    };
    const detach = () => {
      audio.removeEventListener("ended", done);
      audio.removeEventListener("error", fail);
      signal?.removeEventListener("abort", onAbort);
    };
    audio.addEventListener("ended", done);
    audio.addEventListener("error", fail);
    signal?.addEventListener("abort", onAbort, { once: true });

    audio.play().catch((err) => {
      detach();
      URL.revokeObjectURL(objectUrl);
      reject(err instanceof Error ? err : new Error("Audio playback failed."));
    });
  });
}

/** Streams chunks via neural server endpoint with parallel prefetch */
async function speakWithNeuralVoice(text: string, slow: boolean, signal?: AbortSignal): Promise<void> {
  const chunks = chunkSentenceList(text);
  if (!chunks.length) return;

  const fetchChunk = (chunkText: string) => {
    const promise = fetchNeuralSegment(chunkText, slow, signal);
    promise.catch(() => {});
    return promise;
  };

  let nextFetch: Promise<Blob> | null = fetchChunk(chunks[0]);

  for (let i = 0; i < chunks.length; i++) {
    const currentFetch = nextFetch;
    nextFetch = i + 1 < chunks.length ? fetchChunk(chunks[i + 1]) : null;

    const blob = await currentFetch;
    if (signal?.aborted) return;
    if (blob) {
      await playAudioBlob(blob, signal);
    }
    if (signal?.aborted) return;
  }
}

/** Fallback: Synthesize speech using the browser's native Web Speech API with bilingual support */
function speakWithWebSpeech(
  text: string,
  modulation: VoiceModulation,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return reject(new Error("Web Speech API not supported in this browser."));
    }

    try {
      window.speechSynthesis.cancel();
    } catch {}

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return resolve();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = modulation.rate;
    utterance.pitch = modulation.pitch;
    utterance.volume = modulation.volume;

    // Detect Hindi script
    const isHindi = /[\u0900-\u097F]/.test(cleaned);
    const voices = window.speechSynthesis.getVoices();

    let preferredVoice: SpeechSynthesisVoice | undefined;
    if (isHindi) {
      utterance.lang = "hi-IN";
      preferredVoice =
        voices.find((v) => v.lang.startsWith("hi") && (v.name.includes("Natural") || v.name.includes("Swara") || v.name.includes("Google"))) ||
        voices.find((v) => v.lang.startsWith("hi"));
    } else {
      utterance.lang = "en-US";
      preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Jenny") ||
              v.name.includes("Aria") ||
              v.name.includes("Neural") ||
              v.name.includes("Google") ||
              v.name.includes("Female"))
        ) ||
        voices.find((v) => v.lang.startsWith("en"));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    let finished = false;
    const cleanup = () => {
      finished = true;
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      if (finished) return;
      cleanup();
      try {
        window.speechSynthesis.cancel();
      } catch {}
      resolve();
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    utterance.onend = () => {
      if (finished) return;
      cleanup();
      resolve();
    };

    utterance.onerror = (e) => {
      if (finished) return;
      cleanup();
      if (e.error === "canceled" || e.error === "interrupted") {
        resolve();
      } else {
        reject(new Error(`Speech synthesis error: ${e.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Speaks text using the Emotion-Adaptive Voice Engine.
 * 1. Primary: High-fidelity OpenAI Coral Neural Voice (identical to main project).
 * 2. Secondary: Web Speech API fallback with Hindi & English natural voice routing.
 */
export async function speakText(text: string, opts: SpeakOptions = {}): Promise<VoiceModulation> {
  const modulation = computeAdaptiveVoiceProfile(opts.emotion, opts.valence, opts.riskLevel);
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return modulation;

  const isSlow = opts.slow ?? modulation.rate < 0.9;

  // 1. Primary: Main project's OpenAI Coral Neural Voice
  try {
    await speakWithNeuralVoice(cleaned, isSlow, opts.signal);
    return modulation;
  } catch (serverErr) {
    console.warn("Neural server voice unavailable, using local speech engine:", serverErr);
  }

  // 2. Secondary Fallback: Web Speech API
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      await speakWithWebSpeech(cleaned, modulation, opts.signal);
    } catch (webSpeechErr) {
      console.warn("Local speech engine failed:", webSpeechErr);
    }
  }

  return modulation;
}

export function useSpeech() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [speaking, setSpeaking] = useState(false);
  const [modulation, setModulation] = useState<VoiceModulation>(
    computeAdaptiveVoiceProfile("neutral")
  );
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      el?.pause();
    } catch {}
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    async (
      text: string,
      options?: {
        slow?: boolean;
        emotion?: string | null;
        valence?: number | null;
        riskLevel?: string | null;
      }
    ) => {
      if (!text?.trim()) return;
      abortRef.current?.abort();
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        el?.pause();
      } catch {}

      const controller = new AbortController();
      abortRef.current = controller;
      setSpeaking(true);

      const computed = computeAdaptiveVoiceProfile(
        options?.emotion,
        options?.valence,
        options?.riskLevel
      );
      setModulation(computed);

      try {
        await speakText(text, {
          slow: options?.slow,
          signal: controller.signal,
          emotion: options?.emotion,
          valence: options?.valence,
          riskLevel: options?.riskLevel,
        });
      } catch (e) {
        if (!controller.signal.aborted) throw e;
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setSpeaking(false);
      }
    },
    []
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      if (!next) stop();
      return next;
    });
  }, [stop]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
    };
  }, []);

  return { enabled, toggle, speaking, modulation, speak, stop };
}
'''

with open(target_path, 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated speech.ts with raw string successfully!')
