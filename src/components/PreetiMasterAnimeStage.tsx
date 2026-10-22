// ============================================================================
// Chetana Sharma (C.H.E.T.A.N.A.) — Master Unified Anime Stage & Decoupled Kinematics Engine
// Industry-Grade Anime Animation (Demon Slayer / Kyoto Animation Standard)
//
// Key Master Architectural Upgrades:
// 1. Dynamic Demon Slayer Breath & Emotion Mood Aura:
//    - Multi-pass silhouette rim corona blooming around her complete body, arms & hands.
//    - Dramatic volumetric atmospheric radial energy burst in emotion accent colors.
//    - Animated elemental rising aura flame wisps pulsing organically with respiration.
//    - Ufotable signature 1-frame anime impact bloom flash on emotion/gesture changes.
//    - 100% compatible across ALL Full-Body Gestures (Namaste, Wave, Chin Rest, Empathy, Idle).
// 2. Full Decoupled Facial Expression Matrix:
//    - Soft feathered precision emotion faces (Neutral, Happy, Calm, Empathy, Sad, Tense, Surprised)
//    - Seamless blending over all 5 full-body gesture poses with zero cut seams or collar lines.
// 3. Biomechanical 3D Head Kinematics & Wide Mouse Gaze Tracking:
//    - C7 cervical spine rotation pivot at (600, 430) with lateral & vertical displacement.
//    - Expressive Yaw (±18°), Pitch (±14°), Roll (±7°) with 2.5D perspective foreshortening.
//    - Kyoto Animation micro-saccades (preventing dead doll stare) & 120ms non-linear blinks.
//    - Procedural Expressive Gestures: Double Nod, Empathy Dip, Curious Tilt, Reassure Shake, Alert Perk.
// 4. Secondary Spring Physics & Anime Timing:
//    - Dual damped harmonic spring pendulums for Golden Jhumka earrings reacting to head acceleration.
//    - 4-point anime specular star flares on earrings and bangles.
//    - GSAP-inspired cubic-bezier easing with stepped anime timing on pose changes.
// 5. Diaphragmatic Respiration:
//    - Torso & chest expand subtly at waist anchor (600, 780) without skull ballooning.
// 6. Oculus-15 5-Viseme Speech Lip-Sync:
//    - Real-time Web Audio FFT frequency mapping with natural lower jaw drop.
// ============================================================================

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  AvatarGesture,
  AvatarEmotion,
  AtmosphereMode,
  CameraPreset,
  TherapistGazeMode,
  ATMOSPHERE_CONFIGS,
  EMOTION_THEME_COLORS
} from '../lib/avatarTypes';
import { FaceTrackingMetrics } from '../lib/faceTrackingMediaPipe';
import { VisemeState, globalVisemeEngine } from '../lib/visemeEngine';
import { HeadPoseState } from '../lib/headKinematicsEngine';
import {
  globalTherapistKinematics,
  TherapistPoseFrame,
  TherapistGestureAction
} from '../lib/therapistKinematicsEngine';
import { DemonSlayerParticleEngine } from '../lib/demonSlayerParticles';
import { BiomechanicalAnimeMeshRenderer, MeshKinematicsParams, MeshRenderLayer } from '../lib/biomechanicalMeshRenderer';
import { Activity, Video, Eye } from 'lucide-react';
import './AnimeCelStage.css';
import './Inochi2DStage.css';

export const CAMERA_CONFIGS: Record<CameraPreset, { scale: number; panY: number; label: string; dofBlur: number }> = {
  wide: { scale: 0.90, panY: 10, label: 'Wide Consultation', dofBlur: 0 },
  medium: { scale: 1.00, panY: -20, label: 'Attentive Medium', dofBlur: 0 },
  closeup: { scale: 1.26, panY: -95, label: 'Close-Up Eye Contact', dofBlur: 3.5 },
  desk: { scale: 1.16, panY: 65, label: 'Desk & Notes Focus', dofBlur: 1.5 }
};

const MASTER_ASSETS = {
  backgrounds: {
    therapist_office: '/poses/stage_bg_chair.jpg',
    studio: '/poses/stage_bg_chair.jpg',
    wisteria: '/poses/bg_wisteria_night.jpg',
    solar: '/poses/bg_solar_sunset.jpg',
    rainy: '/poses/bg_kyoto_rain.jpg'
  },
  // Authentic Full-Body Gestures & Poses (100% Complete Anatomical Cels — Zero Cutouts!)
  poses: {
    idle_desk: '/poses/stage_cel_breath_0.png',
    namaste: '/poses/stage_cel_pose_namaste.png',
    wave: '/poses/stage_cel_pose_wave.png',
    chin_rest: '/poses/stage_cel_pose_chin_rest.png',
    heart_empathy: '/poses/stage_cel_pose_empathy.png'
  },
  // Authentic Diaphragmatic Respiration Keyframes for Idle Breathing
  breath: [
    '/poses/stage_cel_breath_0.png',
    '/poses/stage_cel_breath_1.png',
    '/poses/stage_cel_breath_2.png',
    '/poses/stage_cel_breath_3.png'
  ],
  // Clean Precision Facial Expressions (0% Cutout, 100% Seamless Line Art Overlay)
  expressions: {
    happy: '/poses/clean_expression_happy.png',
    sad: '/poses/clean_expression_sad.png',
    calm: '/poses/clean_expression_calm.png',
    empathy: '/poses/clean_expression_empathy.png',
    surprised: '/poses/clean_expression_surprised.png',
    tense: '/poses/clean_expression_tense.png'
  },
  // Clean Closed Eyelids for Authentic Kyoto Animation Blink (Zero Smudge!)
  blink: '/poses/stage_character_blink.png',
  // Clean Anime Speech Lip-Sync Cels
  mouths: {
    closed: '/poses/stage_character_mouth_closed.png',
    half: '/poses/stage_character_mouth_half.png',
    ah: '/poses/stage_character_mouth_ah.png',
    oh: '/poses/stage_character_mouth_oh.png',
    ee: '/poses/stage_character_mouth_ee.png'
  },
  // Decoupled Facial Rig (Kyoto Animation Eye Gaze & Articulated Brows)
  rig: {
    sclera: '/poses/rig_sclera_clean.png',
    irises: '/poses/rig_irises_feathered.png',
    eyelashes: '/poses/rig_eyelashes_protect.png',
    browLeft: '/poses/rig_brow_left.png',
    browRight: '/poses/rig_brow_right.png',
    skinCover: '/poses/rig_mouth_skin_cover.png'
  },
  desk: '/poses/stage_fg_desk.png'
};

