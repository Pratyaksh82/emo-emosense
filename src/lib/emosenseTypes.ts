export type EmotionType =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'disgusted'
  | 'surprised'
  | 'neutral'
  | 'tense'
  | 'calm'
  | 'empathy'
  | 'speaking';

export interface EmotionScores {
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  neutral: number;
  [key: string]: number;
}

export type BehavioralState =
  | 'engaged'
  | 'hesitant'
  | 'distracted'
  | 'fatigued'
  | 'low_mood'
  | 'unknown';

export type EmotionTrend =
  | 'stable'
  | 'improving_mood'
  | 'declining_mood'
  | 'suppressed_emotion'
  | 'unstable_mood'
  | 'unknown';

export interface FaceData {
  dominantEmotion: EmotionType;
  emotionScores: EmotionScores;
  emotionTrend: EmotionTrend;
  behavioralState: BehavioralState;
  confidence: number;
  valence: number;
  arousal: number;
  stressLevel: number;
  timestamp: string;
  faceDetected: boolean;
  eyeOpenness: number;
}

export interface ActionUnit {
  au: string;
  name: string;
  active: boolean;
  intensity: number;
  clinical: string;
}

export interface DemoScenario {
  id: string;
  label: string;
  emoji: string;
  badge: string;
  description: string;
  dominantEmotion: EmotionType;
  scores: EmotionScores;
  valence: number;
  arousal: number;
  stressLevel: number;
  sampleMessage: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'calm',
    label: 'Calm & Grounded',
    emoji: '🧘',
    badge: 'Baseline',
    description: 'Steady breathing, low emotional arousal, baseline affective balance.',
    dominantEmotion: 'calm',
    scores: { happy: 0.2, neutral: 0.7, sad: 0.05, angry: 0.01, fearful: 0.02, disgusted: 0.01, surprised: 0.01 },
    valence: 0.35,
    arousal: 0.25,
    stressLevel: 18,
    sampleMessage: "I took a slow mindful walk today and feel really centered, calm and peaceful."
  },
  {
    id: 'panic',
    label: 'Acute Panic & Racing Heart',
    emoji: '⚡',
    badge: 'De-escalation',
    description: 'Elevated sympathetic arousal, breathlessness, situational panic.',
    dominantEmotion: 'tense',
    scores: { happy: 0.01, neutral: 0.05, sad: 0.15, angry: 0.05, fearful: 0.72, disgusted: 0.01, surprised: 0.01 },
    valence: -0.65,
    arousal: 0.88,
    stressLevel: 84,
    sampleMessage: "My heart is racing so fast, I feel panicked and overwhelmed with breathlessness."
  },
  {
    id: 'grief',
    label: 'Deep Sadness & Grief',
    emoji: '💔',
    badge: 'Holding Space',
    description: 'Heavy psychomotor slowing, downward gaze, profound loneliness.',
    dominantEmotion: 'sad',
    scores: { happy: 0.01, neutral: 0.15, sad: 0.75, angry: 0.02, fearful: 0.05, disgusted: 0.01, surprised: 0.01 },
    valence: -0.75,
    arousal: 0.20,
    stressLevel: 68,
    sampleMessage: "I feel so lonely today and have been carrying this heavy sadness alone."
  },
  {
    id: 'joy',
    label: 'Life Win & Joy',
    emoji: '🎉',
    badge: 'Celebration',
    description: 'High positive valence, bright animated expression, elevated dopamine.',
    dominantEmotion: 'happy',
    scores: { happy: 0.88, neutral: 0.08, sad: 0.01, angry: 0.01, fearful: 0.01, disgusted: 0.0, surprised: 0.01 },
    valence: 0.85,
    arousal: 0.70,
    stressLevel: 10,
    sampleMessage: "Chetana! I got the job offer I worked so hard for! I am so excited and happy!"
  },
  {
    id: 'greeting',
    label: 'Respectful Greeting',
    emoji: '🌸',
    badge: 'Namaste',
    description: 'Warm open stance, respectful welcoming connection.',
    dominantEmotion: 'neutral',
    scores: { happy: 0.4, neutral: 0.55, sad: 0.01, angry: 0.01, fearful: 0.01, disgusted: 0.01, surprised: 0.01 },
    valence: 0.10,
    arousal: 0.30,
    stressLevel: 22,
    sampleMessage: "Namaste Chetana, how are you today?"
  }
];

export interface VoiceModulation {
  rate: number;
  pitch: number;
  volume: number;
  styleLabel: string;
  styleEmoji: string;
}
