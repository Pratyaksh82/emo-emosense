import React, { useState } from 'react';
import { X, Copy, Check, Layers, Sparkles, MessageSquare, Heart, ShieldCheck, Code } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const bannerSnippet = `// ============================================================================
// EmoSense Chatting Page Integration (c:\\Users\\praty\\Desktop\\emo-girl\\emosense-source\\src\\ChatSection.tsx)
// ============================================================================

import React, { useState } from 'react';
import { ChetanaChatBanner } from './components/ChetanaChatBanner';
import { analyzeUserEmotion } from './lib/emotionAutopilotEngine';

export function EmoSenseChatSession() {
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [currentGesture, setCurrentGesture] = useState('namaste');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autopilotInfo, setAutopilotInfo] = useState(null);

  // When user sends a message or speech is transcribed:
  const handleUserMessage = (userText: string) => {
    // 1. Analyze emotion from user message
    const analysis = analyzeUserEmotion(userText);
    setAutopilotInfo(analysis);

    // 2. Automatically update Chetana's affective state & gesture
    setCurrentEmotion(analysis.detectedEmotion);
    setCurrentGesture(analysis.recommendedGesture);

    // 3. Chetana speaks the empathetic response with lip-sync
    // (speechService.speak(analysis.empathicResponse))
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4">
      {/* 1. CHETANA BANNER AT THE TOP OF THE CHATTING PAGE */}
      {/* Clicking on this banner expands the avatar with 60 FPS animations! */}
      <ChetanaChatBanner
        detectedEmotion={currentEmotion}
        detectedGesture={currentGesture}
        isSpeaking={isSpeaking}
        confidence={autopilotInfo?.confidence || 0.88}
        stressLevel={autopilotInfo?.stressLevel || 20}
        autopilotExplanation={autopilotInfo?.explanation}
      />

      {/* 2. Chat Conversation Thread */}
      <div className="flex-1 overflow-y-auto">
        {/* Messages stream */}
      </div>

      {/* 3. Input bar */}
      <ChatInput onSend={handleUserMessage} />
    </div>
  );
}`;

  const componentFilesSnippet = `// Self-contained files to copy into emo-girl (c:\\Users\\praty\\Desktop\\emo-girl\\emosense-source):
// 1. src/components/ChetanaChatBanner.tsx & ChetanaChatBanner.css
// 2. src/components/ChetanaMasterAnimeStage.tsx & AnimeCelStage.css
// 3. src/lib/emotionAutopilotEngine.ts
// 4. public/poses/ (pose_idle.jpg, pose_namaste.jpg, pose_empathy.jpg, pose_chin_rest.jpg, pose_wave.jpg)`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">
              <Sparkles size={18} />
            </span>
            <div>
              <h3>EmoSense Chat Banner Integration Guide</h3>
              <p>How Chetana embeds into EmoSense chatting page with automatic emotion reactions</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Step 1 */}
          <div className="guide-step">
            <div className="step-num">1</div>
            <div className="step-content">
              <h4>The Chetana Banner Concept in Chatting Page</h4>
              <p>
                In EmoSense, Chetana is integrated via a high-performance interactive banner at the top of the chat area:
              </p>
              <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                <li><strong>Collapsed Banner:</strong> Minimalist glassmorphism bar showing Chetana's breathing portrait thumbnail, live emotion status dot, and "✨ Engage Chetana" trigger.</li>
                <li><strong>Click-to-Reveal:</strong> Clicking the banner smoothly expands the full 60 FPS anime avatar stage with zero page reload.</li>
                <li><strong>Affective Autopilot:</strong> Automatically detects user emotion (Joy, Grief, Panic, Calm) from messages/voice and triggers the matching gesture (<code>namaste</code>, <code>heart_empathy</code>, <code>chin_rest</code>, <code>wave</code>) and speech visemes!</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="guide-step">
            <div className="step-num">2</div>
            <div className="step-content">
              <h4>Automatic Emotion &amp; Gesture Mapping</h4>
              <p>
                The <code>emotionAutopilotEngine.ts</code> maps detected patient sentiment to Chetana's biological acting:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '8px', borderRadius: '8px', fontSize: '11px' }}>
                  <strong style={{ color: '#fda4af' }}>Sadness / Grief:</strong>
                  <div style={{ color: '#94a3b8', marginTop: '2px' }}>Gesture: <code>heart_empathy</code></div>
                  <div style={{ color: '#64748b' }}>Hand on heart, compassionate eyes</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '8px', borderRadius: '8px', fontSize: '11px' }}>
                  <strong style={{ color: '#fbbf24' }}>Panic / Anxiety:</strong>
                  <div style={{ color: '#94a3b8', marginTop: '2px' }}>Gesture: <code>namaste</code></div>
                  <div style={{ color: '#64748b' }}>Grounding pose, 432Hz tone</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px', borderRadius: '8px', fontSize: '11px' }}>
                  <strong style={{ color: '#34d399' }}>Joy / Success:</strong>
                  <div style={{ color: '#94a3b8', marginTop: '2px' }}>Gesture: <code>wave</code></div>
                  <div style={{ color: '#64748b' }}>Kyoto smile, cheerful wave</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="guide-step">
            <div className="step-num">3</div>
            <div className="step-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>Drop-In Chatting Page Code Snippet</h4>
                <button className="copy-btn" onClick={() => handleCopy(bannerSnippet, 1)}>
                  {copiedIndex === 1 ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIndex === 1 ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <div className="code-block-wrapper" style={{ marginTop: '6px' }}>
                <pre>
                  <code>{bannerSnippet}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="guide-step">
            <div className="step-num">4</div>
            <div className="step-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>Self-Contained Asset Checklist</h4>
                <button className="copy-btn" onClick={() => handleCopy(componentFilesSnippet, 2)}>
                  {copiedIndex === 2 ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIndex === 2 ? 'Copied' : 'Copy Paths'}
                </button>
              </div>
              <div className="code-block-wrapper" style={{ marginTop: '6px' }}>
                <pre>
                  <code>{componentFilesSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981' }}>
            <ShieldCheck size={14} />
            <span>100% Zero-Knowledge Edge Architecture · HIPAA Compliant</span>
          </div>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
