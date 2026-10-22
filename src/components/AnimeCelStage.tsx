import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AvatarGesture, AvatarEmotion, AtmosphereMode, ATMOSPHERE_CONFIGS, EMOTION_THEME_COLORS } from '../lib/avatarTypes';
import { FaceTrackingMetrics } from '../lib/faceTrackingMediaPipe';
import { VisemeState, globalVisemeEngine } from '../lib/visemeEngine';
import { globalHeadKinematics, HeadGestureType, HeadPoseState } from '../lib/headKinematicsEngine';
import { DemonSlayerParticleEngine } from '../lib/demonSlayerParticles';
import {
  Layers,
  Sparkles,
  Film,
  Activity,
  Heart,
  CheckCircle2,
  Smile,
  ShieldAlert,
  Compass
} from 'lucide-react';
import './AnimeCelStage.css';

// Master 1200x900 Production Cel Assets
const CEL_ASSETS = {
  backgrounds: {
    wisteria: '/poses/bg_wisteria_night.jpg',
    solar: '/poses/bg_solar_sunset.jpg',
    rainy: '/poses/bg_kyoto_rain.jpg',
    studio: '/poses/stage_bg_chair.jpg'
  },
  breathCels: [
    '/poses/stage_cel_breath_0.png', // Exhale rest
    '/poses/stage_cel_breath_1.png', // Inhale early
    '/poses/stage_cel_breath_2.png', // Inhale mid
    '/poses/stage_cel_breath_3.png'  // Inhale peak
  ],
  poseNamaste: '/poses/stage_cel_pose_namaste.png',
  poseWave: '/poses/stage_cel_pose_wave.png',
  poseChinRest: '/poses/stage_cel_pose_chin_rest.png',
  poseEmpathy: '/poses/stage_cel_pose_empathy.png',
  emotions: {
    happy: '/poses/stage_cel_emotion_happy.png',
    calm: '/poses/stage_cel_emotion_calm.png',
    empathy: '/poses/stage_cel_emotion_empathy.png',
    sad: '/poses/stage_cel_emotion_sad.png',
    surprised: '/poses/stage_cel_emotion_surprised.png',
    tense: '/poses/stage_cel_emotion_tense.png'
  },
  blinkCel: '/poses/stage_character_blink.png',
  mouthHalf: '/poses/stage_character_mouth_half.png',
  mouthAh: '/poses/stage_character_mouth_ah.png',
  mouthOh: '/poses/stage_character_mouth_oh.png',
  mouthEe: '/poses/stage_character_mouth_ee.png',
  foregroundDesk: '/poses/stage_fg_desk.png'
};

interface Props {
  gesture: AvatarGesture;
  emotion: AvatarEmotion;
  isSpeaking: boolean;
  enableGazeTracking: boolean;
  motionIntensity: number;
  webcamMetrics: FaceTrackingMetrics | null;
  atmosphere?: AtmosphereMode;
  onAtmosphereChange?: (mode: AtmosphereMode) => void;
  scale?: number;
}

