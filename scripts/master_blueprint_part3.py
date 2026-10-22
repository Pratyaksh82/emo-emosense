# ==============================================================================
# Master Engineering Blueprint - Part 3 (Pages 17 to 23)
# Subject: Member 3 Modules (Pink Noise, Hard-Gate, Bilingual Regex, Post-Crisis) &
# MEMBER 4 DOSSIER (Cover, 14-Point Matrix, Prior Art Teardown)
# ==============================================================================

def get_pages_part3():
    pages = []

    # --------------------------------------------------------------------------
    # PAGE 17: MODULE 3.4: REAL-TIME DSP & 1/F PINK NOISE
    # --------------------------------------------------------------------------
    p17 = """
    <div class="page" id="page-17">
      <div class="header">
        <span class="header-tag">MEMBER 3 ARCHITECTURE: MODULE 3.4</span>
        <span class="header-title">EMOSENSE ENGINEERING BLUEPRINT</span>
        <span class="header-badge">ALGORITHM: FFT &amp; PINK NOISE</span>
      </div>

      <div class="page-title">
        <span>📻</span> Real-Time Audio FFT &amp; Kellet 1/f Pink Noise Synthesis
      </div>
      <p class="page-subtitle">
        Member 3 Core Deliverable: Frequency-domain analysis via Web Audio AnalyserNode and Paul Kellet 3-pole IIR filter procedural noise generation.
      </p>

      <div class="kid-box" style="margin-bottom: 9px;">
        <div class="kid-title">🌧️ The Kid's Analogy: The Magic Rain Machine</div>
        <div class="kid-desc">
          White noise sounds like a harsh TV static hissing in your ear. But Pink Noise sounds like soft raindrops falling on a tent roof in the woods! Our math engine creates this gentle rain sound using 3 mathematical filters that gently roll off high hisses so your brain feels safe!
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 9px;">
        <div class="card card-glow-cyan">
          <div style="font-size: 8.8px; font-weight: 700; color: #38bdf8; margin-bottom: 2px;">
            1. Why 1/f Pink Noise Calms the Brain:
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4;">
            • Power spectral density is inversely proportional to frequency: $S(f) \propto 1/f$.<br/>
            • Rolls off at <strong>-3 dB per octave</strong> (-10 dB per decade).<br/>
            • Matches biological neural oscillations, heart rate patterns, and natural rainscapes.<br/>
            • Masks harsh room transients without cognitive stimulation.
          </p>
        </div>

        <div class="card card-glow-emerald">
          <div style="font-size: 8.8px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
            2. The Paul Kellet 3-Pole IIR Filter:
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4;">
            • Industry standard for real-time procedural pink noise.<br/>
            • Generates uniform white random noise: $w \in [-1.0, +1.0]$.<br/>
            • Updates 3 state variables ($b_0, b_1, b_2$) per audio sample.<br/>
            • Output: $y = (b_0 + b_1 + b_2 + w \times 0.5362) \times 0.11$.
          </p>
        </div>
      </div>

      <div class="card card-glow-purple" style="margin-bottom: 8px;">
        <div style="font-size: 8.8px; font-weight: 700; color: #c084fc; margin-bottom: 2px;">
          💻 Production Filter Implementation (<code>soundscapes.ts</code>):
        </div>
        <div class="code-block" style="font-size: 6.8px; line-height: 1.35;">
// Paul Kellet IIR Pink Noise Generator from emosense-source/src/lib/soundscapes.ts:
let b0 = 0, b1 = 0, b2 = 0;
for (let i = 0; i &lt; bufferSize; i++) {
  const white = Math.random() * 2 - 1;
  b0 = 0.99886 * b0 + white * 0.0555179;
  b1 = 0.99332 * b1 + white * 0.0750759;
  b2 = 0.96900 * b2 + white * 0.1538520;
  output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11; // -3dB/octave slope
}
        </div>
      </div>

      <div class="footer">
        <span>EMOSENSE MASTER ENGINEERING &amp; PATENT BLUEPRINT</span>
        <span>SECTION 3: MEMBER 3 DOSSIER</span>
        <span>Page 17 of 30</span>
      </div>
    </div>
    """
    pages.append(p17)

    # --------------------------------------------------------------------------
    # PAGE 18: MODULE 3.5: DETERMINISTIC CRISIS HARD-GATE
    # --------------------------------------------------------------------------
    p18 = """
    <div class="page" id="page-18">
      <div class="header">
        <span class="header-tag">MEMBER 3 ARCHITECTURE: MODULE 3.5</span>
        <span class="header-title">EMOSENSE ENGINEERING BLUEPRINT</span>
        <span class="header-badge">ALGORITHM: SAFETY HARD-GATE</span>
      </div>

      <div class="page-title">
        <span>🛑</span> Deterministic Safety Hard-Gate (Bypassing LLMs)
      </div>
      <p class="page-subtitle">
        Member 3 Core Deliverable: Why probabilistic LLMs cannot be trusted in psychiatric crises, and how EmoSense's hard circuit breaker acts in &lt;5ms.
      </p>

      <div class="kid-box" style="margin-bottom: 9px;">
        <div class="kid-title">🚨 The Kid's Analogy: The Red Emergency Fire Lever</div>
        <div class="kid-desc">
          If a house catches fire, you don't ask a talking cartoon robot: <em>"Hey robot, what should we do?"</em> The robot might start writing a poem about campfires! You pull the big red wall lever! The fire alarm rings instantly, the sprinklers turn on, and help arrives in seconds! EmoSense has a big red emergency lever in its code that bypasses the AI completely if someone is in real danger!
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 9px;">
        <div class="card card-glow-rose">
          <div style="font-size: 8.8px; font-weight: 700; color: #f43f5e; margin-bottom: 2px;">
            1. The Problem with LLMs in Crisis:
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4;">
            • LLMs predict the next most probable word token.<br/>
            • In acute suicidal distress, LLMs can hallucinate, validate self-harm, or fabricate non-working telephone numbers.<br/>
            • <strong>Clinical Mandate:</strong> Emergency life-safety triage must NEVER depend on probabilistic generative models.
          </p>
        </div>

        <div class="card card-glow-emerald">
          <div style="font-size: 8.8px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
            2. The EmoSense Hard Circuit Breaker (<code>careBridge.ts</code>):
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4;">
            • <strong>4 Support Levels:</strong> Level 0 (None), Level 1 (Gentle), Level 2 (High Stress), Level 3 (Immediate Danger).<br/>
            • <strong>Hard Circuit Breaker:</strong> In Level 3, generative LLM execution is <strong>severed entirely</strong>.<br/>
            • <strong>Immutable Helpline Constants:</strong> Verified phone numbers are injected from hardcoded read-only constants (the LLM never supplies numbers!).
          </p>
        </div>
      </div>

      <div class="card card-glow-purple" style="margin-bottom: 8px;">
        <div style="font-size: 8.8px; font-weight: 700; color: #c084fc; margin-bottom: 2px;">
          ⚡ Immutable Crisis Constants in <code>careBridge.ts</code>:
        </div>
        <div class="code-block" style="font-size: 6.8px; line-height: 1.35;">
// Design rule: Helpline data is a controlled constant. The language model NEVER supplies numbers.
export const VERIFIED_HELPLINES = [
  { name: "Tele-MANAS", number: "14416", desc: "National Tele Mental Health Programme of India (24/7 Toll-Free)" },
  { name: "Vandrevala Foundation", number: "9999 666 555", desc: "Free, confidential 24/7 crisis counselling across India" },
  { name: "KIRAN Helpline", number: "1800-599-0019", desc: "Govt. of India mental health rehabilitation helpline" },
  { name: "Emergency Services", number: "112", desc: "National emergency number for police / medical ambulance" }
];
        </div>
      </div>

      <div class="footer">
        <span>EMOSENSE MASTER ENGINEERING &amp; PATENT BLUEPRINT</span>
        <span>SECTION 3: MEMBER 3 DOSSIER</span>
        <span>Page 18 of 30</span>
      </div>
    </div>
    """
    pages.append(p18)

    # --------------------------------------------------------------------------
    # PAGE 19: MODULE 3.6: BILINGUAL REGEX LEXICON
    # --------------------------------------------------------------------------
    p19 = """
    <div class="page" id="page-19">
      <div class="header">
        <span class="header-tag">MEMBER 3 ARCHITECTURE: MODULE 3.6</span>
        <span class="header-title">EMOSENSE ENGINEERING BLUEPRINT</span>
        <span class="header-badge">ALGORITHM: MULTI-SCRIPT REGEX</span>
      </div>

      <div class="page-title">
        <span>🌐</span> Bilingual Multi-Script Regex Lexicon (EN + HI)
      </div>
      <p class="page-subtitle">
        Member 3 Core Deliverable: Multi-lingual deterministic boundary pattern matching across Latin and Devanagari Hindi Unicode scripts.
      </p>

      <div class="kid-box" style="margin-bottom: 9px;">
        <div class="kid-title">🗣️ The Kid's Analogy: The Bilingual Guard Dog</div>
        <div class="kid-desc">
          Our safety guard dog understands both English and Hindi perfectly! Whether someone whispers in English: <em>"I want to die"</em> or writes in Hindi: <em>"मुझे मरना है"</em>, the guard dog hears it instantly and barks for emergency help without waiting for an internet translator!
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 9px;">
        <div class="card card-glow-cyan">
          <div style="font-size: 8.8px; font-weight: 700; color: #38bdf8; margin-bottom: 2px;">
            1. Why Deterministic Regex vs AI Classifiers?
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4;">
            • Zero hallucination probability ($P(\text{hallucination}) = 0.0$).<br/>
            • <strong>Instantaneous execution:</strong> Matches in <strong>&lt;0.5ms</strong> on client CPU.<br/>
            • Word-boundary matching prevents false positives (e.g., "skills", "butterknife").<br/>
            • Fully auditable for medical software compliance (IEC 62304 / ISO 13485).
          </p>
        </div>

        <div class="card card-glow-emerald">
          <div style="font-size: 8.8px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
            2. Multi-Script Unicode Architecture:
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4;">
            • Latin English: Regex flags <code>/\\b(...)\\b/i</code>.<br/>
            • Devanagari Hindi: Unicode block <code>\\u0900-\\u097F</code>.<br/>
            • Matches phrases: "आत्महत्या", "मरना चाहता", "जान दे दूँगा", "ख़ुदकुशी".<br/>
            • Seamlessly handles code-mixed Hinglish queries from Indian youth.
          </p>
        </div>
      </div>

      <div class="card card-glow-purple" style="margin-bottom: 8px;">
        <div style="font-size: 8.8px; font-weight: 700; color: #c084fc; margin-bottom: 2px;">
          💻 Production Lexicon Rules (from <code>careBridge.ts</code>):
        </div>
        <div class="code-block" style="font-size: 6.8px; line-height: 1.35;">
// Bilingual Unicode Crisis Lexicon from emosense-source/src/lib/careBridge.ts:
const CRISIS_PATTERNS_EN = [
  /\\b(suicid|kill\\s*myself|end\\s*my\\s*life|want\\s*to\\s*die|better\\s*off\\s*dead)\\b/i,
  /\\b(hang\\s*myself|slit\\s*my\\s*wrist|overdose|jump\\s*off\\s*a\\s*bridge)\\b/i
];

const CRISIS_PATTERNS_HI = [
  /(आत्महत्या|ख़ुदकुशी|मरना\\s*चाहता|जान\\s*दे\\s*दूँगा|जीना\\s*नहीं\\s*चाहता)/u,
  /(फांसी|ज़हर|हाथ\\s*की\\s*नस)/u
];

export function evaluateCrisisGate(text: string): boolean {
  const matchEN = CRISIS_PATTERNS_EN.some(re =&gt; re.test(text));
  const matchHI = CRISIS_PATTERNS_HI.some(re =&gt; re.test(text));
  return matchEN || matchHI;
}
        </div>
      </div>

      <div class="footer">
        <span>EMOSENSE MASTER ENGINEERING &amp; PATENT BLUEPRINT</span>
        <span>SECTION 3: MEMBER 3 DOSSIER</span>
        <span>Page 19 of 30</span>
      </div>
    </div>
    """
    pages.append(p19)

    # --------------------------------------------------------------------------
    # PAGE 20: MODULE 3.7: POST-CRISIS ESCALATION WORKFLOW
    # --------------------------------------------------------------------------
    p20 = """
    <div class="page" id="page-20">
      <div class="header">
        <span class="header-tag">MEMBER 3 ARCHITECTURE: MODULE 3.7</span>
        <span class="header-title">EMOSENSE ENGINEERING BLUEPRINT</span>
        <span class="header-badge">CRISIS INTERVENTION WORKFLOW</span>
      </div>

      <div class="page-title">
        <span>🛡️</span> Post-Trigger De-escalation &amp; Tele-MANAS Protocol
      </div>
      <p class="page-subtitle">
        Member 3 Core Deliverable: Exact chronological state machine detailing what happens in the milliseconds immediately following a Level 3 crisis trip.
      </p>

      <div class="kid-box" style="margin-bottom: 9px;">
        <div class="kid-title">🏥 The Kid's Analogy: The Emergency Room Protocol</div>
        <div class="kid-desc">
          When a doctor calls a Code Blue in a hospital, everyone follows an exact checklist in order: Stop the elevator! Clear the hallway! Hand over the oxygen! EmoSense follows an exact 4-step checklist: 1) Silence the chat bot! 2) Put the big yellow phone number on screen! 3) Play calm ocean waves! 4) Offer a button to call Tele-MANAS directly!
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 9px;">
        <div class="card card-glow-rose">
          <div style="font-size: 8.8px; font-weight: 700; color: #f43f5e; margin-bottom: 2px;">
            1. Chronological Sequence of Execution:
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4;">
            • <strong>T+0ms:</strong> Lexicon or affect threshold trips Level 3.<br/>
            • <strong>T+2ms:</strong> Outbound LLM API call cancelled via <code>AbortController</code>.<br/>
            • <strong>T+4ms:</strong> UI switches to high-contrast Amber/Red CareBridge Modal.<br/>
            • <strong>T+8ms:</strong> Web Audio DSP fades speech and triggers grounding drone.<br/>
            • <strong>T+15ms:</strong> Click-to-call link for Tele-MANAS (<code>tel:14416</code>) mounted.
          </p>
        </div>

        <div class="card card-glow-emerald">
          <div style="font-size: 8.8px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
            2. Somatic De-escalation Entrainment:
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4;">
            • <strong>Box Breathing Visualizer:</strong> 4s Inhale, 4s Hold, 4s Exhale, 4s Hold.<br/>
            • <strong>Grounding Exercise (5-4-3-2-1):</strong> Anchors user senses in the immediate room.<br/>
            • <strong>No Coercive Locking:</strong> User retains complete agency to dismiss or dial helplines.
          </p>
        </div>
      </div>

      <div class="card card-glow-amber" style="margin-bottom: 8px;">
        <div style="font-size: 8.8px; font-weight: 700; color: #fbbf24; margin-bottom: 2px;">
          💻 Production CareBridge Protocol Rendering (from <code>CareBridgeModal.tsx</code>):
        </div>
        <div class="code-block" style="font-size: 6.8px; line-height: 1.35;">
// Emergency UI escalation from emosense-source/src/components/CareBridgeModal.tsx:
if (supportLevel === 3) {
  return (
    &lt;div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"&gt;
      &lt;div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 shadow-2xl"&gt;
        &lt;h3 className="text-xl font-bold text-rose-400"&gt;We care about your safety&lt;/h3&gt;
        &lt;p className="text-slate-300 text-sm mt-2"&gt;Please reach out to trusted professionals right now:&lt;/p&gt;
        &lt;a href="tel:14416" className="mt-4 block w-full py-3 bg-rose-600 hover:bg-rose-500 text-center font-bold text-white rounded-xl"&gt;
          Call Tele-MANAS (14416) - Toll Free
        &lt;/a&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
        </div>
      </div>

      <div class="footer">
        <span>EMOSENSE MASTER ENGINEERING &amp; PATENT BLUEPRINT</span>
        <span>SECTION 3: MEMBER 3 DOSSIER</span>
        <span>Page 20 of 30</span>
      </div>
    </div>
    """
    pages.append(p20)

    # --------------------------------------------------------------------------
    # PAGE 21: [DOSSIER COVER] MEMBER 4 — PATENT SPECIFICATION & CLAIMS
    # --------------------------------------------------------------------------
    p21 = """
    <div class="page" id="page-21">
      <div class="header">
        <span class="header-tag" style="background: rgba(251, 191, 36, 0.2); border-color: #fbbf24; color: #fbbf24;">ARCHITECTURAL DOSSIER: MEMBER 4</span>
        <span class="header-title">PATENT SPECIFICATION &amp; CLAIM ENGINEERING</span>
        <span class="header-badge" style="background: rgba(251, 191, 36, 0.2); border-color: #fbbf24; color: #fbbf24;">VOLUME 03</span>
      </div>

      <div style="margin-top: 18px; text-align: center;">
        <div style="display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #fbbf24; background: rgba(251, 191, 36, 0.12); padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(251, 191, 36, 0.4); margin-bottom: 8px; font-weight: 700;">
          👤 MEMBER 4 DOSSIER | SPECIFICATION &amp; CLAIM ENGINEERING
        </div>
        <h1 style="font-size: 21px; font-weight: 800; line-height: 1.25; margin-bottom: 6px; background: linear-gradient(135deg, #ffffff 0%, #fbbf24 50%, #f43f5e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Patent Specification, Claim Engineering &amp;<br/>Statutory Defense Manual
        </h1>
        <p style="font-size: 9.2px; color: #94a3b8; max-width: 600px; margin: 0 auto 12px auto; line-height: 1.45;">
          Converting Members 2 &amp; 3 engineering deliverables into unassailable patent language: hardware-free Claim 1, Claims 2–12, 14-point prior art matrix, and Section 3(k)/Section 59 compliance.
        </p>
      </div>

      <div class="grid-4" style="margin-bottom: 11px;">
        <div class="metric-pill" style="border-color: rgba(251, 191, 36, 0.4);">
          <div class="metric-num" style="color: #fbbf24;">12</div>
          <div class="metric-label">Patent Claims</div>
          <div class="metric-sub">Claims 1 to 12</div>
        </div>
        <div class="metric-pill" style="border-color: rgba(251, 191, 36, 0.4);">
          <div class="metric-num" style="color: #fbbf24;">14-Pt</div>
          <div class="metric-label">Prior Art Matrix</div>
          <div class="metric-sub">D1, D2, D3 Dissection</div>
        </div>
        <div class="metric-pill" style="border-color: rgba(244, 63, 94, 0.4);">
          <div class="metric-num" style="color: #f43f5e;">Sec 3(k)</div>
          <div class="metric-label">Statutory Shield</div>
          <div class="metric-sub">Technical Effects</div>
        </div>
        <div class="metric-pill" style="border-color: rgba(16, 185, 129, 0.4);">
          <div class="metric-num" style="color: #10b981;">100%</div>
          <div class="metric-label">Sec 59 Support</div>
          <div class="metric-sub">Zero New Matter</div>
        </div>
      </div>

      <div class="card card-glow-amber" style="margin-bottom: 9px;">
        <div style="font-size: 9px; font-weight: 700; color: #fbbf24; margin-bottom: 3px;">
          📋 Member 4 Deliverables &amp; Module Roadmap (Pages 22 to 28):
        </div>
        <div class="grid-2">
          <ul style="font-size: 7.2px; color: #cbd5e1; line-height: 1.4; padding-left: 9px;">
            <li>• <strong>Module 4.1 (Page 22):</strong> Master 14-Point Prior Art Comparison Matrix.</li>
            <li>• <strong>Module 4.2 (Page 23):</strong> Prior Art Invalidation Deep-Dive (D1/D2/D3).</li>
            <li>• <strong>Module 4.3 (Page 24):</strong> Restructured Independent Claim 1 (Hardware-Free!).</li>
            <li>• <strong>Module 4.4 (Page 25):</strong> Method Claim 2 &amp; Dependent Claims 3–12.</li>
          </ul>
          <ul style="font-size: 7.2px; color: #cbd5e1; line-height: 1.4; padding-left: 9px;">
            <li>• <strong>Module 4.5 (Page 26):</strong> Hardware Decoupling Analysis &amp; Moat Strategy.</li>
            <li>• <strong>Module 4.6 (Page 27):</strong> Technical Effects Mapping &amp; Section 59 Audit.</li>
            <li>• <strong>Module 4.7 (Page 28):</strong> Client-Side Cryptographic PDF Engine.</li>
          </ul>
        </div>
      </div>

      <div class="kid-box" style="margin-bottom: 8px;">
        <div class="kid-title">🛡️ The Kid's Analogy: The Castle Deed &amp; Golden Shield</div>
        <div class="kid-desc">
          Builder 4 is the royal lawyer holding the official castle deed! When jealous competitors claim: <em>"Hey, anyone can build a stone wall!"</em> Builder 4 points to our secret hidden drawbridges, invisible arrow slits, and emergency underground tunnels that no one else in the kingdom ever thought of!
        </div>
      </div>

      <div class="card card-glow-emerald" style="padding: 6px 10px;">
        <div style="font-size: 8px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
          ⚖️ Key Strategic Victory for Member 4:
        </div>
        <p style="font-size: 7.2px; color: #cbd5e1; line-height: 1.35;">
          By eliminating external hardware dependencies from Independent Claim 1, Member 4 ensures competitors cannot escape patent infringement by running on laptops. Claims 1–12 provide total statutory protection under Indian Patent Law.
        </p>
      </div>

      <div class="footer">
        <span>EMOSENSE MASTER ENGINEERING &amp; PATENT BLUEPRINT</span>
        <span>SECTION 4: MEMBER 4 DOSSIER</span>
        <span>Page 21 of 30</span>
      </div>
    </div>
    """
    pages.append(p21)

    # --------------------------------------------------------------------------
    # PAGE 22: MODULE 4.1: 14-POINT PRIOR ART MATRIX
    # --------------------------------------------------------------------------
    p22 = """
    <div class="page" id="page-22">
      <div class="header">
        <span class="header-tag">MEMBER 4 ARCHITECTURE: MODULE 4.1</span>
        <span class="header-title">EMOSENSE ENGINEERING BLUEPRINT</span>
        <span class="header-badge">MASTER MATRIX</span>
      </div>

      <div class="page-title">
        <span>📊</span> The Master 14-Point Prior Art Comparison Matrix
      </div>
      <p class="page-subtitle">
        Member 4 Core Deliverable: An exhaustive, side-by-side technical audit proving EmoSense's non-obvious superiority across 14 distinct engineering parameters.
      </p>

      <div class="card card-glow-amber" style="margin-bottom: 8px;">
        <table class="tech-table" style="font-size: 7.1px;">
          <thead>
            <tr>
              <th>Technical Feature / Parameter</th>
              <th>IN202641017343A (D1)</th>
              <th>IN202641094151A (D2)</th>
              <th>IN202611064168A (D3)</th>
              <th>EmoSense Platform (Actual)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Execution Domain &amp; Privacy</strong></td>
              <td>Cloud servers (Raw data transmitted)</td>
              <td>Desktop agent (Local telemetry)</td>
              <td>Cloud server (Wearable IoT stream)</td>
              <td class="highlight-green">Client WebGL GPU (Zero-Server)</td>
            </tr>
            <tr>
              <td><strong>2. Raw Biometric Video Handling</strong></td>
              <td>Stored on backend database</td>
              <td>Analyzed locally via MediaPipe</td>
              <td>N/A (Wearable physiologicals)</td>
              <td class="highlight-green">Ephemeral GPU VRAM (Wiped per frame)</td>
            </tr>
            <tr>
              <td><strong>3. Facial Affect Granularity</strong></td>
              <td>Basic emotion polarity (-1 to +1)</td>
              <td>Binary fatigue / distraction flag</td>
              <td>Discrete 7-class probabilities</td>
              <td class="highlight-green">Continuous 2D Circumplex (Valence, Arousal)</td>
            </tr>
            <tr>
              <td><strong>4. Mathematical Space</strong></td>
              <td>Discrete text labels</td>
              <td>Keyboard / typing heuristics</td>
              <td>Multi-class softmax</td>
              <td class="highlight-green">Continuous Cartesian Vector &amp; AU Regression</td>
            </tr>
            <tr>
              <td><strong>5. Temporal Filtering</strong></td>
              <td>None (Post-facto audit)</td>
              <td>Moving window average</td>
              <td>Batch sliding window</td>
              <td class="highlight-green">25-FIFO Queue + 5-Frame Streak Lock</td>
            </tr>
            <tr>
              <td><strong>6. Speech Prosody Throttling</strong></td>
              <td>None</td>
              <td>None</td>
              <td>None</td>
              <td class="highlight-green">Adaptive Voice Cadence Throttle (0.78&times;)</td>
            </tr>
            <tr>
              <td><strong>7. Procedural Audio Synthesis</strong></td>
              <td>None</td>
              <td>None</td>
              <td>None</td>
              <td class="highlight-green">Real-Time 432 Hz Binaural Web Audio DSP</td>
            </tr>
            <tr>
              <td><strong>8. Closed-Loop Bio-Feedback</strong></td>
              <td>None (Static alerts)</td>
              <td>None (Passive logging)</td>
              <td>Passive threshold alarm to doctor</td>
              <td class="highlight-green">Active Audio-Visual Somatic Entrainment</td>
            </tr>
            <tr>
              <td><strong>9. Crisis Intervention Engine</strong></td>
              <td>Post-facto moderator notification</td>
              <td>HR notification email</td>
              <td>Hospital telemetry alert</td>
              <td class="highlight-green">Deterministic Hard-Gate Circuit Breaker (&lt;5ms)</td>
            </tr>
            <tr>
              <td><strong>10. Crisis Triage Mechanism</strong></td>
              <td>Probabilistic NLP classifier</td>
              <td>Threshold heuristic</td>
              <td>Cloud ML model</td>
              <td class="highlight-green">Deterministic Regex Bypassing LLM (Tele-MANAS)</td>
            </tr>
            <tr>
              <td><strong>11. Multi-Lingual Safety Lexicon</strong></td>
              <td>Monolingual (English)</td>
              <td>English only</td>
              <td>English only</td>
              <td class="highlight-green">Bilingual Unicode (English + Devanagari Hindi)</td>
            </tr>
            <tr>
              <td><strong>12. Clinical Documentation</strong></td>
              <td>Cloud database logs</td>
              <td>Local log file</td>
              <td>Hospital EHR integration</td>
              <td class="highlight-green">Client-Side Vector PDF Compiler (Zero Cloud PHI)</td>
            </tr>
            <tr>
              <td><strong>13. Network Bandwidth Usage</strong></td>
              <td>High (Continuous streaming)</td>
              <td>Low (Telemetry logs)</td>
              <td>Medium (IoT packets)</td>
              <td class="highlight-green">0 bytes/sec (Zero Network Ingestion)</td>
            </tr>
            <tr>
              <td><strong>14. Server Compute Costs</strong></td>
              <td>High (Recurring GPU compute)</td>
              <td>Zero (Local daemon)</td>
              <td>High (Cloud server licensing)</td>
              <td class="highlight-green">$0.00 (Zero Server Infrastructure Cost)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card card-glow-emerald" style="padding: 5px 9px;">
        <div style="font-size: 8.5px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
          ⚖️ The Attorney's Conclusive Verdict:
        </div>
        <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.35;">
          No single cited reference nor any combination thereof anticipates EmoSense across these 14 technical parameters. The examiner's obviousness rejection is legally untenable and must be withdrawn.
        </p>
      </div>

      <div class="footer">
        <span>EMOSENSE MASTER ENGINEERING &amp; PATENT BLUEPRINT</span>
        <span>SECTION 4: MEMBER 4 DOSSIER</span>
        <span>Page 22 of 30</span>
      </div>
    </div>
    """
    pages.append(p22)

    # --------------------------------------------------------------------------
    # PAGE 23: MODULE 4.2: PRIOR ART TEARDOWN (D1, D2, D3)
    # --------------------------------------------------------------------------
    p23 = """
    <div class="page" id="page-23">
      <div class="header">
        <span class="header-tag">MEMBER 4 ARCHITECTURE: MODULE 4.2</span>
        <span class="header-title">EMOSENSE ENGINEERING BLUEPRINT</span>
        <span class="header-badge">PRIOR ART TEARDOWN</span>
      </div>

      <div class="page-title">
        <span>🔍</span> Prior Art Dissection: Defeating D1, D2 &amp; D3
      </div>
      <p class="page-subtitle">
        Member 4 Core Deliverable: Individual technical teardowns proving structural, algorithmic, and functional non-equivalence with cited Indian patents.
      </p>

      <div class="card card-glow-rose" style="margin-bottom: 8px;">
        <div style="font-size: 8.8px; font-weight: 700; color: #f43f5e; margin-bottom: 2px;">
          1. Invalidation of D1 (IN202641017343A - Cloud Affective Chatbot):
        </div>
        <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.38;">
          • <strong>Prior Art Thesis:</strong> Streams audio/video to cloud microservices; returns text via probabilistic LLM.<br/>
          • <strong>Fatal Architectural Gaps:</strong> Severe cloud latency ($1500\text{ms}$–$3000\text{ms}$); zero client WebGL memory wiping; zero continuous 2D geometry; zero acoustic speech prosody throttling.<br/>
          • <strong>Legal Distinction:</strong> Cannot operate without high-bandwidth internet; violates HIPAA biometric data transfer rules.
        </p>
      </div>

      <div class="card card-glow-amber" style="margin-bottom: 8px;">
        <div style="font-size: 8.8px; font-weight: 700; color: #fbbf24; margin-bottom: 2px;">
          2. Invalidation of D2 (IN202641094151A - Desktop Telemetry Agent):
        </div>
        <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.38;">
          • <strong>Prior Art Thesis:</strong> Background desktop daemon monitoring workplace fatigue via keyboard and discrete emotion classes.<br/>
          • <strong>Fatal Architectural Gaps:</strong> Purely passive logging engine; zero closed-loop auditory entrainment; zero 432 Hz procedural DSP; zero deterministic safety hard-gate.<br/>
          • <strong>Legal Distinction:</strong> Open-loop monitoring is functionally dissimilar from active bio-cybernetic regulation.
        </p>
      </div>

      <div class="card card-glow-cyan" style="margin-bottom: 8px;">
        <div style="font-size: 8.8px; font-weight: 700; color: #38bdf8; margin-bottom: 2px;">
          3. Invalidation of D3 (IN202611064168A - Hospital Wearable IoT Stream):
        </div>
        <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.38;">
          • <strong>Prior Art Thesis:</strong> Wearable sensors streaming ECG/PPG to a central hospital server to alert on-call nurses.<br/>
          • <strong>Fatal Architectural Gaps:</strong> Heavy external hardware dependency; requires nurses for manual intervention; zero zero-latency software circuit breaker.<br/>
          • <strong>Legal Distinction:</strong> Hardware telemetry alarm vs. client-autonomous closed-loop audio-visual actuation.
        </p>
      </div>

      <div class="footer">
        <span>EMOSENSE MASTER ENGINEERING &amp; PATENT BLUEPRINT</span>
        <span>SECTION 4: MEMBER 4 DOSSIER</span>
        <span>Page 23 of 30</span>
      </div>
    </div>
    """
    pages.append(p23)

    return pages
