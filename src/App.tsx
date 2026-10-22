import React, { useState, useEffect, useRef } from 'react';
import { ChetanaMasterAnimeStage } from './components/ChetanaMasterAnimeStage';
import { ControlsPanel } from './components/ControlsPanel';
import { WebcamTrackingModal } from './components/WebcamTrackingModal';
import { IntegrationGuideModal } from './components/IntegrationGuideModal';
import { EmoSenseChetanaPage } from './components/emosense/EmoSenseChetanaPage';
import { AvatarEmotion, AvatarGesture, AtmosphereMode, CameraPreset, TherapistGazeMode } from './lib/avatarTypes';
import { FaceTrackingMetrics } from './lib/faceTrackingMediaPipe';
import { MessageSquare, Clapperboard, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation View Mode: 'chat' (EmoSense Chatting Page with Banner) vs 'studio' (Raw 3D Director Stage)
  const [viewMode, setViewMode] = useState<'chat' | 'studio'>('chat');

  // Studio Mode State
  const [emotion, setEmotion] = useState<AvatarEmotion>('neutral');
  const [gesture, setGesture] = useState<AvatarGesture>('idle_desk');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [enableGazeTracking, setEnableGazeTracking] = useState<boolean>(true);
  const [motionIntensity, setMotionIntensity] = useState<number>(1.25);
  const [atmosphere, setAtmosphere] = useState<AtmosphereMode>('therapist_office');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('medium');
  const [gazeMode, setGazeMode] = useState<TherapistGazeMode>('client');
  const [enableDof, setEnableDof] = useState<boolean>(true);

  // Webcam & MediaPipe Tracking state
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState<boolean>(false);
  const [webcamMetrics, setWebcamMetrics] = useState<FaceTrackingMetrics | null>(null);

  // Modal
  const [isIntegrationGuideOpen, setIsIntegrationGuideOpen] = useState<boolean>(false);

  // FPS Telemetry
  const [fps, setFps] = useState<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animId: number;
    const calcFps = () => {
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      animId = requestAnimationFrame(calcFps);
    };
    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Keyboard Shortcuts (1 = Namaste, 2 = Wave, 3 = Listen, 4 = Empathy, 0 = Idle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;
      if (e.key === '1') setGesture('namaste');
      if (e.key === '2') setGesture('wave');
      if (e.key === '3') setGesture('chin_rest');
      if (e.key === '4') setGesture('heart_empathy');
      if (e.key === '0') setGesture('idle_desk');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* ===================================================================
          Top Persistent Mode Switcher Pill
          Allows immediate toggling between EmoSense Chat and Studio Director
          =================================================================== */}
      <div
        style={{
          position: 'fixed',
          top: 14,
          right: 28,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 24,
          padding: '4px 6px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        <button
          onClick={() => setViewMode('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 18,
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: viewMode === 'chat' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
            color: viewMode === 'chat' ? '#ffffff' : '#94a3b8',
            boxShadow: viewMode === 'chat' ? '0 2px 10px rgba(99, 102, 241, 0.5)' : 'none'
          }}
        >
          <MessageSquare size={14} />
          <span>EmoSense + Chetana Edition</span>
        </button>

        <button
          onClick={() => setViewMode('studio')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 18,
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: viewMode === 'studio' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
            color: viewMode === 'studio' ? '#ffffff' : '#94a3b8',
            boxShadow: viewMode === 'studio' ? '0 2px 10px rgba(99, 102, 241, 0.5)' : 'none'
          }}
        >
          <Clapperboard size={14} />
          <span>3D Studio Director</span>
        </button>
      </div>

      {/* ===================================================================
          VIEW 1: EMOSENSE CHAT INTEGRATION (Chetana Banner & Autopilot)
          =================================================================== */}
      {viewMode === 'chat' ? (
        <EmoSenseChetanaPage onSwitchToStudio={() => setViewMode('studio')} />
      ) : (
        /* ===================================================================
            VIEW 2: RAW 3D STUDIO DIRECTOR STAGE
            =================================================================== */
        <div className="app-container">
          <main className="avatar-stage">
            {/* Floating Top Telemetry HUD */}
            <div className="stage-hud">
              <div className="hud-pill">
                <span className="hud-dot" />
                <span>Chetana Sharma (C.H.E.T.A.N.A.) · Studio Master Engine</span>
              </div>

              <div className="hud-telemetry">
                <span style={{ color: '#10b981', fontWeight: 600 }}>{fps} FPS (Hardware Canvas)</span>
                <span>•</span>
                <span style={{ color: isWebcamActive ? '#10b981' : '#94a3b8' }}>
                  Face: {isWebcamActive ? 'MediaPipe ON' : 'Autonomous 3D'}
                </span>
                <span>•</span>
                <span style={{ color: '#38bdf8' }}>Visemes: Oculus-15 Sync</span>
              </div>
            </div>

            {/* Primary Stage Renderer */}
            <ChetanaMasterAnimeStage
              gesture={gesture}
              emotion={emotion}
              isSpeaking={isSpeaking}
              enableGazeTracking={enableGazeTracking}
              motionIntensity={motionIntensity}
              webcamMetrics={webcamMetrics}
              atmosphere={atmosphere}
              onAtmosphereChange={setAtmosphere}
              cameraPreset={cameraPreset}
              onCameraPresetChange={setCameraPreset}
              gazeMode={gazeMode}
              onGazeModeChange={setGazeMode}
              enableDof={enableDof}
              scale={0.96}
            />
          </main>

          {/* STUDIO CONTROLS SIDEBAR */}
          <aside className="studio-sidebar">
            <ControlsPanel
              emotion={emotion}
              setEmotion={setEmotion}
              gesture={gesture}
              setGesture={setGesture}
              isSpeaking={isSpeaking}
              setIsSpeaking={setIsSpeaking}
              enableGazeTracking={enableGazeTracking}
              setEnableGazeTracking={setEnableGazeTracking}
              motionIntensity={motionIntensity}
              setMotionIntensity={setMotionIntensity}
              isWebcamActive={isWebcamActive}
              onOpenWebcamModal={() => setIsWebcamModalOpen(true)}
              onOpenIntegrationGuide={() => setIsIntegrationGuideOpen(true)}
              atmosphere={atmosphere}
              setAtmosphere={setAtmosphere}
              cameraPreset={cameraPreset}
              setCameraPreset={setCameraPreset}
              gazeMode={gazeMode}
              setGazeMode={setGazeMode}
              enableDof={enableDof}
              setEnableDof={setEnableDof}
            />
          </aside>

          {/* Webcam Face Landmarker Modal */}
          <WebcamTrackingModal
            isOpen={isWebcamModalOpen}
            onClose={() => setIsWebcamModalOpen(false)}
            isWebcamActive={isWebcamActive}
            setIsWebcamActive={setIsWebcamActive}
            onMetricsUpdate={setWebcamMetrics}
          />

          {/* EmoSense Integration Guide Modal */}
          <IntegrationGuideModal
            isOpen={isIntegrationGuideOpen}
            onClose={() => setIsIntegrationGuideOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default App;
