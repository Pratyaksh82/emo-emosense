import React from 'react';
import { ShieldAlert, PhoneCall, HeartPulse, ShieldCheck, AlertCircle } from 'lucide-react';

interface CareBridgeCardProps {
  stressLevel: number;
  onTriggerSOS: () => void;
}

export const CareBridgeCard: React.FC<CareBridgeCardProps> = ({
  stressLevel,
  onTriggerSOS
}) => {
  let careLevel = 1;
  let levelTitle = 'Level 1: Everyday Empathic Support';
  let levelDesc = 'Mindful conversation & parasympathetic self-regulation active.';
  let badgeColor = '#10b981';

  if (stressLevel >= 75) {
    careLevel = 4;
    levelTitle = 'Level 4: Urgent Human Support Required';
    levelDesc = 'Immediate crisis hotlines and human safety intervention protocol active.';
    badgeColor = '#f43f5e';
  } else if (stressLevel >= 55) {
    careLevel = 3;
    levelTitle = 'Level 3: Clinical Safety Check';
    levelDesc = 'Elevated distress detected. Chetana is verifying safety and ground support.';
    badgeColor = '#fbbf24';
  } else if (stressLevel >= 35) {
    careLevel = 2;
    levelTitle = 'Level 2: Mild Affect Concern';
    levelDesc = 'Situational stress identified; soundscape therapy & breathing recommended.';
    badgeColor = 'hsl(200, 90%, 65%)';
  }

  return (
    <div
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 14,
        background: 'hsla(232, 32%, 11%, 0.85)',
        border: `1px solid ${careLevel >= 3 ? 'rgba(244, 63, 94, 0.4)' : 'hsla(232, 25%, 22%, 0.8)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: careLevel >= 3 ? 'rgba(244, 63, 94, 0.18)' : 'hsla(252, 83%, 70%, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {careLevel >= 3 ? <ShieldAlert size={17} style={{ color: '#f43f5e' }} /> : <HeartPulse size={17} style={{ color: badgeColor }} />}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>{levelTitle}</span>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4,
                background: `${badgeColor}22`,
                color: badgeColor,
                border: `1px solid ${badgeColor}44`
              }}
            >
              STAGE {careLevel}/4
            </span>
          </div>
          <p style={{ fontSize: 10.5, color: 'hsl(230, 15%, 70%)', margin: 0, lineHeight: 1.3 }}>
            {levelDesc}
          </p>
        </div>
      </div>

      {careLevel >= 3 && (
        <button
          onClick={onTriggerSOS}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            background: '#f43f5e',
            border: 'none',
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <PhoneCall size={12} />
          <span>Call 988 / 14416</span>
        </button>
      )}
    </div>
  );
};
