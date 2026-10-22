import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

export interface TrajectoryPoint {
  turn: number;
  time: string;
  valence: number; // -1.0 to +1.0
  arousal: number;
  emotion: string;
  role: 'user' | 'assistant';
  snippet?: string;
}

interface MoodTrajectoryChartProps {
  points: TrajectoryPoint[];
}

export const MoodTrajectoryChart: React.FC<MoodTrajectoryChartProps> = ({ points }) => {
  const [hoveredPoint, setHoveredPoint] = useState<TrajectoryPoint | null>(null);

  const width = 280;
  const height = 110;
  const padX = 14;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const zeroY = padY + chartH / 2;

  const validPoints: TrajectoryPoint[] = points.length > 0 ? points : [
    { turn: 1, time: 'Now', valence: 0.1, arousal: 0.3, emotion: 'neutral', role: 'assistant', snippet: 'Baseline session' }
  ];

  // Map points to SVG coordinates
  const coords = validPoints.map((p, idx) => {
    const x = validPoints.length === 1
      ? width / 2
      : padX + (idx / (validPoints.length - 1)) * chartW;
    // valence: -1 to +1 -> y: padY + chartH to padY
    const y = zeroY - (p.valence * (chartH / 2));
    return { ...p, x, y };
  });

  // Calculate SVG Path
  const linePath = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  const areaPath = coords.length > 0
    ? `${linePath} L ${coords[coords.length - 1].x} ${zeroY} L ${coords[0].x} ${zeroY} Z`
    : '';

  // Trajectory Delta
  const firstVal = validPoints[0].valence;
  const lastVal = validPoints[validPoints.length - 1].valence;
  const delta = +(lastVal - firstVal).toFixed(2);
  const isLifting = delta >= 0;

  return (
    <div
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 16,
        background: 'hsla(232, 32%, 11%, 0.85)',
        border: '1px solid hsla(232, 25%, 22%, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}
    >
      {/* Header with Delta Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={14} style={{ color: 'hsl(252, 83%, 70%)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Affective Trajectory</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 6,
            background: isLifting ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${isLifting ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
            fontSize: 10.5,
            fontWeight: 700,
            color: isLifting ? '#34d399' : '#fb7185'
          }}
        >
          {isLifting ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span>{delta >= 0 ? `+${delta}` : delta} {isLifting ? 'Mood Lifting' : 'Stress Drift'}</span>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div style={{ position: 'relative', width: '100%', height: height }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(252, 83%, 70%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(200, 90%, 65%)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Zero Baseline */}
          <line
            x1={padX}
            y1={zeroY}
            x2={width - padX}
            y2={zeroY}
            stroke="hsla(230, 20%, 35%, 0.45)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Area Fill */}
          <path d={areaPath} fill="url(#area-grad)" />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke="hsl(252, 83%, 70%)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {coords.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.turn === pt.turn ? 5 : 3.5}
              fill={pt.valence >= 0 ? '#10b981' : '#f43f5e'}
              stroke="#ffffff"
              strokeWidth="1.5"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: '6px 10px',
              borderRadius: 8,
              background: 'hsla(232, 35%, 8%, 0.95)',
              border: '1px solid hsla(252, 83%, 70%, 0.5)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
              fontSize: 10,
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#ffffff' }}>
              <span style={{ textTransform: 'uppercase', color: 'hsl(252, 83%, 75%)' }}>{hoveredPoint.emotion}</span>
              <span style={{ fontFamily: 'monospace', color: hoveredPoint.valence >= 0 ? '#10b981' : '#f43f5e' }}>
                ({hoveredPoint.valence >= 0 ? `+${hoveredPoint.valence.toFixed(2)}` : hoveredPoint.valence.toFixed(2)})
              </span>
            </div>
            <div style={{ color: 'hsl(230, 15%, 65%)', fontSize: 9.5 }}>{hoveredPoint.time}</div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9.5, color: 'hsl(230, 15%, 60%)' }}>
        <span>Start (Baseline)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShieldCheck size={11} style={{ color: '#10b981' }} />
          <span>Real-Time Biometric Trajectory</span>
        </span>
        <span>Latest Turn</span>
      </div>
    </div>
  );
};
