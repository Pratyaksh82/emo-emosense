import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Heart,
  Volume2,
  VolumeX,
  Radio,
  Eye,
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { AvatarEmotion, AvatarGesture, AtmosphereMode, CameraPreset, TherapistGazeMode } from '../lib/avatarTypes';
import { ChetanaMasterAnimeStage } from './ChetanaMasterAnimeStage';
import './ChetanaChatBanner.css';

export interface ChetanaChatBannerProps {
  detectedEmotion?: AvatarEmotion;
  detectedGesture?: AvatarGesture;
  isSpeaking?: boolean;
  confidence?: number;
  valence?: number;
  arousal?: number;
  stressLevel?: number;
  autopilotExplanation?: string;
  defaultExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  isAudioMuted?: boolean;
  onToggleAudioMute?: () => void;
}

export const ChetanaChatBanner: React.FC<ChetanaChatBannerProps> = ({
  detectedEmotion = 'neutral',
  detectedGesture = 'idle_desk',
  isSpeaking = false,
  confidence = 0.88,
  valence = 0.1,
  arousal = 0.3,
  stressLevel = 22,
  autopilotExplanation,
  defaultExpanded = false,
  onToggleExpand,
  isAudioMuted = false,
  onToggleAudioMute
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [atmosphere, setAtmosphere] = useState<AtmosphereMode>('therapist_office');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('medium');
  const [gazeMode, setGazeMode] = useState<TherapistGazeMode>('client');

  useEffect(() => {
    if (defaultExpanded !== undefined) {
      setIsExpanded(defaultExpanded);
    }
  }, [defaultExpanded]);

  const toggleExpand = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (onToggleExpand) onToggleExpand(nextState);
  };

  // Get dynamic CSS class for the emotion theme
  const emotionThemeClass = `theme-${detectedEmotion}`;

  // Human-readable labels
  const emotionLabels: Record<AvatarEmotion, string> = {
    neutral: 'Attentive & Receptive',
    happy: 'Joyful & Uplifted',
    calm: 'Serene & Grounded',
    empathy: 'Deep Compassion',
    sad: 'Gentle Support',
    tense: 'Anxiety De-escalation',
    surprised: 'Attentive Alert',
    speaking: 'Expressive Dialogue'
  };

  const gestureLabels: Record<AvatarGesture, string> = {
    idle_desk: 'Attentive Posture',
    namaste: 'Namaste Greeting',
    wave: 'Cheerful Wave',
    chin_rest: 'Thoughtful Listening',
    heart_empathy: 'Heart-to-Heart Empathy',
    typing: 'Clinical Notes'
  };

  return (
    <div className={`chetana-banner-root ${emotionThemeClass}`}>
      {!isExpanded ? (
        /* ===================================================================
           1. Collapsed Banner View (Standard Chatting Page Bar)
           =================================================================== */
        <div className="chetana-banner-bar" onClick={toggleExpand}>
          <div className="banner-left">
            <div className="banner-avatar-thumb">
              <img
                src={
                  detectedGesture === 'namaste'
                    ? '/poses/pose_namaste.jpg'
                    : detectedGesture === 'heart_empathy'
                    ? '/poses/pose_empathy.jpg'
                    : detectedGesture === 'chin_rest'
                    ? '/poses/pose_chin_rest.jpg'
                    : '/poses/pose_idle.jpg'
                }
                alt="Chetana Avatar Thumbnail"
              />
              <div className="thumb-pulse-ring" />
            </div>

            <div className="banner-info">
              <div className="banner-title-row">
                <span className="banner-title-text">C.H.E.T.A.N.A.</span>
                <Sparkles size={14} className="banner-sparkle-icon" />
                <span className="banner-status-badge">
                  <span className="status-dot" />
                  Live Affective Autopilot
                </span>
              </div>
              <p className="banner-subtext">
                Analyzing user emotions in real-time · Click to invite Chetana to your session
              </p>
            </div>
          </div>

          <div className="banner-right">
            <div className="banner-emotion-pill">
              <Heart size={13} style={{ fill: 'currentColor' }} />
              <span>
                {emotionLabels[detectedEmotion]} ({(confidence * 100).toFixed(0)}%)
              </span>
            </div>

            <button className="banner-cta-btn" onClick={(e) => { e.stopPropagation(); toggleExpand(); }}>
              <span>Engage Chetana</span>
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* ===================================================================
           2. Expanded Avatar Stage View (Embodied Companion Active)
           =================================================================== */
        <div className="chetana-expanded-card">
          <div className="expanded-header">
            <div className="header-identity">
              <div className="banner-avatar-thumb" style={{ width: 34, height: 34 }}>
                <img src="/poses/pose_idle.jpg" alt="Chetana Icon" />
              </div>
              <div>
                <div className="header-name">Chetana Sharma · Autonomous Affective Stage</div>
                <div className="header-sub">
                  Reacting to User Affect: <strong style={{ color: '#38bdf8' }}>{emotionLabels[detectedEmotion]}</strong>
                  {' · '}
                  Gesture: <strong style={{ color: '#34d399' }}>{gestureLabels[detectedGesture]}</strong>
                </div>
              </div>
            </div>

            <div className="expanded-tools">
              <div className="tool-chip">
                <ShieldCheck size={13} style={{ color: '#10b981' }} />
                <span>100% On-Device Zero-Knowledge</span>
              </div>

              {onToggleAudioMute && (
                <button
                  className="btn-icon-subtle"
                  onClick={onToggleAudioMute}
                  title={isAudioMuted ? 'Unmute Voice' : 'Mute Voice'}
                >
                  {isAudioMuted ? <VolumeX size={15} style={{ color: '#f43f5e' }} /> : <Volume2 size={15} style={{ color: '#34d399' }} />}
                </button>
              )}

              <button
                className="btn-icon-subtle"
                onClick={toggleExpand}
                title="Minimize back to Banner"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* Avatar Rendering Viewport (Clean & Unobstructed with Zero Tool Bar Overlays) */}
          <div className="avatar-viewport-container">
            {/* Primary Master 60 FPS Stage Engine */}
            <ChetanaMasterAnimeStage
              emotion={detectedEmotion}
              gesture={detectedGesture}
              isSpeaking={isSpeaking}
              enableGazeTracking={true}
              motionIntensity={1.2}
              webcamMetrics={null}
              atmosphere={atmosphere}
              onAtmosphereChange={setAtmosphere}
              cameraPreset={cameraPreset}
              onCameraPresetChange={setCameraPreset}
              gazeMode={gazeMode}
              onGazeModeChange={setGazeMode}
              enableDof={true}
              scale={1.0}
              hideOverlays={true}
            />
          </div>

          {/* Bottom Telemetry Footer */}
          <div className="expanded-footer">
            <div className="footer-telemetry">
              <span className="telemetry-item">
                Valence: <strong>{valence >= 0 ? `+${valence.toFixed(2)}` : valence.toFixed(2)}</strong>
              </span>
              <span className="telemetry-item">
                Arousal: <strong>{arousal.toFixed(2)}</strong>
              </span>
              <span className="telemetry-item">
                Viseme Engine: <strong>Oculus-15 FFT Sync</strong>
              </span>
              <span className="telemetry-item">
                Framerate: <strong>60 FPS Locked</strong>
              </span>
            </div>

            <div className="footer-actions">
              <button className="btn-secondary-sm" onClick={toggleExpand}>
                <ChevronUp size={13} />
                <span>Dock to Banner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
