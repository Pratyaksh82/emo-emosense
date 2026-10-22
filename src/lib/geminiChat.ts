/**
 * EmoSense Chetana Multimodal Emotion Chat Client
 * Sends user text + live facial telemetry + vocal acoustics to real Google Gemini models.
 */

import { FaceData } from './emosenseTypes';
import { analyzeUserEmotion } from './emotionAutopilotEngine';
import { isUrgent, getUrgentResponse } from './safetyCore';

export interface EmotionChatTurn {
  role: 'user' | 'assistant' | 'ai' | 'model';
  content: string;
}

export interface EmotionChatResponse {
  reply: string;
  emotion: string;
  risk_level: 'none' | 'concern' | 'high';
  safety_triggered?: boolean;
  audioUrl?: string;
}

export interface VoiceDataPayload {
  primaryEmotion?: string;
  stressLevel?: number;
  tremorDetected?: boolean;
  flatAffectDetected?: boolean;
}

export async function sendEmotionChatMessage(
  message: string,
  history: EmotionChatTurn[],
  faceData: FaceData | null,
  voiceData?: VoiceDataPayload | null
): Promise<EmotionChatResponse> {
  // 1. Immediate Client-Side Safety Pre-Check (Zero-Latency Crisis Protection)
  if (isUrgent(message)) {
    return {
      reply: getUrgentResponse(message),
      emotion: 'sad',
      risk_level: 'high',
      safety_triggered: true,
    };
  }

  const payload = {
    message,
    history: history.slice(-8).map((m) => ({
      role: m.role === 'assistant' || m.role === 'ai' || m.role === 'model' ? 'assistant' : 'user',
      content: m.content,
    })),
    faceContext: faceData
      ? {
          dominantEmotion: faceData.dominantEmotion,
          confidence: faceData.confidence,
          behavioralState: faceData.behavioralState,
          emotionTrend: faceData.emotionTrend,
          valence: faceData.valence,
          arousal: faceData.arousal,
        }
      : undefined,
    voiceContext: voiceData
      ? {
          primaryEmotion: voiceData.primaryEmotion,
          stressLevel: voiceData.stressLevel,
          tremorDetected: voiceData.tremorDetected,
          flatAffectDetected: voiceData.flatAffectDetected,
        }
      : undefined,
  };

  try {
    const response = await fetch('/api/emotion-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.reply) {
        return {
          reply: data.reply,
          audioUrl: data.audioUrl || undefined,
          emotion: data.emotion || faceData?.dominantEmotion || 'neutral',
          risk_level: data.risk_level || 'none',
          safety_triggered: data.safety_triggered || false,
        };
      }
    }
    console.warn('/api/emotion-chat returned non-ok status or empty reply, falling back gracefully');
  } catch (err) {
    console.warn('Network error reaching emotion-chat API:', err);
  }

  // Graceful intelligent client-side fallback using autopilot affective synthesis
  const analysis = analyzeUserEmotion(message);
  return {
    reply: analysis.empathicResponse,
    emotion: analysis.detectedEmotion,
    risk_level: 'none',
  };
}

/**
 * On-demand neural TTS synthesis request for Chetana
 */
export async function requestTTSAudio(text: string, voice?: string): Promise<string> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.audioUrl || '';
    }
  } catch (err) {
    console.warn('TTS fetch error:', err);
  }
  return '';
}
