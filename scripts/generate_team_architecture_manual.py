# ==============================================================================
# EmoSense 2D Humanoid Avatar Studio — Team Architecture & Code Manual Generator
# Assembles 16 comprehensive pages with source code, diagrams, and live screenshots.
# ==============================================================================

import os
import sys
import base64
import html

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
os.makedirs(DIST_DIR, exist_ok=True)

def read_file_safe(rel_path):
    p = os.path.join(ROOT_DIR, rel_path)
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    return ""

def img_to_base64(rel_path):
    p = os.path.join(ROOT_DIR, rel_path)
    if os.path.exists(p):
        with open(p, 'rb') as f:
            data = base64.b64encode(f.read()).decode('utf-8')
            ext = os.path.splitext(p)[1].lower().replace('.', '')
            if ext == 'jpg': ext = 'jpeg'
            return f"data:image/{ext};base64,{data}"
    return ""

def esc(text):
    return html.escape(text)

# Read source files
chetana_stage_src = read_file_safe('src/components/ChetanaMasterAnimeStage.tsx')
kinematics_src = read_file_safe('src/lib/therapistKinematicsEngine.ts')
viseme_src = read_file_safe('src/lib/visemeEngine.ts')
mediapipe_src = read_file_safe('src/lib/faceTrackingMediaPipe.ts')
app_src = read_file_safe('src/App.tsx')
controls_src = read_file_safe('src/components/ControlsPanel.tsx')

# Read screenshots
img_idle = img_to_base64('public/poses/master_live_01_idle_neutral.png')
img_namaste = img_to_base64('public/poses/master_live_02_namaste_happy.png')
img_wave = img_to_base64('public/poses/master_live_03_wave_sad.png')
img_chin = img_to_base64('public/poses/master_live_04_chin_rest_empathy.png')
img_heart = img_to_base64('public/poses/master_live_05_heart_tense.png')

print(f"Loaded assets. Generating 16-page HTML manual...")

css_styles = """
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

@page {
  size: A4 portrait;
  margin: 0;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  background: #060913;
  color: #f1f5f9;
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page {
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  padding: 9.5mm 13mm 8.5mm 13mm;
  page-break-after: always;
  page-break-inside: avoid;
  position: relative;
  background: #070a14 radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.08) 0%, rgba(7, 10, 20, 1) 70%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  margin-bottom: 7px;
}
.header-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  color: #38bdf8;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  font-weight: 700;
}
.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 8.5px;
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
}
.footer {
  margin-top: auto;
  padding-top: 5px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 8px;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}
.footer-badge {
  color: #10b981;
  font-weight: 600;
}
.title-banner {
  margin-bottom: 8px;
}
.title-banner h1 {
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.4px;
  margin-bottom: 2px;
}
.title-banner h2 {
  font-size: 10.5px;
  font-weight: 600;
  color: #38bdf8;
  margin-bottom: 3px;
}
.title-banner p {
  font-size: 9px;
  color: #94a3b8;
  line-height: 1.35;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}
.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}
.grid-4 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 6px;
}
.card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 5px;
  padding: 7px 9px;
  position: relative;
}
.card.accent-cyan { border-left: 3px solid #38bdf8; }
.card.accent-purple { border-left: 3px solid #a855f7; }
.card.accent-emerald { border-left: 3px solid #10b981; }
.card.accent-amber { border-left: 3px solid #f59e0b; }
.card.accent-rose { border-left: 3px solid #f43f5e; }

.card-title {
  font-size: 9.5px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.card-p {
  font-size: 8.5px;
  color: #cbd5e1;
  line-height: 1.32;
}
.code-container {
  background: #040711;
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 5px;
  padding: 6px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.2px;
  line-height: 1.25;
  color: #e2e8f0;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
}
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.9);
  padding: 3px 7px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 5px 5px 0 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.8px;
  color: #38bdf8;
  font-weight: 700;
}
table.tech-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
  margin-top: 3px;
}
table.tech-table th {
  background: rgba(30, 41, 59, 0.85);
  color: #38bdf8;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  text-align: left;
  padding: 3.5px 5px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}
table.tech-table td {
  padding: 3.5px 5px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.6);
}
.img-box {
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 5px;
  overflow: hidden;
  background: #030712;
}
.img-box img {
  width: 100%;
  height: auto;
  display: block;
}
.badge-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #38bdf8;
  color: #040711;
  font-weight: 800;
  font-size: 8.5px;
  font-family: 'JetBrains Mono', monospace;
  margin-right: 4px;
}
</style>
"""

pages_html = []

