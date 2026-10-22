import React from 'react';

interface ValenceArousalRadarProps {
  valence: number; // -1 to +1
  arousal: number; // -1 to +1
  dominantEmotion?: string;
  stressLevel?: number;
}

export const ValenceArousalRadar: React.FC<ValenceArousalRadarProps> = ({
  valence,
  arousal,
  dominantEmotion = 'neutral',
  stressLevel = 20
}) => {
  const size = 220;
  const center = size / 2;
  const radius = size * 0.42;

  // Map [-1, 1] to SVG coordinates
  const clampV = Math.max(-1, Math.min(1, valence));
  const clampA = Math.max(-1, Math.min(1, arousal));
  const posX = center + clampV * radius;
  const posY = center - clampA * radius; // Invert Y for SVG

  // Quadrant categorization
  let quadrantLabel = 'Neutral Baseline';
  let quadrantColor = '#8b5cf6';
  if (clampV >= 0 && clampA >= 0) {
    quadrantLabel = 'Excitement / High Joy';
    quadrantColor = '#10b981';
  } else if (clampV >= 0 && clampA < 0) {
    quadrantLabel = 'Serenity / Grounded Calm';
    quadrantColor = '#06b6d4';
  } else if (clampV < 0 && clampA >= 0) {
    quadrantLabel = 'Agitation / Situational Stress';
    quadrantColor = '#ef4444';
  } else {
    quadrantLabel = 'Low Energy / Sadness';
    quadrantColor = '#3b82f6';
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          background: 'hsla(232, 35%, 8%, 0.85)',
          borderRadius: 16,
          border: '1px solid hsla(232, 25%, 22%, 0.9)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 25px rgba(0,0,0,0.6)'
        }}
      >
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            {/* Quadrant Soft Glow Gradients */}
            <radialGradient id="quad-joy" cx="75%" cy="25%" r="60%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="quad-calm" cx="75%" cy="75%" r="60%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="quad-stress" cx="25%" cy="25%" r="60%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="quad-sad" cx="25%" cy="75%" r="60%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Quadrant Background Shading */}
          <rect x={center} y={0} width={center} height={center} fill="url(#quad-joy)" />
          <rect x={center} y={center} width={center} height={center} fill="url(#quad-calm)" />
          <rect x={0} y={0} width={center} height={center} fill="url(#quad-stress)" />
          <rect x={0} y={center} width={center} height={center} fill="url(#quad-sad)" />

          {/* Concentric Circumplex Circles */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="hsla(232, 20%, 30%, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r={radius * 0.66} fill="none" stroke="hsla(232, 20%, 30%, 0.3)" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius * 0.33} fill="none" stroke="hsla(232, 20%, 30%, 0.25)" strokeWidth="1" />

          {/* Crosshair Axes */}
          <line x1={center - radius - 8} y1={center} x2={center + radius + 8} y2={center} stroke="hsla(230, 20%, 45%, 0.6)" strokeWidth="1.2" />
          <line x1={center} y1={center - radius - 8} x2={center} y2={center + radius + 8} stroke="hsla(230, 20%, 45%, 0.6)" strokeWidth="1.2" />

          {/* Axis Labels */}
          <text x={center + radius - 4} y={center - 6} fill="hsl(230, 20%, 75%)" fontSize="9" fontWeight="600" textAnchor="end">+ Valence</text>
          <text x={center - radius + 4} y={center - 6} fill="hsl(230, 20%, 75%)" fontSize="9" fontWeight="600" textAnchor="start">- Valence</text>
          <text x={center + 6} y={center - radius + 12} fill="hsl(230, 20%, 75%)" fontSize="9" fontWeight="600">+ Arousal</text>
          <text x={center + 6} y={center + radius - 4} fill="hsl(230, 20%, 75%)" fontSize="9" fontWeight="600">- Arousal</text>

          {/* Dynamic Affect Tracking Pulse Dot */}
          <circle
            cx={posX}
            cy={posY}
            r="14"
            fill={quadrantColor}
            opacity="0.25"
            style={{ filter: 'blur(3px)', transition: 'all 0.5s ease-out' }}
          />
          <circle
            cx={posX}
            cy={posY}
            r="6.5"
            fill={quadrantColor}
            stroke="#ffffff"
            strokeWidth="2"
            style={{
              filter: `drop-shadow(0 0 6px ${quadrantColor})`,
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>

        {/* Live Coordinate Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            borderRadius: 8,
            background: 'hsla(232, 35%, 10%, 0.85)',
            border: '1px solid hsla(232, 25%, 25%, 0.8)',
            fontSize: 10,
            backdropFilter: 'blur(8px)'
          }}
        >
          <span style={{ color: quadrantColor, fontWeight: 700 }}>{quadrantLabel}</span>
          <span style={{ color: 'hsl(230, 20%, 75%)', fontFamily: 'monospace' }}>
            V: {valence >= 0 ? `+${valence.toFixed(2)}` : valence.toFixed(2)} | A: {arousal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
