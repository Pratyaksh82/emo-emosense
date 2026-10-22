import React, { useState, useRef, useEffect } from 'react';
import {
  AvatarEmotion,
  AvatarGesture,
  AtmosphereMode,
  CameraPreset,
  TherapistGazeMode,
  ATMOSPHERE_CONFIGS
} from '../lib/avatarTypes';
import { globalSpeechService } from '../lib/speechService';
import { globalVisemeEngine } from '../lib/visemeEngine';
import { globalTherapistKinematics, TherapistGestureAction } from '../lib/therapistKinematicsEngine';
import {
  Smile,
  Hand,
  Eye,
  Layers,
  Activity,
  Camera,
  Volume2,
  Mic,
  Sparkles,
  Flame,
  Moon,
  Sun,
  CloudRain,
  Building,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Heart,
  Video,
  BookOpen
} from 'lucide-react';

interface Props {
  emotion: AvatarEmotion;
  setEmotion: (emo: AvatarEmotion) => void;
  gesture: AvatarGesture;
  setGesture: (g: AvatarGesture) => void;
  isSpeaking: boolean;
  setIsSpeaking: (sp: boolean) => void;
  enableGazeTracking: boolean;
  setEnableGazeTracking: (en: boolean) => void;
  motionIntensity: number;
  setMotionIntensity: (val: number) => void;
  isWebcamActive: boolean;
  onOpenWebcamModal: () => void;
  onOpenIntegrationGuide: () => void;
  atmosphere?: AtmosphereMode;
  setAtmosphere?: (atmo: AtmosphereMode) => void;
  cameraPreset?: CameraPreset;
  setCameraPreset?: (preset: CameraPreset) => void;
  gazeMode?: TherapistGazeMode;
  setGazeMode?: (mode: TherapistGazeMode) => void;
  enableDof?: boolean;
  setEnableDof?: (dof: boolean) => void;
}