# PAGE 1: COVER & EXECUTIVE SUMMARY
pages_html.append(f"""
<div class="page" id="page-1">
  <div class="header">
    <div class="header-tag">EMOSENSE PLATFORM ARCHITECTURE · VOL. 2D-AVATAR</div>
    <div class="header-right"><span>CONFIDENTIAL TEAM DOSSIER</span><span>DOC-ID: EMS-2D-01</span></div>
  </div>
  <div class="title-banner">
    <h1>Chetana Sharma · 2D Humanoid Avatar Studio</h1>
    <h2>Master Technical Architecture, Component Specifications, and Full Code Implementation Guide</h2>
    <p>A comprehensive engineering manual for internal team members detailing the 60 FPS HTML5 Canvas pipeline, biomechanical and psychological acting kinematics, Web Audio FFT viseme analysis, MediaPipe 3D face tracking, and full source code to enable independent development and extension.</p>
  </div>

  <div class="grid-2" style="margin-bottom: 8px;">
    <div class="card accent-cyan">
      <div class="card-title">✨ Primary Architectural Vision</div>
      <div class="card-p">Chetana Sharma is a production-grade 2D anime-stylized AI therapist avatar running natively in the browser without heavyweight 3D dependencies. Combining Kyoto Animation / Demon Slayer visual excellence with clinical psychological acting principles, she exhibits slow diaphragmatic respiration (4.5s), Poisson non-linear blinking, 3-axis cervical spine kinematics, and real-time 15-Oculus speech lip-sync.</div>
    </div>
    <div class="card accent-emerald">
      <div class="card-title">🛡️ Core Technical Specifications</div>
      <table class="tech-table">
        <tr><th>Engine Dimension</th><th>Specification & Standards</th></tr>
        <tr><td>Canvas Viewport</td><td>1200 x 900 Hardware-Accelerated 2D Context (60 FPS)</td></tr>
        <tr><td>Frontend Framework</td><td>React 19, TypeScript 5.7, Vite 6.2 Bundler</td></tr>
        <tr><td>Kinematics Model</td><td>3-Axis Thoracic Pivot (Pitch Up/Down, Depth Scale Z, Roll/Yaw)</td></tr>
        <tr><td>Audio Processing</td><td>Web Audio API AnalyserNode (128-band FFT Formant Engine)</td></tr>
        <tr><td>Face Mesh Driver</td><td>MediaPipe 478 3D Facial Landmarks with Geometric PnP</td></tr>
      </table>
    </div>
  </div>

  <div class="card accent-purple" style="margin-bottom: 8px;">
    <div class="card-title">🧩 End-to-End System Dataflow Pipeline</div>
    <div class="card-p" style="font-family: 'JetBrains Mono', monospace; font-size: 7.8px; line-height: 1.45;">
      [Client Micro-Interactions] ──► [Mouse / Touch Gaze Tracker] ──┐<br>
      [Webcam Video Stream]      ──► [MediaPipe 478 Face Mesh]   ──┼──► [TherapistKinematicsEngine (60 FPS)]<br>
      [Bilingual Neural Audio]   ──► [Web Audio 128-Band FFT]     ──┤      │ (Yaw, Pitch, Roll, DepthScale, Respiration)<br>
      [User UI Controls / Hotkeys] ──► [Studio State Orchestrator] ─┘      ▼<br>
                                                                 [ChetanaMasterAnimeStage (1200x900)]<br>
                                                                 ├─ Layer 0: Background Parallax (1220x920)<br>
                                                                 ├─ Layer 1: Radial Emotional Mood Aura & Flames<br>
                                                                 ├─ Layer 2: Silhouette Corona Rim Bloom<br>
                                                                 ├─ Layer 3: Master Cel Node (Poses, Breathing, Blinks, Visemes)<br>
                                                                 ├─ Layer 5: Grounded Mahogany Desk & Clinical Notepad<br>
                                                                 └─ Layer 6-8: Particle Engine & Star Glints
    </div>
  </div>

  <div class="grid-3">
    <div class="card accent-amber">
      <div class="card-title">🧘 5 Full-Body Mudras</div>
      <div class="card-p">Living Desk Idle, Namaste Bow, Executive Wave, Thoughtful Listen (Chin Rest), and Hand to Heart rendered as cohesive 1200x900 non-severed cels.</div>
    </div>
    <div class="card accent-rose">
      <div class="card-title">🎭 7 Seamless Emotions</div>
      <div class="card-p">Neutral, Happy, Calm, Empathy, Sadness, Stress De-escalation, and Surprised overlaid via clean difference masks with 0% cutout artifacts.</div>
    </div>
    <div class="card accent-cyan">
      <div class="card-title">🎙️ Bilingual Audio Engine</div>
      <div class="card-p">5-minute Candidate C masterpiece audio with real-time FFT spectrum viseme lip-sync and 3-chapter therapeutic progression.</div>
    </div>
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 01 / 16 · ARCHITECTURAL SUMMARY</span>
  </div>
</div>
""")

