import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Activity,
  Shield,
  Heart,
  Volume2,
  VolumeX,
  Radio,
  Camera,
  CameraOff,
  Waves,
  Wind,
  AlertTriangle,
  FileText,
  Paperclip,
  Share2,
  LogOut,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smile,
  ThumbsUp,
  ThumbsDown,
  Info,
  Download,
  Printer,
  ChevronDown,
  Maximize2,
  Minimize2,
  Eye,
  Sliders,
  FileDown,
  TrendingUp
} from 'lucide-react';
import { AvatarEmotion, AvatarGesture, AtmosphereMode, CameraPreset, TherapistGazeMode } from '../../lib/avatarTypes';
import { analyzeUserEmotion, EmotionAnalysisResult } from '../../lib/emotionAutopilotEngine';
import {
  FaceData,
  DemoScenario,
  DEMO_SCENARIOS,
  ActionUnit
} from '../../lib/emosenseTypes';
import {
  globalSoundscape,
  computeAdaptiveVoiceProfile,
  cleanTextForSpeech,
  SOUNDSCAPE_PRESETS,
  SoundscapePresetId
} from '../../lib/emosenseAudioEngine';
import { ValenceArousalRadar } from './ValenceArousalRadar';
import { MoodTrajectoryChart, TrajectoryPoint } from './MoodTrajectoryChart';
import { ActionUnitsPanel } from './ActionUnitsPanel';
import { EmotionVisionPip } from './EmotionVisionPip';
import { SomaticExerciseModal } from './SomaticExerciseModal';
import { CareBridgeCard } from './CareBridgeCard';
import { VoiceInputButton } from '../voice/VoiceInputButton';
import { sendEmotionChatMessage, requestTTSAudio } from '../../lib/geminiChat';
import { ChetanaMasterAnimeStage } from '../ChetanaMasterAnimeStage';
import { SessionSummaryModal } from './SessionSummaryModal';
import { generateSessionPdfReport, printSessionReportHtml, SessionReportPayload } from '../../lib/sessionReportGenerator';
import { globalTherapistKinematics, TherapistGestureAction } from '../../lib/therapistKinematicsEngine';
import { InstallBanner } from '../pwa/InstallBanner';
import './EmoSenseChetanaPage.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  emotion?: AvatarEmotion;
  confidence?: number;
  time: string;
  feedback?: 'up' | 'down' | null;
}

interface EmoSenseChetanaPageProps {
  onSwitchToStudio?: () => void;
}

