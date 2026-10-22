import os

button_path = "C:/Users/praty/Desktop/emo-girl/emosense-source/src/components/voice/VoiceInputButton.tsx"

new_button_code = r'''import React, { useEffect, useState } from "react";
import { Mic, MicOff, Square, Volume2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { AdaptiveVoiceEngine, VoiceEmotionEstimate } from "@/lib/emo-voice";
import { toast } from "sonner";

interface VoiceInputButtonProps {
  onTranscriptChange: (text: string) => void;
  onFinalTranscript?: (text: string, voiceEmotion?: VoiceEmotionEstimate | null) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscriptChange,
  onFinalTranscript,
  disabled = false,
  className,
}) => {
  const [voiceEmotion, setVoiceEmotion] = useState<VoiceEmotionEstimate | null>(null);

  const {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      onTranscriptChange(text);
      if (isFinal) {
        onFinalTranscript?.(text, voiceEmotion);
      }
    },
    onError: (err) => {
      toast.error(err);
    },
  });

  const handleToggle = async () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      stopListening();
      AdaptiveVoiceEngine.getInstance().stopVoiceEmotionAnalysis();
      setVoiceEmotion(null);
    } else {
      resetTranscript();
      startListening();
      try {
        await AdaptiveVoiceEngine.getInstance().startVoiceEmotionAnalysis((estimate) => {
          setVoiceEmotion(estimate);
        });
      } catch (e) {
        console.warn("Vocal emotion telemetry init failed:", e);
      }
      toast.info("Listening... both words and vocal emotion are active.", { duration: 2500 });
    }
  };

  useEffect(() => {
    return () => {
      AdaptiveVoiceEngine.getInstance().stopVoiceEmotionAnalysis();
    };
  }, []);

  const getPillStyle = () => {
    if (!voiceEmotion) return "bg-rose-500/90 border-rose-400/50";
    if (voiceEmotion.primaryEmotion === "crisis" || voiceEmotion.tremorDetected) {
      return "bg-rose-600/95 border-rose-400 text-white animate-pulse shadow-rose-500/40";
    }
    if (voiceEmotion.primaryEmotion === "anxious") {
      return "bg-amber-600/95 border-amber-400 text-white shadow-amber-500/40";
    }
    if (voiceEmotion.primaryEmotion === "happy") {
      return "bg-emerald-600/95 border-emerald-400 text-white shadow-emerald-500/40";
    }
    return "bg-indigo-600/95 border-indigo-400 text-white shadow-indigo-500/40";
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        title={isListening ? "Listening with live emotion detection... click to finish" : "Speak with live Voice Emotion Analysis"}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 relative overflow-hidden",
          isListening
            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-4 ring-rose-500/20 animate-pulse"
            : "bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/40",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        {isListening ? (
          <>
            <span className="absolute inset-0 rounded-full bg-rose-400 opacity-20 animate-ping" />
            <Square className="w-4 h-4 fill-white" />
          </>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Floating Listening Indicator Pill with Real-Time Emotion Telemetry */}
      {isListening && (
        <div
          className={cn(
            "absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xl border whitespace-nowrap animate-float-up pointer-events-none z-30 transition-all duration-300",
            getPillStyle()
          )}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            {voiceEmotion ? (
              voiceEmotion.tremorDetected
                ? "Listening (Vocal Tremor Detected)"
                : voiceEmotion.primaryEmotion === "crisis"
                ? "Listening (Acute Distress Detected)"
                : voiceEmotion.primaryEmotion === "anxious"
                ? "Listening (High Tension Detected)"
                : voiceEmotion.primaryEmotion === "happy"
                ? "Listening (Bright / Cheerful Tone)"
                : voiceEmotion.primaryEmotion === "sad"
                ? "Listening (Subdued / Soft Tone)"
                : "Listening (Calm Baseline)"
            ) : (
              "Listening..."
            )}
          </span>
          <span className="inline-flex items-end gap-0.5 h-2.5 ml-1">
            <span className="w-0.5 h-2 bg-white rounded-full animate-pulse" />
            <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
            <span className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
          </span>
        </div>
      )}
    </div>
  );
};
'''

with open(button_path, "w", encoding="utf-8") as f:
    f.write(new_button_code)
print("Updated VoiceInputButton.tsx with live SER telemetry HUD!")
