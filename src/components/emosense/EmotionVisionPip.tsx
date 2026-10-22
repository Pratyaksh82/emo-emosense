import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Minimize2, Maximize2, X, PlayCircle, Sliders, Activity, ShieldCheck } from 'lucide-react';
import { FaceData, DemoScenario, DEMO_SCENARIOS } from '../../lib/emosenseTypes';

interface EmotionVisionPipProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
  faceData: FaceData | null;
}

export const EmotionVisionPip: React.FC<EmotionVisionPipProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  faceData
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('calm');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Setup real webcam stream when enabled
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && useRealWebcam) {
      navigator.mediaDevices?.getUserMedia({ video: { width: 320, height: 240 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn('Webcam permission not granted, falling back to synthetic affect tracking:', err);
          setUseRealWebcam(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, useRealWebcam]);

  // Synthetic Face Mesh Animation on Canvas
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 10;
      const scale = 58;

      // Simulated Facial Landmark Contours
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.2;

      // Jawline oval
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, scale * 0.9, scale * 1.15, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Eyebrows (reacting to affect)
      const browY = cy - scale * 0.45;
      const browOffset = (faceData?.dominantEmotion === 'tense' ? -4 : 0) + Math.sin(t) * 1.5;
      // Left brow
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.55, browY + browOffset);
      ctx.lineTo(cx - scale * 0.15, browY - 2 + browOffset);
      ctx.stroke();
      // Right brow
      ctx.beginPath();
      ctx.moveTo(cx + scale * 0.15, browY - 2 + browOffset);
      ctx.lineTo(cx + scale * 0.55, browY + browOffset);
      ctx.stroke();

      // Eyes
      const eyeY = cy - scale * 0.25;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx - scale * 0.35, eyeY, 3, 0, Math.PI * 2);
      ctx.arc(cx + scale * 0.35, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Mouth contour (smiling vs tense vs neutral)
      const mouthY = cy + scale * 0.5;
      const smile = faceData?.dominantEmotion === 'happy' ? 6 : faceData?.dominantEmotion === 'sad' ? -4 : 0;
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.3, mouthY);
      ctx.quadraticCurveTo(cx, mouthY + smile + Math.sin(t * 1.5) * 1.5, cx + scale * 0.3, mouthY);
      ctx.stroke();

      // Bounding box with pulsing corners
      ctx.strokeStyle = faceData?.dominantEmotion === 'tense' ? '#f43f5e' : '#10b981';
      ctx.lineWidth = 1.5;
      const bw = scale * 2.1;
      const bh = scale * 2.6;
      const bx = cx - bw / 2;
      const by = cy - bh / 2;
      const corner = 12;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + corner);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + corner, by);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - corner, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + corner);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - corner);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + corner, by + bh);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - corner, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - corner);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isMinimized, faceData]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: 'hsla(232, 35%, 10%, 0.94)',
        border: '1px solid hsla(252, 83%, 70%, 0.4)',
        borderRadius: 20,
        boxShadow: '0 18px 45px rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        width: isMinimized ? 220 : 320,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'hsla(232, 28%, 14%, 0.9)',
          borderBottom: '1px solid hsla(232, 25%, 22%, 0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Camera size={14} style={{ color: '#10b981' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Face Affect Vision</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Video / Canvas Viewport */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 180,
              background: '#090d16',
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid hsla(232, 25%, 25%, 0.6)'
            }}
          >
            {useRealWebcam ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}

            <canvas
              ref={canvasRef}
              width={290}
              height={180}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />

            {/* Live Pill HUD */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: 10,
                color: '#ffffff',
                fontWeight: 600
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span>{faceData?.dominantEmotion?.toUpperCase() || 'NEUTRAL'} ({Math.round((faceData?.confidence || 0.94) * 100)}%)</span>
            </div>

            {/* Zero-Knowledge Privacy Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(5, 7, 15, 0.75)',
                fontSize: 9,
                color: '#34d399'
              }}
            >
              <ShieldCheck size={10} />
              <span>100% Client-Side Privacy</span>
            </div>
          </div>

          {/* Toggle Webcam vs Synthetic Scenario */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setUseRealWebcam(!useRealWebcam)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 8,
                background: useRealWebcam ? 'hsla(252, 83%, 70%, 0.25)' : 'hsla(232, 28%, 16%, 0.8)',
                border: `1px solid ${useRealWebcam ? 'hsl(252, 83%, 70%)' : 'hsla(232, 25%, 25%, 0.8)'}`,
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              {useRealWebcam ? <Camera size={13} style={{ color: '#10b981' }} /> : <CameraOff size={13} />}
              <span>{useRealWebcam ? 'Real Camera ON' : 'Switch to Webcam'}</span>
            </button>
          </div>

          {/* Simulation Scenario Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10.5, color: 'hsl(230, 15%, 65%)', fontWeight: 600 }}>
              Affect Scenario Simulation:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {DEMO_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioId(sc.id);
                    onSelectScenario(sc);
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: selectedScenarioId === sc.id ? 'hsla(252, 83%, 70%, 0.25)' : 'hsla(232, 28%, 16%, 0.7)',
                    border: `1px solid ${selectedScenarioId === sc.id ? 'hsl(252, 83%, 70%)' : 'hsla(232, 25%, 22%, 0.7)'}`,
                    color: selectedScenarioId === sc.id ? '#ffffff' : 'hsl(230, 20%, 80%)',
                    fontSize: 10.5,
                    cursor: 'pointer'
                  }}
                >
                  {sc.emoji} {sc.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
