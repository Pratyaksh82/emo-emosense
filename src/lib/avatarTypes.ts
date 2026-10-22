/**
 * Types & Interfaces for Chetana 2D Humanoid Avatar (C.H.E.T.A.N.A.)
 * 100% compatible with EmoSense AI (emo-girl).
 */

export type AvatarEmotion =
  | 'neutral'
  | 'happy'
  | 'calm'
  | 'empathy'
  | 'sad'
  | 'tense'
  | 'surprised'
  | 'speaking';

export type AvatarGesture =
  | 'idle_desk'
  | 'namaste'
  | 'wave'
  | 'chin_rest'
  | 'heart_empathy'
  | 'typing';

export type CameraPreset = 'wide' | 'medium' | 'closeup' | 'desk';

export type TherapistGazeMode = 'client' | 'notes' | 'reflective' | 'webcam';

export type VisemeType = 'idle' | 'smile' | 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'empathy';

export interface GazeTarget {
  x: number; // -1 to +1
  y: number; // -1 to +1
}

export interface AvatarProps {
  emotion?: AvatarEmotion;
  gesture?: AvatarGesture;
  isSpeaking?: boolean;
  enableGazeTracking?: boolean;
  scale?: number;
  className?: string;
}

export type AtmosphereMode = 'therapist_office' | 'wisteria' | 'solar' | 'studio' | 'rainy';

export interface AtmosphereConfig {
  id: AtmosphereMode;
  name: string;
  subTitle: string;
  breathingStyle: string;
  bgPath: string;
  rimColor: [number, number, number]; // RGB 0..1 for WebGL shader
  rimColorCss: string;
  ambientTint: [number, number, number];
  particleType: 'wisteria_petals' | 'solar_embers' | 'dust_motes' | 'rain_streaks';
  particleCount: number;
  godRayIntensity: number;
  bloomColor: string;
  description: string;
}

export const ATMOSPHERE_CONFIGS: Record<AtmosphereMode, AtmosphereConfig> = {
  therapist_office: {
    id: 'therapist_office',
    name: 'Executive Consultation Suite',
    subTitle: 'Kyoto Animation Psychotherapy & Executive Counsel',
    breathingStyle: 'Mindfulness Breathing: Form I - Serene Equilibrium',
    bgPath: '/poses/bg_therapist_office.jpg',
    rimColor: [1.0, 0.82, 0.45], // Warm golden amber #ffd273
    rimColorCss: 'rgba(255, 210, 115, 0.45)',
    ambientTint: [1.08, 1.02, 0.92],
    particleType: 'dust_motes',
    particleCount: 24,
    godRayIntensity: 0.30,
    bloomColor: '#f59e0b',
    description: 'Executive therapy suite with rich mahogany bookshelves, warm desk lamp, dusk skyline, and serene presence.'
  },
  wisteria: {
    id: 'wisteria',
    name: 'Wisteria Night Sanctuary',
    subTitle: 'Demon Slayer Moonlit Blossom Garden',
    breathingStyle: 'Flower Breathing: Form IV - Ethereal Wisteria Bloom',
    bgPath: '/poses/bg_wisteria_night.jpg',
    rimColor: [0.78, 0.52, 1.0], // Electric violet #c785ff
    rimColorCss: 'rgba(199, 133, 255, 0.45)',
    ambientTint: [0.85, 0.88, 1.1],
    particleType: 'wisteria_petals',
    particleCount: 42,
    godRayIntensity: 0.35,
    bloomColor: '#c084fc',
    description: 'Deep indigo midnight wisteria pavilion with fluttering luminous petals and celestial moonlit rim-lighting.'
  },
  solar: {
    id: 'solar',
    name: 'Nichirin Solar Sunset',
    subTitle: 'Ufotable Golden Hour Mountain Vista',
    breathingStyle: 'Sun Breathing (Hinokami): Form I - Radiance of Dusk',
    bgPath: '/poses/bg_solar_sunset.jpg',
    rimColor: [1.0, 0.72, 0.22], // Warm golden amber #ffb838
    rimColorCss: 'rgba(255, 184, 56, 0.55)',
    ambientTint: [1.12, 0.98, 0.85],
    particleType: 'solar_embers',
    particleCount: 50,
    godRayIntensity: 0.65,
    bloomColor: '#f59e0b',
    description: 'Breathtaking golden hour mountain overlook with volumetric sun rays, rising fire motes, and radiant amber warmth.'
  },
  rainy: {
    id: 'rainy',
    name: 'Kyoto Rain Solitude',
    subTitle: 'Makoto Shinkai & Ufotable Evening Rain',
    breathingStyle: 'Water Breathing: Form XI - Dead Calm Stillness',
    bgPath: '/poses/bg_kyoto_rain.jpg',
    rimColor: [0.38, 0.75, 0.98], // Cool cobalt teal #60c0fa
    rimColorCss: 'rgba(96, 192, 250, 0.45)',
    ambientTint: [0.90, 0.96, 1.05],
    particleType: 'rain_streaks',
    particleCount: 65,
    godRayIntensity: 0.25,
    bloomColor: '#38bdf8',
    description: 'Contemplative Kyoto evening with rain streaks streaming down panoramic glass, warm desk lantern reflection, and calm depth.'
  },
  studio: {
    id: 'studio',
    name: 'Executive Studio Zen',
    subTitle: 'Modern Tokyo Penthouse Suite',
    breathingStyle: 'Focus Breathing: Form I - Pure Resonance',
    bgPath: '/poses/stage_bg_chair.jpg',
    rimColor: [0.22, 0.82, 0.75], // Emerald cyan #38d1c0
    rimColorCss: 'rgba(56, 209, 192, 0.4)',
    ambientTint: [1.0, 1.0, 1.0],
    particleType: 'dust_motes',
    particleCount: 28,
    godRayIntensity: 0.20,
    bloomColor: '#2dd4bf',
    description: 'Executive penthouse studio with high-back leather executive chair and crisp, architectural rim lighting.'
  }
};

export const EMOTION_THEME_COLORS: Record<AvatarEmotion, { glow: string; accent: string; label: string }> = {
  neutral: { glow: 'rgba(99, 102, 241, 0.25)', accent: '#818cf8', label: 'Neutral & Attentive' },
  happy: { glow: 'rgba(245, 158, 11, 0.35)', accent: '#fbbf24', label: 'Joyful & Warm' },
  calm: { glow: 'rgba(20, 184, 166, 0.3)', accent: '#2dd4bf', label: 'Calm & Grounded' },
  empathy: { glow: 'rgba(236, 72, 153, 0.32)', accent: '#f472b6', label: 'Empathetic & Caring' },
  sad: { glow: 'rgba(56, 189, 248, 0.28)', accent: '#38bdf8', label: 'Comforting Sadness' },
  tense: { glow: 'rgba(239, 68, 68, 0.28)', accent: '#f87171', label: 'De-escalating Stress' },
  surprised: { glow: 'rgba(168, 85, 247, 0.32)', accent: '#c084fc', label: 'Pleasantly Surprised' },
  speaking: { glow: 'rgba(14, 165, 233, 0.35)', accent: '#38bdf8', label: 'Speaking to You' },
};