export const AnimeCelStage: React.FC<Props> = ({
  gesture,
  emotion,
  isSpeaking,
  enableGazeTracking,
  motionIntensity,
  webcamMetrics,
  atmosphere = 'wisteria',
  onAtmosphereChange,
  scale = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preloaded image references
  const imagesRef = useRef<{
    bgs: Record<string, HTMLImageElement>;
    breath: HTMLImageElement[];
    poseNamaste: HTMLImageElement | null;
    poseWave: HTMLImageElement | null;
    poseChinRest: HTMLImageElement | null;
    poseEmpathy: HTMLImageElement | null;
    emotions: Record<string, HTMLImageElement>;
    blink: HTMLImageElement | null;
    mouthHalf: HTMLImageElement | null;
    mouthAh: HTMLImageElement | null;
    mouthOh: HTMLImageElement | null;
    mouthEe: HTMLImageElement | null;
    desk: HTMLImageElement | null;
    isLoaded: boolean;
  }>({
    bgs: {},
    breath: [],
    poseNamaste: null,
    poseWave: null,
    poseChinRest: null,
    poseEmpathy: null,
    emotions: {},
    blink: null,
    mouthHalf: null,
    mouthAh: null,
    mouthOh: null,
    mouthEe: null,
    desk: null,
    isLoaded: false
  });

  // Particle Engine
  const particleEngineRef = useRef<DemonSlayerParticleEngine>(new DemonSlayerParticleEngine(1200, 900));

  // Head Kinematics State
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

  // Smooth Kinematic Gesture Transition State
  const gestureTransitionRef = useRef<{
    active: AvatarGesture;
    progress: number;
  }>({
    active: gesture,
    progress: gesture === 'idle_desk' ? 0 : 1
  });

  // Smooth 60 FPS Emotion In-Betweening State (Douga Cross-Fade)
  const emotionTransitionRef = useRef<{
    active: AvatarEmotion;
    progress: number;
  }>({
    active: emotion,
    progress: emotion === 'neutral' ? 0 : 1
  });

  // Mouse coordinate refs for smooth gaze tracking
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothedGazeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Autonomous Blinking state (0.0 = fully open, 1.0 = fully closed)
  const blinkProgressRef = useRef<number>(0);
  const blinkTimerRef = useRef<number | null>(null);

  // Dynamic Viseme state
  const [visemeState, setVisemeState] = useState<VisemeState>(globalVisemeEngine.state);

  // Telemetry & Interactive State
  const [stageFps, setStageFps] = useState<number>(60);
  const [activeGestureName, setActiveGestureName] = useState<string>('Organic Respiration');
  const [autoNodActive, setAutoNodActive] = useState<boolean>(true);

  // Current atmosphere config
  const atmoConfig = useMemo(() => ATMOSPHERE_CONFIGS[atmosphere] || ATMOSPHERE_CONFIGS.wisteria, [atmosphere]);

  // Update particles on atmosphere change
  useEffect(() => {
    particleEngineRef.current.setMode(atmosphere, atmoConfig.particleCount);
  }, [atmosphere, atmoConfig]);

  // Preload all animation cels & backgrounds
  useEffect(() => {
    let loadedCount = 0;
    const emotionKeys = Object.keys(CEL_ASSETS.emotions) as (keyof typeof CEL_ASSETS.emotions)[];
    const bgKeys = Object.keys(CEL_ASSETS.backgrounds) as (keyof typeof CEL_ASSETS.backgrounds)[];
    const totalCount = bgKeys.length + CEL_ASSETS.breathCels.length + 4 + emotionKeys.length + 1 + 4 + 1;

    const onLoad = () => {
      loadedCount++;
      if (loadedCount >= totalCount) {
        imagesRef.current.isLoaded = true;
      }
    };

    const loadImage = (src: string) => {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = src;
      return img;
    };

    const loadedBgs: Record<string, HTMLImageElement> = {};
    for (const key of bgKeys) {
      loadedBgs[key] = loadImage(CEL_ASSETS.backgrounds[key]);
    }

    const breath = CEL_ASSETS.breathCels.map(loadImage);
    const poseNamaste = loadImage(CEL_ASSETS.poseNamaste);
    const poseWave = loadImage(CEL_ASSETS.poseWave);
    const poseChinRest = loadImage(CEL_ASSETS.poseChinRest);
    const poseEmpathy = loadImage(CEL_ASSETS.poseEmpathy);

    const loadedEmotions: Record<string, HTMLImageElement> = {};
    for (const key of emotionKeys) {
      loadedEmotions[key] = loadImage(CEL_ASSETS.emotions[key]);
    }

    const blink = loadImage(CEL_ASSETS.blinkCel);
    const mouthHalf = loadImage(CEL_ASSETS.mouthHalf);
    const mouthAh = loadImage(CEL_ASSETS.mouthAh);
    const mouthOh = loadImage(CEL_ASSETS.mouthOh);
    const mouthEe = loadImage(CEL_ASSETS.mouthEe);
    const desk = loadImage(CEL_ASSETS.foregroundDesk);

    imagesRef.current = {
      bgs: loadedBgs,
      breath,
      poseNamaste,
      poseWave,
      poseChinRest,
      poseEmpathy,
      emotions: loadedEmotions,
      blink,
      mouthHalf,
      mouthAh,
      mouthOh,
      mouthEe,
      desk,
      isLoaded: false
    };
  }, []);

  // 1. Autonomous Kyoto Animation Blinking Loop
  useEffect(() => {
    let active = true;

    const triggerBlink = () => {
      if (!active) return;
      if (!webcamMetrics?.isFaceDetected) {
        const startTime = performance.now();
        const duration = 120; // 120ms authentic anime blink

        const stepBlink = (now: number) => {
          if (!active) return;
          const elapsed = now - startTime;
          const progress = elapsed / duration;

          if (progress < 0.45) {
            blinkProgressRef.current = progress / 0.45;
            requestAnimationFrame(stepBlink);
          } else if (progress < 1.0) {
            blinkProgressRef.current = 1.0 - (progress - 0.45) / 0.55;
            requestAnimationFrame(stepBlink);
          } else {
            blinkProgressRef.current = 0;
            if (Math.random() < 0.22) {
              setTimeout(() => {
                if (active) triggerBlink();
              }, 110);
            } else {
              const nextDelay = 2400 + Math.random() * 2600;
              blinkTimerRef.current = window.setTimeout(triggerBlink, nextDelay);
            }
          }
        };

        requestAnimationFrame(stepBlink);
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
      blinkProgressRef.current = isBlinking ? 1 : 0;
    }
  }, [webcamMetrics]);

  // 2. Mouse Gaze Listener
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!enableGazeTracking || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.35;

      const deltaX = (e.clientX - centerX) / (window.innerWidth * 0.5);
      const deltaY = (e.clientY - centerY) / (window.innerHeight * 0.5);

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
  const triggerHeadMotion = useCallback((type: HeadGestureType, label: string) => {
    globalHeadKinematics.triggerGesture(type);
    setActiveGestureName(label);
    setTimeout(() => {
      setActiveGestureName('Organic Respiration');
    }, 1600);
  }, []);

  const toggleAutoNods = useCallback(() => {
    const next = !autoNodActive;
    setAutoNodActive(next);
    globalHeadKinematics.enableAutonomousNods = next;
  }, [autoNodActive]);

  // 3. Canvas 2D Anime Cel Animation Engine Loop (60 FPS)
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

      // Smooth mouse gaze lerp
      const targetGaze = mouseTargetRef.current;
      const currentGaze = smoothedGazeRef.current;
      currentGaze.x += (targetGaze.x - currentGaze.x) * 0.09;
      currentGaze.y += (targetGaze.y - currentGaze.y) * 0.09;

      // Audio Viseme Frame
      const currentViseme = globalVisemeEngine.updateFrame();
      setVisemeState({ ...currentViseme });

      // Solve Biomechanical 3D Head Kinematics
      const breathPhase = Math.sin(timeSec * 1.75);
      const pose = globalHeadKinematics.update(
        timeSec,
        motionIntensity,
        currentGaze,
        breathPhase,
        isSpeaking,
        now
      );

      // Override with webcam if detected
      if (webcamMetrics && webcamMetrics.isFaceDetected) {
        pose.yaw = webcamMetrics.yawDeg;
        pose.pitch = webcamMetrics.pitchDeg;
        pose.roll = webcamMetrics.rollDeg;
      }

      setHeadPose({ ...pose });

      // Smooth Kinematic Gesture Transition (350ms cubic easing)
      const gState = gestureTransitionRef.current;
      if (gState.active !== gesture) {
        if (gState.progress > 0.05) {
          gState.progress -= 0.12;
        } else {
          gState.active = gesture;
          gState.progress = 0;
        }
      } else {
        const target = gesture === 'idle_desk' ? 0 : 1;
        gState.progress += (target - gState.progress) * 0.14;
      }
      const gProgress = Math.max(0, Math.min(1, gState.progress));

      // Smooth 60 FPS Emotion In-Betweening State (Douga Cross-Fade)
      const eState = emotionTransitionRef.current;
      if (eState.active !== emotion) {
        if (eState.progress > 0.05) {
          eState.progress -= 0.12;
        } else {
          eState.active = emotion;
          eState.progress = 0;
        }
      } else {
        const target = emotion === 'neutral' ? 0 : 1;
        eState.progress += (target - eState.progress) * 0.14;
      }
      const eProgress = Math.max(0, Math.min(1, eState.progress));

      // Emotion and Gesture dynamic respiration & posture modulation
      let breathSpeed = 1.75;
      let emotionPitchBias = 0;
      let emotionPostureY = 0;

      if (eState.active === 'happy') {
        breathSpeed = 2.1;
        emotionPitchBias = -0.4 * eProgress;
        emotionPostureY = -1.2 * eProgress;
      } else if (eState.active === 'calm') {
        breathSpeed = 1.25;
        emotionPitchBias = 0.2 * eProgress;
        emotionPostureY = 0.5 * eProgress;
      } else if (eState.active === 'empathy') {
        breathSpeed = 1.35;
        emotionPitchBias = 0.6 * eProgress;
        emotionPostureY = 0.3 * eProgress;
      } else if (eState.active === 'sad') {
        breathSpeed = 1.4;
        emotionPitchBias = 0.9 * eProgress;
        emotionPostureY = 0.8 * eProgress;
      } else if (eState.active === 'surprised') {
        breathSpeed = 2.4;
        emotionPitchBias = -0.7 * eProgress;
        emotionPostureY = -1.8 * eProgress;
      } else if (eState.active === 'tense') {
        breathSpeed = 1.55;
        emotionPitchBias = 0.3 * eProgress;
        emotionPostureY = 0;
      }

      if (gState.active === 'heart_empathy') {
        breathSpeed = 1.3;
      }

      // Mouth selection & jaw drop
      const mouthOpen = currentViseme.mouthOpen;
      const visemeCode = currentViseme.currentViseme;
      const isSpeakingActive = isSpeaking || mouthOpen > 0.07;

      let activeMouthImg: HTMLImageElement | null = null;
      const imgs = imagesRef.current;

      if (isSpeakingActive) {
        if (mouthOpen > 0.40) {
          if (['oh', 'ou', 'rr'].includes(visemeCode)) {
            activeMouthImg = imgs.mouthOh;
          } else if (['ee', 'ih', 'ey'].includes(visemeCode)) {
            activeMouthImg = imgs.mouthEe;
          } else {
            activeMouthImg = imgs.mouthAh;
          }
        } else if (mouthOpen > 0.12) {
          if (['ee', 'ih'].includes(visemeCode)) {
            activeMouthImg = imgs.mouthEe;
          } else {
            activeMouthImg = imgs.mouthHalf;
          }
        }
      }

      const jawDropY = mouthOpen * 2.8 - pose.jawDeformY * 4.2;

      // =====================================================================
      // CANVAS RENDERING PASS (1200 x 900)
      // =====================================================================
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, 1200, 900);

      // LAYER 0: Background Environment (Atmosphere Selected)
      const currentBg = imgs.bgs[atmosphere] || imgs.bgs.wisteria || imgs.bgs.studio;
      if (currentBg && currentBg.complete) {
        ctx.drawImage(currentBg, 0, 0, 1200, 900);
      }

      // Volumetric God Rays in 2D Canvas Pass
      if (atmoConfig.godRayIntensity > 0.05) {
        ctx.save();
        ctx.globalAlpha = atmoConfig.godRayIntensity * 0.4;
        const grad = ctx.createLinearGradient(0, 0, 1200, 900);
        grad.addColorStop(0, atmoConfig.bloomColor);
        grad.addColorStop(0.5, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 900);
        ctx.restore();
      }

      // LAYER 1: Chetana Sharma Cel Animation Track
      if (imgs.breath.length === 4) {
        ctx.save();

        // Cervical spine pivot at (600, 480) with dynamic gesture dip and 3D head motion
        const headTransX = pose.neckTransX;
        const headTransY = pose.neckTransY + emotionPostureY;

        ctx.translate(600 + headTransX, 480 + headTransY);
        if (Math.abs(pose.roll) > 0.01) {
          ctx.rotate((pose.roll * Math.PI) / 180);
        }
        ctx.translate(-600, -480);

        // Continuous In-Between Cel Interpolation (Genga/Douga Blending)
        const normalizedBreath = Math.sin(timeSec * breathSpeed) * 0.5 + 0.5;
        const celIndexFloat = normalizedBreath * 3.0;
        const baseIndex = Math.min(2, Math.floor(celIndexFloat));
        const frac = celIndexFloat - baseIndex;

        const celA = imgs.breath[baseIndex];
        const celB = imgs.breath[baseIndex + 1];

        if (celA && celA.complete) {
          ctx.globalAlpha = 1.0;
          ctx.drawImage(celA, 0, 0, 1200, 900);
        }

        if (celB && celB.complete && frac > 0.02) {
          ctx.globalAlpha = frac;
          ctx.drawImage(celB, 0, 0, 1200, 900);
        }

        // Master Emotion Cel Cross-Fade
        if (eProgress > 0.01 && gProgress < 0.92) {
          const activeEmoImg = imgs.emotions[eState.active];
          if (activeEmoImg && activeEmoImg.complete) {
            const emoWeight = Math.min(1.0, eProgress) * (1.0 - gProgress * 0.8);
            ctx.globalAlpha = emoWeight;
            ctx.drawImage(activeEmoImg, 0, 0, 1200, 900);
          }
        }

        // Authentic Full-Body Pose Cels (Namaste, Wave, Chin Rest, Empathy)
        if (gProgress > 0.01) {
          let poseImg: HTMLImageElement | null = null;
          if (gState.active === 'namaste') poseImg = imgs.poseNamaste;
          else if (gState.active === 'wave') poseImg = imgs.poseWave;
          else if (gState.active === 'chin_rest') poseImg = imgs.poseChinRest;
          else if (gState.active === 'heart_empathy') poseImg = imgs.poseEmpathy;

          if (poseImg && poseImg.complete) {
            ctx.globalAlpha = gProgress;
            ctx.drawImage(poseImg, 0, 0, 1200, 900);
          }
        }

        // Autonomous Blinking Cel
        if (blinkProgressRef.current > 0.05 && imgs.blink && imgs.blink.complete) {
          ctx.globalAlpha = blinkProgressRef.current;
          ctx.drawImage(imgs.blink, 0, 0, 1200, 900);
        }

        // 5-Viseme Anime Mouth Overlay with Lower Jaw Drop
        if (activeMouthImg && activeMouthImg.complete) {
          ctx.globalAlpha = 1.0;
          ctx.drawImage(activeMouthImg, 0, jawDropY, 1200, 900);
        }

        ctx.restore();
      }

      // LAYER 2: Foreground Executive Desk
      if (imgs.desk && imgs.desk.complete) {
        ctx.globalAlpha = 1.0;
        ctx.drawImage(imgs.desk, 0, 0, 1200, 900);
      }

      // LAYER 3: Demon Slayer 60 FPS Particle Engine
      particleEngineRef.current.update(timeSec);
      particleEngineRef.current.render(ctx);

      // Specular Star Sparkle on Gold Jhumkas
      if (pose.jhumkaSparkle > 0.35) {
        drawJewelrySparkle(ctx, 447, 417, pose.jhumkaSparkle, atmoConfig.bloomColor);
        drawJewelrySparkle(ctx, 588, 417, pose.jhumkaSparkle * 0.9, atmoConfig.bloomColor);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [gesture, emotion, motionIntensity, webcamMetrics, isSpeaking, atmosphere, atmoConfig]);

  const drawJewelrySparkle = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    intensity: number,
    glowColor: string
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = Math.min(1.0, intensity * 1.2);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;

    const size = 16 * intensity;
    const coreSize = 3.5 * intensity;

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

  return (
    <div
      ref={containerRef}
      className="anime-cel-stage-container"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Floating Quick Action Head Motion Bar */}
      <div className="head-motion-quick-bar">
        <div className="motion-bar-label">
          <Activity size={12} className="text-amber-400" />
          <span>Expressive Head Kinematics:</span>
        </div>
        <div className="motion-bar-buttons">
          <button
            className="btn-quick-motion"
            onClick={() => triggerHeadMotion('agree_nod', 'Affirmation Double Nod')}
            title="Japanese double-dip affirmation nod"
          >
            <span>✨ Double Nod</span>
          </button>
          <button
            className="btn-quick-motion"
            onClick={() => triggerHeadMotion('deep_empathy_nod', 'Compassionate Deep Dip')}
            title="Slow, thoughtful empathetic head dip and reassuring hold"
          >
            <span>💖 Empathy Nod</span>
          </button>
          <button
            className="btn-quick-motion"
            onClick={() => triggerHeadMotion('curious_tilt', 'Curious Alert Tilt')}
            title="Inquisitive perk with 12-deg side tilt"
          >
            <span>⭐ Curious Tilt</span>
          </button>
          <button
            className="btn-quick-motion"
            onClick={() => triggerHeadMotion('reassuring_shake', 'Reassuring Gentle Shake')}
            title="Gentle reassuring head shake"
          >
            <span>🍃 Reassure Shake</span>
          </button>
          <button
            className="btn-quick-motion"
            onClick={() => triggerHeadMotion('alert_perk', 'Attentive Perk Up')}
            title="Attentive head lift and alertness"
          >
            <span>🎯 Alert Perk</span>
          </button>
          <button
            className={`btn-quick-motion ${autoNodActive ? 'active' : ''}`}
            onClick={toggleAutoNods}
            title="Toggle autonomous listening nods every 3-5 seconds"
          >
            <span>{autoNodActive ? '👂 Auto-Nods ON' : '👂 Auto-Nods OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main 4:3 Stage Viewport Box */}
      <div
        className="anime-cel-viewport"
        style={{
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px ${atmoConfig.rimColorCss}`
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
            boxShadow: `inset 0 0 60px ${atmoConfig.rimColorCss}`
          }}
        />

        {/* Floating Telemetry HUD */}
        <div className="anime-cel-telemetry-hud">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }}
            />
            <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
              KYOTO ANIME CEL ENGINE
            </span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: atmoConfig.bloomColor, fontWeight: 600 }}>
              {atmoConfig.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#38bdf8' }}>
              Motion: <strong style={{ color: '#ffffff' }}>{activeGestureName}</strong>
            </span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#a855f7' }}>
              Head: Yaw {headPose.yaw.toFixed(1)}° | Pitch {headPose.pitch.toFixed(1)}° | Roll {headPose.roll.toFixed(1)}°
            </span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{stageFps} FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
