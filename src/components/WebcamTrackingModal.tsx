import React, { useEffect, useRef, useState } from 'react';
import { globalFaceTracker, FaceTrackingMetrics } from '../lib/faceTrackingMediaPipe';
import { Camera, X, CheckCircle, AlertCircle, RefreshCw, Eye, Smile } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isWebcamActive: boolean;
  setIsWebcamActive: (active: boolean) => void;
  onMetricsUpdate: (metrics: FaceTrackingMetrics) => void;
}

export const WebcamTrackingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isWebcamActive,
  setIsWebcamActive,
  onMetricsUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [metrics, setMetrics] = useState<FaceTrackingMetrics>(globalFaceTracker.currentMetrics);
  const [statusMessage, setStatusMessage] = useState<string>('Camera is idle');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (isWebcamActive && videoRef.current) {
      startCamera();
    }
  }, [isOpen, isWebcamActive]);

  const startCamera = async () => {
    if (!videoRef.current) return;
    setStatusMessage('Initializing MediaPipe Face Landmarker...');
    setHasError(false);

    const success = await globalFaceTracker.startWebcam(videoRef.current, (newMetrics) => {
      setMetrics(newMetrics);
      onMetricsUpdate(newMetrics);
    });

    if (success) {
      setStatusMessage('Live Face Tracking Active');
      setIsWebcamActive(true);
    } else {
      setStatusMessage('Unable to access webcam. Check permissions.');
      setHasError(true);
      setIsWebcamActive(false);
    }
  };

  const stopCamera = () => {
    globalFaceTracker.stopWebcam();
    setIsWebcamActive(false);
    setStatusMessage('Camera stopped');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="integration-modal" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Camera size={20} className="text-cyan-400" />
            <h2 className="modal-title">Live Webcam Face & Pose Mirroring (MediaPipe)</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Left: Video Feed */}
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', height: '240px' }}>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            {!isWebcamActive && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '10px' }}>
                <Camera size={40} opacity={0.4} />
                <span style={{ fontSize: '13px' }}>Webcam is currently disabled</span>
              </div>
            )}
            {metrics.isFaceDetected && isWebcamActive && (
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(16, 185, 129, 0.85)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle size={13} />
                <span>FACE LOCKED (478 LANDMARKS)</span>
              </div>
            )}
          </div>

          {/* Right: Live Telemetry Gauges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real-Time Blendshape Metrics
            </div>

            {/* Head Yaw Gauge */}
            <div style={{ fontSize: '12px', color: '#e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Head Yaw (Turn):</span>
                <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{metrics.yawDeg.toFixed(1)}°</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.max(0, (metrics.yawDeg + 30) / 0.6))}%`, height: '100%', background: '#38bdf8', transition: 'width 0.05s' }} />
              </div>
            </div>

            {/* Head Pitch Gauge */}
            <div style={{ fontSize: '12px', color: '#e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Head Pitch (Nod):</span>
                <span style={{ fontFamily: 'monospace', color: '#f59e0b' }}>{metrics.pitchDeg.toFixed(1)}°</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.max(0, (metrics.pitchDeg + 25) / 0.5))}%`, height: '100%', background: '#f59e0b', transition: 'width 0.05s' }} />
              </div>
            </div>

            {/* Eye Blink Gauge */}
            <div style={{ fontSize: '12px', color: '#e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Blink Aperture:</span>
                <span style={{ fontFamily: 'monospace', color: '#10b981' }}>{(metrics.leftEyeBlink * 100).toFixed(0)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.leftEyeBlink * 100}%`, height: '100%', background: '#10b981', transition: 'width 0.05s' }} />
              </div>
            </div>

            {/* Mouth Smile Gauge */}
            <div style={{ fontSize: '12px', color: '#e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Smile Detection:</span>
                <span style={{ fontFamily: 'monospace', color: '#ec4899' }}>{(metrics.mouthSmile * 100).toFixed(0)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.mouthSmile * 100}%`, height: '100%', background: '#ec4899', transition: 'width 0.05s' }} />
              </div>
            </div>

            {/* Camera Control Buttons */}
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              {!isWebcamActive ? (
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '9px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={startCamera}
                >
                  <Camera size={14} />
                  <span>Start Face Tracking</span>
                </button>
              ) : (
                <button
                  className="btn-guide"
                  style={{ width: '100%', padding: '9px 14px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={stopCamera}
                >
                  <AlertCircle size={14} />
                  <span>Stop Tracking</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: hasError ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {hasError ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
            <span>{statusMessage}</span>
          </div>
          <button className="btn-guide" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