# PAGE 2: REPOSITORY DIRECTORY TREE & TECH STACK
pages_html.append(f"""
<div class="page" id="page-2">
  <div class="header">
    <div class="header-tag">SYSTEM STRUCTURE · REPOSITORY LAYOUT</div>
    <div class="header-right"><span>MODULE TREE</span><span>DOC-ID: EMS-2D-02</span></div>
  </div>
  <div class="title-banner">
    <h1>Repository Layout & Engineering Subsystems</h1>
    <h2>Modular Breakdown of Components, Libraries, Audio, and Asset Directories</h2>
  </div>

  <div class="grid-2" style="flex: 1; gap: 8px;">
    <div class="card accent-cyan" style="display: flex; flex-direction: column;">
      <div class="card-title">📁 Complete Project Directory Tree</div>
      <div class="code-container" style="font-size: 7.2px; line-height: 1.25;">
2d model/
├── package.json               # Dependencies (React 19, Pixi, GSAP, Lucide, Puppeteer)
├── tsconfig.json              # TypeScript 5.7 Bundler Settings
├── vite.config.ts             # Vite 6 Dev & Build Pipeline
├── index.html                 # App Mount DOM
├── public/
│   ├── audio/
│   │   └── EMOSENSE_BILINGUAL_MASTER_VOICE_5MIN.mp3  # 5-Min 432Hz Neural Voice
│   └── poses/
│       ├── stage_bg_chair.jpg                       # Executive Chair Office BG
│       ├── stage_fg_desk.png                        # Mahogany Foreground Desk
│       ├── stage_cel_breath_0..3.png                # Diaphragmatic Breath Cels
│       ├── stage_cel_pose_namaste.png               # Full-Body Namaste Bow
│       ├── stage_cel_pose_wave.png                  # Full-Body Executive Wave
│       ├── stage_cel_pose_chin_rest.png             # Full-Body Thoughtful Listen
│       ├── stage_cel_pose_empathy.png               # Full-Body Hand to Heart
│       ├── clean_expression_[happy|sad|calm..].png  # 0% Cutout Facial Overlays
│       ├── stage_character_blink.png                # Kyoto Closed Eyelids
│       └── stage_character_mouth_[half|ah|oh|ee].png# Speech Viseme Cels
├── src/
│   ├── App.tsx                                      # Root State Orchestrator
│   ├── main.tsx                                     # React 19 Entrypoint
│   ├── components/
│   │   ├── ChetanaMasterAnimeStage.tsx               # 60 FPS Master Canvas Stage
│   │   ├── ControlsPanel.tsx                        # Studio Control Sidebar
│   │   ├── WebcamTrackingModal.tsx                  # MediaPipe Video Inspector
│   │   └── IntegrationGuideModal.tsx                # Technical Blueprint Modal
│   └── lib/
│       ├── therapistKinematicsEngine.ts             # Biomechanics & Acting Math
│       ├── animeKinematicsSystem.ts                 # Two-Bone IK, Springs & Verlet
│       ├── visemeEngine.ts                          # Web Audio FFT Analyser
│       ├── speechService.ts                         # Speech Synthesis & Audio
│       ├── faceTrackingMediaPipe.ts                 # 478 3D Landmark Tracking
│       └── avatarTypes.ts                           # Global Type Definitions
      </div>
    </div>

    <div class="card accent-emerald" style="display: flex; flex-direction: column;">
      <div class="card-title">⚙️ Technological Stack & Package Dependencies</div>
      <table class="tech-table">
        <tr><th>Package / Tool</th><th>Version</th><th>Role & Architectural Purpose</th></tr>
        <tr><td><strong>react / react-dom</strong></td><td>^19.0.0</td><td>Reactive state tree, concurrent rendering, and UI dispatch</td></tr>
        <tr><td><strong>typescript</strong></td><td>^5.7.3</td><td>Strict type safety across kinematic frames and visemes</td></tr>
        <tr><td><strong>vite</strong></td><td>^6.2.0</td><td>Instant HMR development server and optimized Rollup bundler</td></tr>
        <tr><td><strong>gsap</strong></td><td>^3.15.0</td><td>Micro-timing easeOutBack curves and stepped anime tweens</td></tr>
        <tr><td><strong>lucide-react</strong></td><td>^1.16.0</td><td>Clean iconography for studio control panel buttons</td></tr>
        <tr><td><strong>puppeteer</strong></td><td>^25.12.0</td><td>Headless browser automation for test screenshots & PDF</td></tr>
        <tr><td><strong>ffmpeg-static</strong></td><td>^5.2.0</td><td>Binary for direct H.264 MP4 screencast encoding</td></tr>
        <tr><td><strong>Web Audio API</strong></td><td>Native</td><td>Real-time FFT audio spectrum analysis & Oculus visemes</td></tr>
        <tr><td><strong>MediaPipe Tasks</strong></td><td>0.10.x</td><td>In-browser real-time 478 3D landmark geometric face mesh</td></tr>
      </table>
      <div class="card-title" style="margin-top: 8px;">🚀 Quick Commands for New Team Members</div>
      <div class="code-container" style="font-size: 7.2px;">
# 1. Install dependencies
npm install

# 2. Start Vite development server (Port 5174)
npm run dev

# 3. Compile TypeScript & bundle production build
npm run build
      </div>
    </div>
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 02 / 16 · DIRECTORY & DEPENDENCY BLUEPRINT</span>
  </div>
</div>
""")

# PAGE 3: VISUAL COMPONENT MANUAL (Annotated Live UI Breakdown)
pages_html.append(f"""
<div class="page" id="page-3">
  <div class="header">
    <div class="header-tag">VISUAL MANUAL · USER INTERFACE BREAKDOWN</div>
    <div class="header-right"><span>ANNOTATED UI GUIDE</span><span>DOC-ID: EMS-2D-03</span></div>
  </div>
  <div class="title-banner">
    <h1>Visual Component Manual & Studio Interface Breakdown</h1>
    <h2>Operational Callouts for the Master Viewport, Telemetry, Controls, and Kinematics</h2>
  </div>

  <div class="img-box" style="margin-bottom: 7px; max-height: 130mm;">
    <img src="{img_idle}" alt="Annotated Studio UI" style="max-height: 130mm; object-fit: contain;" />
  </div>

  <table class="tech-table">
    <tr><th>ID</th><th>Subsystem Component</th><th>Operational Trigger & Function</th><th>Technical File / Handler</th></tr>
    <tr><td><span class="badge-num">1</span></td><td>4:3 Master Stage Viewport</td><td>Renders 1200x900 60 FPS hardware canvas with parallax, character cel, and desk</td><td><code>ChetanaMasterAnimeStage.tsx</code> (Canvas 2D)</td></tr>
    <tr><td><span class="badge-num">2</span></td><td>Floating Telemetry HUD</td><td>Displays real-time FPS counter, active emotion aura, motion label, camera, and head yaw/pitch/roll</td><td><code>stageFps, headPose</code> state hooks</td></tr>
    <tr><td><span class="badge-num">3</span></td><td>Therapist Acting Quick Bar</td><td>Triggers Double Nod, Empathy Dip, Notes Glance, Curious Tilt, Reassuring Shake, and Auto-Nods</td><td><code>globalTherapistKinematics.triggerGesture()</code></td></tr>
    <tr><td><span class="badge-num">4</span></td><td>Cinematic Camera Presets</td><td>Transitions smoothly across Wide (0.90x), Medium (1.00x), Close-Up (1.26x with DOF), and Desk (1.16x)</td><td><code>CAMERA_CONFIGS</code> lerp interpolation</td></tr>
    <tr><td><span class="badge-num">5</span></td><td>Atmosphere Selector</td><td>Swaps background environment (Executive Office, Wisteria Night, Solar Sunset, Kyoto Rain)</td><td><code>imgs.bgs[atmosphere]</code> with 3D parallax</td></tr>
    <tr><td><span class="badge-num">6</span></td><td>Full-Body Mudras & Poses</td><td>Swaps active full-body anatomical cel (Namaste Bow, Executive Wave, Thoughtful Listen, Heart)</td><td><code>imgs.poses[gesture]</code> with stepped cross-fade</td></tr>
    <tr><td><span class="badge-num">7</span></td><td>Emotion & Aura Palette</td><td>Applies 0% cutout facial expression overlays and alters radial volumetric screen radiance</td><td><code>imgs.expressions[emotion]</code> difference masks</td></tr>
    <tr><td><span class="badge-num">8</span></td><td>Candidate C Audio Player</td><td>Streams 5-min bilingual neural audio; feeds Web Audio Analyser for 15-Oculus lip-sync</td><td><code>globalVisemeEngine.connectAudioElement()</code></td></tr>
  </table>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 03 / 16 · LIVE COMPONENT BREAKDOWN</span>
  </div>
</div>
""")

