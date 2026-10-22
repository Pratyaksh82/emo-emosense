import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  AvatarProps,
  AvatarGesture,
  GazeTarget,
  EMOTION_THEME_COLORS
} from '../lib/avatarTypes';
import { FaceTrackingMetrics } from '../lib/faceTrackingMediaPipe';
import { VisemeState, globalVisemeEngine } from '../lib/visemeEngine';
import { solve2BoneIK, GESTURE_IK_TARGETS } from '../lib/kinematicsIK';
import './ChetanaAvatar.css';

// Master High-Resolution Pose Artworks
const POSE_IMAGES: Record<AvatarGesture, string> = {
  idle_desk: '/poses/pose_idle.jpg',
  namaste: '/poses/pose_namaste.jpg',
  wave: '/poses/pose_wave.jpg',
  chin_rest: '/poses/pose_chin_rest.jpg',
  heart_empathy: '/poses/pose_empathy.jpg',
  typing: '/poses/pose_idle.jpg'
};

const BLINK_IMAGE = '/poses/pose_blink.jpg';

interface LivingMotionState {
  chestScaleY: number;
  shoulderRiseY: number;
  headRotZ: number;
  headRotY: number;
  headRotX: number;
  headTransX: number;
  headTransY: number;
  gestureBowY: number;
  gestureBowRotX: number;
}

export interface ChetanaAvatarFullProps extends AvatarProps {
  motionIntensity?: number;
  webcamMetrics?: FaceTrackingMetrics | null;
  visemeState?: VisemeState | null;
}