export const EmoSenseChetanaPage: React.FC<EmoSenseChetanaPageProps> = ({
  onSwitchToStudio
}) => {
  // Chetana Affective State
  const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>('neutral');
  const [currentGesture, setCurrentGesture] = useState<AvatarGesture>('idle_desk');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autopilotInfo, setAutopilotInfo] = useState<EmotionAnalysisResult | null>(null);

  // 3-Part Antigravity Layout & Stage Settings
  const [isChetanaEngaged, setIsChetanaEngaged] = useState<boolean>(true);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [stageAtmosphere, setStageAtmosphere] = useState<AtmosphereMode>('therapist_office');
  const [stageCamera, setStageCamera] = useState<CameraPreset>('medium');
  const [stageGazeMode, setStageGazeMode] = useState<TherapistGazeMode>('client');
  const [mobileTab, setMobileTab] = useState<'avatar' | 'chat' | 'telemetry'>('avatar');
  const openInstallBannerRef = useRef<(() => void) | null>(null);

  // Speech and Submission Mutexes (Eliminating duplicate voice triggering)
  const speechSeqRef = useRef<number>(0);
  const isSendingRef = useRef<boolean>(false);

  // EmoSense Core Features State
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
  const [isSoundscapePlaying, setIsSoundscapePlaying] = useState<boolean>(false);
  const [activeSoundscapePreset, setActiveSoundscapePreset] = useState<SoundscapePresetId>('drone_432');
  const [isCameraVisionOpen, setIsCameraVisionOpen] = useState<boolean>(false);
  const [isGroundingActive, setIsGroundingActive] = useState<boolean>(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  // Conversation history sessions
  const [conversations] = useState([
    { id: 'conv-1', title: 'Processing overwhelm & anxiety', time: 'Today' },
    { id: 'conv-2', title: 'Grounding after panic episode', time: 'Yesterday' },
    { id: 'conv-3', title: 'Reflecting on career transition', time: '3 days ago' }
  ]);

  // Messages Thread with Pre-Cached Neural Voice for Chetana Greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: "Namaste, I am Chetana. Welcome to EmoSense. This is a gentle, judgment-free space tuned to your heart. How are you feeling right now, really?",
      audioUrl: '/audio_cache/3b76164285e2eec90d13141f8ac935a8.mp3',
      emotion: 'neutral',
      confidence: 0.95,
      time: '1:45 PM'
    }
  ]);

  const scrollerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    scrollerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Trajectory points for the AreaChart
  const trajectoryPoints: TrajectoryPoint[] = useMemo(() => {
    return messages.map((m, idx) => {
      let valence = 0.1;
      let arousal = 0.3;
      if (m.emotion === 'happy') { valence = 0.85; arousal = 0.7; }
      else if (m.emotion === 'calm') { valence = 0.35; arousal = 0.25; }
      else if (m.emotion === 'tense') { valence = -0.65; arousal = 0.88; }
      else if (m.emotion === 'sad') { valence = -0.75; arousal = 0.20; }
      return {
        turn: idx + 1,
        time: m.time,
        valence,
        arousal,
        emotion: m.emotion || 'neutral',
        role: m.role,
        snippet: m.content.slice(0, 48)
      };
    });
  }, [messages]);

  // Dynamic Facial Action Units based on affect
  const actionUnits: ActionUnit[] = useMemo(() => {
    const emo = currentEmotion;
    const stress = autopilotInfo?.stressLevel || 22;
    return [
      { au: 'AU1', name: 'Inner Brow Raiser', active: emo === 'sad' || emo === 'tense', intensity: emo === 'sad' ? 0.85 : emo === 'tense' ? 0.72 : 0.15, clinical: 'Medial frontalis activation (distress / concern)' },
      { au: 'AU2', name: 'Outer Brow Raiser', active: emo === 'tense', intensity: emo === 'tense' ? 0.68 : 0.10, clinical: 'Lateral frontalis (alert / apprehension)' },
      { au: 'AU4', name: 'Brow Lowerer', active: emo === 'tense' || stress > 50, intensity: stress > 60 ? 0.88 : 0.22, clinical: 'Corrugator supercilii (furrowing / acute tension)' },
      { au: 'AU6', name: 'Cheek Raiser', active: emo === 'happy', intensity: emo === 'happy' ? 0.92 : 0.08, clinical: 'Orbicularis oculi (Duchenne genuine positivity)' },
      { au: 'AU12', name: 'Lip Corner Puller', active: emo === 'happy' || emo === 'calm', intensity: emo === 'happy' ? 0.95 : emo === 'calm' ? 0.45 : 0.05, clinical: 'Zygomaticus major (smile expression)' },
      { au: 'AU15', name: 'Lip Corner Depressor', active: emo === 'sad', intensity: emo === 'sad' ? 0.80 : 0.05, clinical: 'Depressor anguli oris (sorrow / heaviness)' },
      { au: 'AU25', name: 'Lips Part', active: isSpeaking || emo === 'tense', intensity: isSpeaking ? 0.75 : 0.15, clinical: 'Depressor labii inferioris (vocalization / gasps)' },
      { au: 'AU26', name: 'Jaw Drop', active: isSpeaking, intensity: isSpeaking ? 0.65 : 0.05, clinical: 'Masseter relaxation (speech viseme modulation)' }
    ];
  }, [currentEmotion, autopilotInfo, isSpeaking]);

  // Synthetic or Live Face Data
  const currentFaceData: FaceData = useMemo(() => {
    return {
      dominantEmotion: currentEmotion,
      emotionScores: {
        happy: currentEmotion === 'happy' ? 0.88 : 0.05,
        sad: currentEmotion === 'sad' ? 0.82 : 0.05,
        angry: 0.02,
        fearful: currentEmotion === 'tense' ? 0.75 : 0.02,
        disgusted: 0.01,
        surprised: 0.02,
        neutral: currentEmotion === 'neutral' ? 0.85 : 0.15
      },
      emotionTrend: currentEmotion === 'happy' ? 'improving_mood' : currentEmotion === 'tense' ? 'unstable_mood' : 'stable',
      behavioralState: currentEmotion === 'tense' ? 'hesitant' : 'engaged',
      confidence: autopilotInfo?.confidence || 0.94,
      valence: autopilotInfo?.valence || 0.10,
      arousal: autopilotInfo?.arousal || 0.30,
      stressLevel: autopilotInfo?.stressLevel || 22,
      timestamp: new Date().toISOString(),
      faceDetected: true,
      eyeOpenness: 0.85
    };
  }, [currentEmotion, autopilotInfo]);

  // Handle Soundscape Toggle
  const toggleSoundscape = (preset?: SoundscapePresetId) => {
    const target = preset || activeSoundscapePreset;
    if (isSoundscapePlaying && (!preset || preset === activeSoundscapePreset)) {
      globalSoundscape.stop();
      setIsSoundscapePlaying(false);
    } else {
      setActiveSoundscapePreset(target);
      globalSoundscape.play(target);
      setIsSoundscapePlaying(true);
    }
  };

  // Pre-load and cache voices immediately
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any ongoing speech (both HTML5 audio and browser speech synthesis)
  const stopAllChetanaSpeech = () => {
    speechSeqRef.current++; // Invalidate any active speech or in-flight TTS calls
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current.src = '';
        activeAudioRef.current.load();
      } catch (e) {}
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeaking(false);
  };

  // Browser Web Speech fallback if neural audio endpoint is offline
  const fallbackWebSpeech = (text: string, emotion: AvatarEmotion, valence: number, stress: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const modulation = computeAdaptiveVoiceProfile(emotion, valence, stress);
    const utterance = new SpeechSynthesisUtterance(cleaned);

    utterance.rate = modulation.rate;
    utterance.pitch = Math.max(1.15, modulation.pitch * 1.12);
    utterance.volume = modulation.volume;

    const isHindiOrIndian =
      /[\u0900-\u097F]/.test(cleaned) ||
      /\b(namaste|kya|hai|hain|kaise|kaisi|kaisa|aap|tum|mera|meri|mere|mujhe|hum|theek|nahi|shukriya|alvida|baat|dil|suno|kaho|man|pyar|accha|achha|bohot|bahut|dhanyawad|pranam|shanti|sukoon|dard|pareshan|madad|chinta|khayal|chetana|ji)\b/i.test(cleaned);

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (isHindiOrIndian) {
      utterance.lang = 'hi-IN';
      // Prioritize authentic Indian Hindi voices (Swara, Kalpana, Heera, Neerja, Shruti, Veena)
      selectedVoice =
        voices.find((v) => (v.lang.startsWith('hi') || v.lang === 'en-IN') && /swara|kalpana|heera|neerja|shruti|veena|india/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('hi')) ||
        voices.find((v) => v.lang === 'en-IN');
    }

    if (!selectedVoice) {
      // Prioritize Indian English companion voices, then general soothing female voices
      selectedVoice =
        voices.find((v) => v.lang === 'en-IN' && !/david|mark|george|male/i.test(v.name)) ||
        voices.find((v) => /heera|swara|kalpana|neerja|shruti|aria|jenny/i.test(v.name)) ||
        voices.find((v) => !/david|mark|george|richard|guy|male|stefan|pavel/i.test(v.name));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      utterance.pitch = 1.25;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utterance.onboundary = () => setIsSpeaking(true);

    window.speechSynthesis.speak(utterance);
  };

  // High-Fidelity Neural Voice Synthesis (Guaranteed Single-Instance Playback)
  const speakWithChetana = async (
    text: string,
    emotion: AvatarEmotion,
    valence: number,
    stress: number,
    audioUrl?: string
  ) => {
    stopAllChetanaSpeech();
    const currentSeq = speechSeqRef.current;

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    // 1. Check if audioUrl is provided, or request on-demand neural synthesis
    let urlToPlay = audioUrl;
    if (!urlToPlay) {
      try {
        urlToPlay = await requestTTSAudio(cleaned);
      } catch (err) {
        console.warn('TTS request failed:', err);
      }
    }

    // Discard if another speech request arrived while fetching
    if (speechSeqRef.current !== currentSeq) return;

    // 2. Play neural audio through HTML5 Audio
    if (urlToPlay) {
      try {
        const audio = new Audio(urlToPlay);
        activeAudioRef.current = audio;

        audio.onplay = () => {
          if (speechSeqRef.current === currentSeq) setIsSpeaking(true);
        };
        audio.onended = () => {
          if (speechSeqRef.current === currentSeq) {
            setIsSpeaking(false);
            activeAudioRef.current = null;
          }
        };

        await audio.play();
        return; // Single instance played: DO NOT fall through to fallback!
      } catch (err) {
        console.warn('Direct audio play failed, invoking fallback speech:', err);
      }
    }

    // 3. Fallback to client-side Web Speech API ONLY if audio URL failed to play
    if (speechSeqRef.current === currentSeq) {
      fallbackWebSpeech(cleaned, emotion, valence, stress);
    }
  };

  // Immediate speech cutoff when voice is muted
  useEffect(() => {
    if (!isVoiceActive) {
      stopAllChetanaSpeech();
    }
  }, [isVoiceActive]);

  // Handle User Message Submission with Real Gemini Multimodal AI
  const handleSendMessage = async (textOverride?: string) => {
    const text = (textOverride || inputText).trim();
    if (!text || isSendingRef.current) return;
    isSendingRef.current = true;
    setIsSending(true);

    const userMsgId = 'msg-' + Date.now();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Optimistic User Message
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      time: nowTime
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // 2. Multimodal Affective Analysis (Immediate local telemetry sync)
    const analysis = analyzeUserEmotion(text);
    setAutopilotInfo(analysis);

    // Update user message with detected affect
    setMessages((prev) =>
      prev.map((m) =>
        m.id === userMsgId
          ? { ...m, emotion: analysis.detectedEmotion, confidence: analysis.confidence }
          : m
      )
    );

    // 3. Automatically sync Chetana's Avatar state & engage stage
    setCurrentEmotion(analysis.detectedEmotion);
    setCurrentGesture(analysis.recommendedGesture);
    setIsChetanaEngaged(true);

    // Auto-initiate soundscape if acute stress is detected
    if (analysis.triggerSoundscape && !isSoundscapePlaying) {
      toggleSoundscape('drone_432');
    }

    let finalReply = '';
    let finalEmotion = analysis.detectedEmotion;
    let finalAudioUrl: string | undefined = undefined;

    try {
      // 4. Call Real EmoSense Multimodal Gemini Chat Engine
      const voiceContext = {
        primaryEmotion: analysis.detectedEmotion,
        stressLevel: (analysis.stressLevel || 20) / 100,
        tremorDetected: analysis.detectedEmotion === 'tense' && analysis.stressLevel > 60,
        flatAffectDetected: analysis.detectedEmotion === 'sad' && analysis.valence < -0.6
      };

      const aiResponse = await sendEmotionChatMessage(
        text,
        messages,
        currentFaceData,
        voiceContext
      );

      finalReply = aiResponse.reply;
      finalEmotion = (aiResponse.emotion as AvatarEmotion) || analysis.detectedEmotion;
      finalAudioUrl = aiResponse.audioUrl;

      // If crisis safety triggered, open panic modal / show Tele-MANAS
      if (aiResponse.safety_triggered || aiResponse.risk_level === 'high') {
        setIsPanicModalOpen(true);
      }
    } catch (err) {
      console.error('Error generating AI response:', err);
      finalReply = analysis.empathicResponse;
      finalEmotion = analysis.detectedEmotion;
    }

    // 5. Append Assistant Response Exactly Once
    const assistantMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: finalReply,
      audioUrl: finalAudioUrl,
      emotion: finalEmotion,
      confidence: analysis.confidence,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, assistantMsg]);

    // 6. Natural Vocalization with High-Fidelity Neural Voice & Visemes (Guaranteed Single Playback)
    if (isVoiceActive && finalReply) {
      try {
        await speakWithChetana(
          finalReply,
          finalEmotion,
          analysis.valence,
          analysis.stressLevel,
          finalAudioUrl
        );
      } catch (voiceErr) {
        console.warn('Voice playback non-fatal error:', voiceErr);
      }
    }

    isSendingRef.current = false;
    setIsSending(false);
  };

  // Quick Diagnostic Prompts
  const quickTestPrompts = [
    { label: '💔 Loneliness & Grief', text: "I feel so lonely today and have been carrying this heavy sadness alone." },
    { label: '⚡ Sudden Anxiety Attack', text: "My heart is racing so fast, I feel panicked and overwhelmed with breathlessness." },
    { label: '🎉 Life Win / Promotion', text: "Chetana! I got the job offer I worked so hard for! I am so excited and happy!" },
    { label: '🧘 Serene Mindfulness', text: "I am feeling peaceful today and would like a quiet grounding practice together." }
  ];

  // Head Motion Trigger for Center Stage
  const triggerTherapistMotion = (action: TherapistGestureAction) => {
    globalTherapistKinematics.triggerGesture(action);
  };

  // PDF Export Payload Generator
  const getSessionPayload = (): SessionReportPayload => {
    return {
      userName: 'Guest Explorer',
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        emotion: m.emotion,
        created_at: new Date().toISOString()
      })),
      currentFaceData: currentFaceData,
      sessionStartTime: new Date(Date.now() - messages.length * 2 * 60 * 1000)
    };
  };

  const handleExportPdf = () => {
    try {
      const payload = getSessionPayload();
      const { doc, filename } = generateSessionPdfReport(payload);
      doc.save(filename);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const handlePrintReport = () => {
    try {
      const payload = getSessionPayload();
      printSessionReportHtml(payload);
    } catch (err) {
      console.error('Print preview failed:', err);
    }
  };

  return (
    <div className="emosense-app-root">
      {/* ===================================================================
          TOP GLOBAL NAVIGATION & TELEHEALTH NAVBAR
          =================================================================== */}
      <header className="emosense-top-navbar">
        <div className="nav-left-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-badge-icon" style={{ width: 32, height: 32 }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>EmoSense AI</span>
                <span className="dot-online" />
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'hsla(252, 83%, 70%, 0.15)', color: 'hsl(252, 83%, 75%)', border: '1px solid hsla(252, 83%, 70%, 0.3)' }}>
                  Encrypted Session #104
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="nav-telemetry-badge">
              <Activity size={12} style={{ color: '#10b981' }} />
              <span>Heart: <strong>72 BPM</strong></span>
            </div>
            <div className="nav-telemetry-badge">
              <Radio size={12} style={{ color: 'hsl(200, 90%, 65%)' }} />
              <span>HRV: <strong>64 ms</strong></span>
            </div>
          </div>
        </div>

        <div className="top-navbar-actions">
          {/* Permanent PWA Install App Button */}
          <button
            onClick={() => openInstallBannerRef.current?.()}
            className="btn-install-pwa"
            title="Install EmoSense Progressive Web App"
          >
            <Download size={13} />
            <span className="hide-on-mobile-xs">Install App</span>
          </button>

          {/* Quick PDF Report Download */}
          <button
            onClick={handleExportPdf}
            className="btn-export-pdf"
            title="Download complete clinical session report in PDF format"
          >
            <FileDown size={13} />
            <span className="hide-on-mobile-sm">Export PDF</span>
          </button>

          {/* Session Summary Modal */}
          <button
            onClick={() => setIsSummaryModalOpen(true)}
            className="btn-summary-modal"
            title="View comprehensive clinical session insights"
          >
            <FileText size={13} />
            <span className="hide-on-mobile-sm">Session Report</span>
          </button>

          {/* Engage / Center Stage Toggle */}
          <button
            onClick={() => setIsChetanaEngaged(!isChetanaEngaged)}
            className="btn-engage-stage"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 10,
              background: isChetanaEngaged ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'hsla(232, 28%, 18%, 0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isChetanaEngaged ? 'Hide Chetana Stage' : 'Engage Chetana Center Stage'}
          >
            <Sparkles size={13} />
            <span>{isChetanaEngaged ? 'Chetana Engaged' : 'Engage Chetana'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Segmented View Switcher (Visible on mobile/tablet screens <= 900px) */}
      <nav className="emosense-mobile-nav-bar" role="tablist" aria-label="Mobile Workspace Navigation">
        <button
          className={`mobile-nav-tab ${mobileTab === 'avatar' ? 'active' : ''}`}
          onClick={() => setMobileTab('avatar')}
          role="tab"
          aria-selected={mobileTab === 'avatar'}
        >
          <Sparkles size={14} />
          <span>Chetana Stage</span>
        </button>
        <button
          className={`mobile-nav-tab ${mobileTab === 'chat' ? 'active' : ''}`}
          onClick={() => setMobileTab('chat')}
          role="tab"
          aria-selected={mobileTab === 'chat'}
        >
          <MessageSquare size={14} />
          <span>Dialogue Hub</span>
        </button>
        <button
          className={`mobile-nav-tab ${mobileTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setMobileTab('telemetry')}
          role="tab"
          aria-selected={mobileTab === 'telemetry'}
        >
          <Activity size={14} />
          <span>Graphs & FACS</span>
        </button>
      </nav>

      {/* ===================================================================
          ANTIGRAVITY 3-PART MODULAR WORKSPACE
          Part 1: Left Telemetry & Reports (320px)
          Part 2: Middle Chetana Master Stage (Flex 1, Center Stage)
          Part 3: Right Conversational Chat & Voice (410px)
          =================================================================== */}
      <div className="emosense-3part-workspace" data-mobile-active={mobileTab}>
        {/* =================================================================
            PART 1: LEFT TELEMETRY, GRAPHS & CLINICAL INTELLIGENCE
            ================================================================= */}
        <aside className="emosense-left-panel">
          {/* Quick PDF & Print Report Group */}
          <div className="panel-export-group">
            <button
              className="btn-export-pdf"
              onClick={handleExportPdf}
              title="Download official PDF report"
            >
              <FileDown size={13} />
              <span>Export PDF Report</span>
            </button>
            <button
              className="btn-summary-modal"
              onClick={handlePrintReport}
              title="Open Printable Summary"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>

          {/* 1. Affective Trajectory Progression Graph */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="panel-section-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={13} style={{ color: '#10b981' }} />
                <span>Affective Trajectory</span>
              </span>
              <span style={{ fontSize: 10, color: '#38bdf8' }}>{trajectoryPoints.length} Turns</span>
            </div>
            <MoodTrajectoryChart points={trajectoryPoints} />
          </div>

          {/* 2. 2D Valence-Arousal Circumplex Radar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="panel-section-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={13} style={{ color: 'hsl(200, 90%, 65%)' }} />
                <span>2D Valence-Arousal Circumplex</span>
              </span>
              <span style={{ fontSize: 10, color: '#10b981' }}>Live Polar</span>
            </div>
            <ValenceArousalRadar
              valence={autopilotInfo?.valence || 0.10}
              arousal={autopilotInfo?.arousal || 0.30}
              dominantEmotion={currentEmotion}
              stressLevel={autopilotInfo?.stressLevel || 22}
            />
          </div>

          {/* 3. Facial Action Units (FACS) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <ActionUnitsPanel actionUnits={actionUnits} isTracking={isCameraVisionOpen} />
          </div>

          {/* 4. Clinical Safety Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="panel-section-title">
              <ShieldCheck size={13} style={{ color: '#10b981' }} />
              <span>Clinical Interventions & Tools</span>
            </span>
            <div className="sidebar-tools-grid">
              <button
                className="sidebar-btn-tool btn-panic-sos"
                onClick={() => setIsPanicModalOpen(true)}
              >
                <AlertTriangle size={13} />
                <span>Panic SOS (14416)</span>
              </button>

              <button
                className="sidebar-btn-tool"
                onClick={() => setIsGroundingActive(true)}
              >
                <Wind size={13} style={{ color: 'hsl(200, 90%, 65%)' }} />
                <span>5-4-3-2-1 Grounding</span>
              </button>

              <button
                className="sidebar-btn-tool"
                onClick={() => setIsCameraVisionOpen(true)}
              >
                <Camera size={13} style={{ color: '#10b981' }} />
                <span>Emotion Vision Cam</span>
              </button>

              <button
                className="sidebar-btn-tool"
                onClick={() => setIsSummaryModalOpen(true)}
              >
                <FileText size={13} style={{ color: '#38bdf8' }} />
                <span>Clinical Notes</span>
              </button>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="conversation-list" style={{ marginTop: 'auto' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'hsl(230, 15%, 55%)', letterSpacing: 0.5, padding: '4px 6px' }}>
              Recent Sessions
            </span>
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`chat-item-pill ${activeConversationId === c.id ? 'active' : ''}`}
                onClick={() => setActiveConversationId(c.id)}
              >
                <MessageSquare size={13} style={{ opacity: 0.7 }} />
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* =================================================================
            PART 2: MIDDLE CENTER STAGE (CHETANA LIVING 60 FPS AVATAR)
            ================================================================= */}
        <main className="emosense-center-stage">
          {isChetanaEngaged ? (
            <>
              {/* Stage Top Bar: Atmosphere & Camera Selects */}
              <div className="stage-header-bar">
                <div className="stage-avatar-title">
                  <div className="banner-avatar-thumb" style={{ width: 28, height: 28 }}>
                    <img src="/poses/pose_idle.jpg" alt="Chetana Icon" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="name" style={{ whiteSpace: 'nowrap' }}>Chetana Sharma</span>
                    <span className="dot-online" />
                    <span className="sub" style={{ whiteSpace: 'nowrap' }}>
                      Attuned: <strong style={{ color: '#38bdf8' }}>{currentEmotion}</strong> • 60 FPS
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Atmosphere Dropdown */}
                  <select
                    value={stageAtmosphere}
                    onChange={(e) => setStageAtmosphere(e.target.value as AtmosphereMode)}
                    className="stage-select-pill"
                    title="Change Stage Atmosphere"
                  >
                    <option value="therapist_office">Executive Suite</option>
                    <option value="wisteria">Wisteria Night</option>
                    <option value="solar">Nichirin Solar</option>
                    <option value="rainy">Kyoto Rain</option>
                    <option value="studio">Modern Studio</option>
                  </select>

                  {/* Camera Dropdown */}
                  <select
                    value={stageCamera}
                    onChange={(e) => setStageCamera(e.target.value as CameraPreset)}
                    className="stage-select-pill"
                    title="Change Camera Framing"
                  >
                    <option value="medium">Medium View</option>
                    <option value="wide">Wide View</option>
                    <option value="closeup">Close-Up</option>
                    <option value="desk">Desk Focus</option>
                  </select>

                  <button
                    onClick={() => setIsChetanaEngaged(false)}
                    className="btn-acting-chip"
                    title="Minimize Chetana Stage"
                  >
                    <Minimize2 size={12} />
                  </button>
                </div>
              </div>

              {/* Master 60 FPS Center Viewport (Zero Top-Clipping, Solid Skull) */}
              <div className="stage-viewport-box">
                <ChetanaMasterAnimeStage
                  emotion={currentEmotion}
                  gesture={currentGesture}
                  isSpeaking={isSpeaking}
                  enableGazeTracking={true}
                  motionIntensity={1.0}
                  webcamMetrics={null}
                  atmosphere={stageAtmosphere}
                  onAtmosphereChange={setStageAtmosphere}
                  cameraPreset={stageCamera}
                  onCameraPresetChange={setStageCamera}
                  gazeMode={stageGazeMode}
                  onGazeModeChange={setStageGazeMode}
                  enableDof={true}
                  scale={0.96}
                  hideOverlays={true}
                />
              </div>

              {/* Stage Bottom Acting Bar */}
              <div className="stage-bottom-bar">
                <div className="acting-chips-row">
                  <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginRight: 4 }}>Acting:</span>
                  <button
                    className="btn-acting-chip"
                    onClick={() => triggerTherapistMotion('agree_nod')}
                    title="Japanese double affirmation nod"
                  >
                    ✨ Double Nod
                  </button>
                  <button
                    className="btn-acting-chip"
                    onClick={() => triggerTherapistMotion('deep_empathy_nod')}
                    title="Slow compassionate dip"
                  >
                    💖 Empathy Dip
                  </button>
                  <button
                    className="btn-acting-chip"
                    onClick={() => triggerTherapistMotion('notes_glance')}
                    title="Glance down at desk notes"
                  >
                    📝 Glance Notes
                  </button>
                  <button
                    className="btn-acting-chip"
                    onClick={() => triggerTherapistMotion('curious_tilt')}
                    title="Curious 12-deg side tilt"
                  >
                    ⭐ Curious Tilt
                  </button>
                  <button
                    className="btn-acting-chip"
                    onClick={() => triggerTherapistMotion('reassuring_shake')}
                    title="Gentle reassuring head shake"
                  >
                    🍃 Reassure
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#94a3b8' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>60 FPS Hardware</span>
                  <span>•</span>
                  <span style={{ color: '#38bdf8' }}>Oculus-15 FFT</span>
                </div>
              </div>
            </>
          ) : (
            /* Standby Card when Chetana is minimized */
            <div className="stage-standby-card">
              <div className="brand-badge-icon" style={{ width: 50, height: 50 }}>
                <Sparkles size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>Chetana is in Standby</h3>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '4px 0 0' }}>
                  Engage Chetana to bring her 60 FPS embodied anime stage to the center.
                </p>
              </div>
              <button
                className="btn-export-pdf"
                onClick={() => setIsChetanaEngaged(true)}
                style={{ padding: '8px 20px', fontSize: 12 }}
              >
                <Sparkles size={14} />
                <span>Engage Chetana</span>
              </button>
            </div>
          )}
        </main>

        {/* =================================================================
            PART 3: RIGHT DEDICATED CONVERSATIONAL CHAT & VOICE STREAM
            ================================================================= */}
        <div className="emosense-right-chat">
          {/* Chat Header */}
          <div className="chat-column-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dot-online" />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>Dialogue Hub</span>
              <span style={{ fontSize: 10, color: '#38bdf8' }}>Chetana Attuned</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Soundscape Trigger */}
              <button
                onClick={() => toggleSoundscape()}
                className="btn-acting-chip"
                style={{
                  background: isSoundscapePlaying ? 'hsla(200, 90%, 65%, 0.25)' : undefined,
                  borderColor: isSoundscapePlaying ? 'hsl(200, 90%, 65%)' : undefined
                }}
                title={isSoundscapePlaying ? 'Stop 432Hz Soundscape' : 'Play 432Hz Healing Soundscape'}
              >
                <Waves size={12} style={{ color: isSoundscapePlaying ? '#38bdf8' : undefined }} />
                <span>432Hz</span>
              </button>

              {/* Voice Mute / Unmute */}
              <button
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className="btn-acting-chip"
                style={{
                  background: !isVoiceActive ? 'hsla(0, 75%, 60%, 0.2)' : undefined,
                  borderColor: !isVoiceActive ? '#f43f5e' : undefined
                }}
                title={isVoiceActive ? 'Mute Chetana voice' : 'Unmute Chetana voice'}
              >
                {isVoiceActive ? <Volume2 size={12} style={{ color: '#10b981' }} /> : <VolumeX size={12} style={{ color: '#f43f5e' }} />}
              </button>
            </div>
          </div>

          {/* Stepped Care Bridge Card */}
          <div style={{ padding: '8px 12px 0' }}>
            <CareBridgeCard
              stressLevel={autopilotInfo?.stressLevel || 22}
              onTriggerSOS={() => setIsPanicModalOpen(true)}
            />
          </div>

          {/* Scrollable Message Stream */}
          <div className="chat-scroll-stream">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble-container ${m.role}`}>
                <div className="bubble-avatar-circle">
                  <img
                    src={m.role === 'assistant' ? '/poses/pose_idle.jpg' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={m.role}
                  />
                </div>

                <div className="bubble-content-block" style={{ maxWidth: '82%' }}>
                  <div className="bubble-text-box">
                    {m.content}
                  </div>

                  <div className="bubble-meta-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#94a3b8' }}>
                      <span>{m.time}</span>
                      {m.emotion && (
                        <span className={`bubble-emotion-chip chip-${m.emotion}`}>
                          <Heart size={8} style={{ fill: 'currentColor' }} />
                          {m.emotion} {m.confidence ? `(${(m.confidence * 100).toFixed(0)}%)` : ''}
                        </span>
                      )}
                    </div>

                    {m.role === 'assistant' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => {
                            speakWithChetana(
                              m.content,
                              currentEmotion,
                              autopilotInfo?.valence || 0.1,
                              autopilotInfo?.stressLevel || 22,
                              m.audioUrl
                            );
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                          title="Listen again"
                        >
                          <Volume2 size={12} />
                        </button>
                        <button
                          onClick={() => setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, feedback: msg.feedback === 'up' ? null : 'up' } : msg))}
                          style={{ background: 'transparent', border: 'none', color: m.feedback === 'up' ? '#10b981' : '#94a3b8', cursor: 'pointer', padding: 2 }}
                        >
                          <ThumbsUp size={11} />
                        </button>
                        <button
                          onClick={() => setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, feedback: msg.feedback === 'down' ? null : 'down' } : msg))}
                          style={{ background: 'transparent', border: 'none', color: m.feedback === 'down' ? '#f43f5e' : '#94a3b8', cursor: 'pointer', padding: 2 }}
                        >
                          <ThumbsDown size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollerRef} />
          </div>

          {/* Quick Scenario Chips Bar */}
          <div style={{ padding: '4px 12px', display: 'flex', gap: 5, overflowX: 'auto' }}>
            {quickTestPrompts.map((p, idx) => (
              <button
                key={idx}
                className="btn-acting-chip"
                style={{ fontSize: 10, padding: '3px 8px' }}
                onClick={() => handleSendMessage(p.text)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Composer */}
          <div className="chat-footer-composer">
            <div className="chat-composer-box">
              <input
                type="text"
                placeholder="Share your feelings with Chetana (Hindi or English)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              {/* Hands-Free Voice Input Microphone with Conversational Barge-In */}
              <VoiceInputButton
                onTranscriptChange={(transcribed) => setInputText(transcribed)}
                onFinalTranscript={(finalText) => {
                  setInputText(finalText);
                }}
                onBargeIn={() => {
                  if (isSpeaking) {
                    stopAllChetanaSpeech();
                    setCurrentGesture('chin_rest');
                  }
                }}
                disabled={isSending}
              />

              <button
                className="btn-send-purple"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                title="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MODALS: SESSION SUMMARY REPORT, PIP CAMERA & SOMATIC EXERCISES
          =================================================================== */}
      <SessionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        payload={getSessionPayload()}
      />

      <EmotionVisionPip
        isOpen={isCameraVisionOpen}
        onClose={() => setIsCameraVisionOpen(false)}
        onSelectScenario={(sc: DemoScenario) => {
          handleSendMessage(sc.sampleMessage);
        }}
        faceData={currentFaceData}
      />

      <SomaticExerciseModal
        isOpen={isGroundingActive}
        onClose={() => setIsGroundingActive(false)}
        onComplete={() => {
          setCurrentEmotion('calm');
          setCurrentGesture('namaste');
        }}
      />

      {/* Panic SOS Modal */}
      {isPanicModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 15, 0.88)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 20
          }}
          onClick={() => setIsPanicModalOpen(false)}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: 'hsl(232, 32%, 11%)',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 20px 60px rgba(244, 63, 94, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={24} style={{ color: '#f43f5e' }} />
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', margin: 0 }}>Immediate Crisis Support</h3>
                <p style={{ fontSize: 11.5, color: '#fda4af', margin: 0 }}>Stepped Care Level 4 Emergency Protocol</p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'hsl(230, 15%, 80%)', lineHeight: 1.5, marginBottom: 16 }}>
              You are not alone in this moment. Chetana is transitioning into immediate de-escalation posture. Please connect with immediate professional help:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="tel:14416"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <span>Tele-MANAS National Mental Health (India)</span>
                <span style={{ color: '#fda4af' }}>Dial 14416 / 1800-89-14416</span>
              </a>

              <a
                href="tel:18005990019"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <span>KIRAN Mental Health Helpline</span>
                <span style={{ color: '#fda4af' }}>Dial 1800-599-0019</span>
              </a>

              <a
                href="tel:112"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <span>National Emergency Response Service</span>
                <span style={{ color: '#fda4af' }}>Dial 112</span>
              </a>
            </div>

            <button
              onClick={() => {
                setIsPanicModalOpen(false);
                setCurrentEmotion('tense');
                setCurrentGesture('namaste');
              }}
              style={{
                width: '100%',
                marginTop: 18,
                padding: '10px',
                borderRadius: 12,
                background: 'hsla(232, 28%, 18%, 0.9)',
                border: '1px solid hsla(232, 25%, 25%, 0.8)',
                color: '#cbd5e1',
                fontSize: 12.5,
                cursor: 'pointer'
              }}
            >
              Return to Chetana De-Escalation
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Promotion Banner & iOS Step Guide */}
      <InstallBanner onManualTriggerRef={(fn) => { openInstallBannerRef.current = fn; }} />
    </div>
  );
};

export default EmoSenseChetanaPage;
