// ============================================================================
// Emotion Autopilot Engine for EmoSense Chetana
// Analyzes user text & speech affect, classifies emotion, computes valence/arousal,
// and autonomously orchestrates Chetana's facial expressions, gestures & speech.
// ============================================================================

import { AvatarEmotion, AvatarGesture, AtmosphereMode } from './avatarTypes';

export interface EmotionAnalysisResult {
  detectedEmotion: AvatarEmotion;
  confidence: number; // 0.0 to 1.0
  valence: number;    // -1.0 (very negative) to +1.0 (very positive)
  arousal: number;    // 0.0 (calm/sleepy) to +1.0 (hyper-aroused/panic)
  stressLevel: number;// 0% to 100%
  recommendedGesture: AvatarGesture;
  recommendedAtmosphere: AtmosphereMode;
  empathicResponse: string;
  triggerSoundscape: boolean;
  explanation: string;
}

// Affective lexicon patterns for multimodal English + Hindi/Hinglish
const EMOTION_PATTERNS = {
  tense: [
    'panic', 'anxious', 'anxiety', 'racing', 'breathe', 'suffocating', 'scared', 'fear',
    'stress', 'stressed', 'overwhelmed', 'freaking out', 'heart attack', 'gabhrahat', 'darr',
    'chinta', 'tension', 'nervous', 'shaking', 'trembling', 'pressure', 'exam', 'deadline',
    'terrified', 'paralyzed', 'phobia'
  ],
  sad: [
    'sad', 'lonely', 'alone', 'crying', 'tears', 'hurt', 'pain', 'broken', 'hopeless',
    'depressed', 'depression', 'worthless', 'lost', 'empty', 'grief', 'mourning', 'left me',
    'udas', 'rona', 'dukh', 'koi nahi', 'dard', 'akela', 'breakup', 'rejected', 'miss'
  ],
  happy: [
    'happy', 'excited', 'joy', 'grateful', 'great', 'awesome', 'wonderful', 'promoted',
    'celebrate', 'passed', 'won', 'love', 'smile', 'laugh', 'khush', 'mazza', 'achha',
    'proud', 'success', 'fantastic', 'blessed', 'content'
  ],
  calm: [
    'calm', 'relax', 'peace', 'peaceful', 'meditate', 'breathe', 'better', 'grounded',
    'quiet', 'stillness', 'relief', 'shanti', 'sukoon', 'aram', 'settled', 'tranquil'
  ],
  empathy: [
    'help', 'need someone', 'talk', 'listen', 'hear me', 'support', 'understand me',
    'vulnerable', 'confused', 'advice', 'guidance', 'samjho', 'madad', 'batao', 'friend'
  ]
};

// Therapeutic compassionate responses curated for adolescent & adult mental health
const EMPATHIC_RESPONSES: Record<AvatarEmotion, string[]> = {
  tense: [
    "I'm right here with you. Take a slow, gentle breath with me. Breathe in... and release. You are completely safe in this moment.",
    "I can sense how overwhelming this feels right now. Let's ground ourselves together. Feel your feet on the floor, and breathe softly with me.",
    "Your nervous system is just trying to protect you, but you are not in danger right now. Soften your shoulders. I am holding space for you."
  ],
  sad: [
    "I hear the pain in your heart, and I want you to know it's okay to feel this way. You do not have to carry this heaviness all alone.",
    "Thank you for trusting me with how much you're hurting. I'm placing my hand on my heart for you. Take all the time you need.",
    "Even when everything feels dark and empty, your feelings matter deeply. I am right here beside you, listening with all my warmth."
  ],
  happy: [
    "That is wonderful! Your joy genuinely brightens this whole space. I'm so proud of you and happy to share this moment!",
    "Hearing this makes my heart smile! You worked so hard, and you deserve every bit of this happiness. Let's celebrate it!",
    "I love seeing your light shine! Remember this feeling of accomplishment—it belongs to you."
  ],
  calm: [
    "That stillness feels so restorative. Let's savor this gentle, peaceful breath together.",
    "Sukoon... finding peace in the present is a profound gift. I'm glad we are anchored in this calm state together.",
    "Your breathing is so centered and steady. Notice how your body softens when you give yourself permission to simply be."
  ],
  empathy: [
    "I am here, listening with an open heart. Whatever you need to say, there is no judgment here—only compassion.",
    "You are worthy of care, patience, and warmth. Tell me whatever is on your mind; I am completely attentive to you.",
    "It takes courage to be vulnerable. Namaste, I respect and honor your journey. Let's walk through this together."
  ],
  surprised: [
    "Oh! That sounds unexpected. Let's process that together step by step.",
    "That took us by surprise! Tell me more about what just happened."
  ],
  speaking: [
    "I'm sharing my thoughts with you.",
    "Listening and responding with care."
  ],
  neutral: [
    "Namaste! I am Chetana. How are you feeling right now in your mind and body?",
    "I'm here with you. Tell me what's on your mind today, or how I can support you best.",
    "Hello! I am attuned to your voice and presence. Whenever you're ready, we can explore whatever you'd like."
  ]
};

