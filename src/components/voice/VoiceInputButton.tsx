import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface VoiceInputButtonProps {
  onTranscriptChange: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onBargeIn?: () => void;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscriptChange,
  onFinalTranscript,
  onBargeIn,
  disabled = false
}) => {
  const {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      onTranscriptChange(text);
      if (text.trim().length > 1) {
        onBargeIn?.();
      }
      if (isFinal) {
        onFinalTranscript?.(text);
      }
    }
  });

  const handleToggle = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        title={isListening ? 'Stop listening' : 'Speak to Chetana with voice input'}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: 'none',
          background: isListening
            ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
            : 'hsla(232, 28%, 18%, 0.9)',
          color: isListening ? '#ffffff' : 'hsl(230, 20%, 80%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isListening ? '0 0 16px rgba(244, 63, 94, 0.6)' : 'none',
          transition: 'all 0.25s',
          outline: 'none'
        }}
      >
        {isListening ? (
          <Square size={13} style={{ fill: 'currentColor' }} />
        ) : (
          <Mic size={16} />
        )}
      </button>

      {/* Pulsing ring when microphone is actively capturing voice */}
      {isListening && (
        <span
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px solid #f43f5e',
            animation: 'micPulseRing 1.6s infinite ease-out',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};
