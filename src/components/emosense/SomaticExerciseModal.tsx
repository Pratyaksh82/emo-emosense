import React, { useState, useEffect, useRef } from 'react';
import { Wind, Eye, Hand, Volume2, Sparkles, CheckCircle2, RefreshCw, X, Heart } from 'lucide-react';
import { AutonomicBreathingEntrainmentSynthesizer } from '../../lib/emosenseAudioEngine';

interface SomaticExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const SomaticExerciseModal: React.FC<SomaticExerciseModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState<'grounding' | 'box_breathing' | '478_breathing'>('grounding');

  // Grounding Step Checks
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Box Breathing State
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [cycleCount, setCycleCount] = useState(1);

  // 4-7-8 Parasympathetic Entrainment State (Item 2.4)
  const [phase478, setPhase478] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [seconds478, setSeconds478] = useState(4);
  const [cycles478, setCycles478] = useState(1);
  const synth478Ref = useRef<AutonomicBreathingEntrainmentSynthesizer | null>(null);

  // Box breathing timer
  useEffect(() => {
    if (!isOpen || activeTab !== 'box_breathing') return;
    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases
        setBreathPhase((currentPhase) => {
          if (currentPhase === 'Inhale') return 'Hold';
          if (currentPhase === 'Hold') return 'Exhale';
          if (currentPhase === 'Exhale') return 'Pause';
          setCycleCount((c) => c + 1);
          return 'Inhale';
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  // 4-7-8 Parasympathetic Entrainment Loop with 432Hz -> 528Hz Binaural Audio
  useEffect(() => {
    if (!isOpen || activeTab !== '478_breathing') {
      synth478Ref.current?.stop();
      synth478Ref.current = null;
      return;
    }

    if (!synth478Ref.current) {
      synth478Ref.current = new AutonomicBreathingEntrainmentSynthesizer();
      synth478Ref.current.start();
    }

    const interval = setInterval(() => {
      setSeconds478((prev) => {
        if (prev > 1) {
          // Update audio frequency pitch glide
          const totalSec = phase478 === 'Inhale' ? 4 : phase478 === 'Hold' ? 7 : 8;
          const prog = 1.0 - (prev - 1) / totalSec;
          synth478Ref.current?.updateCadence(
            phase478 === 'Inhale' ? 'inhale' : phase478 === 'Hold' ? 'hold' : 'exhale',
            prog
          );
          return prev - 1;
        }

        // Transition 4-7-8 phases
        if (phase478 === 'Inhale') {
          setPhase478('Hold');
          return 7;
        } else if (phase478 === 'Hold') {
          setPhase478('Exhale');
          return 8;
        } else {
          setPhase478('Inhale');
          setCycles478((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      synth478Ref.current?.stop();
      synth478Ref.current = null;
    };
  }, [isOpen, activeTab, phase478]);

  if (!isOpen) return null;

  const groundingSteps = [
    { num: 5, sense: 'SEE', icon: '👁️', color: 'hsl(200, 90%, 65%)', prompt: 'Look around and acknowledge 5 distinct physical objects in your immediate room.' },
    { num: 4, sense: 'TOUCH', icon: '✋', color: 'hsl(252, 83%, 70%)', prompt: 'Feel 4 physical textures (your clothing fabric, desk surface, soles of feet on floor).' },
    { num: 3, sense: 'HEAR', icon: '👂', color: '#34d399', prompt: 'Listen attentively for 3 ambient sounds (distant hum, Chetana breathing, room tone).' },
    { num: 2, sense: 'SMELL', icon: '👃', color: '#fbbf24', prompt: 'Gently breathe in through your nose and detect 2 subtle scents around you.' },
    { num: 1, sense: 'TASTE', icon: '👅', color: '#f43f5e', prompt: 'Notice 1 lingering taste in your mouth, or take a sip of room-temperature water.' }
  ];

  const allGroundingComplete = groundingSteps.every((s) => checkedSteps[s.num]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 7, 15, 0.88)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'hsl(232, 32%, 11%)',
          borderRadius: 24,
          border: '1px solid hsla(252, 83%, 70%, 0.4)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'linear-gradient(135deg, hsl(252, 83%, 70%), hsl(200, 90%, 65%))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Wind size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>Somatic Nervous System Reset</h2>
              <p style={{ fontSize: 12, color: 'hsl(230, 15%, 70%)', margin: 0 }}>Parasympathetic autonomic grounding</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}
          >
            &times;
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'hsla(232, 28%, 15%, 0.9)', padding: 4, borderRadius: 12, gap: 4 }}>
          <button
            onClick={() => setActiveTab('grounding')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 8,
              background: activeTab === 'grounding' ? 'hsl(252, 83%, 70%)' : 'transparent',
              color: activeTab === 'grounding' ? '#ffffff' : 'hsl(230, 15%, 70%)',
              border: 'none',
              fontWeight: 600,
              fontSize: 11.5,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            5-4-3-2-1 Sensory
          </button>
          <button
            onClick={() => setActiveTab('box_breathing')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 8,
              background: activeTab === 'box_breathing' ? 'hsl(252, 83%, 70%)' : 'transparent',
              color: activeTab === 'box_breathing' ? '#ffffff' : 'hsl(230, 15%, 70%)',
              border: 'none',
              fontWeight: 600,
              fontSize: 11.5,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Box (4-4-4-4)
          </button>
          <button
            onClick={() => setActiveTab('478_breathing')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 8,
              background: activeTab === '478_breathing' ? 'linear-gradient(135deg, hsl(252, 83%, 70%), hsl(200, 90%, 65%))' : 'transparent',
              color: activeTab === '478_breathing' ? '#ffffff' : 'hsl(230, 15%, 70%)',
              border: 'none',
              fontWeight: 600,
              fontSize: 11.5,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            4-7-8 Parasympathetic
          </button>
        </div>

        {/* Tab 1: 5-4-3-2-1 Sensory Grounding */}
        {activeTab === 'grounding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groundingSteps.map((step) => {
              const isChecked = !!checkedSteps[step.num];
              return (
                <div
                  key={step.num}
                  onClick={() => setCheckedSteps((prev) => ({ ...prev, [step.num]: !prev[step.num] }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: isChecked ? 'hsla(160, 84%, 39%, 0.15)' : 'hsla(232, 28%, 16%, 0.7)',
                    border: `1px solid ${isChecked ? '#10b981' : 'hsla(232, 25%, 22%, 0.8)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isChecked ? '#10b981' : 'hsla(230, 20%, 25%, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#ffffff'
                    }}
                  >
                    {isChecked ? <CheckCircle2 size={16} /> : step.num}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: step.color, marginBottom: 2 }}>
                      {step.sense}
                    </div>
                    <div style={{ fontSize: 11.5, color: isChecked ? '#ffffff' : 'hsl(230, 15%, 75%)', lineHeight: 1.4 }}>
                      {step.prompt}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: allGroundingComplete
                  ? 'linear-gradient(135deg, hsl(252, 83%, 70%), hsl(200, 90%, 65%))'
                  : 'hsla(232, 28%, 18%, 0.8)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                marginTop: 6
              }}
            >
              {allGroundingComplete ? '✨ Complete Somatic Grounding with Chetana' : 'Complete Grounding Session'}
            </button>
          </div>
        )}

        {/* Tab 2: Box Breathing */}
        {activeTab === 'box_breathing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 16 }}>
            {/* Animated Breathing Circle */}
            <div
              style={{
                position: 'relative',
                width: 170,
                height: 170,
                borderRadius: '50%',
                background: 'radial-gradient(circle, hsla(252, 83%, 70%, 0.25) 0%, hsla(200, 90%, 65%, 0.05) 70%)',
                border: '2px solid hsl(252, 83%, 70%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px hsla(252, 83%, 70%, 0.35)',
                transform: breathPhase === 'Inhale' || breathPhase === 'Hold' ? 'scale(1.15)' : 'scale(0.88)',
                transition: 'transform 3.8s ease-in-out'
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>{breathPhase}</span>
              <span style={{ fontSize: 32, fontWeight: 800, color: 'hsl(200, 90%, 65%)', fontFamily: 'monospace' }}>
                {breathSeconds}
              </span>
              <span style={{ fontSize: 10, color: 'hsl(230, 15%, 70%)' }}>Seconds</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: 'hsl(230, 15%, 75%)' }}>
                Completed <strong>Cycle {cycleCount}</strong> of 4 · Stimulating vagal tone
              </span>
            </div>

            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, hsl(252, 83%, 70%), hsl(200, 90%, 65%))',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Return to Chetana with Grounded Mind
            </button>
          </div>
        )}

        {/* Tab 3: 4-7-8 Parasympathetic Entrainment */}
        {activeTab === '478_breathing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 16 }}>
            {/* Animated 4-7-8 Breathing Sphere with Solfeggio Ring */}
            <div
              style={{
                position: 'relative',
                width: 170,
                height: 170,
                borderRadius: '50%',
                background: phase478 === 'Inhale'
                  ? 'radial-gradient(circle, hsla(200, 90%, 65%, 0.35) 0%, hsla(200, 90%, 65%, 0.05) 75%)'
                  : phase478 === 'Hold'
                  ? 'radial-gradient(circle, hsla(252, 83%, 70%, 0.35) 0%, hsla(252, 83%, 70%, 0.05) 75%)'
                  : 'radial-gradient(circle, hsla(160, 84%, 45%, 0.35) 0%, hsla(160, 84%, 45%, 0.05) 75%)',
                border: `2px solid ${
                  phase478 === 'Inhale' ? 'hsl(200, 90%, 65%)' : phase478 === 'Hold' ? 'hsl(252, 83%, 70%)' : '#10b981'
                }`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 45px ${
                  phase478 === 'Inhale'
                    ? 'hsla(200, 90%, 65%, 0.4)'
                    : phase478 === 'Hold'
                    ? 'hsla(252, 83%, 70%, 0.4)'
                    : 'hsla(160, 84%, 45%, 0.4)'
                }`,
                transform: phase478 === 'Inhale' ? 'scale(1.22)' : phase478 === 'Hold' ? 'scale(1.20)' : 'scale(0.85)',
                transition: phase478 === 'Inhale' ? 'transform 3.8s cubic-bezier(0.4, 0, 0.2, 1)' : phase478 === 'Exhale' ? 'transform 7.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 1s ease'
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>{phase478}</span>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: phase478 === 'Inhale' ? 'hsl(200, 90%, 65%)' : phase478 === 'Hold' ? 'hsl(252, 83%, 70%)' : '#34d399',
                  fontFamily: 'monospace'
                }}
              >
                {seconds478}
              </span>
              <span style={{ fontSize: 10, color: 'hsl(230, 15%, 70%)' }}>
                {phase478 === 'Inhale' ? '4s Deep Inhale' : phase478 === 'Hold' ? '7s Diaphragmatic Hold' : '8s Slow Exhale'}
              </span>
            </div>

            {/* Solfeggio Audio Entrainment Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'hsla(232, 28%, 18%, 0.8)',
                border: '1px solid hsla(252, 83%, 70%, 0.25)',
                fontSize: 11.5,
                color: 'hsl(230, 15%, 80%)'
              }}
            >
              <Volume2 size={13} color="hsl(200, 90%, 65%)" />
              <span>
                <strong>Solfeggio Binaural Active</strong>: {phase478 === 'Inhale' ? '432 Hz' : phase478 === 'Hold' ? '480 Hz' : '528 Hz'} carrier · 6 Hz Theta
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: 'hsl(230, 15%, 75%)' }}>
                Cycle <strong>{cycles478}</strong> · Deep parasympathetic vagus activation
              </span>
            </div>

            <button
              onClick={() => {
                synth478Ref.current?.stop();
                synth478Ref.current = null;
                onComplete();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, hsl(252, 83%, 70%), hsl(200, 90%, 65%))',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Complete 4-7-8 Somatic Entrainment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