/**
 * Analyzes input text or transcription to detect affective tone,
 * and outputs the recommended autonomous reaction for Chetana.
 */
export function analyzeUserEmotion(text: string): EmotionAnalysisResult {
  const lower = text.toLowerCase().trim();

  // Check greetings first
  if (/^(hi|hello|hey|namaste|pranam|good morning|good evening)/i.test(lower) && lower.length < 30) {
    return {
      detectedEmotion: 'happy',
      confidence: 0.92,
      valence: 0.5,
      arousal: 0.4,
      stressLevel: 15,
      recommendedGesture: 'namaste',
      recommendedAtmosphere: 'therapist_office',
      empathicResponse: "Namaste! I am Chetana. I'm truly glad you're here. How is your heart and mind feeling today?",
      triggerSoundscape: false,
      explanation: "Warm cultural greeting detected. Triggering respectful Namaste gesture with gentle welcoming smile."
    };
  }

  // Count matches across emotion categories
  const scores: Record<AvatarEmotion, number> = {
    tense: 0,
    sad: 0,
    happy: 0,
    calm: 0,
    empathy: 0,
    surprised: 0,
    speaking: 0,
    neutral: 0
  };

  for (const [emotionKey, keywords] of Object.entries(EMOTION_PATTERNS)) {
    const key = emotionKey as AvatarEmotion;
    for (const word of keywords) {
      if (lower.includes(word)) {
        scores[key] += 1.5;
        // Check for exclamation marks or intensity words
        if (lower.includes('so ' + word) || lower.includes('very ' + word) || lower.includes('really ' + word)) {
          scores[key] += 1.0;
        }
      }
    }
  }

  // High punctuation markers
  if (lower.includes('!') || lower.includes('???')) {
    if (scores.tense > 0) scores.tense += 1.2;
    if (scores.happy > 0) scores.happy += 1.0;
  }

  // Find max scored emotion
  let detectedEmotion: AvatarEmotion = 'neutral';
  let maxScore = 0;

  for (const [em, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = em as AvatarEmotion;
    }
  }

  // Fallback to neutral if no clear match
  if (maxScore === 0) {
    detectedEmotion = 'neutral';
  }

  // Calculate biometric telemetry approximations
  let valence = 0.0;
  let arousal = 0.3;
  let stressLevel = 20;
  let recommendedGesture: AvatarGesture = 'idle_desk';
  let recommendedAtmosphere: AtmosphereMode = 'therapist_office';
  let triggerSoundscape = false;

  switch (detectedEmotion) {
    case 'tense':
      valence = -0.65;
      arousal = 0.88;
      stressLevel = 84;
      recommendedGesture = 'namaste'; // Grounding, reassuring pose
      recommendedAtmosphere = 'solar'; // Warm solar amber tones
      triggerSoundscape = true; // Trigger 432 Hz + Theta wave
      break;

    case 'sad':
      valence = -0.75;
      arousal = 0.25;
      stressLevel = 62;
      recommendedGesture = 'heart_empathy'; // Hand on heart
      recommendedAtmosphere = 'rainy'; // Gentle rain contemplation
      triggerSoundscape = true;
      break;

    case 'happy':
      valence = 0.85;
      arousal = 0.70;
      stressLevel = 10;
      recommendedGesture = 'wave'; // Joyful acknowledgment
      recommendedAtmosphere = 'wisteria'; // Kyoto wisteria blossoms
      triggerSoundscape = false;
      break;

    case 'calm':
      valence = 0.60;
      arousal = 0.18;
      stressLevel = 12;
      recommendedGesture = 'chin_rest'; // Attentive, serene
      recommendedAtmosphere = 'therapist_office';
      triggerSoundscape = true;
      break;

    case 'empathy':
      valence = 0.20;
      arousal = 0.40;
      stressLevel = 38;
      recommendedGesture = 'heart_empathy';
      recommendedAtmosphere = 'therapist_office';
      triggerSoundscape = false;
      break;

    default:
      valence = 0.10;
      arousal = 0.30;
      stressLevel = 22;
      recommendedGesture = 'idle_desk';
      recommendedAtmosphere = 'therapist_office';
      triggerSoundscape = false;
      break;
  }

  // Select random response from pool
  const pool = EMPATHIC_RESPONSES[detectedEmotion] || EMPATHIC_RESPONSES.neutral;
  const empathicResponse = pool[Math.floor(Math.random() * pool.length)];

  // Calculate confidence
  const confidence = Math.min(0.96, Math.max(0.68, 0.65 + maxScore * 0.1));

  const explanation = `Detected ${detectedEmotion.toUpperCase()} (Confidence ${(confidence * 100).toFixed(0)}%, Stress ${stressLevel}%). Autopilot setting gesture to "${recommendedGesture}" with ${recommendedAtmosphere} aura.`;

  return {
    detectedEmotion,
    confidence,
    valence,
    arousal,
    stressLevel,
    recommendedGesture,
    recommendedAtmosphere,
    empathicResponse,
    triggerSoundscape,
    explanation
  };
}