# PAGE 4: VISUAL GALLERY OF FULL-BODY POSES
pages_html.append(f"""
<div class="page" id="page-4">
  <div class="header">
    <div class="header-tag">ANATOMICAL SPECIFICATIONS · FULL-BODY MUDRAS</div>
    <div class="header-right"><span>POSE GALLERY</span><span>DOC-ID: EMS-2D-04</span></div>
  </div>
  <div class="title-banner">
    <h1>Visual Gallery: Authentic Full-Body Gestures</h1>
    <h2>100% Contiguous Anatomical Cels: Eliminating Cardboard Cutouts & Seams</h2>
  </div>

  <div class="grid-2" style="margin-bottom: 7px;">
    <div class="card">
      <div class="card-title">🙏 Namaste Bow (Anjali Mudra)</div>
      <div class="img-box" style="margin-bottom: 4px;">
        <img src="{img_namaste}" alt="Namaste Bow" style="max-height: 52mm; object-fit: contain;" />
      </div>
      <div class="card-p">Hands joined at chest level in prayer mudra, embellished with traditional gold bangles. Fully contiguous with navy suit sleeves and collarbone.</div>
    </div>
    <div class="card">
      <div class="card-title">👋 Executive Welcoming Wave</div>
      <div class="img-box" style="margin-bottom: 4px;">
        <img src="{img_wave}" alt="Executive Wave" style="max-height: 52mm; object-fit: contain;" />
      </div>
      <div class="card-p">Right hand raised in open executive greeting with forearm angled naturally. Zero floating wrists or severed sleeves.</div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom: 7px;">
    <div class="card">
      <div class="card-title">🤔 Thoughtful Listen (Chin Rest)</div>
      <div class="img-box" style="margin-bottom: 4px;">
        <img src="{img_chin}" alt="Thoughtful Listen" style="max-height: 52mm; object-fit: contain;" />
      </div>
      <div class="card-p">Attentive hand resting thoughtfully under chin. Forearm resting comfortably near desk line. Seamless integration with jawline.</div>
    </div>
    <div class="card">
      <div class="card-title">💖 Hand to Heart (Empathetic Respiration)</div>
      <div class="img-box" style="margin-bottom: 4px;">
        <img src="{img_heart}" alt="Hand to Heart" style="max-height: 52mm; object-fit: contain;" />
      </div>
      <div class="card-p">Palm placed gently over center of chest during compassionate deep breathing. Demonstrates clinical validation posture.</div>
    </div>
  </div>

  <div class="card accent-emerald">
    <div class="card-title">🛡️ Critical Cel Rule for New Poses</div>
    <div class="card-p">Always render each pose as a <strong>complete 1200x900 PNG</strong> containing the head, torso, arms, and chair back. Never crop severed hands or forearms to paste over a static body. Full cels guarantee zero seams, natural shadows, and unified lighting across all clothing fabrics.</div>
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 04 / 16 · FULL-BODY POSE SPECIFICATIONS</span>
  </div>
</div>
""")