// Elemental Rising Aura Particle Structure
interface AuraFlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  angle: number;
  wobbleSpeed: number;
}

interface Props {
  gesture: AvatarGesture;
  emotion: AvatarEmotion;
  isSpeaking: boolean;
  enableGazeTracking: boolean;
  motionIntensity: number;
  webcamMetrics: FaceTrackingMetrics | null;
  atmosphere?: AtmosphereMode;
  onAtmosphereChange?: (mode: AtmosphereMode) => void;
  cameraPreset?: CameraPreset;
  onCameraPresetChange?: (preset: CameraPreset) => void;
  gazeMode?: TherapistGazeMode;
  onGazeModeChange?: (mode: TherapistGazeMode) => void;
  enableDof?: boolean;
  scale?: number;
  hideOverlays?: boolean;
}

export const ChetanaMasterAnimeStage: React.FC<Props> = ({
  gesture,
  emotion,
  isSpeaking,
  enableGazeTracking,
  motionIntensity,
  webcamMetrics,
  atmosphere = 'therapist_office',
  onAtmosphereChange,
  cameraPreset = 'medium',
  onCameraPresetChange,
  gazeMode = 'client',
  onGazeModeChange,
  enableDof = true,
  scale = 1,
  hideOverlays = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraTransformRef = useRef<{ scale: number; panY: number }>({ scale: 1.0, panY: -20 });
  const meshRendererRef = useRef<BiomechanicalAnimeMeshRenderer | null>(null);

  // Preloaded image references
  const imgsRef = useRef<{
    bgs: Record<string, HTMLImageElement>;
    poses: Record<string, HTMLImageElement>;
    breath: HTMLImageElement[];
    expressions: Record<string, HTMLImageElement>;
    blink: HTMLImageElement | null;
    mouths: Record<string, HTMLImageElement>;
    rig: Record<string, HTMLImageElement>;
    desk: HTMLImageElement | null;
    isLoaded: boolean;
  }>({
    bgs: {},
    poses: {},
    breath: [],
    expressions: {},
    blink: null,
    mouths: {},
    rig: {},
    desk: null,
    isLoaded: false
  });

  // Offscreen facial rig composite canvas
  const faceRigCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Particle Engine
  const particleEngineRef = useRef<DemonSlayerParticleEngine>(new DemonSlayerParticleEngine(1200, 900));

  // Dynamic Rising Aura Flame Wisps (28 particles tracing silhouette)
  const auraFlamesRef = useRef<AuraFlameParticle[]>([]);

  // Transitions: Gesture & Emotion interpolation (GSAP stepped anime curves)
  const gestureTransRef = useRef<{ current: AvatarGesture; target: AvatarGesture; prog: number }>({
    current: gesture,
    target: gesture,
    prog: 1.0
  });

  const emotionTransRef = useRef<{ current: AvatarEmotion; target: AvatarEmotion; prog: number }>({
    current: emotion,
    target: emotion,
    prog: 1.0
  });

  // Ufotable 1-Frame Anime Impact Bloom Flash Alpha (0.0 to 1.0)
  const impactFlashAlphaRef = useRef<number>(0);

  // Mouse Gaze Tracking
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothedGazeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Autonomous Blinking state
  const blinkProgRef = useRef<number>(0);
  const blinkTimerRef = useRef<number | null>(null);

  // Dynamic Viseme state
  const [visemeState, setVisemeState] = useState<VisemeState>(globalVisemeEngine.state);

  // Active Head Pose State
  const [headPose, setHeadPose] = useState<HeadPoseState>({
    yaw: 0,
    pitch: 0,
    roll: 0,
    neckTransX: 0,
    neckTransY: 0,
    jawDeformY: 0,
    perspectiveSkew: 0,
    jhumkaLeftAngle: 0,
    jhumkaRightAngle: 0,
    jhumkaSparkle: 0,
    hairSwayOffset: 0,
    eyeSaccadeX: 0,
    eyeSaccadeY: 0
  });

  // Telemetry & Interactive State
  const [stageFps, setStageFps] = useState<number>(60);
  const [activeGestureLabel, setActiveGestureLabel] = useState<string>('Organic Respiration');
  const [autoNodActive, setAutoNodActive] = useState<boolean>(true);

  // Current atmosphere & emotion configs
  const atmoConfig = useMemo(() => ATMOSPHERE_CONFIGS[atmosphere] || ATMOSPHERE_CONFIGS.wisteria, [atmosphere]);
  const emotionTheme = useMemo(() => EMOTION_THEME_COLORS[emotion] || EMOTION_THEME_COLORS.neutral, [emotion]);

  // Accessibility: prefers-reduced-motion (damper sway amplitude by 70% per Blueprint Part 3.2)
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Update particles on atmosphere change
  useEffect(() => {
    particleEngineRef.current.setMode(atmosphere, atmoConfig.particleCount);
  }, [atmosphere, atmoConfig]);

  // Handle gesture changes with snappy anime ease-out + impact flash
  useEffect(() => {
    if (gestureTransRef.current.target !== gesture) {
      gestureTransRef.current.current = gestureTransRef.current.target;
      gestureTransRef.current.target = gesture;
      gestureTransRef.current.prog = 0.0;
      impactFlashAlphaRef.current = 0.45; // subtle impact flash on pose change
    }
  }, [gesture]);

  // Handle emotion changes with vibrant anime impact bloom flash!
  useEffect(() => {
    if (emotionTransRef.current.target !== emotion) {
      emotionTransRef.current.current = emotionTransRef.current.target;
      emotionTransRef.current.target = emotion;
      emotionTransRef.current.prog = 0.0;
      impactFlashAlphaRef.current = 0.65; // Signature Ufotable emotion impact flash
    }
  }, [emotion]);

  // Preload all assets
  useEffect(() => {
    let loaded = 0;
    const bgKeys = Object.keys(MASTER_ASSETS.backgrounds) as (keyof typeof MASTER_ASSETS.backgrounds)[];
    const poseKeys = Object.keys(MASTER_ASSETS.poses) as (keyof typeof MASTER_ASSETS.poses)[];
    const exprKeys = Object.keys(MASTER_ASSETS.expressions) as (keyof typeof MASTER_ASSETS.expressions)[];
    const mouthKeys = Object.keys(MASTER_ASSETS.mouths) as (keyof typeof MASTER_ASSETS.mouths)[];
    const rigKeys = Object.keys(MASTER_ASSETS.rig) as (keyof typeof MASTER_ASSETS.rig)[];

    const total = bgKeys.length + poseKeys.length + MASTER_ASSETS.breath.length + exprKeys.length + mouthKeys.length + rigKeys.length + 2;

    const onLoad = () => {
      loaded++;
      if (loaded >= total) {
        imgsRef.current.isLoaded = true;
      }
    };

    const loadImg = (src: string) => {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = src;
      return img;
    };

    const bgs: Record<string, HTMLImageElement> = {};
    for (const k of bgKeys) bgs[k] = loadImg(MASTER_ASSETS.backgrounds[k]);

    const poses: Record<string, HTMLImageElement> = {};
    for (const k of poseKeys) poses[k] = loadImg(MASTER_ASSETS.poses[k]);

    const breath = MASTER_ASSETS.breath.map(loadImg);

    const expressions: Record<string, HTMLImageElement> = {};
    for (const k of exprKeys) expressions[k] = loadImg(MASTER_ASSETS.expressions[k]);

    const mouths: Record<string, HTMLImageElement> = {};
    for (const k of mouthKeys) mouths[k] = loadImg(MASTER_ASSETS.mouths[k]);

    const rig: Record<string, HTMLImageElement> = {};
    for (const k of rigKeys) rig[k] = loadImg(MASTER_ASSETS.rig[k]);

    const blink = loadImg(MASTER_ASSETS.blink);
    const desk = loadImg(MASTER_ASSETS.desk);

    imgsRef.current = {
      bgs,
      poses,
      breath,
      expressions,
      blink,
      mouths,
      rig,
      desk,
      isLoaded: false
    };

    // Initialize rising aura flame particles
    const flames: AuraFlameParticle[] = [];
    for (let i = 0; i < 32; i++) {
      flames.push({
        x: 460 + Math.random() * 280,
        y: 340 + Math.random() * 420,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(1.4 + Math.random() * 2.2),
        size: 8 + Math.random() * 16,
        alpha: 0.15 + Math.random() * 0.45,
        maxLife: 60 + Math.random() * 70,
        life: Math.random() * 60,
        angle: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.04 + Math.random() * 0.06
      });
    }
    auraFlamesRef.current = flames;
  }, []);

  // Autonomous Kyoto Animation Blinking Loop (120ms non-linear curve)
  useEffect(() => {
    let active = true;

    const triggerBlink = () => {
      if (!active) return;
      if (!webcamMetrics?.isFaceDetected) {
        const startTime = performance.now();
        const duration = 120;

        const step = (now: number) => {
          if (!active) return;
          const elapsed = now - startTime;
          const p = elapsed / duration;

          if (p < 0.45) {
            blinkProgRef.current = p / 0.45;
            requestAnimationFrame(step);
          } else if (p < 1.0) {
            blinkProgRef.current = 1.0 - (p - 0.45) / 0.55;
            requestAnimationFrame(step);
          } else {
            blinkProgRef.current = 0;
            if (Math.random() < 0.22) {
              setTimeout(() => {
                if (active) triggerBlink();
              }, 110);
            } else {
              const delay = 2400 + Math.random() * 2600;
              blinkTimerRef.current = window.setTimeout(triggerBlink, delay);
            }
          }
        };

        requestAnimationFrame(step);
      } else {
        blinkTimerRef.current = window.setTimeout(triggerBlink, 1500);
      }
    };

    const initialDelay = 1000 + Math.random() * 1200;
    blinkTimerRef.current = window.setTimeout(triggerBlink, initialDelay);

    return () => {
      active = false;
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [webcamMetrics?.isFaceDetected]);

  // Sync webcam blinking if active
  useEffect(() => {
    if (webcamMetrics?.isFaceDetected) {
      const isBlinking = webcamMetrics.leftEyeBlink > 0.55 || webcamMetrics.rightEyeBlink > 0.55;
      blinkProgRef.current = isBlinking ? 1 : 0;
    }
  }, [webcamMetrics]);

  // Mouse Gaze Tracking Listener (Wide, Natural Articulation)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!enableGazeTracking || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.38;

      const deltaX = (e.clientX - centerX) / (window.innerWidth * 0.45);
      const deltaY = (e.clientY - centerY) / (window.innerHeight * 0.45);

      mouseTargetRef.current = {
        x: Math.max(-1, Math.min(1, deltaX)),
        y: Math.max(-1, Math.min(1, deltaY))
      };
    },
    [enableGazeTracking]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Quick Action Motion Trigger
  const triggerTherapistGesture = useCallback((type: TherapistGestureAction, label: string) => {
    globalTherapistKinematics.triggerGesture(type);
    impactFlashAlphaRef.current = 0.5;
    setActiveGestureLabel(label);
    setTimeout(() => {
      setActiveGestureLabel('Diaphragmatic Respiration (4.5s)');
    }, 1800);
  }, []);

  const toggleAutoNods = useCallback(() => {
    const next = !autoNodActive;
    setAutoNodActive(next);
    globalTherapistKinematics.enableAutoNods = next;
  }, [autoNodActive]);

  // Main 60 FPS Living Animation, Physics & Master Drawing Loop
  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    let frameCount = 0;
    let lastFpsTime = startTime;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const renderLoop = (now: number) => {
      const timeSec = (now - startTime) * 0.001;

      frameCount++;
      if (now - lastFpsTime >= 1000) {
        setStageFps(frameCount);
        frameCount = 0;
        lastFpsTime = now;
      }

      // Smooth mouse gaze lerp with organic exponential easing
      const targetGaze = mouseTargetRef.current;
      const currentGaze = smoothedGazeRef.current;
      currentGaze.x += (targetGaze.x - currentGaze.x) * 0.14;
      currentGaze.y += (targetGaze.y - currentGaze.y) * 0.14;

      // Audio Viseme Frame
      const currentViseme = globalVisemeEngine.updateFrame();
      setVisemeState({ ...currentViseme });

      // 1. Solve Psychological Acting & Biomechanical Kinematics
      globalTherapistKinematics.gazeMode = gazeMode;
      const effectiveMotion = isReducedMotion ? motionIntensity * 0.30 : motionIntensity;
      const therapistPose = globalTherapistKinematics.update(
        currentGaze,
        effectiveMotion,
        isSpeaking,
        now
      );

      // Override with webcam if detected
      if (webcamMetrics && webcamMetrics.isFaceDetected) {
        therapistPose.yaw = webcamMetrics.yawDeg;
        therapistPose.pitch = webcamMetrics.pitchDeg;
        therapistPose.roll = webcamMetrics.rollDeg;
      }

      setHeadPose({
        yaw: therapistPose.yaw,
        pitch: therapistPose.pitch,
        roll: therapistPose.roll,
        neckTransX: therapistPose.cervicalTransX,
        neckTransY: therapistPose.cervicalTransY,
        jawDeformY: 0,
        perspectiveSkew: Math.sin((therapistPose.yaw * Math.PI) / 180) * 0.10,
        jhumkaLeftAngle: therapistPose.jhumkaLeftAngle,
        jhumkaRightAngle: therapistPose.jhumkaRightAngle,
        jhumkaSparkle: therapistPose.jhumkaSparkleIntensity,
        hairSwayOffset: therapistPose.hairLagOffsetX,
        eyeSaccadeX: therapistPose.eyeSaccadeX,
        eyeSaccadeY: therapistPose.eyeSaccadeY
      });

      // Progress Gesture Cross-Fade (Snappy Anime Curve on Twos)
      const gTrans = gestureTransRef.current;
      if (gTrans.prog < 1.0) {
        gTrans.prog = Math.min(1.0, gTrans.prog + 0.09);
      }

      // Progress Emotion Cross-Fade (Snappy Anime Curve on Twos)
      const eTrans = emotionTransRef.current;
      if (eTrans.prog < 1.0) {
        eTrans.prog = Math.min(1.0, eTrans.prog + 0.10);
      }

      // Decay Ufotable Impact Flash Alpha
      if (impactFlashAlphaRef.current > 0.01) {
        impactFlashAlphaRef.current *= 0.88;
      } else {
        impactFlashAlphaRef.current = 0;
      }

      // 3D Head Transform Variables
      const headRotZ = therapistPose.roll;
      const headRotY = therapistPose.yaw;
      const headRotX = therapistPose.pitch;
      const headTransX = therapistPose.cervicalTransX;
      const headTransY = therapistPose.cervicalTransY;

      // 2.5D Perspective Foreshortening
      const headScaleX = 1.0 - Math.abs(headRotY) * 0.004;
      const headScaleY = 1.0 + (headRotX / 14.0) * 0.014;
      const perspectiveSkewX = Math.sin((headRotY * Math.PI) / 180) * 0.10;

      // Eyeball Pupil Offset (Eye Gaze Tracking + Saccades)
      const pupilX = therapistPose.pupilOffsetX;
      const pupilY = therapistPose.pupilOffsetY;

      // Viseme Mouth Aperture & Jaw Drop
      let mouthOpen = currentViseme.mouthOpen;
      let visemeCode = currentViseme.currentViseme;
      const isSpeakingActive = isSpeaking || mouthOpen > 0.05;

      // If Chetana is actively vocalizing (Web Speech API) and no FFT input is driving visemes,
      // generate continuous, fluid anime speech lip movements!
      if (isSpeaking && mouthOpen < 0.12) {
        const speechSec = timeSec;
        // Syllable oscillation (conversational tempo ~5-6 Hz)
        const syllableOsc = Math.sin(speechSec * 16.5);
        const speechTexture = Math.sin(speechSec * 8.2 + 0.6);
        const speechEnvelope = Math.max(0, syllableOsc * 0.7 + speechTexture * 0.3);

        mouthOpen = speechEnvelope * 0.65;

        // Cycle through natural anime visemes (ah, ee, oh, half)
        const visemeStep = Math.floor((speechSec * 7.5) % 4);
        if (visemeStep === 0) visemeCode = 'aa';
        else if (visemeStep === 1) visemeCode = 'ee';
        else if (visemeStep === 2) visemeCode = 'oh';
        else visemeCode = 'ih';
      }

      const jawDropY = mouthOpen * 4.8;

      let activeMouthKey: 'half' | 'ah' | 'oh' | 'ee' | null = null;
      if (isSpeakingActive) {
        if (mouthOpen > 0.32) {
          if (['oh', 'ou', 'rr'].includes(visemeCode)) activeMouthKey = 'oh';
          else if (['ee', 'ih', 'ey'].includes(visemeCode)) activeMouthKey = 'ee';
          else activeMouthKey = 'ah';
        } else if (mouthOpen > 0.08) {
          if (['ee', 'ih'].includes(visemeCode)) activeMouthKey = 'ee';
          else activeMouthKey = 'half';
        } else if (isSpeaking) {
          activeMouthKey = 'half';
        }
      }

      // Dynamic 3D Camera Parallax
      const parallaxBgX = currentGaze.x * -7.0;
      const parallaxBgY = currentGaze.y * -4.5;
      const parallaxDeskX = currentGaze.x * 11.0;
      const parallaxDeskY = currentGaze.y * 5.0;

      const imgs = imgsRef.current;

      // =====================================================================
      // 60 FPS CANVAS MASTER RENDERING PIPELINE (1200 x 900)
      // =====================================================================
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, 1200, 900);

      // CINEMATIC CAMERA SYSTEM: Smooth transitions across Wide, Medium, Close-up, Desk
      const targetCam = CAMERA_CONFIGS[cameraPreset] || CAMERA_CONFIGS.medium;
      const cam = cameraTransformRef.current;
      const targetScale = targetCam.scale * therapistPose.cinematicZoom;
      cam.scale += (targetScale - cam.scale) * 0.055;
      cam.panY += (targetCam.panY - cam.panY) * 0.055;

      ctx.save();
      ctx.translate(600, 450);
      ctx.scale(cam.scale, cam.scale);
      ctx.translate(-600, -450 + cam.panY);

      // LAYER 0: Background Atmosphere (with 3D Parallax)
      const currentBg = imgs.bgs[atmosphere] || imgs.bgs.therapist_office || imgs.bgs.wisteria || imgs.bgs.studio;
      if (currentBg && currentBg.complete) {
        ctx.drawImage(currentBg, -10 + parallaxBgX, -10 + parallaxBgY, 1220, 920);
      }

      // LAYER 1: DEMON SLAYER BREATHING & EMOTION MOOD AURA
      // (Radiates powerfully in Emotion Accent Color behind Chetana across ALL Gestures!)
      ctx.save();
      const breathPhase = Math.sin((timeSec * 2 * Math.PI) / 4.5);
      const auraBreathPulse = 1.0 + (breathPhase * 0.12);

      // 1A. Massive Volumetric Atmospheric Aura Flare
      const auraGrad = ctx.createRadialGradient(600, 390, 90, 600, 390, 560 * auraBreathPulse);
      auraGrad.addColorStop(0, emotionTheme.accent + '99'); // 60% saturation
      auraGrad.addColorStop(0.35, emotionTheme.accent + '55'); // 33%
      auraGrad.addColorStop(0.70, emotionTheme.accent + '1c'); // 11%
      auraGrad.addColorStop(1.0, 'transparent');

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, 1200, 900);

      // 1B. Animated Elemental Rising Aura Flame Wisps
      const flames = auraFlamesRef.current;
      for (let i = 0; i < flames.length; i++) {
        const p = flames[i];
        p.life++;
        p.y += p.vy;
        p.x += p.vx + Math.sin(timeSec * 3.0 + p.life * p.wobbleSpeed) * 0.6;

        if (p.life >= p.maxLife || p.y < 120) {
          p.x = 470 + Math.random() * 260;
          p.y = 520 + Math.random() * 240;
          p.life = 0;
          p.alpha = 0.15 + Math.random() * 0.45;
        }

        const pLifeNorm = p.life / p.maxLife;
        const pAlpha = p.alpha * Math.sin(pLifeNorm * Math.PI) * 1.2;

        ctx.fillStyle = emotionTheme.accent;
        ctx.globalAlpha = Math.min(1.0, pAlpha);
        ctx.shadowColor = emotionTheme.accent;
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.0 - pLifeNorm * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // =====================================================================
      // BIOMECHANICAL 2D MESH PIPELINE: ZERO CUTOUTS • LIVING BIOMECHANICS
      // Head articulates UP/DOWN, FRONT/BACK, and SIDE-TO-SIDE naturally,
      // while Torso and Shoulders remain rock-solid grounded in the seat!
      // =====================================================================
      if (!meshRendererRef.current && typeof document !== 'undefined') {
        meshRendererRef.current = new BiomechanicalAnimeMeshRenderer(1200, 900);
      }
      const meshRenderer = meshRendererRef.current;

      // 3A. DIAPHRAGMATIC BREATHING IN-BETWEEN CALCULATION (4.5s cycle)
      const breathNorm = (Math.sin((timeSec * 2 * Math.PI) / 4.5) + 1.0) * 0.5;
      const breathFloat = breathNorm * 3.0;
      const bIdx0 = Math.min(3, Math.floor(breathFloat));
      const bIdx1 = Math.min(3, bIdx0 + 1);
      const bBlend = breathFloat - bIdx0;

      if (!faceRigCanvasRef.current && typeof document !== 'undefined') {
        const c = document.createElement('canvas');
        c.width = 1200;
        c.height = 900;
        faceRigCanvasRef.current = c;
      }
      const rigCanvas = faceRigCanvasRef.current;
      const rigCtx = rigCanvas ? rigCanvas.getContext('2d') : null;

      if (rigCtx) {
        rigCtx.clearRect(0, 0, 1200, 900);

        // 1. Master Pose Cel / Diaphragmatic Breath Keyframes
        if (gTrans.target === 'idle_desk' || gTrans.target === 'typing') {
          const c0 = imgs.breath[bIdx0] || imgs.poses.idle_desk;
          const c1 = imgs.breath[bIdx1] || imgs.poses.idle_desk;
          if (gTrans.prog < 1.0) {
            const curPoseCel = imgs.poses[gTrans.current] || imgs.poses.idle_desk;
            if (curPoseCel && curPoseCel.complete) {
              rigCtx.globalAlpha = 1.0 - gTrans.prog;
              rigCtx.drawImage(curPoseCel, 0, 0, 1200, 900);
            }
          }
          if (c0 && c0.complete) {
            rigCtx.globalAlpha = gTrans.prog >= 1.0 ? (1.0 - bBlend) : (1.0 - bBlend) * gTrans.prog;
            rigCtx.drawImage(c0, 0, 0, 1200, 900);
          }
          if (bBlend > 0.02 && c1 && c1.complete && bIdx1 !== bIdx0) {
            rigCtx.globalAlpha = gTrans.prog >= 1.0 ? bBlend : bBlend * gTrans.prog;
            rigCtx.drawImage(c1, 0, 0, 1200, 900);
          }
        } else {
          // Active Full-Body Mudra Gesture
          const tgtPoseCel = imgs.poses[gTrans.target] || imgs.poses.idle_desk;
          if (gTrans.prog < 1.0) {
            const curPoseCel = imgs.poses[gTrans.current] || imgs.poses.idle_desk;
            if (curPoseCel && curPoseCel.complete) {
              rigCtx.globalAlpha = 1.0 - gTrans.prog;
              rigCtx.drawImage(curPoseCel, 0, 0, 1200, 900);
            }
            if (tgtPoseCel && tgtPoseCel.complete) {
              rigCtx.globalAlpha = gTrans.prog;
              rigCtx.drawImage(tgtPoseCel, 0, 0, 1200, 900);
            }
          } else {
            if (tgtPoseCel && tgtPoseCel.complete) {
              rigCtx.globalAlpha = 1.0;
              rigCtx.drawImage(tgtPoseCel, 0, 0, 1200, 900);
            }
          }
        }

        // 2. Precision Emotion Face Overlay
        if (eTrans.target !== 'neutral' && eTrans.target !== 'speaking') {
          const curExpr = imgs.expressions[eTrans.current];
          const tgtExpr = imgs.expressions[eTrans.target];

          if (eTrans.prog < 1.0 && curExpr && curExpr.complete && eTrans.current !== 'neutral' && eTrans.current !== 'speaking') {
            rigCtx.globalAlpha = (1.0 - eTrans.prog) * 0.95;
            rigCtx.drawImage(curExpr, 0, 0, 1200, 900);
          }
          if (tgtExpr && tgtExpr.complete) {
            rigCtx.globalAlpha = eTrans.prog * 0.95;
            rigCtx.drawImage(tgtExpr, 0, 0, 1200, 900);
          }
        }

        // 3. Kyoto Animation Organic Blink (Crisp lash line, zero smudge noise)
        const currentBlink = Math.max(blinkProgRef.current, therapistPose.blinkProgress);
        if (currentBlink > 0.05 && imgs.blink && imgs.blink.complete) {
          rigCtx.globalAlpha = Math.min(1.0, currentBlink * 1.15);
          rigCtx.drawImage(imgs.blink, 0, 0, 1200, 900);
        }

        // 4. Kyoto Animation Precision Speech Visemes & Natural Resting Lips (Decoupled Layer Architecture)
        if (isSpeakingActive && activeMouthKey && imgs.mouths[activeMouthKey] && imgs.mouths[activeMouthKey].complete) {
          rigCtx.globalAlpha = 1.0;
          rigCtx.drawImage(imgs.mouths[activeMouthKey], 0, 0, 1200, 900);
        } else if (imgs.mouths.closed && imgs.mouths.closed.complete) {
          rigCtx.globalAlpha = 1.0;
          rigCtx.drawImage(imgs.mouths.closed, 0, 0, 1200, 900);
        }
      }

      // 5. Compute Deformed Character via 2D Continuous Biomechanical Mesh Engine
      // Includes:
      // - Upgrade 1: Decoupled Floating Pupils & Gaze Saccades (Kyoto Animation Socket Glide)
      // - Upgrade 2: Articulated Eyebrows (Micro-Empathy Arching & Curious Tilts)
      // - Upgrade 3: Secondary Hair Physics (Spring-damper inertia on front/side locks)
      const meshKinematics: MeshKinematicsParams = {
        pivotX: 600,
        pivotY: 465,
        pitchY: therapistPose.cervicalTransY,
        rollDeg: therapistPose.roll,
        scaleZ: therapistPose.depthScale,
        yawSkew: Math.sin((therapistPose.yaw * Math.PI) / 180) * 0.07,
        transX: therapistPose.cervicalTransX,
        chestLiftY: therapistPose.chestLiftY,
        hairLagX: therapistPose.hairLagOffsetX,
        pupilOffsetX: therapistPose.pupilOffsetX,
        pupilOffsetY: therapistPose.pupilOffsetY,
        browLeftY: therapistPose.browLeftY,
        browRightY: therapistPose.browRightY
      };

      const meshLayers: MeshRenderLayer[] = [
        { image: rigCanvas, alpha: 1.0 }
      ];

      const characterCanvas = meshRenderer ? meshRenderer.render(meshKinematics, meshLayers) : null;
      const characterToDraw = characterCanvas || rigCanvas;

      // =====================================================================
      // LAYER 2: CHARACTER SILHOUETTE CORONA RIM BLOOM
      // =====================================================================
      if (characterToDraw) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = emotionTheme.accent;
        ctx.shadowBlur = 36;
        ctx.globalAlpha = 0.30;
        ctx.drawImage(characterToDraw, 0, 0, 1200, 900);
        ctx.restore();
      }

      // =====================================================================
      // LAYER 3: MASTER CHARACTER NODE (Zero Cutouts • Living Biomechanics)
      // =====================================================================
      if (characterToDraw) {
        ctx.save();
        ctx.drawImage(characterToDraw, 0, 0, 1200, 900);

        // 3E. SPECULAR JEWELRY STAR GLINTS (Tracked to Deformed Ears & Hands)
        if (therapistPose.jhumkaSparkleIntensity > 0.22) {
          const earL = (meshRenderer && !meshRenderer.isContextLost)
            ? meshRenderer.transformPoint(537, 395, meshKinematics)
            : { x: 537 + therapistPose.cervicalTransX, y: 395 + therapistPose.cervicalTransY };
          const earR = (meshRenderer && !meshRenderer.isContextLost)
            ? meshRenderer.transformPoint(705, 395, meshKinematics)
            : { x: 705 + therapistPose.cervicalTransX, y: 395 + therapistPose.cervicalTransY };

          drawJewelrySparkle(ctx, earL.x, earL.y, therapistPose.jhumkaSparkleIntensity, emotionTheme.accent);
          drawJewelrySparkle(ctx, earR.x, earR.y, therapistPose.jhumkaSparkleIntensity * 0.9, emotionTheme.accent);

          if (gTrans.target === 'namaste') {
            const handPos = (meshRenderer && !meshRenderer.isContextLost)
              ? meshRenderer.transformPoint(600, 520, meshKinematics)
              : { x: 600, y: 520 };
            drawJewelrySparkle(ctx, handPos.x, handPos.y, therapistPose.jhumkaSparkleIntensity * 0.85, '#fde047');
          } else if (gTrans.target === 'wave') {
            const handPos = (meshRenderer && !meshRenderer.isContextLost)
              ? meshRenderer.transformPoint(775, 390, meshKinematics)
              : { x: 775, y: 390 };
            drawJewelrySparkle(ctx, handPos.x, handPos.y, therapistPose.jhumkaSparkleIntensity * 0.9, '#fde047');
          } else if (gTrans.target === 'chin_rest') {
            const handPos = (meshRenderer && !meshRenderer.isContextLost)
              ? meshRenderer.transformPoint(650, 470, meshKinematics)
              : { x: 650, y: 470 };
            drawJewelrySparkle(ctx, handPos.x, handPos.y, therapistPose.jhumkaSparkleIntensity * 0.85, '#fde047');
          }
        }

        ctx.restore();
      }

      // LAYER 5: FOREGROUND GROUNDED EXECUTIVE DESK & CLINICAL NOTEPAD
      if (imgs.desk && imgs.desk.complete) {
        ctx.save();
        if (enableDof && targetCam.dofBlur > 0) {
          ctx.filter = `blur(${targetCam.dofBlur}px)`;
        }
        ctx.globalAlpha = 1.0;
        ctx.drawImage(imgs.desk, parallaxDeskX, parallaxDeskY, 1200, 900);
        ctx.restore();
      }

      // Draw Executive Consultation Notepad on Desk
      drawDeskNotepad(ctx, therapistPose.penTipX, therapistPose.penTipY, therapistPose.isWriting);

      // LAYER 6: DEMON SLAYER 60 FPS PARTICLE PHYSICS ENGINE
      particleEngineRef.current.update(timeSec);
      particleEngineRef.current.render(ctx);



      // LAYER 8: UFOTABLE 1-FRAME ANIME IMPACT BLOOM FLASH
      if (impactFlashAlphaRef.current > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = emotionTheme.accent;
        ctx.globalAlpha = impactFlashAlphaRef.current;
        ctx.fillRect(0, 0, 1200, 900);
        ctx.restore();
      }

      ctx.restore(); // Exit Cinematic Camera Transform

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [motionIntensity, webcamMetrics, isSpeaking, atmosphere, atmoConfig, emotionTheme, cameraPreset, gazeMode, enableDof]);

  // Helper: Draw 4-point anime specular sparkle star
  const drawJewelrySparkle = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    intensity: number,
    glowColor: string
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = Math.min(1.0, intensity * 1.3);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;

    const size = 18 * intensity;
    const coreSize = 4.0 * intensity;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(0, 0, size, 0);
    ctx.quadraticCurveTo(0, 0, 0, size);
    ctx.quadraticCurveTo(0, 0, -size, 0);
    ctx.quadraticCurveTo(0, 0, 0, -size);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Helper: Draw Executive Consultation Notepad on Desk
  const drawDeskNotepad = (
    c: CanvasRenderingContext2D,
    penX: number,
    penY: number,
    writing: boolean
  ) => {
    c.save();
    c.translate(650, 755);
    c.rotate((-4 * Math.PI) / 180);

    // Leather Folio Binder Underlay
    c.fillStyle = '#1c1917';
    c.shadowColor = 'rgba(0,0,0,0.6)';
    c.shadowBlur = 12;
    c.fillRect(-65, -55, 130, 95);

    // Premium Ivory Paper
    c.fillStyle = '#fefce8';
    c.shadowBlur = 4;
    c.shadowColor = 'rgba(0,0,0,0.2)';
    c.fillRect(-60, -50, 120, 85);

    // Clinical Note Ruling Lines
    c.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    c.lineWidth = 1;
    for (let y = -34; y <= 26; y += 10) {
      c.beginPath();
      c.moveTo(-52, y);
      c.lineTo(52, y);
      c.stroke();
    }

    // Faint handwritten notes lines
    c.fillStyle = 'rgba(71, 85, 105, 0.7)';
    c.font = '6px serif';
    c.fillText('Session · Therapeutic Counsel', -50, -36);
    c.fillText('Breathing: 4.5s Diaphragmatic', -50, -26);
    c.fillText('State: Receptive & Grounded', -50, -16);

    // Active Note-taking Fountain Pen
    if (writing) {
      c.save();
      c.translate(penX - 650, penY - 755);
      c.rotate((-35 * Math.PI) / 180);

      // Pen Barrel (Navy & Gold)
      c.fillStyle = '#0f172a';
      c.fillRect(-2, -26, 4, 26);
      c.fillStyle = '#d97706';
      c.fillRect(-2.5, -6, 5, 2.5);

      // Golden Nib
      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.moveTo(-2, 0);
      c.lineTo(0, 4);
      c.lineTo(2, 0);
      c.closePath();
      c.fill();

      // Fresh ink point
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.arc(0, 4.5, 1.2, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }

    c.restore();
  };

  return (
    <div
      ref={containerRef}
      className="anime-cel-stage-container"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Dynamic Background Mood Aura Radiance */}
      <div
        className="anime-cel-ambient-aura"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${emotionTheme.accent} 0%, rgba(7, 10, 18, 0) 70%)`,
          opacity: 0.85
        }}
      />

      {/* Floating Quick Action Therapist Acting & Cinematography Toolbar (Hidden in Chat/Avatar mode) */}
      {!hideOverlays && (
        <div className="head-motion-quick-bar">
          <div className="motion-bar-label">
            <Activity size={12} className="text-amber-400" />
            <span>Therapist Acting:</span>
          </div>
          <div className="motion-bar-buttons">
            <button
              className="btn-quick-motion"
              onClick={() => triggerTherapistGesture('agree_nod', 'Affirmation Double Nod')}
              title="Japanese double-dip affirmation nod"
            >
              <span>✨ Double Nod</span>
            </button>
            <button
              className="btn-quick-motion"
              onClick={() => triggerTherapistGesture('deep_empathy_nod', 'Compassionate Deep Dip')}
              title="Slow, thoughtful empathetic head dip and reassuring hold"
            >
              <span>💖 Empathy Dip</span>
            </button>
            <button
              className="btn-quick-motion"
              onClick={() => triggerTherapistGesture('notes_glance', 'Attentive Glance at Notes')}
              title="Thoughtfully look down at desk notes and return gaze"
            >
              <span>📝 Glance Notes</span>
            </button>
            <button
              className="btn-quick-motion"
              onClick={() => triggerTherapistGesture('curious_tilt', 'Curious Alert Tilt')}
              title="Inquisitive perk with 12-deg side tilt"
            >
              <span>⭐ Curious Tilt</span>
            </button>
            <button
              className="btn-quick-motion"
              onClick={() => triggerTherapistGesture('reassuring_shake', 'Reassuring Gentle Shake')}
              title="Gentle reassuring head shake"
            >
              <span>🍃 Reassure Shake</span>
            </button>
            <button
              className={`btn-quick-motion ${autoNodActive ? 'active' : ''}`}
              onClick={toggleAutoNods}
              title="Toggle autonomous listening nods every 4-7 seconds"
            >
              <span>{autoNodActive ? '👂 Auto-Nods ON' : '👂 Auto-Nods OFF'}</span>
            </button>
          </div>

          {/* Camera Cut Presets */}
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
          <div className="motion-bar-label">
            <Video size={12} className="text-cyan-400" />
            <span>Camera:</span>
          </div>
          <div className="motion-bar-buttons">
            {(['wide', 'medium', 'closeup', 'desk'] as CameraPreset[]).map((preset) => {
              const isSel = cameraPreset === preset;
              const labels: Record<CameraPreset, string> = {
                wide: 'Wide',
                medium: 'Medium',
                closeup: 'Close-Up',
                desk: 'Desk'
              };
              return (
                <button
                  key={preset}
                  className={`btn-quick-motion ${isSel ? 'active-cam' : ''}`}
                  onClick={() => onCameraPresetChange && onCameraPresetChange(preset)}
                  title={CAMERA_CONFIGS[preset].label}
                >
                  <span>{labels[preset]}</span>
                </button>
              );
            })}
          </div>

          {/* Gaze Focus Modes */}
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
          <div className="motion-bar-label">
            <Eye size={12} className="text-purple-400" />
            <span>Gaze:</span>
          </div>
          <div className="motion-bar-buttons">
            {[
              { id: 'client' as TherapistGazeMode, label: 'Client' },
              { id: 'notes' as TherapistGazeMode, label: 'Notes' },
              { id: 'reflective' as TherapistGazeMode, label: 'Reflect' }
            ].map((mode) => {
              const isSel = gazeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  className={`btn-quick-motion ${isSel ? 'active-gaze' : ''}`}
                  onClick={() => onGazeModeChange && onGazeModeChange(mode.id)}
                  title={`Switch gaze focus to ${mode.label}`}
                >
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 4:3 Stage Viewport Box */}
      <div
        className="anime-cel-viewport"
        style={{
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.85), 0 0 50px ${emotionTheme.accent}66`
        }}
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={900}
          className="anime-cel-canvas"
        />

        {/* Ufotable Silhouette Rim Light Edge Shader Overlay */}
        <div
          className="ufotable-rim-glow-overlay"
          style={{
            boxShadow: `inset 0 0 65px ${emotionTheme.accent}44`
          }}
        />

        {/* Floating Telemetry HUD (Hidden in Chat/Avatar mode) */}
        {!hideOverlays && (
          <div className="anime-cel-telemetry-hud">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: emotionTheme.accent,
                  boxShadow: `0 0 10px ${emotionTheme.accent}`
                }}
              />
              <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                CHETANA STUDIO MASTER ENGINE
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: emotionTheme.accent, fontWeight: 700 }}>
                Aura: {emotionTheme.label}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#38bdf8' }}>
                Motion: <strong style={{ color: '#ffffff' }}>{activeGestureLabel}</strong>
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#f43f5e' }}>
                Camera: <strong>{CAMERA_CONFIGS[cameraPreset]?.label || 'Medium'}</strong>
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#a855f7' }}>
                Head: Yaw {headPose.yaw.toFixed(1)}° | Pitch {headPose.pitch.toFixed(1)}° | Roll {headPose.roll.toFixed(1)}°
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{stageFps} FPS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PreetiMasterAnimeStage = ChetanaMasterAnimeStage;
export default ChetanaMasterAnimeStage;