export const ChetanaAvatar: React.FC<ChetanaAvatarFullProps> = ({
  emotion = 'neutral',
  gesture = 'idle_desk',
  enableGazeTracking = true,
  scale = 1,
  className = '',
  motionIntensity = 1.25,
  webcamMetrics = null,
  visemeState = null
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate refs
  const mouseTargetRef = useRef<GazeTarget>({ x: 0, y: 0 });
  const smoothedGazeRef = useRef<GazeTarget>({ x: 0, y: 0 });

  // Autonomous Blinking state
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const blinkTimerRef = useRef<number | null>(null);

  // Internal Viseme state if not passed from parent
  const [internalViseme, setInternalViseme] = useState<VisemeState>(globalVisemeEngine.state);

  // Active living 60 FPS motion values
  const [motion, setMotion] = useState<LivingMotionState>({
    chestScaleY: 1,
    shoulderRiseY: 0,
    headRotZ: 0,
    headRotY: 0,
    headRotX: 0,
    headTransX: 0,
    headTransY: 0,
    gestureBowY: 0,
    gestureBowRotX: 0
  });

  // Kinematic Gesture interpolation refs
  const currentBowYRef = useRef<number>(0);
  const currentBowRotXRef = useRef<number>(0);

  // =========================================================================
  // 1. Natural Biological Blinking Loop (Overridden if Webcam is tracking)
  // =========================================================================
  useEffect(() => {
    let active = true;

    const triggerBlink = () => {
      if (!active) return;
      // If webcam is actively tracking eyes, let webcam dictate blinking
      if (!webcamMetrics?.isFaceDetected) {
        setIsBlinking(true);

        setTimeout(() => {
          if (!active) return;
          setIsBlinking(false);

          // 20% probability of an authentic anime double blink
          if (Math.random() < 0.2) {
            setTimeout(() => {
              if (!active) return;
              setIsBlinking(true);
              setTimeout(() => {
                if (active) setIsBlinking(false);
              }, 85);
            }, 130);
          }

          const nextDelay = 2800 + Math.random() * 2600;
          blinkTimerRef.current = window.setTimeout(triggerBlink, nextDelay);
        }, 125);
      } else {
        const nextDelay = 1500;
        blinkTimerRef.current = window.setTimeout(triggerBlink, nextDelay);
      }
    };

    const initialDelay = 1200 + Math.random() * 1500;
    blinkTimerRef.current = window.setTimeout(triggerBlink, initialDelay);

    return () => {
      active = false;
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [webcamMetrics?.isFaceDetected]);

  // Webcam Blink Mirroring
  useEffect(() => {
    if (webcamMetrics?.isFaceDetected) {
      const shouldBlink = webcamMetrics.leftEyeBlink > 0.55 || webcamMetrics.rightEyeBlink > 0.55;
      setIsBlinking(shouldBlink);
    }
  }, [webcamMetrics]);

  // =========================================================================
  // 2. Mouse Coordinate Listener
  // =========================================================================
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

  // =========================================================================
  // 3. CONTINUOUS 60 FPS LIVING ANIME MOTION & IK ENGINE
  // =========================================================================
  useEffect(() => {
    let animId: number;
    const startTime = performance.now();

    const updateLivingLoop = (now: number) => {
      const time = (now - startTime) * 0.001; // elapsed time in seconds
      const intensity = motionIntensity;

      // Update viseme audio frame
      const currentViseme = visemeState || globalVisemeEngine.updateFrame();
      setInternalViseme({ ...currentViseme });

      // Smooth mouse gaze dampening
      const targetGaze = mouseTargetRef.current;
      const currentGaze = smoothedGazeRef.current;
      currentGaze.x += (targetGaze.x - currentGaze.x) * 0.075;
      currentGaze.y += (targetGaze.y - currentGaze.y) * 0.075;

      // A. Organic Respiration Wave (3.6s natural human cycle)
      const breathPhase = Math.sin(time * 1.75);
      const breathMultiplier = emotion === 'empathy' || emotion === 'calm' ? 1.35 : 1.0;
      const chestScaleY = 1 + breathPhase * 0.024 * intensity * breathMultiplier;
      const shoulderRiseY = -breathPhase * 5.6 * intensity * breathMultiplier;

      // B. Continuous 3D Neck-Pivot Head Sway (Lissajous Curves)
      const organicRoll = Math.sin(time * 0.85) * 4.2 * intensity;
      const organicYaw = Math.sin(time * 0.65) * 5.0 * intensity;
      const organicPitch = Math.sin(time * 1.75 + 0.4) * 3.4 * intensity;
      const organicDriftX = Math.sin(time * 0.85) * 7.5 * intensity;
      const organicDriftY = Math.sin(time * 1.75) * 4.2 * intensity;

      // Mouse reaction offsets (3D perspective turning towards cursor)
      const gazeRoll = currentGaze.x * 3.2 * intensity;
      const gazeYaw = currentGaze.x * 6.5 * intensity;
      const gazePitch = -currentGaze.y * 4.8 * intensity;

      // Gesture-specific head bias
      let gestureRollOffset = 0;
      let gesturePitchOffset = 0;

      if (gesture === 'wave') {
        gestureRollOffset = 5.2;
      } else if (gesture === 'chin_rest') {
        gestureRollOffset = -5.8;
        gesturePitchOffset = Math.sin(time * 2.4) * 2.8; // attentive listening nod
      } else if (gesture === 'namaste') {
        gesturePitchOffset = 5.6; // respectful bow
      } else if (gesture === 'heart_empathy') {
        gestureRollOffset = 3.6;
      }

      // Check if MediaPipe Face Mirroring is active
      let totalHeadRotZ = organicRoll + gazeRoll + gestureRollOffset;
      let totalHeadRotY = organicYaw + gazeYaw;
      let totalHeadRotX = organicPitch + gazePitch + gesturePitchOffset;

      if (webcamMetrics && webcamMetrics.isFaceDetected) {
        // Blend MediaPipe head angles (live mirroring)
        totalHeadRotY = webcamMetrics.yawDeg * 0.85;
        totalHeadRotX = webcamMetrics.pitchDeg * 0.85 + gesturePitchOffset;
        totalHeadRotZ = webcamMetrics.rollDeg * 0.85 + gestureRollOffset;
      }

      const totalHeadTransX = organicDriftX + currentGaze.x * 8.5 * intensity;
      const totalHeadTransY = organicDriftY + currentGaze.y * 5.5 * intensity;

      // C. Kinematic Gesture Actions (e.g. Bowing during Namaste)
      const targetBowY = gesture === 'namaste' ? 12.0 : 0;
      const targetBowRotX = gesture === 'namaste' ? 4.5 : 0;
      currentBowYRef.current += (targetBowY - currentBowYRef.current) * 0.08;
      currentBowRotXRef.current += (targetBowRotX - currentBowRotXRef.current) * 0.08;

      setMotion({
        chestScaleY,
        shoulderRiseY,
        headRotZ: totalHeadRotZ,
        headRotY: totalHeadRotY,
        headRotX: totalHeadRotX,
        headTransX: totalHeadTransX,
        headTransY: totalHeadTransY,
        gestureBowY: currentBowYRef.current,
        gestureBowRotX: currentBowRotXRef.current
      });

      animId = requestAnimationFrame(updateLivingLoop);
    };

    animId = requestAnimationFrame(updateLivingLoop);
    return () => cancelAnimationFrame(animId);
  }, [emotion, gesture, motionIntensity, webcamMetrics, visemeState]);

  const theme = useMemo(() => EMOTION_THEME_COLORS[emotion] || EMOTION_THEME_COLORS.neutral, [emotion]);

  // Dynamic iris tracking coordinates
  const pupilOffsetX = smoothedGazeRef.current.x * 5.2;
  const pupilOffsetY = smoothedGazeRef.current.y * 3.4;

  const activeViseme = visemeState || internalViseme;
  const isSpeakingViseme = activeViseme.mouthOpen > 0.08;

  return (
    <div
      ref={containerRef}
      className={`chetana-avatar-container ${className}`}
      style={{ transform: `scale(${scale})` }}
      data-emotion={emotion}
      data-gesture={gesture}
    >
      {/* 1. Dynamic Ambient Mood Aura Glow */}
      <div
        className="chetana-aura-glow"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${theme.accent} 0%, rgba(7, 10, 18, 0) 68%)`
        }}
      />

      {/* 2. Grounded Stage Architecture (Desk is 100% stationary) */}
      <div className="chetana-stage-grounded">
        {/* Continuous Breathing Layer (Anchored to desk baseline at 50% 92%) */}
        <div
          className="chetana-living-breathing-layer"
          style={{
            transform: `scaleY(${motion.chestScaleY}) translateY(${motion.shoulderRiseY}px)`
          }}
        >
          {/* Kinematic Bowing Layer (Smooth bow dip for Namaste) */}
          <div
            className="chetana-gesture-motion-layer"
            style={{
              transform: `translateY(${motion.gestureBowY}px) rotateX(${motion.gestureBowRotX}deg)`
            }}
          >
            {/* Continuous 3D Neck-Pivot Head & Face Articulator */}
            <div
              className="chetana-living-head-neck"
              style={{
                transform: `rotateZ(${motion.headRotZ}deg) rotateY(${motion.headRotY}deg) rotateX(${motion.headRotX}deg) translate(${motion.headTransX}px, ${motion.headTransY}px)`
              }}
            >
              {/* Multi-Pose Master Artwork Images with Smooth Cross-Fade */}
              {(['idle_desk', 'namaste', 'wave', 'chin_rest', 'heart_empathy'] as AvatarGesture[]).map((g) => {
                const isCurrent = gesture === g || (gesture === 'typing' && g === 'idle_desk');
                return (
                  <img
                    key={g}
                    src={POSE_IMAGES[g]}
                    alt={`Chetana ${g}`}
                    className={`chetana-pose-img ${isCurrent ? 'active' : ''}`}
                    draggable={false}
                  />
                );
              })}

              {/* ===============================================================
                  REAL-TIME OCULUS VISEME LIP-SYNC MOUTH LAYER
                  Articulates synchronized mouth shapes during speech / mic audio
                  =============================================================== */}
              <div
                className="chetana-viseme-mouth-container"
                style={{
                  opacity: isSpeakingViseme ? 1 : 0
                }}
              >
                <div
                  className="chetana-viseme-oral-cavity"
                  style={{
                    transform: `scale(${1 + activeViseme.mouthWidth * 0.35}, ${Math.max(0.15, activeViseme.mouthOpen * 1.4)})`,
                    borderRadius: activeViseme.mouthPucker > 0.5 ? '50%' : '50% 50% 60% 60%'
                  }}
                >
                  <div className="chetana-viseme-teeth" />
                  <div className="chetana-viseme-tongue" />
                </div>
              </div>

              {/* ===============================================================
                  AUTHENTIC CLOSED-EYE BLINKING OVERLAY
                  Uses high-res closed eyelid illustration of Chetana.
                  Zero black bars: seamlessly covers eye socket region for 125ms.
                  =============================================================== */}
              <div className={`chetana-closed-eye-mask ${isBlinking ? 'blinking-active' : ''}`}>
                <img
                  src={BLINK_IMAGE}
                  alt="Chetana Blink"
                  className="chetana-blink-artwork"
                  draggable={false}
                />
              </div>

              {/* ===============================================================
                  LIVING EYE GAZE & SACCADE TRACKING
                  Iris glides smoothly inside the eye aperture
                  =============================================================== */}
              {!isBlinking && enableGazeTracking && !webcamMetrics?.isFaceDetected && (
                <div className="chetana-iris-gaze-zone">
                  <div
                    className="chetana-iris-glider left"
                    style={{
                      transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`
                    }}
                  />
                  <div
                    className="chetana-iris-glider right"
                    style={{
                      transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export const PreetiAvatar = ChetanaAvatar;
export type PreetiAvatarFullProps = ChetanaAvatarFullProps;
export default ChetanaAvatar;