# PAGE 5: RENDERING PIPELINE ARCHITECTURE (ChetanaMasterAnimeStage.tsx)
pages_html.append(f"""
<div class="page" id="page-5">
  <div class="header">
    <div class="header-tag">RENDERING ENGINE · 60 FPS PIPELINE SPECIFICATION</div>
    <div class="header-right"><span>CANVAS COMPOSITING</span><span>DOC-ID: EMS-2D-05</span></div>
  </div>
  <div class="title-banner">
    <h1>The 9-Layer Canvas Compositing Pipeline</h1>
    <h2>Layer Order, Alpha Blending, 3D Kinematics Transforms, and Parallax Dynamics</h2>
  </div>

  <div class="card accent-cyan" style="margin-bottom: 8px;">
    <div class="card-title">🎨 Canvas Layer Composition Architecture (1200 x 900 Hardware Context)</div>
    <table class="tech-table">
      <tr><th>Layer Index</th><th>Compositing Pass</th><th>Blend Mode & Filter</th><th>Description & Anatomic Role</th></tr>
      <tr><td><strong>Layer 0</strong></td><td>Background Atmosphere</td><td><code>source-over</code>, Alpha 1.0</td><td>1220x920 environment image shifted by inverted gaze parallax (<code>parallaxBgX, parallaxBgY</code>).</td></tr>
      <tr><td><strong>Layer 1</strong></td><td>Emotion Mood Aura & Flames</td><td><code>screen</code>, Alpha 0.15 - 0.60</td><td>Radial gradient flare keyed to active emotion accent + 32 animated rising flame particles.</td></tr>
      <tr><td><strong>Layer 2</strong></td><td>Silhouette Corona Rim Bloom</td><td><code>screen</code>, 36px shadowBlur</td><td>Traces character silhouette in glowing emotion aura, transformed by active kinematics matrix.</td></tr>
      <tr><td><strong>Layer 3</strong></td><td>Master Character Cel Node</td><td><code>source-over</code>, Alpha 1.0</td><td>Unified anatomical pose cel with diaphragmatic breathing interpolation across in-betweens.</td></tr>
      <tr><td><strong>Layer 3B</strong></td><td>Clean Expression Overlay</td><td><code>source-over</code>, Alpha 0.95</td><td>Precision difference-masked eye curves, eyebrows, mouth line, and gentle blush (0% cutout seams).</td></tr>
      <tr><td><strong>Layer 3C</strong></td><td>Kyoto Organic Blink</td><td><code>source-over</code>, Non-linear</td><td>Authentic closed anime eyelids drawn at <code>(0,0)</code> during Poisson blink triggers (zero smudges).</td></tr>
      <tr><td><strong>Layer 3D</strong></td><td>5-Viseme Speech Lip-Sync</td><td><code>source-over</code>, Alpha 1.0</td><td>Anime mouth shapes (<code>half, ah, oh, ee</code>) pinned to lips during active speech audio frames.</td></tr>
      <tr><td><strong>Layer 3E</strong></td><td>Specular Star Glints</td><td><code>screen</code>, 20px blur</td><td>4-point anime sparkle stars rendered over golden Jhumka earrings and bangles during head motion.</td></tr>
      <tr><td><strong>Layer 5</strong></td><td>Foreground Executive Desk</td><td><code>source-over</code>, DOF Blur</td><td>Mahogany desk with laptop and consultation notepad (<code>stage_fg_desk.png</code>) with forward 3D parallax.</td></tr>
      <tr><td><strong>Layer 6-8</strong></td><td>Particle Engine & Impact Flash</td><td><code>screen</code>, Multi-mode</td><td>Atmospheric particles (petals, rain, embers) and Ufotable 1-frame emotion impact bloom flashes.</td></tr>
    </table>
  </div>

  <div class="grid-2">
    <div class="card accent-purple">
      <div class="card-title">📐 Camera Parallax Formulation</div>
      <div class="card-p">To create authentic depth perception, gaze target $(x, y) \\in [-1, 1]$ drives inverse background translation and forward foreground translation:
      <br><br>
      <code>parallaxBgX = currentGaze.x * -7.0px;</code><br>
      <code>parallaxBgY = currentGaze.y * -4.5px;</code><br>
      <code>parallaxDeskX = currentGaze.x * 11.0px;</code><br>
      <code>parallaxDeskY = currentGaze.y * 5.0px;</code>
      </div>
    </div>
    <div class="card accent-emerald">
      <div class="card-title">⏱️ Stepped Anime Cross-Fading</div>
      <div class="card-p">Pose and emotion changes do not use slow linear cross-dissolves, which cause ghosting in traditional cel animation. Instead, a snappy stepped ease-out curve advances transition progress <code>prog += 0.09</code> per frame (approx. 11 frames / 180ms), mimicking genuine anime acting on twos.</div>
    </div>
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 05 / 16 · RENDERING PIPELINE SPECIFICATION</span>
  </div>
</div>
""")

# Slices of ChetanaMasterAnimeStage.tsx for Pages 6-8
stage_lines = chetana_stage_src.splitlines()

def get_slice(start, end):
    return esc("\n".join(stage_lines[start-1:end]))

# PAGE 6: ChetanaMasterAnimeStage.tsx CODE PART 1
code_p6 = get_slice(50, 155)
pages_html.append(f"""
<div class="page" id="page-6">
  <div class="header">
    <div class="header-tag">SOURCE CODE · ChetanaMasterAnimeStage.tsx (PART 1)</div>
    <div class="header-right"><span>TYPES & ASSET PRELOADER</span><span>DOC-ID: EMS-2D-06</span></div>
  </div>
  <div class="title-banner">
    <h1>ChetanaMasterAnimeStage.tsx: Configuration & Asset Preloading</h1>
    <h2>Camera Presets, Master Asset Mapping, and Component Props</h2>
  </div>

  <div class="code-header">
    <span>src/components/ChetanaMasterAnimeStage.tsx (Lines 50–155)</span>
    <span>TypeScript / React 19</span>
  </div>
  <div class="code-container">
{code_p6}
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 06 / 16 · COMPONENT SETUP CODE</span>
  </div>
</div>
""")

# PAGE 7: ChetanaMasterAnimeStage.tsx CODE PART 2
code_p7 = get_slice(260, 375)
pages_html.append(f"""
<div class="page" id="page-7">
  <div class="header">
    <div class="header-tag">SOURCE CODE · ChetanaMasterAnimeStage.tsx (PART 2)</div>
    <div class="header-right"><span>IMAGE PRELOADER & BLINK LOOP</span><span>DOC-ID: EMS-2D-07</span></div>
  </div>
  <div class="title-banner">
    <h1>ChetanaMasterAnimeStage.tsx: Asset Preload Loop & Kyoto Blink Cycle</h1>
    <h2>Parallel Image Loading, Rising Aura Particles, and 120ms Non-Linear Blinking</h2>
  </div>

  <div class="code-header">
    <span>src/components/ChetanaMasterAnimeStage.tsx (Lines 260–375)</span>
    <span>TypeScript / React 19</span>
  </div>
  <div class="code-container">
{code_p7}
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 07 / 16 · PRELOADING & BLINK CYCLES</span>
  </div>
</div>
""")

# PAGE 8: ChetanaMasterAnimeStage.tsx CODE PART 3
code_p8 = get_slice(624, 755)
pages_html.append(f"""
<div class="page" id="page-8">
  <div class="header">
    <div class="header-tag">SOURCE CODE · ChetanaMasterAnimeStage.tsx (PART 3)</div>
    <div class="header-right"><span>MASTER CANVAS RENDER LOOP</span><span>DOC-ID: EMS-2D-08</span></div>
  </div>
  <div class="title-banner">
    <h1>ChetanaMasterAnimeStage.tsx: Master Cel & Kinematics Node</h1>
    <h2>3D Cervical Matrix, Breathing In-Betweens, Expressions, and Speech Lips</h2>
  </div>

  <div class="code-header">
    <span>src/components/ChetanaMasterAnimeStage.tsx (Lines 624–755)</span>
    <span>TypeScript / React 19</span>
  </div>
  <div class="code-container">
{code_p8}
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 08 / 16 · 60 FPS MASTER CANVAS RENDER LOOP</span>
  </div>
</div>
""")

