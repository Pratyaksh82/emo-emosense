import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Inochi2DParameters, DEFAULT_INOCHI2D_PARAMS } from '../lib/inochi2dBridge';
import { AvatarGesture, AvatarEmotion, AtmosphereMode, ATMOSPHERE_CONFIGS, EMOTION_THEME_COLORS } from '../lib/avatarTypes';
import { FaceTrackingMetrics } from '../lib/faceTrackingMediaPipe';
import { VisemeState, globalVisemeEngine } from '../lib/visemeEngine';
import { globalHeadKinematics, HeadGestureType, HeadPoseState } from '../lib/headKinematicsEngine';
import { DemonSlayerParticleEngine } from '../lib/demonSlayerParticles';
import {
  Sparkles,
  Activity,
  Eye,
  Camera,
  Layers,
  Flame,
  Moon,
  Sun,
  CloudRain,
  Building,
  CheckCircle2,
  Heart,
  Smile,
  ShieldAlert,
  Compass
} from 'lucide-react';
import './Inochi2DStage.css';

// Master Anatomically Decoupled Production Assets (1200x900 Canvas Standard)
const ASSETS = {
  torso: '/poses/stage_character_torso.png',
  head: '/poses/stage_character_head.png',
  pupils: '/poses/stage_character_pupils.png',
  eyelidsBlink: '/poses/stage_character_blink.png',
  jhumkaL: '/poses/stage_character_jhumka_l.png',
  jhumkaR: '/poses/stage_character_jhumka_r.png',
  mouthHalf: '/poses/stage_character_mouth_half.png',
  mouthOpenAh: '/poses/stage_character_mouth_ah.png',
  mouthOpenOh: '/poses/stage_character_mouth_oh.png',
  mouthOpenEe: '/poses/stage_character_mouth_ee.png',
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

export const Inochi2DStage: React.FC<Props> = ({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse coordinate refs for smooth gaze tracking
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothedGazeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Autonomous Blinking state (Kyoto Animation 120ms non-linear curve)
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const blinkTimerRef = useRef<number | null>(null);

  // Dynamic Viseme state
  const [visemeState, setVisemeState] = useState<VisemeState>(globalVisemeEngine.state);

  // Active Head Kinematics State
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

  // Particle Engine Instance
  const particleEngineRef = useRef<DemonSlayerParticleEngine>(new DemonSlayerParticleEngine(1200, 900));

  // Telemetry
  const [fps, setFps] = useState<number>(60);
  const [activeGestureName, setActiveGestureName] = useState<string>('Organic Respiration');
  const [autoNodActive, setAutoNodActive] = useState<boolean>(true);
  const [sparkleActive, setSparkleActive] = useState<boolean>(false);

  // Current atmosphere config
  const atmoConfig = useMemo(() => ATMOSPHERE_CONFIGS[atmosphere] || ATMOSPHERE_CONFIGS.wisteria, [atmosphere]);
  const theme = useMemo(() => EMOTION_THEME_COLORS[emotion] || EMOTION_THEME_COLORS.neutral, [emotion]);

  // Update particle engine when atmosphere changes
  useEffect(() => {
    particleEngineRef.current.setMode(atmosphere, atmoConfig.particleCount);
  }, [atmosphere, atmoConfig]);

  // 1. Autonomous Kyoto Animation Blinking Loop
  useEffect(() => {
    let active = true;

    const triggerBlink = () => {
      if (!active) return;
      if (!webcamMetrics?.isFaceDetected) {
        setIsBlinking(true);

        setTimeout(() => {
          if (!active) return;
          setIsBlinking(false);

          // 22% probability of authentic anime double-blink
          if (Math.random() < 0.22) {
            setTimeout(() => {
              if (!active) return;
              setIsBlinking(true);
              setTimeout(() => {
                if (active) setIsBlinking(false);
              }, 75);
            }, 110);
          }

          const nextDelay = 2400 + Math.random() * 2600;
          blinkTimerRef.current = window.setTimeout(triggerBlink, nextDelay);
        }, 115);
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
      const shouldBlink = webcamMetrics.leftEyeBlink > 0.55 || webcamMetrics.rightEyeBlink > 0.55;
      setIsBlinking(shouldBlink);
    }
  }, [webcamMetrics]);

  // 2. Mouse Gaze Tracking Listener
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

  // 3. Trigger Expressive Head Motions via Biomechanical Kinematics Engine
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

  // 4. Main 60 FPS Living Motion, Particle & Physics Loop
  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    let frameCount = 0;
    let lastFpsTime = startTime;

    const renderLoop = (now: number) => {
      const timeSec = (now - startTime) * 0.001;

      frameCount++;
      if (now - lastFpsTime >= 1000) {
        setFps(frameCount);
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

      // Respiration calculation
      const breathPhase = Math.sin(timeSec * 1.75);

      // Solve Biomechanical 3D Head Kinematics
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
      setSparkleActive(pose.jhumkaSparkle > 0.45);

      // 5. Update & Render Demon Slayer Particle Overlay
      const pCanvas = particleCanvasRef.current;
      if (pCanvas) {
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) {
          pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
          particleEngineRef.current.update(timeSec);
          particleEngineRef.current.render(pCtx);

          // Specular Star Sparkle on Gold Jhumka Earrings
          if (pose.jhumkaSparkle > 0.35) {
            drawJewelrySparkle(pCtx, 447, 417, pose.jhumkaSparkle, atmoConfig.bloomColor);
            drawJewelrySparkle(pCtx, 588, 417, pose.jhumkaSparkle * 0.9, atmoConfig.bloomColor);
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [gesture, motionIntensity, webcamMetrics, isSpeaking, atmoConfig]);

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
    ctx.globalAlpha = Math.min(1.0, intensity * 1.2);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;

    const size = 16 * intensity;
    const coreSize = 3.5 * intensity;

    // Cross star flare
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(0, 0, size, 0);
    ctx.quadraticCurveTo(0, 0, 0, size);
    ctx.quadraticCurveTo(0, 0, -size, 0);
    ctx.quadraticCurveTo(0, 0, 0, -size);
    ctx.closePath();
    ctx.fill();

    // Central circular flare
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // =========================================================================
  // 1. DIAPHRAGM RESPIRATION (Chest & Shoulders ONLY - Head Scale is 1.0!)
  // =========================================================================
  const breathFactor = Math.sin(performance.now() * 0.00175);
  const torsoScaleY = 1 + breathFactor * 0.024 * motionIntensity;
  const torsoScaleX = 1 + breathFactor * 0.010 * motionIntensity;
  const torsoLiftY = -breathFactor * 5.2 * motionIntensity;

  // Cervical spine lift from respiration
  const headSpineLiftY = -breathFactor * 2.8 * motionIntensity + headPose.neckTransY;

  // =========================================================================
  // 2. 3D HEAD KINEMATICS (Cervical Spine Pivot + 2.5D Perspective Foreshortening)
  // =========================================================================
  const headRotX = headPose.pitch;
  const headRotY = headPose.yaw;
  const headRotZ = headPose.roll;
  const headTransX = headPose.neckTransX;
  const headTransY = headSpineLiftY;

  // 2.5D Perspective foreshortening
  const headScaleX = 1 - Math.abs(headRotY) * 0.0035;

  // =========================================================================
  // 3. EYE PUPIL GAZE & KYOTO ANIMATION MICRO-SACCADES
  // =========================================================================
  const pupilOffsetX = (smoothedGazeRef.current.x * 6.2 + headPose.eyeSaccadeX) * motionIntensity;
  const pupilOffsetY = (smoothedGazeRef.current.y * 4.0 + headPose.eyeSaccadeY) * motionIntensity;

  // =========================================================================
  // 4. AUTHENTIC 5-VISEME ANIME MOUTH ARTICULATION (with Sternocleidomastoid Jaw Drop)
  // =========================================================================
  const mouthOpen = visemeState.mouthOpen;
  const visemeCode = visemeState.currentViseme;
  const isSpeakingActive = isSpeaking || mouthOpen > 0.07;

  let activeMouthFrame: 'idle' | 'half' | 'ah' | 'oh' | 'ee' = 'idle';

  if (isSpeakingActive) {
    if (mouthOpen > 0.40) {
      if (['oh', 'ou', 'rr'].includes(visemeCode)) {
        activeMouthFrame = 'oh';
      } else if (['ee', 'ih', 'ey'].includes(visemeCode)) {
        activeMouthFrame = 'ee';
      } else {
        activeMouthFrame = 'ah';
      }
    } else if (mouthOpen > 0.12) {
      if (['ee', 'ih'].includes(visemeCode)) {
        activeMouthFrame = 'ee';
      } else {
        activeMouthFrame = 'half';
      }
    } else {
      activeMouthFrame = 'idle';
    }
  }

  // Lower jaw drop during speech + chin tuck from head pitch
  const jawDropY = mouthOpen * 3.2 - headPose.jawDeformY * 4.5;

  return (
    <div
      ref={containerRef}
      className="inochi-stage-container"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Dynamic Ufotable Ambient Mood Aura */}
      <div
        className="inochi-ambient-aura"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${atmoConfig.bloomColor} 0%, rgba(7, 10, 18, 0) 70%)`,
          opacity: 0.68
        }}
      />

      {/* Floating Quick Action Head Motion Bar (Ufotable Expressive Controls) */}
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
            title="Gentle reassuring head shake (It is okay)"
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

      {/* Main Viewport Box (Standard 4:3 Aspect Matching 1200x900 Production Canvas) */}
      <div
        className="inochi-stage-viewport"
        style={{
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px ${atmoConfig.rimColorCss}`
        }}
      >
        {/* =================================================================
            LAYER 0: STATIC ATMOSPHERIC ENVIRONMENT
            ================================================================= */}
        <div className="inochi-layer-bg-environment">
          <img
            src={atmoConfig.bgPath}
            alt={atmoConfig.name}
            className="inochi-img-full"
            draggable={false}
          />
        </div>

        {/* Volumetric God Ray Overlay (Demon Slayer Lighting) */}
        <div
          className="volumetric-god-rays"
          style={{
            opacity: atmoConfig.godRayIntensity,
            background: `linear-gradient(135deg, ${atmoConfig.bloomColor}25 0%, transparent 60%)`
          }}
        />

        {/* =================================================================
            LAYER 1: CHETANA SHARMA ANATOMICALLY DECOUPLED RIG
            ================================================================= */}
        <div
          className="inochi-character-rig-root"
          style={{
            filter: `drop-shadow(0 0 16px ${atmoConfig.rimColorCss})`
          }}
        >
          {/* -------------------------------------------------------------
              NODE A: TORSO & SHOULDERS (DIAPHRAGM RESPIRATION ONLY)
              ------------------------------------------------------------- */}
          <div
            className="inochi-node-torso"
            style={{
              transform: `translateY(${torsoLiftY}px) scale(${torsoScaleX}, ${torsoScaleY})`
            }}
          >
            <img
              src={ASSETS.torso}
              alt="Chetana Torso"
              className="inochi-img-full"
              draggable={false}
            />
          </div>

          {/* -------------------------------------------------------------
              NODE B: 3D HEAD & CERVICAL SPINE KINEMATICS
              ------------------------------------------------------------- */}
          <div
            className="inochi-node-head"
            style={{
              transform: `translate(${headTransX}px, ${headTransY}px) scaleX(${headScaleX}) rotateZ(${headRotZ}deg) rotateY(${headRotY}deg) rotateX(${headRotX}deg)`
            }}
          >
            {/* Head Base Image */}
            <img
              src={ASSETS.head}
              alt="Chetana Head"
              className="inochi-img-full"
              draggable={false}
            />

            {/* Sub-Node: Moving Amber Pupils (with Kyoto Animation Micro-Saccades) */}
            <div
              className="inochi-subnode-pupils"
              style={{
                transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`
              }}
            >
              <img
                src={ASSETS.pupils}
                alt=""
                className="inochi-img-full"
                draggable={false}
              />
            </div>

            {/* Sub-Node: Kyoto Animation Eyelid Blink Layer */}
            <div
              className={`inochi-subnode-blink ${isBlinking ? 'active' : ''}`}
              aria-hidden="true"
            >
              <img
                src={ASSETS.eyelidsBlink}
                alt=""
                className="inochi-img-full"
                draggable={false}
              />
            </div>

            {/* Sub-Node: Golden Jhumka Earrings (Damped Pendulum Physics) */}
            <div
              className="inochi-subnode-jhumka-l"
              style={{
                transform: `rotate(${headPose.jhumkaLeftAngle}deg)`
              }}
            >
              <img
                src={ASSETS.jhumkaL}
                alt=""
                className="inochi-img-full"
                draggable={false}
              />
            </div>

            <div
              className="inochi-subnode-jhumka-r"
              style={{
                transform: `rotate(${headPose.jhumkaRightAngle}deg)`
              }}
            >
              <img
                src={ASSETS.jhumkaR}
                alt=""
                className="inochi-img-full"
                draggable={false}
              />
            </div>

            {/* Sub-Node: 5-Viseme Anime Mouth System (with Lower Jaw Drop) */}
            <div
              className="inochi-subnode-mouth-group"
              style={{
                transform: `translateY(${jawDropY}px)`
              }}
            >
              <div
                className={`inochi-subnode-viseme ${activeMouthFrame === 'half' ? 'active' : ''}`}
                aria-hidden="true"
              >
                <img
                  src={ASSETS.mouthHalf}
                  alt=""
                  className="inochi-img-full"
                  draggable={false}
                />
              </div>

              <div
                className={`inochi-subnode-viseme ${activeMouthFrame === 'ah' ? 'active' : ''}`}
                aria-hidden="true"
              >
                <img
                  src={ASSETS.mouthOpenAh}
                  alt=""
                  className="inochi-img-full"
                  draggable={false}
                />
              </div>

              <div
                className={`inochi-subnode-viseme ${activeMouthFrame === 'oh' ? 'active' : ''}`}
                aria-hidden="true"
              >
                <img
                  src={ASSETS.mouthOpenOh}
                  alt=""
                  className="inochi-img-full"
                  draggable={false}
                />
              </div>

              <div
                className={`inochi-subnode-viseme ${activeMouthFrame === 'ee' ? 'active' : ''}`}
                aria-hidden="true"
              >
                <img
                  src={ASSETS.mouthOpenEe}
                  alt=""
                  className="inochi-img-full"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            LAYER 2: GROUNDED FOREGROUND DESK & BRASS NAMEPLATE
            ================================================================= */}
        <div className="inochi-layer-fg-desk">
          <img
            src={ASSETS.foregroundDesk}
            alt="Foreground Desk"
            className="inochi-img-full"
            draggable={false}
          />
        </div>

        {/* =================================================================
            LAYER 3: DEMON SLAYER 60 FPS PARTICLE & SPARKLE CANVAS
            ================================================================= */}
        <canvas
          ref={particleCanvasRef}
          width={1200}
          height={900}
          className="demon-slayer-particle-canvas"
        />

        {/* Ufotable Silhouette Rim Light Edge Shader Overlay */}
        <div
          className="ufotable-rim-glow-overlay"
          style={{
            boxShadow: `inset 0 0 60px ${atmoConfig.rimColorCss}`
          }}
        />

        {/* Floating Inochi2D & Demon Slayer Telemetry HUD */}
        <div className="inochi-telemetry-hud">
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
              INOCHI2D WEBGL2 RIG
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
            <span style={{ color: '#10b981', fontWeight: 700 }}>{fps} FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
