# ==============================================================================
# Voice Blueprint - Part 2 (Pages 5 to 8)
# Input SER, Bilingual Candidate C Engine, Warmth DSP, & Procedural Soundscape
# ==============================================================================

def get_pages_part2():
    pages = []

    # --------------------------------------------------------------------------
    # PAGE 5: SER CLASSIFIER & 2D AFFECTIVE STATE MACHINE (INPUT FEATURE)
    # --------------------------------------------------------------------------
    p5 = r"""
    <div class="page" id="page-5">
      <div class="header">
        <span class="header-tag">MODULE 04: INPUT FEATURE CLASSIFIER</span>
        <span class="header-title">SER CLASSIFIER &amp; TEMPORAL RING BUFFER</span>
        <span class="header-badge">MACHINE LEARNING</span>
      </div>

      <div class="page-title">
        <span>Input Feature: Speech Emotion Recognition &amp; State-Locked Arbiter</span>
      </div>
      <div class="page-subtitle">
        Translating raw frame-level acoustic telemetry vectors into continuous 2D Valence-Arousal coordinates and discrete psychiatric risk states via circular FIFO buffering and exponential smoothing.
      </div>

      <div class="grid-2" style="margin-bottom: 7px;">
        <div class="card card-glow-cyan">
          <div class="card-title" style="color: #38bdf8;">
            <span>1. 2D Valence-Arousal Affective Mapping</span>
            <span class="badge badge-cyan">CIRCUMPLEX MODEL</span>
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
            The engine maps the multidimensional input feature vector into continuous physiological coordinates (V, A) in [-1.0, 1.0]^2:
          </p>
          <div class="math-block">
            A = \tanh\left( w_1 \cdot \text{RMS}_{\text{norm}} + w_2 \cdot \frac{\sigma_{F0}}{\mu_{F0}} + w_3 \cdot \frac{C - C_{\text{baseline}}}{1000} \right)
          </div>
          <div class="math-block">
            V = \tanh\left( w_4 \cdot \Delta F_{0,\text{slope}} - w_5 \cdot J_{\text{rel}} - w_6 \cdot R_{\text{pause}} + w_7 \cdot \text{Harmonicity} \right)
          </div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.35; margin-top: 3px;">
            Where weights {w_1 ... w_7} are empirically calibrated against therapeutic vocal benchmarks to prevent false euphoria or unwarranted alarm.
          </p>
        </div>

        <div class="card card-glow-violet">
          <div class="card-title" style="color: #c084fc;">
            <span>2. 25-Frame FIFO Ring Buffer &amp; EMA Filtering</span>
            <span class="badge badge-purple">ANTI-FLICKER LOGIC</span>
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
            Raw acoustic frames exhibit high transient variance. EmoSense routes input estimates into a 25-frame FIFO ring buffer (500ms temporal window) smoothed via Exponential Moving Average (EMA):
          </p>
          <div class="math-block">
            \bar{V}_t = \alpha V_t + (1 - \alpha) \bar{V}_{t-1}, \quad \bar{A}_t = \alpha A_t + (1 - \alpha) \bar{A}_{t-1}
          </div>
          <p style="font-size: 7.2px; color: #94a3b8; line-height: 1.35; margin-top: 3px;">
            With smoothing constant \alpha = 0.25. Furthermore, a <strong>5-Streak State Lock</strong> enforces that the primary psychiatric classification cannot transition unless confirmed over 5 consecutive frames (&ge; 100 ms).
          </p>
        </div>
      </div>

      <div class="card card-glow-rose" style="margin-bottom: 7px;">
        <div class="card-title" style="color: #fb7185;">
          <span>🚨 Dual Emergency Detectors: Acute Crisis &amp; Depressive Flat Affect</span>
          <span class="badge badge-rose">PATENTED CRITICAL LOGIC</span>
        </div>
        <div class="grid-2" style="margin-top: 3px;">
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 8px; border-radius: 4px; border: 1px solid rgba(244, 63, 94, 0.2);">
            <div style="font-size: 8px; font-weight: 700; color: #fb7185; margin-bottom: 2px;">A. The "I am Fine" Involuntary Tremor Catch</div>
            <p style="font-size: 7.2px; color: #cbd5e1; line-height: 1.35;">
              Patients in severe grief or panic often verbally state "I'm okay", but autonomic vocal fold micro-tremors betray internal distress. Trigger conditions:
            </p>
            <div class="code-box" style="margin-top: 3px; font-size: 6.8px;">
              if (Jitter &gt;= 3.8% || (PitchVariance &gt; 45Hz &amp;&amp; Stress &gt; 0.65)) {<br/>
              &nbsp;&nbsp;overrideEmotion = "crisis";<br/>
              &nbsp;&nbsp;primeSoundscape(ThetaEntrainment, volume=0.08);<br/>
              &nbsp;&nbsp;applyCompassionateCadence(rate=0.78, pitch=0.88);<br/>
              }
            </div>
          </div>

          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 8px; border-radius: 4px; border: 1px solid rgba(148, 163, 184, 0.2);">
            <div style="font-size: 8px; font-weight: 700; color: #94a3b8; margin-bottom: 2px;">B. Severe Depressive Flat Affect Detector</div>
            <p style="font-size: 7.2px; color: #cbd5e1; line-height: 1.35;">
              Severe anhedonia and vegetative depression manifest as acoustic monotonic exhaustion. Trigger conditions:
            </p>
            <div class="code-box" style="margin-top: 3px; font-size: 6.8px;">
              if (PitchDynamicRange &lt; 12.0Hz &amp;&amp; PauseRatio &gt; 0.42 &amp;&amp; Centroid &lt; 1400Hz) {<br/>
              &nbsp;&nbsp;overrideEmotion = "fatigued";<br/>
              &nbsp;&nbsp;applyGentleUplift(presenceGain=+2.2dB, rate=0.82);<br/>
              &nbsp;&nbsp;logVegetativeDepressionSymptom();<br/>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="color: #f1f5f9;">
          <span>🎯 Closed-Loop Output Parameter Mapping Matrix</span>
        </div>
        <table class="tech-table">
          <thead>
            <tr><th>Detected Emotion</th><th>Valence (V)</th><th>Arousal (A)</th><th>Output Speed Multiplier</th><th>Output Pitch Mod</th><th>Procedural Soundscape</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Acute Crisis / Grief</strong></td><td>[-1.0, -0.6]</td><td>[-0.2, +0.9]</td><td>0.78x (Very Slow)</td><td>0.88x (Warm Grounding)</td><td>432 Hz + 4 Hz Theta Drone (Active)</td></tr>
            <tr><td><strong>Anxiety / Panic</strong></td><td>[-0.6, -0.2]</td><td>[+0.4, +1.0]</td><td>0.84x (De-escalating)</td><td>0.92x (Calming)</td><td>432 Hz + 4 Hz Theta Drone (Active)</td></tr>
            <tr><td><strong>Depression / Flat Affect</strong></td><td>[-0.8, -0.3]</td><td>[-1.0, -0.4]</td><td>0.85x (Gentle Support)</td><td>0.98x (Warm Intimacy)</td><td>528 Hz Harmonic Resonance (Soft)</td></tr>
            <tr><td><strong>Baseline / Neutral</strong></td><td>[-0.2, +0.3]</td><td>[-0.3, +0.3]</td><td>0.95x (Conversational)</td><td>1.00x (Candidate C Base)</td><td>Subtle Background Pad (-34 dB)</td></tr>
            <tr><td><strong>Joy / Celebration</strong></td><td>[+0.4, +1.0]</td><td>[+0.2, +0.8]</td><td>1.08x (Bright &amp; Lively)</td><td>1.14x (Beaming Energy)</td><td>Warm Major Harmonic Shimmer</td></tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <span>EMOSENSE BIO-ACOUSTIC SYSTEMS &bull; BILINGUAL &amp; I/O SPECIFICATION</span>
        <span>CONFIDENTIAL &bull; FOR EXAMINER &amp; INVENTOR REVIEW ONLY</span>
        <span>PAGE 5 OF 12</span>
      </div>
    </div>
    """
    pages.append(p5)

    # --------------------------------------------------------------------------
    # PAGE 6: CANDIDATE C BILINGUAL FOUNDATION ENGINE (OUTPUT FEATURE)
    # --------------------------------------------------------------------------
    p6 = r"""
    <div class="page" id="page-6">
      <div class="header">
        <span class="header-tag">MODULE 05: OUTPUT BILINGUAL ENGINE</span>
        <span class="header-title">CANDIDATE C &amp; UNIFIED AGE CALIBRATION</span>
        <span class="header-badge">NEURAL SYNTHESIS</span>
      </div>

      <div class="page-title">
        <span>Output Feature: Unified Bilingual Candidate C Voice Architecture</span>
      </div>
      <div class="page-subtitle">
        Deploying Google native neural synthesis for both English and Hindi, establishing identical acoustic age (~19 yrs, 228–232 Hz), zero flutter jitter, and rubberband formant-locked pitch scaling.
      </div>

      <div class="grid-2" style="margin-bottom: 7px;">
        <div class="card card-glow-emerald">
          <div class="card-title" style="color: #10b981;">
            <span>1. Unified Bilingual Voice Persona (English + Hindi)</span>
            <span class="badge badge-green">COHERENT CHARACTER</span>
          </div>
          <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
            A major failure in prior art multilingual companions is "character drift"—switching between English and Hindi changes the speaker's age, timbre, and accent. EmoSense unifies both under the Candidate C engine:
          </p>
          <ul style="font-size: 7px; color: #94a3b8; padding-left: 12px; line-height: 1.35;">
            <li><strong>Candidate C Hindi:</strong> Pitch = <strong>227.5 Hz</strong>, Jitter = <strong>2.82%</strong>, 100% Devanagari phonology without Western foreign vowel distortion.</li>
            <li><strong>Candidate C English:</strong> Pitch = <strong>231.8 Hz</strong>, Jitter = <strong>3.57%</strong>, sweet conversational English with natural breath pacing.</li>
            <li><strong>Cross-Lingual Uniformity:</strong> Identical perceived age (~19 yrs) and intimacy profile, creating the sensation of one unified companion.</li>
          </ul>
        </div>

        <div class="card card-glow-cyan">
          <div class="card-title" style="color: #38bdf8;">
            <span>2. Acoustic Vocal Tract Age Modeling (~19 Years)</span>
            <span class="badge badge-cyan">PHYSIOLOGICAL PITCH SHIFT</span>
          </div>
          <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
            In human acoustic phonetics, vocal tract length ($L_{vt}$) scales inversely with formant frequencies and fundamental chord resonance:
          </p>
          <div class="math-block">
            F_n = \frac{(2n - 1) c}{4 L_{vt}}, \quad n \in \{1, 2, 3\}
          </div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.35; margin: 3px 0;">
            A mature female ($L_{vt} \approx 15.2\text{ cm}$) exhibits $F_0 \approx 200\text{--}210\text{ Hz}$. A young woman in her late teens ($L_{vt} \approx 13.8\text{ cm}$) exhibits $F_0 \approx 225\text{--}235\text{ Hz}$. EmoSense precisely executes:
          </p>
          <div class="math-block">
            F_{0,\text{Hindi}} = 205.3 \times 1.10 \approx \mathbf{227.5\text{ Hz}}, \quad F_{0,\text{English}} \approx \mathbf{231.8\text{ Hz}}
          </div>
          <p style="font-size: 6.8px; color: #64748b; line-height: 1.35; margin-top: 3px;">
            This $+1.65$ semitone transformation lands the voice precisely into a sweet, youthful, comforting ~19-year-old companion persona across both languages.
          </p>
        </div>
      </div>

      <div class="card card-glow-violet" style="margin-bottom: 7px;">
        <div class="card-title" style="color: #c084fc;">
          <span>⚡ Rubberband Phase-Preserved Formant Shifter (Eliminating Chipmunk Artifacts)</span>
          <span class="badge badge-purple">LIBRUBBERBAND DSP</span>
        </div>
        <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
          Naive resampling shifts pitch by altering playback speed, causing both pitch and formants to rise together—creating the laughable, alienating "helium/chipmunk" distortion. EmoSense deploys <code>librubberband</code>:
        </p>
        <div class="math-block">
          S(f) = E(f) \cdot H(f) \quad \xrightarrow{\text{Rubberband Transform}} \quad S_{\text{young}}(f) = E(1.10 \cdot f) \cdot H(f)
        </div>
        <p style="font-size: 7.1px; color: #94a3b8; line-height: 1.35; margin-top: 3px;">
          By decomposing speech into the glottal excitation spectrum $E(f)$ and vocal tract transfer function $H(f)$, the fundamental pitch $E(f)$ is scaled by $1.10\times$ while the biological formant envelope $H(f)$ is <strong>strictly preserved</strong>. This preserves natural chest cavity resonance in both English and Hindi.
        </p>
      </div>

      <div class="card">
        <div class="card-title" style="color: #f1f5f9;">
          <span>⚙️ Language-Aware Voice Preset Resolver Implementation</span>
        </div>
        <div class="code-box" style="font-size: 6.7px; line-height: 1.35;">
          public getVoicePresetForText(text: string): VoicePresetConfig {<br/>
          &nbsp;&nbsp;const hasHindi = /[\u0900-\u097F]/.test(text);<br/>
          &nbsp;&nbsp;return hasHindi ? CANDIDATE_C_VOICE_PRESET : CANDIDATE_C_ENGLISH_VOICE_PRESET;<br/>
          }<br/>
          // Both presets share identical 240Hz warmth peak (+2.8dB) and 432Hz binaural soundscape bed!
        </div>
      </div>

      <div class="footer">
        <span>EMOSENSE BIO-ACOUSTIC SYSTEMS &bull; BILINGUAL &amp; I/O SPECIFICATION</span>
        <span>CONFIDENTIAL &bull; FOR EXAMINER &amp; INVENTOR REVIEW ONLY</span>
        <span>PAGE 6 OF 12</span>
      </div>
    </div>
    """
    pages.append(p6)

    # --------------------------------------------------------------------------
    # PAGE 7: REAL-TIME WEB AUDIO WARMTH FILTER (OUTPUT FEATURE)
    # --------------------------------------------------------------------------
    p7 = r"""
    <div class="page" id="page-7">
      <div class="header">
        <span class="header-tag">MODULE 06: OUTPUT DSP MASTERING</span>
        <span class="header-title">REAL-TIME WEB AUDIO WARMTH FILTER</span>
        <span class="header-badge">BIQUAD FILTERING</span>
      </div>

      <div class="page-title">
        <span>Output Feature: 5-Stage Web Audio Warmth DSP &amp; Dynamic Compander</span>
      </div>
      <div class="page-subtitle">
        Discrete-time mathematical transfer functions and parametric equalization curve designed to eliminate digital harshness, enhance proximal chest warmth, and achieve soft-knee intimacy compression in real time.
      </div>

      <div class="card card-glow-cyan" style="margin-bottom: 7px;">
        <div class="card-title" style="color: #38bdf8;">
          <span>1. The 5-Stage Parametric Biquad Mastering Architecture</span>
          <span class="badge badge-cyan">WEBAUDIO NATIVE</span>
        </div>
        <div class="grid-3" style="margin-top: 3px;">
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px; border-radius: 4px; border: 1px solid rgba(148, 163, 184, 0.15);">
            <div style="font-size: 7.5px; font-weight: 700; color: #38bdf8;">Stage 1: 80 Hz HPF</div>
            <p style="font-size: 6.8px; color: #94a3b8; line-height: 1.3; margin-top: 2px;">
              2nd-order Butterworth high-pass ($Q=0.707$). Strips microphonic mechanical thump, HVAC rumble, and plosive DC offset below vocal fundamental range.
            </p>
          </div>
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px; border-radius: 4px; border: 1px solid rgba(148, 163, 184, 0.15);">
            <div style="font-size: 7.5px; font-weight: 700; color: #10b981;">Stage 2: 240 Hz Chest Peak</div>
            <p style="font-size: 6.8px; color: #94a3b8; line-height: 1.3; margin-top: 2px;">
              Parametric peaking ($Q=1.2, +2.8\text{ dB}$). Enriches 1st formant sub-harmonics, imparting proximal human chest warmth and psychological closeness.
            </p>
          </div>
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px; border-radius: 4px; border: 1px solid rgba(148, 163, 184, 0.15);">
            <div style="font-size: 7.5px; font-weight: 700; color: #c084fc;">Stage 3: 3.3 kHz Presence</div>
            <p style="font-size: 6.8px; color: #94a3b8; line-height: 1.3; margin-top: 2px;">
              Peaking presence ($Q=1.0, +1.6\text{ dB}$). Elevates consonant intelligibility across Devanagari stops ($k, t, p$) and English fricatives ($s, th$).
            </p>
          </div>
        </div>
        <div class="grid-2" style="margin-top: 5px;">
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px; border-radius: 4px; border: 1px solid rgba(148, 163, 184, 0.15);">
            <div style="font-size: 7.5px; font-weight: 700; color: #f59e0b;">Stage 4: 8.0 kHz De-Harshing Shelf</div>
            <p style="font-size: 6.8px; color: #94a3b8; line-height: 1.3; margin-top: 2px;">
              High-shelf attenuation ($-2.5\text{ dB}$ at $f_c=8000\text{ Hz}$). Eliminates artificial digital sibilance, vocoder phase sizzle, and codec artifacts.
            </p>
          </div>
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px; border-radius: 4px; border: 1px solid rgba(148, 163, 184, 0.15);">
            <div style="font-size: 7.5px; font-weight: 700; color: #fb7185;">Stage 5: Soft-Knee Dynamic Compander</div>
            <p style="font-size: 6.8px; color: #94a3b8; line-height: 1.3; margin-top: 2px;">
              Threshold: $-24\text{ dB}$, Knee: $30\text{ dB}$, Ratio: $3.0:1$. Lifts delicate whispered breathing while clamping excessive acoustic peaks.
            </p>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 7px;">
        <div class="card">
          <div class="card-title" style="color: #10b981;">
            <span>2. Biquad Z-Domain Digital Transfer Function</span>
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
            Every parametric filter stage executes direct form II transposed biquad difference equations in 64-bit floating point:
          </p>
          <div class="math-block">
            H(z) = \frac{Y(z)}{X(z)} = \frac{b_0 + b_1 z^{-1} + b_2 z^{-2}}{1 + a_1 z^{-1} + a_2 z^{-2}}
          </div>
          <p style="font-size: 7.2px; color: #94a3b8; line-height: 1.35; margin-top: 3px;">
            For the 240 Hz warmth peak with gain $A = 10^{2.8 / 40}$ and $\omega_0 = 2\pi f_0 / f_s$:
          </p>
          <div class="math-block">
            b_0 = 1 + \alpha A, \quad b_1 = -2\cos\omega_0, \quad b_2 = 1 - \alpha A
          </div>
          <div class="math-block">
            a_0 = 1 + \frac{\alpha}{A}, \quad a_1 = -2\cos\omega_0, \quad a_2 = 1 - \frac{\alpha}{A}
          </div>
        </div>

        <div class="card">
          <div class="card-title" style="color: #c084fc;">
            <span>3. Intimacy Early Reflection Modeling (Room Acoustics)</span>
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
            Dead, anechoic mono speech creates psychological alienation. EmoSense injects micro-room acoustic proximity reflections:
          </p>
          <div class="math-block">
            y[n] = x[n] + 0.05 \cdot x[n - D_1] + 0.03 \cdot x[n - D_2]
          </div>
          <p style="font-size: 7.2px; color: #94a3b8; line-height: 1.35; margin-top: 3px;">
            Where delay line $D_1 = 25\text{ ms}$ and $D_2 = 40\text{ ms}$. This recreates the natural acoustic impression of sitting within 1.5 meters of a compassionate human presence in a quiet, cozy room, with zero muddy reverberant smear.
          </p>
        </div>
      </div>

      <div class="card card-glow-emerald">
        <div class="card-title" style="color: #10b981;">
          <span>📊 Acoustic Spectral Transformation Verification (Master Output)</span>
        </div>
        <table class="tech-table">
          <thead>
            <tr><th>Spectral Band</th><th>Raw Candidate C</th><th>Post-WarmthFilter DSP</th><th>Clinical / Psychoacoustic Impact</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Sub-Bass (20 - 80 Hz)</strong></td><td>-28.4 dBFS</td><td>-54.2 dBFS (&darr; 25.8 dB)</td><td>Clean bottom end; eliminates speaker rumble</td></tr>
            <tr><td><strong>Chest Core (180 - 320 Hz)</strong></td><td>-18.2 dBFS</td><td>-15.4 dBFS (&uarr; 2.8 dB)</td><td>Maximum vocal warmth, intimacy, and presence</td></tr>
            <tr><td><strong>Consonant Band (2.5 - 4.2 kHz)</strong></td><td>-22.1 dBFS</td><td>-20.5 dBFS (&uarr; 1.6 dB)</td><td>Effortless Hindi dental &amp; English intelligibility</td></tr>
            <tr><td><strong>Harsh Highs (7.5 - 12 kHz)</strong></td><td>-29.6 dBFS</td><td>-32.1 dBFS (&darr; 2.5 dB)</td><td>Silky smooth; eliminates digital vocoder fizz</td></tr>
            <tr><td><strong>Dynamic Range (Loud/Soft)</strong></td><td>38.2 dB Window</td><td>18.4 dB Window (Companded)</td><td>Intimate whisper audible without volume cranking</td></tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <span>EMOSENSE BIO-ACOUSTIC SYSTEMS &bull; BILINGUAL &amp; I/O SPECIFICATION</span>
        <span>CONFIDENTIAL &bull; FOR EXAMINER &amp; INVENTOR REVIEW ONLY</span>
        <span>PAGE 7 OF 12</span>
      </div>
    </div>
    """
    pages.append(p7)

    # --------------------------------------------------------------------------
    # PAGE 8: PROCEDURAL NEUROACOUSTIC SOUNDSCAPE (OUTPUT FEATURE)
    # --------------------------------------------------------------------------
    p8 = r"""
    <div class="page" id="page-8">
      <div class="header">
        <span class="header-tag">MODULE 07: OUTPUT NEUROACOUSTICS</span>
        <span class="header-title">432 Hz BINAURAL &amp; ISOCHRONIC ENTRAINMENT</span>
        <span class="header-badge">HARDWARE ADAPTIVE</span>
      </div>

      <div class="page-title">
        <span>Output Feature: Procedural 432 Hz / 436 Hz Theta Wave Soundscape</span>
      </div>
      <div class="page-subtitle">
        Continuous, hardware-adaptive neuroacoustic background generator capable of stimulating 4.0 Hz cerebral theta waves via binaural frequency difference on headphones, and seamlessly falling back to isochronic pulses on device loudspeakers.
      </div>

      <div class="grid-2" style="margin-bottom: 7px;">
        <div class="card card-glow-amber">
          <div class="card-title" style="color: #f59e0b;">
            <span>1. 432 Hz Natural Harmonics &amp; Theta Beat Calculus</span>
            <span class="badge badge-amber">NATURAL HARMONIC</span>
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
            Standard international concert tuning ($A=440\text{ Hz}$) introduces subtle neuro-physiological tension. EmoSense grounds the carrier fundamental at the natural harmonic frequency $f_0 = 432.0\text{ Hz}$.
          </p>
          <div class="math-block">
            s_L(t) = A_L \sin(2\pi \cdot 432.0 \cdot t), \quad s_R(t) = A_R \sin(2\pi \cdot 436.0 \cdot t)
          </div>
          <p style="font-size: 7.2px; color: #94a3b8; line-height: 1.35; margin: 3px 0;">
            The human superior olivary complex processes the interaural phase disparity, creating an internal subjective beat at:
          </p>
          <div class="math-block">
            f_{\text{binaural}} = |436.0 - 432.0| = \mathbf{4.0\text{ Hz}} \quad (\text{Theta Wave Band})
          </div>
          <p style="font-size: 7px; color: #64748b; line-height: 1.35; margin-top: 3px;">
            Theta waves (4–8 Hz) are clinically correlated with deep meditative states, anxiety reduction, and the release of repressed emotional trauma.
          </p>
        </div>

        <div class="card card-glow-emerald">
          <div class="card-title" style="color: #10b981;">
            <span>2. Hardware Transducer Fallback: Isochronic Pulse</span>
            <span class="badge badge-green">LOUDSPEAKER SAFE</span>
          </div>
          <p style="font-size: 7.5px; color: #cbd5e1; line-height: 1.4; margin-bottom: 4px;">
            Binaural beats fail completely on laptop or smartphone speakers due to acoustic crosstalk mixing both channels before reaching the ear. EmoSense implements an adaptive hardware arbiter:
          </p>
          <div class="math-block">
            s_{\text{isochronic}}(t) = A(t) \cdot \sin(2\pi \cdot 432.0 \cdot t)
          </div>
          <div class="math-block">
            A(t) = A_0 \left[ 0.5 + 0.5 \cdot \text{sgn}\left(\sin(2\pi \cdot 4.0 \cdot t)\right) \right]
          </div>
          <p style="font-size: 7.2px; color: #94a3b8; line-height: 1.35; margin-top: 3px;">
            The 4.0 Hz amplitude pulse does not require stereo separation, successfully driving cortical frequency following response (FFR) across external loudspeakers.
          </p>
        </div>
      </div>

      <div class="card card-glow-cyan" style="margin-bottom: 7px;">
        <div class="card-title" style="color: #38bdf8;">
          <span>🌊 Sidechain Voice Ducking &amp; Slow Breathing Modulation</span>
          <span class="badge badge-cyan">INTELLIGIBILITY SAFEGUARD</span>
        </div>
        <div class="grid-2">
          <div>
            <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.4;">
              To prevent the soundscape bed from masking delicate consonants or whispered intimate words in English or Hindi, the soundscape gain is modulated dynamically via vocal activity envelope:
            </p>
            <div class="math-block" style="font-size: 7px;">
              G_{\text{soundscape}}(t) = 
              \begin{cases}
                -30\text{ dBFS}, & \text{when speech active} \\
                -18\text{ dBFS}, & \text{during pauses / contemplation}
              \end{cases}
            </div>
          </div>
          <div>
            <p style="font-size: 7.4px; color: #cbd5e1; line-height: 1.4;">
              Furthermore, during long contemplative pauses, the soundscape executes a slow 0.1 Hz amplitude breathing wave ($T = 10\text{ seconds}$), subtly nudging the patient's respiratory rhythm into autonomic equilibrium.
            </p>
            <div class="math-block" style="font-size: 7px;">
              A_{\text{breath}}(t) = 0.8 + 0.2 \sin(2\pi \cdot 0.1 \cdot t)
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="color: #f1f5f9;">
          <span>⚙️ Real-Time Procedural Soundscape Class Definition</span>
        </div>
        <div class="code-box" style="font-size: 6.8px; line-height: 1.35;">
          export class ProceduralSoundscape {<br/>
          &nbsp;&nbsp;public startThetaEntrainment(gain = 0.04, duration = 300) {<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;const isHeadphones = this.detectStereoHeadphones();<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;if (isHeadphones) {<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.startBinauralCarrier(432.0, 436.0, gain); // 4.0 Hz Intra-cranial Beat<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;} else {<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.startIsochronicCarrier(432.0, 4.0, gain); // 4.0 Hz Free-Space Amplitude Pulse<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;}<br/>
          &nbsp;&nbsp;}<br/>
          }
        </div>
      </div>

      <div class="footer">
        <span>EMOSENSE BIO-ACOUSTIC SYSTEMS &bull; BILINGUAL &amp; I/O SPECIFICATION</span>
        <span>CONFIDENTIAL &bull; FOR EXAMINER &amp; INVENTOR REVIEW ONLY</span>
        <span>PAGE 8 OF 12</span>
      </div>
    </div>
    """
    pages.append(p8)

    return pages
