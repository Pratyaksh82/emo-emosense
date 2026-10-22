import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Heart,
  Activity,
  Mic,
  MicOff,
  Layers,
  ArrowLeft,
  Volume2,
  VolumeX,
  Radio,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { AvatarEmotion, AvatarGesture } from '../lib/avatarTypes';
import { analyzeUserEmotion, EmotionAnalysisResult } from '../lib/emotionAutopilotEngine';
import { SpeechService } from '../lib/speechService';
import { ChetanaChatBanner } from './ChetanaChatBanner';
import './EmoSenseChatExperience.css';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  detectedEmotion?: AvatarEmotion;
  confidence?: number;
}

interface EmoSenseChatExperienceProps {
  onSwitchToStudio?: () => void;
}

export const EmoSenseChatExperience: React.FC<EmoSenseChatExperienceProps> = ({
  onSwitchToStudio
}) => {
  // Speech Service ref
  const speechServiceRef = useRef<SpeechService | null>(null);

  // Autopilot State
  const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>('neutral');
  const [currentGesture, setCurrentGesture] = useState<AvatarGesture>('namaste');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [autopilotInfo, setAutopilotInfo] = useState<EmotionAnalysisResult | null>(null);
  const [isBannerExpanded, setIsBannerExpanded] = useState<boolean>(false);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init-1',
      sender: 'assistant',
      text: "Namaste! I am Chetana, your affective companion in EmoSense. I'm connected to your session and tuned to your emotions. How are you feeling right now?",
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Service
  useEffect(() => {
    speechServiceRef.current = new SpeechService();
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle User Message Submission
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // 1. Append User Message
    const userMsgId = 'msg-' + Date.now();
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);
    setInputText('');

    // 2. Run Autonomous Emotion Analysis
    const analysis = analyzeUserEmotion(text);
    setAutopilotInfo(analysis);
    setCurrentEmotion(analysis.detectedEmotion);
    setCurrentGesture(analysis.recommendedGesture);

    // 3. Automatically ensure Chetana is visible
    setIsBannerExpanded(true);

    // Update user message with detected emotion badge
    setMessages((prev) =>
      prev.map((m) =>
        m.id === userMsgId
          ? { ...m, detectedEmotion: analysis.detectedEmotion, confidence: analysis.confidence }
          : m
      )
    );

    // 4. Chetana Formulates Response & Speaks
    setTimeout(() => {
      const assistantMsg: Message = {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        text: analysis.empathicResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Trigger Speech & Visemes
      if (!isAudioMuted && speechServiceRef.current) {
        setIsSpeaking(true);
        speechServiceRef.current.speak(
          analysis.empathicResponse,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    }, 450);
  };

  // Quick Emotion Simulation Pills
  const quickPrompts = [
    {
      label: '💔 Overwhelmed & Lonely',
      text: "I feel so lonely and overwhelmed today, like nobody really understands."
    },
    {
      label: '⚡ Panic & Racing Heart',
      text: "My heart is racing, I feel a sudden panic attack coming on and can't breathe."
    },
    {
      label: '🎉 Passed Dream Exam',
      text: "Chetana, I finally cleared my hardest board exam today! I am so happy!"
    },
    {
      label: '🌸 Namaste Greeting',
      text: "Namaste Chetana! How is your day going?"
    },
    {
      label: '🧘 Grounding & Calm',
      text: "I'm sitting peacefully now, doing my slow breathing exercise."
    }
  ];

  return (
    <div className="emosense-chat-page">
      {/* ===================================================================
          1. EmoSense Session Top Bar
          =================================================================== */}
      <header className="emosense-chat-header">
        <div className="header-brand-group">
          <div className="brand-gem">E</div>
          <div className="brand-text">
            <h2>
              <span>EmoSense Clinical Telehealth Care</span>
              <span className="session-badge">Session #104 · Encrypted</span>
            </h2>
            <p>Affective AI Co-Regulation · Client Portal View</p>
          </div>
        </div>

        <div className="header-telemetry-cluster">
          <div className="biometric-pill">
            <Activity size={14} style={{ color: '#10b981' }} />
            <span>Heart: <strong>72 BPM</strong></span>
          </div>

          <div className="biometric-pill">
            <Radio size={14} style={{ color: '#38bdf8' }} />
            <span>HRV: <strong>64 ms</strong></span>
          </div>

          <div className="biometric-pill">
            <ShieldCheck size={14} style={{ color: '#34d399' }} />
            <span>Zero-Knowledge Edge</span>
          </div>

          {onSwitchToStudio && (
            <button className="btn-switch-studio" onClick={onSwitchToStudio}>
              <ArrowLeft size={14} />
              <span>Studio Director</span>
            </button>
          )}
        </div>
      </header>

      {/* ===================================================================
          2. Chat Body Container
          =================================================================== */}
      <main className="chat-body-container">
        {/* ===================================================================
            CHETANA INTERACTIVE BANNER IN THE CHATTING PAGE
            Clicking this banner expands Chetana's live avatar stage!
            =================================================================== */}
        <ChetanaChatBanner
          detectedEmotion={currentEmotion}
          detectedGesture={currentGesture}
          isSpeaking={isSpeaking}
          confidence={autopilotInfo?.confidence || 0.88}
          valence={autopilotInfo?.valence || 0.1}
          arousal={autopilotInfo?.arousal || 0.3}
          stressLevel={autopilotInfo?.stressLevel || 22}
          autopilotExplanation={autopilotInfo?.explanation}
          defaultExpanded={isBannerExpanded}
          onToggleExpand={setIsBannerExpanded}
          isAudioMuted={isAudioMuted}
          onToggleAudioMute={() => setIsAudioMuted(!isAudioMuted)}
        />

        {/* Scrollable Messages Stream */}
        <div className="chat-messages-stream">
          {messages.map((m) => (
            <div key={m.id} className={`message-row ${m.sender}`}>
              <div className="msg-avatar">
                <img
                  src={m.sender === 'assistant' ? '/poses/pose_idle.jpg' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={m.sender}
                />
              </div>

              <div className="msg-bubble-wrap">
                <div className="msg-bubble">
                  {m.text}
                </div>

                <div className="msg-meta-row">
                  <span>{m.timestamp}</span>
                  {m.detectedEmotion && (
                    <span className={`detected-affect-tag affect-${m.detectedEmotion}`}>
                      <Heart size={10} style={{ fill: 'currentColor' }} />
                      Detected: {m.detectedEmotion} ({(m.confidence! * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Emotion Simulation Pills */}
        <div className="emotion-prompt-tray">
          <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, paddingRight: 4 }}>
            <Sparkles size={12} style={{ color: '#38bdf8' }} />
            Quick Test:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="prompt-pill-btn"
              onClick={() => handleSendMessage(p.text)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="chat-input-bar">
          <input
            type="text"
            placeholder="Type your feelings or message to Chetana (Hindi or English)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <button
            className="btn-send-message"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </main>
    </div>
  );
};
