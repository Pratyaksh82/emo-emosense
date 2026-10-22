import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import util from 'util';
import { isUrgent, getUrgentResponse } from '../lib/safetyCore';

const execFileAsync = util.promisify(execFile);

async function generateTTSAudio(text: string, voice?: string): Promise<string> {
  const venvPython = path.resolve(process.cwd(), '.venv', 'Scripts', 'python.exe');
  const pythonBin = fs.existsSync(venvPython) ? venvPython : 'python';
  const scriptPath = path.resolve(process.cwd(), 'scripts', 'synthesize_voice.py');

  try {
    const args = [scriptPath, text];
    if (voice) args.push(voice);
    const { stdout } = await execFileAsync(pythonBin, args, { timeout: 15000 });
    const lines = stdout.trim().split('\n');
    const audioUrl = lines.pop()?.trim() || '';
    return audioUrl.startsWith('/') ? audioUrl : '';
  } catch (err) {
    console.warn('TTS generation failed on server:', err);
    return '';
  }
}

function getGeminiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) return match[1].trim();
    }
  } catch (e) {
    console.error('Error reading .env.local for GEMINI_API_KEY:', e);
  }
  return '';
}

export function emotionChatDevPlugin(): Plugin {
  return {
    name: 'emotion-chat-dev-api',
    configureServer(server) {
      // 1. Dedicated TTS endpoint for on-demand synthesis
      server.middlewares.use('/api/tts', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let raw = '';
        req.on('data', (chunk: any) => {
          raw += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(raw || '{}');
            const { text, voice } = body;
            if (!text || typeof text !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing text' }));
              return;
            }

            const audioUrl = await generateTTSAudio(text, voice);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ audioUrl }));
          } catch (err: any) {
            console.error('TTS endpoint error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'TTS failure' }));
          }
        });
      });

      // 2. Multimodal Emotion Chat Endpoint
      server.middlewares.use('/api/emotion-chat', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let rawBody = '';
        req.on('data', (chunk: any) => {
          rawBody += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(rawBody || '{}');
            const { message, history = [], faceContext, voiceContext } = body;

            if (!message || typeof message !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing message' }));
              return;
            }

            // 1. Safety assessment (immediate crisis triage)
            if (isUrgent(message)) {
              const urgentReply = getUrgentResponse(message);
              const audioUrl = await generateTTSAudio(urgentReply);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  reply: urgentReply,
                  audioUrl,
                  emotion: 'distress',
                  risk_level: 'high',
                  safety_triggered: true,
                })
              );
              return;
            }

            // 2. Obtain key safely
            const apiKey = getGeminiKey();
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not set on server' }));
              return;
            }

            // 3. Build system instruction with live face & voice context
            let faceContextStr = 'No face detected / camera off.';
            if (faceContext && faceContext.dominantEmotion) {
              const conf = faceContext.confidence
                ? Math.round(faceContext.confidence * 100)
                : 85;
              faceContextStr = `Current facial emotion: ${faceContext.dominantEmotion.toUpperCase()} (Confidence: ${conf}%). Behavioral state: ${faceContext.behavioralState || 'neutral'}. Emotion trajectory: ${faceContext.emotionTrend || 'steady'}. Valence: ${faceContext.valence?.toFixed(2) || '0.00'}, Arousal: ${faceContext.arousal?.toFixed(2) || '0.00'}.`;
            }

            let vocalContextStr = 'No microphone vocal telemetry active.';
            if (voiceContext && voiceContext.primaryEmotion) {
              const stressPct = Math.round((voiceContext.stressLevel || 0) * 100);
              vocalContextStr = `Acoustic vocal tone: ${voiceContext.primaryEmotion.toUpperCase()} (Stress index: ${stressPct}%). Vocal cord tremor detected: ${voiceContext.tremorDetected ? 'YES (Involuntary tremor / anxiety)' : 'No'}. Flat affect detected: ${voiceContext.flatAffectDetected ? 'YES (Monotone / psychomotor depression)' : 'No'}.`;
            }

            const systemInstruction = `You are Chetana (C.H.E.T.A.N.A. — Compassionate Humanoid Emotion-Tracker & Affective Navigation Assistant), the embodied AI clinical confidant for EmoSense.
You are chatting with a user in real-time while on-device facial and acoustic vocal emotion trackers observe their emotional state.

LIVE MULTIMODAL TELEMETRY:
- Facial metrics: ${faceContextStr}
- Vocal acoustics: ${vocalContextStr}

GUIDELINES:
- Speak like a deeply caring, emotionally attuned companion: warm, concise, and sincere (2 to 4 sentences).
- If facial cues and voice diverge (for example, smiling face but high distress or tremor in voice), be especially gentle and attentive to their underlying tension without confronting or diagnosing them.
- Do NOT mechanically say "I see on your camera that you feel X" or "My sensors detect Y". Rather, let their facial and vocal telemetry naturally guide your empathy, gentleness, and curiosity.
- If the user uses Hindi or Hinglish, reply naturally in the same language with warmth (using respectful terms like Namaste, Sukoon, etc.).
- Never diagnose, prescribe medications, or replace emergency psychiatric services.
- Always validate their feelings with authentic warmth before asking thoughtful open-ended questions.`;

            // 4. Assemble contents
            const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

            const recentHistory = history.slice(-8);
            for (const h of recentHistory) {
              contents.push({
                role: h.role === 'assistant' || h.role === 'ai' || h.role === 'model' ? 'model' : 'user',
                parts: [{ text: h.content }],
              });
            }

            contents.push({
              role: 'user',
              parts: [{ text: message }],
            });

            // 5. Call Gemini API with model fallback hierarchy
            const models = [
              'gemini-3.5-flash-lite',
              'gemini-3.8-flash',
              'gemini-flash-latest',
              'gemini-flash-lite-latest'
            ];
            let replyText = '';

            for (const model of models) {
              try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const response = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    system_instruction: {
                      parts: [{ text: systemInstruction }],
                    },
                    contents,
                    generationConfig: {
                      temperature: 0.75,
                      maxOutputTokens: 350,
                    },
                  }),
                });

                if (response.ok) {
                  const data = await response.json();
                  const candidate = data.candidates?.[0];
                  const text = candidate?.content?.parts?.[0]?.text;
                  if (text) {
                    replyText = text.trim();
                    break;
                  }
                }
              } catch (e) {
                console.warn(`Dev server error with model ${model}:`, e);
              }
            }

            if (!replyText) {
              replyText =
                "I am right here with you. I hear the depth of what you're sharing — please take all the gentle time you need, and share whatever feels comfortable.";
            }

            const audioUrl = await generateTTSAudio(replyText);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                reply: replyText,
                audioUrl,
                emotion: faceContext?.dominantEmotion || 'neutral',
                risk_level: 'none',
              })
            );
          } catch (err: any) {
            console.error('Error in emotion-chat middleware:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal error' }));
          }
        });
      });
    },
  };
}
