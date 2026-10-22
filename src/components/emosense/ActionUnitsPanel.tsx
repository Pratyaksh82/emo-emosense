import React from 'react';
import { ActionUnit } from '../../lib/emosenseTypes';

interface ActionUnitsPanelProps {
  actionUnits: ActionUnit[];
  isTracking: boolean;
}

export const ActionUnitsPanel: React.FC<ActionUnitsPanelProps> = ({
  actionUnits,
  isTracking
}) => {
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
        gap: 8
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Facial Action Units (FACS)</span>
        <span style={{ fontSize: 10, color: isTracking ? '#10b981' : 'hsl(230, 15%, 55%)', fontWeight: 700 }}>
          {isTracking ? 'TRACKING LIVE' : 'AWAITING CAM'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {actionUnits.map((u) => (
          <div
            key={u.au}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px',
              borderRadius: 8,
              background: u.active ? 'hsla(252, 83%, 70%, 0.12)' : 'transparent',
              border: `1px solid ${u.active ? 'hsla(252, 83%, 70%, 0.35)' : 'transparent'}`,
              transition: 'all 0.3s'
            }}
          >
            {/* Active Glow Dot */}
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: u.active ? 'hsl(252, 83%, 70%)' : 'hsl(230, 20%, 30%)',
                boxShadow: u.active ? '0 0 6px hsl(252, 83%, 70%)' : 'none'
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5 }}>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>
                  <span style={{ color: 'hsl(200, 90%, 65%)', marginRight: 4, fontFamily: 'monospace' }}>{u.au}</span>
                  {u.name}
                </span>
                <span style={{ color: 'hsl(230, 15%, 70%)', fontFamily: 'monospace', fontWeight: 600 }}>
                  {Math.round(u.intensity * 100)}%
                </span>
              </div>

              {/* Intensity Bar */}
              <div
                style={{
                  width: '100%',
                  height: 3.5,
                  borderRadius: 2,
                  background: 'hsla(230, 20%, 20%, 0.6)',
                  overflow: 'hidden',
                  marginTop: 3
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(u.intensity * 100)}%`,
                    background: u.active
                      ? 'linear-gradient(90deg, hsl(252, 83%, 70%), hsl(200, 90%, 65%))'
                      : 'hsl(230, 20%, 35%)',
                    transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