export const ControlsPanel: React.FC<Props> = ({
  emotion,
  setEmotion,
  gesture,
  setGesture,
  isSpeaking,
  setIsSpeaking,
  enableGazeTracking,
  setEnableGazeTracking,
  motionIntensity,
  setMotionIntensity,
  isWebcamActive,
  onOpenWebcamModal,
  onOpenIntegrationGuide,
  atmosphere = 'therapist_office',
  setAtmosphere,
  cameraPreset = 'medium',
  setCameraPreset,
  gazeMode = 'client',
  setGazeMode,
  enableDof = true,
  setEnableDof
}) => {
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [autoNodActive, setAutoNodActive] = useState<boolean>(true);
  const [autoNotesGlanceActive, setAutoNotesGlanceActive] = useState<boolean>(true);

  // Audio Player State for Candidate C 5-Minute Masterpiece
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingCandidateC, setIsPlayingCandidateC] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(285);
  const [selectedTrack, setSelectedTrack] = useState<string>('/audio/EMOSENSE_BILINGUAL_MASTER_VOICE_5MIN.mp3');

  const emotionList: { id: AvatarEmotion; label: string; icon: string }[] = [
    { id: 'neutral', label: 'Neutral', icon: '✨' },
    { id: 'happy', label: 'Happy / Joy', icon: '🌸' },
    { id: 'calm', label: 'Calm & Grounded', icon: '🍃' },
    { id: 'empathy', label: 'Empathetic', icon: '💖' },
    { id: 'sad', label: 'Comfort Sadness', icon: '🌧️' },
    { id: 'tense', label: 'De-escalate Stress', icon: '🛡️' },
    { id: 'surprised', label: 'Surprised', icon: '⭐' }
  ];

  const gestureList: { id: AvatarGesture; label: string; desc: string; badge?: string }[] = [
    { id: 'idle_desk', label: 'Living Desk Idle', desc: 'Continuous organic breathing, grounded poise & responsive eye contact', badge: 'Active Motion' },
    { id: 'namaste', label: 'Namaste Bow', desc: 'Hands in Anjali Mudra, gold bangles, and respectful grounded poise', badge: 'Option 2 Cel' },
    { id: 'wave', label: 'Executive Wave', desc: 'Right hand raised in greeting, gold bangles, grounded upright stance', badge: 'Option 2 Cel' },
    { id: 'chin_rest', label: 'Thoughtful Listen', desc: 'Chin resting on hand with attentive, focused executive presence', badge: 'Option 2 Cel' },
    { id: 'heart_empathy', label: 'Hand to Heart', desc: 'Hand over heart with calm deep respiration and empathetic presence', badge: 'Option 2 Cel' }
  ];

  // Head Motion Trigger
  const triggerTherapistMotion = (type: TherapistGestureAction) => {
    globalTherapistKinematics.triggerGesture(type);
  };

  const toggleAutoNods = () => {
    const next = !autoNodActive;
    setAutoNodActive(next);
    globalTherapistKinematics.enableAutoNods = next;
  };

  const toggleAutoNotesGlance = () => {
    const next = !autoNotesGlanceActive;
    setAutoNotesGlanceActive(next);
    globalTherapistKinematics.enableAutonomousNotesGlance = next;
  };

  // Connect Audio Element to Web Audio Viseme Analyser
  const togglePlayCandidateC = async () => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(selectedTrack);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setAudioDuration(audio?.duration || 285);
      };

      audio.ontimeupdate = () => {
        if (audio) {
          setAudioProgress((audio.currentTime / (audio.duration || 1)) * 100);
        }
      };

      audio.onended = () => {
        setIsPlayingCandidateC(false);
        setIsSpeaking(false);
        setAudioProgress(0);
      };
    }

    if (isPlayingCandidateC) {
      audio.pause();
      setIsPlayingCandidateC(false);
      setIsSpeaking(false);
    } else {
      await globalVisemeEngine.initAudio();
      globalVisemeEngine.connectMediaElement(audio);
      audio.play().then(() => {
        setIsPlayingCandidateC(true);
        setIsSpeaking(true);
      }).catch((e) => {
        console.error('Audio playback failed:', e);
      });
    }
  };

  // Jump to Chapter in Masterpiece Audio
  const seekToChapter = (seconds: number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(selectedTrack);
      audioRef.current.onloadedmetadata = () => {
        setAudioDuration(audioRef.current?.duration || 285);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setAudioProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
        }
      };
      audioRef.current.onended = () => {
        setIsPlayingCandidateC(false);
        setIsSpeaking(false);
        setAudioProgress(0);
      };
    }
    const audio = audioRef.current;
    audio.currentTime = seconds;
    if (!isPlayingCandidateC) {
      togglePlayCandidateC();
    }
  };

  // Toggle microphone live viseme sync
  const toggleMicrophone = async () => {
    if (isMicActive) {
      globalVisemeEngine.stopMicrophone();
      setIsMicActive(false);
    } else {
      const ok = await globalVisemeEngine.startMicrophone();
      if (ok) setIsMicActive(true);
    }
  };

  return (
    <div className="controls-panel">
      <div className="panel-header">
        <div className="avatar-badge">
          <span className="live-indicator" />
          <span className="avatar-name">CHETANA SHARMA</span>
          <span className="avatar-version">Inochi2D & Anime Studio</span>
        </div>
        <button
          className="btn-guide"
          onClick={onOpenIntegrationGuide}
          title="EmoSense AI Integration Instructions"
        >
          <Layers size={15} />
          <span>Integration Guide</span>
        </button>
      </div>

      {/* SECTION 1: DEMON SLAYER / UFOTABLE ATMOSPHERE & SCENE */}
      <div className="control-section">
        <div className="section-title">
          <Sparkles size={16} className="text-amber-400" />
          <span>Cinematic Anime Atmosphere</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          {[
            { id: 'therapist_office' as AtmosphereMode, label: 'Executive Suite', icon: <BookOpen size={14} className="text-amber-400" />, desc: 'Mahogany Books & Skyline' },
            { id: 'wisteria' as AtmosphereMode, label: 'Wisteria Night', icon: <Moon size={14} className="text-purple-400" />, desc: 'Ethereal Moonlit Petals' },
            { id: 'solar' as AtmosphereMode, label: 'Nichirin Solar', icon: <Sun size={14} className="text-amber-400" />, desc: 'Golden Hour Embers' },
            { id: 'rainy' as AtmosphereMode, label: 'Kyoto Rain', icon: <CloudRain size={14} className="text-cyan-400" />, desc: 'Rain Streaks & Lantern' },
            { id: 'studio' as AtmosphereMode, label: 'Modern Studio', icon: <Building size={14} className="text-emerald-400" />, desc: 'Executive Penthouse' }
          ].map((item) => {
            const isSel = atmosphere === item.id;
            return (
              <button
                key={item.id}
                className={`gesture-btn ${isSel ? 'active' : ''}`}
                style={{ padding: '8px 10px', textAlign: 'left' }}
                onClick={() => setAtmosphere && setAtmosphere(item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '11px' }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: THERAPIST ACTING & GAZE FOCUS */}
      <div className="control-section">
        <div className="section-title">
          <Activity size={16} className="text-cyan-400" />
          <span>Therapist Psychological Acting</span>
        </div>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 8px 0', lineHeight: 1.4 }}>
          4.5s diaphragmatic breathing, Poisson exponential blinks, cervical spine articulation & therapeutic micro-acting.
        </p>

        {/* Gaze Focus Modes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          {[
            { id: 'client' as TherapistGazeMode, label: 'Client Contact', icon: '👁️', desc: 'Warm Attention' },
            { id: 'notes' as TherapistGazeMode, label: 'Desk Notepad', icon: '📝', desc: 'Clinical Notes' },
            { id: 'reflective' as TherapistGazeMode, label: 'Reflective', icon: '🌌', desc: 'Contemplation' }
          ].map((item) => {
            const isSel = gazeMode === item.id;
            return (
              <button
                key={item.id}
                className={`gesture-btn ${isSel ? 'active' : ''}`}
                style={{ padding: '6px 4px', textAlign: 'center' }}
                onClick={() => setGazeMode && setGazeMode(item.id)}
              >
                <div style={{ fontSize: '11px', fontWeight: 600 }}>{item.icon} {item.label}</div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>{item.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Micro-Acting Gesture Triggers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          <button
            className="btn-guide"
            style={{ padding: '7px 4px', fontSize: '11px', justifyContent: 'center' }}
            onClick={() => triggerTherapistMotion('agree_nod')}
            title="Affirmation double-dip nod"
          >
            <span>✨ Double Nod</span>
          </button>
          <button
            className="btn-guide"
            style={{ padding: '7px 4px', fontSize: '11px', justifyContent: 'center' }}
            onClick={() => triggerTherapistMotion('deep_empathy_nod')}
            title="Compassionate deep head dip"
          >
            <span>💖 Empathy Dip</span>
          </button>
          <button
            className="btn-guide"
            style={{ padding: '7px 4px', fontSize: '11px', justifyContent: 'center' }}
            onClick={() => triggerTherapistMotion('notes_glance')}
            title="Glance down at desk notes and return"
          >
            <span>📝 Notes Glance</span>
          </button>
          <button
            className="btn-guide"
            style={{ padding: '7px 4px', fontSize: '11px', justifyContent: 'center' }}
            onClick={() => triggerTherapistMotion('curious_tilt')}
            title="Attentive side tilt"
          >
            <span>⭐ Curious Tilt</span>
          </button>
          <button
            className="btn-guide"
            style={{ padding: '7px 4px', fontSize: '11px', justifyContent: 'center' }}
            onClick={() => triggerTherapistMotion('reassuring_shake')}
            title="Gentle reassuring shake"
          >
            <span>🍃 Reassure</span>
          </button>
          <button
            className="btn-guide"
            style={{ padding: '7px 4px', fontSize: '11px', justifyContent: 'center' }}
            onClick={() => triggerTherapistMotion('alert_perk')}
            title="Attentive perk up"
          >
            <span>🎯 Alert Perk</span>
          </button>
        </div>

        {/* Autonomous Listening Behaviors Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            className={`btn-guide ${autoNodActive ? 'active' : ''}`}
            style={{
              padding: '7px 6px',
              fontSize: '11px',
              justifyContent: 'center',
              background: autoNodActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              borderColor: autoNodActive ? '#10b981' : 'rgba(255,255,255,0.1)'
            }}
            onClick={toggleAutoNods}
          >
            <span>{autoNodActive ? '👂 Auto-Nods ON' : '👂 Auto-Nods OFF'}</span>
          </button>

          <button
            className={`btn-guide ${autoNotesGlanceActive ? 'active' : ''}`}
            style={{
              padding: '7px 6px',
              fontSize: '11px',
              justifyContent: 'center',
              background: autoNotesGlanceActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              borderColor: autoNotesGlanceActive ? '#38bdf8' : 'rgba(255,255,255,0.1)'
            }}
            onClick={toggleAutoNotesGlance}
          >
            <span>{autoNotesGlanceActive ? '📝 Auto-Notes ON' : '📝 Auto-Notes OFF'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 2B: CINEMATIC CAMERA SYSTEM & DEPTH OF FIELD */}
      <div className="control-section">
        <div className="section-title">
          <Video size={16} className="text-pink-400" />
          <span>Cinematic Camera System</span>
        </div>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 8px 0', lineHeight: 1.4 }}>
          Cinematic camera cuts with smooth interpolation, 20s breathing push-in & foreground depth of field blur.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          {[
            { id: 'wide' as CameraPreset, label: 'Wide Consultation', desc: '0.90x Full Desk' },
            { id: 'medium' as CameraPreset, label: 'Attentive Medium', desc: '1.00x Counseling' },
            { id: 'closeup' as CameraPreset, label: 'Close-Up Eye Contact', desc: '1.26x Emotional' },
            { id: 'desk' as CameraPreset, label: 'Desk & Notes Focus', desc: '1.16x Clinical Pad' }
          ].map((item) => {
            const isSel = cameraPreset === item.id;
            return (
              <button
                key={item.id}
                className={`gesture-btn ${isSel ? 'active' : ''}`}
                style={{ padding: '6px 8px', textAlign: 'left' }}
                onClick={() => setCameraPreset && setCameraPreset(item.id)}
              >
                <div style={{ fontWeight: 600, fontSize: '11px' }}>{item.label}</div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>{item.desc}</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Foreground Desk Depth of Field Blur</span>
          <button
            className={`btn-guide ${enableDof ? 'active' : ''}`}
            style={{
              padding: '4px 10px',
              fontSize: '10px',
              background: enableDof ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.06)',
              borderColor: enableDof ? '#a855f7' : 'rgba(255,255,255,0.1)'
            }}
            onClick={() => setEnableDof && setEnableDof(!enableDof)}
          >
            <span>{enableDof ? 'DOF ON' : 'DOF OFF'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: CANDIDATE C NEURAL BILINGUAL VOICE & TRUE FFT LIP-SYNC */}
      <div className="control-section">
        <div className="section-title">
          <Headphones size={16} className="text-pink-400" />
          <span>Candidate C Masterpiece Audio</span>
        </div>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 8px 0', lineHeight: 1.4 }}>
          5-Minute Bilingual Neural Engine (Hindi + English, 227.5 Hz F0, 432 Hz healing alpha drone) with real-time FFT lip-sync.
        </p>

        {/* Master Play / Pause Button */}
        <button
          className="btn-primary"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px',
            background: isPlayingCandidateC ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : undefined
          }}
          onClick={togglePlayCandidateC}
        >
          {isPlayingCandidateC ? <Pause size={14} /> : <Play size={14} />}
          <span>{isPlayingCandidateC ? 'Pause Masterpiece Audio' : 'Play 5-Min Bilingual Showcase'}</span>
        </button>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${audioProgress}%`, height: '100%', background: '#38bdf8', transition: 'width 0.1s linear' }} />
        </div>

        {/* Chapter Jump Shortcuts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <button
            className="btn-guide"
            style={{ padding: '6px', fontSize: '10px', textAlign: 'center' }}
            onClick={() => seekToChapter(0)}
          >
            <span>Ch. 1 Greeting</span>
          </button>
          <button
            className="btn-guide"
            style={{ padding: '6px', fontSize: '10px', textAlign: 'center' }}
            onClick={() => seekToChapter(58)}
          >
            <span>Ch. 3 Empathy</span>
          </button>
          <button
            className="btn-guide"
            style={{ padding: '6px', fontSize: '10px', textAlign: 'center' }}
            onClick={() => seekToChapter(175)}
          >
            <span>Ch. 7 Evening</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: Live Tracking (MediaPipe & Mic) */}
      <div className="control-section">
        <div className="section-title">
          <Camera size={16} />
          <span>Webcam Mirror & Mic Lip-Sync</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            className={`btn-guide ${isWebcamActive ? 'active' : ''}`}
            style={{
              padding: '8px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: isWebcamActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              borderColor: isWebcamActive ? '#10b981' : 'rgba(255,255,255,0.1)'
            }}
            onClick={onOpenWebcamModal}
          >
            <Camera size={13} className={isWebcamActive ? 'text-emerald-400' : ''} />
            <span>{isWebcamActive ? 'Face Mirror ON' : 'Webcam Mirror'}</span>
          </button>

          <button
            className={`btn-guide ${isMicActive ? 'active' : ''}`}
            style={{
              padding: '8px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: isMicActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              borderColor: isMicActive ? '#38bdf8' : 'rgba(255,255,255,0.1)'
            }}
            onClick={toggleMicrophone}
          >
            <Mic size={13} className={isMicActive ? 'text-cyan-400' : ''} />
            <span>{isMicActive ? 'Mic Sync ON' : 'Mic Lip-Sync'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: Full Body Poses & Gestures */}
      <div className="control-section">
        <div className="section-title">
          <Hand size={16} />
          <span>Full Body Poses & Mudras</span>
        </div>
        <div className="gesture-grid">
          {gestureList.map((g) => {
            const isSelected = gesture === g.id;
            return (
              <button
                key={g.id}
                className={`gesture-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setGesture(g.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="gesture-title">{g.label}</div>
                  {g.badge && (
                    <span style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#34d399' : '#94a3b8'
                    }}>
                      {g.badge}
                    </span>
                  )}
                </div>
                <div className="gesture-desc">{g.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: Emotion & Mood Aura */}
      <div className="control-section">
        <div className="section-title">
          <Smile size={16} />
          <span>Emotion & Aura</span>
        </div>
        <div className="emotion-grid">
          {emotionList.map((emo) => {
            const isSelected = emotion === emo.id;
            return (
              <button
                key={emo.id}
                className={`emotion-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setEmotion(emo.id)}
              >
                <span className="emo-icon">{emo.icon}</span>
                <span className="emo-label">{emo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 7: Motion Intensity (60 FPS) */}
      <div className="control-section">
        <div className="section-title">
          <Activity size={16} />
          <span>Motion Dynamics Scale</span>
        </div>
        <div className="motion-intensity-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { val: 0.65, label: 'Gentle', desc: 'Subtle Life' },
            { val: 1.0, label: 'Natural', desc: 'Real Human' },
            { val: 1.35, label: 'Expressive', desc: 'Full Anime' }
          ].map((mode) => {
            const isSel = Math.abs(motionIntensity - mode.val) < 0.15;
            return (
              <button
                key={mode.val}
                className={`gesture-btn ${isSel ? 'active' : ''}`}
                style={{ padding: '8px 6px', textAlign: 'center' }}
                onClick={() => setMotionIntensity(mode.val)}
              >
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{mode.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 8: Gaze Interactivity */}
      <div className="control-section">
        <div className="section-title">
          <Eye size={16} />
          <span>Gaze Orientation</span>
        </div>
        <div className="toggle-row">
          <label className="toggle-label">
            <Eye size={16} />
            <span>Mouse Gaze Tracking + Saccades</span>
            <input
              type="checkbox"
              checked={enableGazeTracking}
              onChange={(e) => setEnableGazeTracking(e.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