# PAGE 9: KINEMATICS ENGINE PRINCIPLES (therapistKinematicsEngine.ts)
pages_html.append("""
<div class="page" id="page-9">
  <div class="header">
    <div class="header-tag">BIOMECHANICS & ACTING · MATHEMATICAL FORMULATIONS</div>
    <div class="header-right"><span>KINEMATICS THEORY</span><span>DOC-ID: EMS-2D-09</span></div>
  </div>
  <div class="title-banner">
    <h1>Biomechanical & Psychological Kinematics Theory</h1>
    <h2>Mathematical Foundations of Therapist Acting, Respiration, Blinking & Springs</h2>
  </div>

  <div class="grid-2" style="margin-bottom: 7px;">
    <div class="card accent-cyan">
      <div class="card-title">🫁 1. Diaphragmatic Respiration (T = 4.5s)</div>
      <div class="card-p">In therapeutic consultation, calm breathing regulates client autonomic arousal. Chest lift and shoulder phase lag are computed continuously:
      <br><br>
      $$\\omega = \\frac{2\\pi}{4.5}, \\quad y_{\\text{chest}}(t) = -A \\sin(\\omega t)$$
      $$y_{\\text{shoulder}}(t) = -0.55 A \\sin(\\omega t - 0.40)$$
      Torso expands subtly: $S_y = 1 + 0.015 \\sin(\\omega t), \\ S_x = 1 + 0.006 \\sin(\\omega t)$.
      </div>
    </div>
    <div class="card accent-emerald">
      <div class="card-title">👁️ 2. Poisson Exponential Blinking</div>
      <div class="card-p">Deterministic periodic blinking looks robotic. Human blinking follows an exponential Poisson process with mean $\\mu = 4.0\\text{s}$:
      <br><br>
      $$\\Delta t_{\\text{next}} = -\\mu \\ln(1 - U), \\quad U \\sim \\text{Uniform}(0, 0.98)$$
      Blink duration: 3 frames (45ms) fast snap close, 5 frames (85ms) ease open. Features 18% probability of double-blinks during attentive listening.
      </div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom: 7px;">
    <div class="card accent-amber">
      <div class="card-title">🦴 3. 3-Axis Cervical Spine Mechanics</div>
      <div class="card-p">Head motion articulates organically from the atlanto-occipital and C1-C7 cervical joints:
      <br><br>
      • <strong>Up & Down:</strong> Vertical pitch dip + cervical arch + breathing lift:<br>
      <code>cervicalTransY = (pitch * 1.65 + (1 - cos(roll)) * 8 + chestLiftY * 0.75)</code><br>
      • <strong>Front & Back:</strong> 3D depth foreshortening scale:<br>
      <code>depthScale = 1.0 + (pitch * 0.0035 + breathPhase * 0.008)</code><br>
      • <strong>Side to Side:</strong> Lateral shift + roll tilt + yaw skew:<br>
      <code>cervicalTransX = sin(roll) * 18.0 + sin(yaw) * 16.0</code>
      </div>
    </div>
    <div class="card accent-purple">
      <div class="card-title">✨ 4. Semi-Implicit Spring-Damper Earrings</div>
      <div class="card-p">Golden Jhumka earrings swing with head movement under secondary physics:
      <br><br>
      $$\\ddot{\\theta} + 2\\zeta\\omega\\dot{\\theta} + \\omega^2\\theta = F_{\\text{inertia}}$$
      Tuned for tranquil therapist elegance with low stiffness ($k=95$) and high damping ($c=0.82$). Inertia driven by angular velocities:
      <code>F = dRoll * 2.8 + dYaw * 2.0 + |dPitch| * 1.6</code>.
      </div>
    </div>
  </div>

  <div class="card accent-rose">
    <div class="card-title">💖 5. Therapeutic Listening Nod Dynamics</div>
    <div class="card-p">Affirmation nods utilize an <code>easeOutBack</code> overshoot on the dip phase ($p < 0.45$), followed by a gentle <code>easeInOutSine</code> recovery back to neutral. Autonomous nods trigger every 4.0–7.5s during listening.</div>
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 09 / 16 · KINEMATICS THEORY & MATHEMATICAL MODELS</span>
  </div>
</div>
""")

# Slices of therapistKinematicsEngine.ts for Pages 10-11
kin_lines = kinematics_src.splitlines()

def get_kin_slice(start, end):
    return esc("\n".join(kin_lines[start-1:end]))

# PAGE 10: therapistKinematicsEngine.ts CODE PART 1
code_p10 = get_kin_slice(40, 160)
pages_html.append(f"""
<div class="page" id="page-10">
  <div class="header">
    <div class="header-tag">SOURCE CODE · therapistKinematicsEngine.ts (PART 1)</div>
    <div class="header-right"><span>INTERFACES & TIMERS</span><span>DOC-ID: EMS-2D-10</span></div>
  </div>
  <div class="title-banner">
    <h1>therapistKinematicsEngine.ts: Frame Interface & Internal Timers</h1>
    <h2>Pose Frame Definition, Gesture Actions, and Gaze Tracking Setup</h2>
  </div>

  <div class="code-header">
    <span>src/lib/therapistKinematicsEngine.ts (Lines 40–160)</span>
    <span>TypeScript</span>
  </div>
  <div class="code-container">
{code_p10}
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 10 / 16 · KINEMATICS FRAME DEFINITION</span>
  </div>
</div>
""")

# PAGE 11: therapistKinematicsEngine.ts CODE PART 2
code_p11 = get_kin_slice(380, 510)
pages_html.append(f"""
<div class="page" id="page-11">
  <div class="header">
    <div class="header-tag">SOURCE CODE · therapistKinematicsEngine.ts (PART 2)</div>
    <div class="header-right"><span>GESTURES & CERVICAL MECHANICS</span><span>DOC-ID: EMS-2D-11</span></div>
  </div>
  <div class="title-banner">
    <h1>therapistKinematicsEngine.ts: Gesture Solver & Cervical Mechanics</h1>
    <h2>Double Nod, Empathy Dip, Curious Tilt, Reassure Shake & 3D Translations</h2>
  </div>

  <div class="code-header">
    <span>src/lib/therapistKinematicsEngine.ts (Lines 380–510)</span>
    <span>TypeScript</span>
  </div>
  <div class="code-container">
{code_p11}
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 11 / 16 · GESTURE & CERVICAL SOLVER</span>
  </div>
</div>
""")

# PAGE 12: AUDIO VISEME & SPEECH ENGINE (visemeEngine.ts)
vis_lines = viseme_src.splitlines()
code_p12 = esc("\n".join(vis_lines[1:130]))
pages_html.append(f"""
<div class="page" id="page-12">
  <div class="header">
    <div class="header-tag">SPEECH & LIP-SYNC · WEB AUDIO FFT & VISEME ENGINE</div>
    <div class="header-right"><span>OCULUS 15 STANDARD</span><span>DOC-ID: EMS-2D-12</span></div>
  </div>
  <div class="title-banner">
    <h1>Real-Time Web Audio FFT Spectrum & Viseme Engine</h1>
    <h2>Audio AnalyserNode, Formant Frequency Extraction, and Oculus Code Mapping</h2>
  </div>

  <div class="code-header">
    <span>src/lib/visemeEngine.ts (Formant Band Extraction & Oculus 15 Mapping)</span>
    <span>TypeScript / Web Audio API</span>
  </div>
  <div class="code-container">
{code_p12}
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 12 / 16 · AUDIO VISEME LIP-SYNC ENGINE</span>
  </div>
</div>
""")

# PAGE 13: MEDIAPIPE FACE MESH TRACKING (faceTrackingMediaPipe.ts)
media_lines = mediapipe_src.splitlines()
code_p13 = esc("\n".join(media_lines[1:130]))
pages_html.append(f"""
<div class="page" id="page-13">
  <div class="header">
    <div class="header-tag">WEBCAM MIRRORING · MEDIAPIPE 3D FACE MESH PIPELINE</div>
    <div class="header-right"><span>478 3D LANDMARKS</span><span>DOC-ID: EMS-2D-13</span></div>
  </div>
  <div class="title-banner">
    <h1>MediaPipe 3D Face Mesh & Head Orientation Tracking</h1>
    <h2>Geometric Landmark Solvers for Yaw, Pitch, Roll, EAR Blinks, and MAR Speech</h2>
  </div>

  <div class="code-header">
    <span>src/lib/faceTrackingMediaPipe.ts (Landmark Geometric Extraction)</span>
    <span>TypeScript / MediaPipe Vision</span>
  </div>
  <div class="code-container">
{code_p13}
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 13 / 16 · 3D FACE MESH TRACKING ENGINE</span>
  </div>
</div>
""")

# PAGE 14: STUDIO ORCHESTRATION & APP ROOT (App.tsx)
app_lines = app_src.splitlines()
code_p14 = esc("\n".join(app_lines[1:130]))
pages_html.append(f"""
<div class="page" id="page-14">
  <div class="header">
    <div class="header-tag">APPLICATION ORCHESTRATION · ROOT DISPATCH PIPELINE</div>
    <div class="header-right"><span>App.tsx ARCHITECTURE</span><span>DOC-ID: EMS-2D-14</span></div>
  </div>
  <div class="title-banner">
    <h1>Studio Orchestration & Hotkey Synchronization</h1>
    <h2>Keyboard Hotkeys (0-4), Atmosphere State, and Stage Props Binding</h2>
  </div>

  <div class="code-header">
    <span>src/App.tsx (Root State Orchestrator & Hotkey Dispatch)</span>
    <span>TypeScript / React 19</span>
  </div>
  <div class="code-container">
{code_p14}
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 14 / 16 · STUDIO ROOT ORCHESTRATION</span>
  </div>
</div>
""")

# PAGE 15: CEL ASSET CREATION & DIFFERENCE MASKING GUIDE
pages_html.append(f"""
<div class="page" id="page-15">
  <div class="header">
    <div class="header-tag">ASSET ENGINEERING · CEL SPECIFICATIONS & MASKING</div>
    <div class="header-right"><span>ARTWORK PIPELINE</span><span>DOC-ID: EMS-2D-15</span></div>
  </div>
  <div class="title-banner">
    <h1>Cel Asset Standards & Clean Expression Extraction Guide</h1>
    <h2>How to Create Seam-Free Difference Masks and Add New Poses & Mudras</h2>
  </div>

  <div class="card accent-cyan" style="margin-bottom: 7px;">
    <div class="card-title">🔍 The Difference Masking Algorithm (Zero Cutouts)</div>
    <div class="card-p">To add a new emotion expression without cutting oval holes into Chetana's face or severing hair bangs, use RGB difference thresholding against the neutral base cel (<code>stage_cel_breath_0.png</code>):
    <br><br>
    <code>const delta = Math.sqrt((r1 - r0)^2 + (g1 - g0)^2 + (b1 - b0)^2);</code><br>
    <code>if (delta > 12 && y < 520 && x > 470 && x < 730) {{</code><br>
    <code>  // Extract expressive eye line, eyebrows, mouth, and blush</code><br>
    <code>  outputAlpha = smoothstep(12, 35, delta) * 255;</code><br>
    <code>}} else {{ outputAlpha = 0; }} // Zero opacity on hair, ears, chin, neck!</code>
    </div>
  </div>

  <div class="card accent-emerald" style="margin-bottom: 7px;">
    <div class="card-title">📝 Step-by-Step: Adding a New Mudra / Pose in 4 Steps</div>
    <table class="tech-table">
      <tr><th>Step</th><th>Action</th><th>File / Location</th><th>Technical Requirement</th></tr>
      <tr><td>1</td><td>Export Full-Body Cel</td><td><code>public/poses/stage_cel_pose_new.png</code></td><td>1200x900 PNG, transparent background, head/body aligned to 600,580 pivot.</td></tr>
      <tr><td>2</td><td>Add Type Definition</td><td><code>src/lib/avatarTypes.ts</code></td><td>Add <code>| 'new_pose'</code> to <code>export type AvatarGesture</code> union.</td></tr>
      <tr><td>3</td><td>Map in Master Assets</td><td><code>src/components/ChetanaMasterAnimeStage.tsx</code></td><td>Add <code>new_pose: '/poses/stage_cel_pose_new.png'</code> to <code>MASTER_ASSETS.poses</code>.</td></tr>
      <tr><td>4</td><td>Add Control Button</td><td><code>src/components/ControlsPanel.tsx</code></td><td>Add item to <code>gestureList</code> with label, description, and badge.</td></tr>
    </table>
  </div>

  <div class="grid-2">
    <div class="card accent-amber">
      <div class="card-title">📐 Canvas Coordinate Baseline Reference</div>
      <div class="card-p">
      • Canvas Dimensions: <strong>1200 x 900</strong><br>
      • Center Pivot: <strong>(600, 580)</strong><br>
      • Eye Sockets Midpoint: <strong>(600, 395)</strong><br>
      • Lip Line Baseline: <strong>(600, 480)</strong><br>
      • Left Golden Jhumka: <strong>(537, 395)</strong><br>
      • Right Golden Jhumka: <strong>(705, 395)</strong><br>
      • Foreground Desk Top: <strong>y = 710</strong>
      </div>
    </div>
    <div class="card accent-purple">
      <div class="card-title">💡 Lip-Sync Cel Pinning Rule</div>
      <div class="card-p">Mouth viseme cels (<code>mouth_half, mouth_ah, mouth_oh, mouth_ee</code>) must always be drawn at <code>(0, 0)</code> on the lip baseline without vertical jaw drop translations. This keeps speech line art naturally anchored to the chin.</div>
    </div>
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 15 / 16 · CEL & ASSET PRODUCTION GUIDE</span>
  </div>
</div>
""")

# PAGE 16: TEAM ONBOARDING, TESTING & PRODUCTION CHECKLIST
pages_html.append(f"""
<div class="page" id="page-16">
  <div class="header">
    <div class="header-tag">ENGINEERING OPERATIONS · TEAM WORKFLOW & DEPLOYMENT</div>
    <div class="header-right"><span>DEVELOPER PLAYBOOK</span><span>DOC-ID: EMS-2D-16</span></div>
  </div>
  <div class="title-banner">
    <h1>Team Onboarding, Testing & Production Verification</h1>
    <h2>Local Development Workflow, Automated Testing Scripts, and Production Checklist</h2>
  </div>

  <div class="card accent-cyan" style="margin-bottom: 7px;">
    <div class="card-title">🛠️ Local Development & Debugging Workflow</div>
    <div class="code-container" style="font-size: 7.2px; line-height: 1.25;">
# Run development server with live HMR
npm run dev

# Check TypeScript typings and build production bundle
npm run build

# Run automated visual regression screenshot capture (captures all poses & emotions)
node scripts/capture_master_demo.cjs

# Run 3-axis nodding & kinematic verification test
node scripts/test_nodding_mechanics.cjs

# Record full-feature MP4 walkthrough video
node scripts/record_master_showcase_video.cjs
    </div>
  </div>

  <div class="card accent-emerald" style="margin-bottom: 7px;">
    <div class="card-title">✅ Production Verification & Quality Assurance Checklist</div>
    <table class="tech-table">
      <tr><th>QA Dimension</th><th>Acceptance Criteria</th><th>Verification Method</th></tr>
      <tr><td>Zero Cutouts & Seams</td><td>No oval patches, pink lines, or severed hair/neck on any emotion</td><td>Inspect difference masks against all 5 poses</td></tr>
      <tr><td>Unbroken Anatomy</td><td>Head and neck never decouple from shoulders during nods or sways</td><td>Pivot locked at (600, 580) behind foreground desk</td></tr>
      <tr><td>60 FPS Performance</td><td>Consistently 60 FPS on standard modern desktop GPUs</td><td>Hardware 2D Canvas context; zero DOM re-render churn</td></tr>
      <tr><td>Clean Audio Lip-Sync</td><td>Mouth shapes open and close in sync with speech formants</td><td>Web Audio FFT formant analyser; Oculus-15 mapping</td></tr>
      <tr><td>Cross-Platform Build</td><td>Zero TypeScript errors; production bundle < 350KB gzipped</td><td><code>tsc && vite build</code> passes with exit code 0</td></tr>
    </table>
  </div>

  <div class="grid-2">
    <div class="card accent-amber">
      <div class="card-title">🤝 Pair Programming & Contribution</div>
      <div class="card-p">When committing changes: ensure all newly introduced state hooks keep canvas rendering inside <code>requestAnimationFrame</code>. Do not trigger React state updates inside 60 FPS animation loops except for low-frequency telemetry.</div>
    </div>
    <div class="card accent-purple">
      <div class="card-title">📦 Artifacts Generated for Team</div>
      <div class="card-p">
      • PDF Manual: <code>EMOSENSE_2D_AVATAR_STUDIO_TEAM_MANUAL.pdf</code><br>
      • MP4 Video: <code>EMOSENSE_2D_MODEL_FULL_FEATURE_SHOWCASE.mp4</code><br>
      • HTML Source: <code>dist/team_architecture_manual.html</code>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>EMOSENSE 2D AVATAR STUDIO · TEAM ARCHITECTURE MANUAL</span>
    <span class="footer-badge">PAGE 16 / 16 · TEAM ONBOARDING & PRODUCTION CHECKLIST</span>
  </div>
</div>
""")

full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EmoSense 2D Avatar Studio · Team Architecture & Code Manual</title>
  {css_styles}
</head>
<body>
{"".join(pages_html)}
</body>
</html>
"""

out_html_path = os.path.join(DIST_DIR, 'team_architecture_manual.html')
with open(out_html_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f"✅ Generated {len(pages_html)} pages in HTML manual: {out_html_path}")
