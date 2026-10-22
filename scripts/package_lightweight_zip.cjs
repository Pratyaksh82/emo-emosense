const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Creating Lightweight EmoSense + Chetana Package for Teammate...');

const ROOT = path.resolve(__dirname, '..');
const STAGE = path.join(ROOT, 'package_stage');
const ZIP_NAME = 'EmoSense_Chetana_Edition_Package.zip';
const ZIP_PATH = path.join(ROOT, ZIP_NAME);

// Clean previous stage and zip
if (fs.existsSync(STAGE)) {
  fs.rmSync(STAGE, { recursive: true, force: true });
}
if (fs.existsSync(ZIP_PATH)) {
  fs.rmSync(ZIP_PATH, { force: true });
}

fs.mkdirSync(STAGE, { recursive: true });

// 1. Copy source code
function copyDir(src, dest, filterFn) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (filterFn && !filterFn(srcPath, entry)) continue;
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, filterFn);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📁 Copying src/ ...');
copyDir(path.join(ROOT, 'src'), path.join(STAGE, 'src'));

console.log('📁 Copying public/ (essential UI assets only) ...');
fs.mkdirSync(path.join(STAGE, 'public'), { recursive: true });

// Copy only active poses/cels needed by the app (omitting 570+ unused/backup files)
const requiredPoses = [
  'stage_bg_chair.jpg',
  'bg_wisteria_night.jpg',
  'bg_solar_sunset.jpg',
  'bg_kyoto_rain.jpg',
  'bg_therapist_office.jpg',
  'pose_idle.jpg',
  'pose_namaste.jpg',
  'pose_wave.jpg',
  'pose_chin_rest.jpg',
  'pose_heart_empathy.jpg',
  'pose_empathy.jpg',
  'stage_cel_breath_0.png',
  'stage_cel_pose_namaste.png',
  'stage_cel_pose_wave.png',
  'stage_cel_pose_chin_rest.png',
  'stage_cel_pose_empathy.png',
  'stage_cel_breath_1.png',
  'stage_cel_breath_2.png',
  'stage_cel_breath_3.png',
  'clean_expression_happy.png',
  'clean_expression_sad.png',
  'clean_expression_calm.png',
  'clean_expression_empathy.png',
  'clean_expression_surprised.png',
  'clean_expression_tense.png',
  'stage_character_blink.png',
  'stage_character_mouth_closed.png',
  'stage_character_mouth_half.png',
  'stage_character_mouth_ah.png',
  'stage_character_mouth_oh.png',
  'stage_character_mouth_ee.png',
  'rig_sclera_clean.png',
  'rig_irises_feathered.png',
  'rig_eyelashes_protect.png',
  'rig_brow_left.png',
  'rig_brow_right.png',
  'rig_mouth_skin_cover.png',
  'stage_fg_desk.png'
];

fs.mkdirSync(path.join(STAGE, 'public/poses'), { recursive: true });
for (const file of requiredPoses) {
  const p = path.join(ROOT, 'public/poses', file);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(STAGE, 'public/poses', file));
  }
}

// 2. Copy pre-built dist (compiled JS/CSS assets and HTML only, no duplicates)
console.log('📁 Copying production dist/ (assets & html only) ...');
fs.mkdirSync(path.join(STAGE, 'dist'), { recursive: true });
if (fs.existsSync(path.join(ROOT, 'dist/assets'))) {
  copyDir(path.join(ROOT, 'dist/assets'), path.join(STAGE, 'dist/assets'));
}
if (fs.existsSync(path.join(ROOT, 'dist/index.html'))) {
  fs.copyFileSync(path.join(ROOT, 'dist/index.html'), path.join(STAGE, 'dist/index.html'));
}

// 3. Copy root configuration files (excluding large unnecessary demo audio and raw dumps)
const rootFiles = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  'server.cjs',
  '.env.local',
  'start.bat'
];

console.log('📄 Copying root project configuration & server files...');
for (const file of rootFiles) {
  const p = path.join(ROOT, file);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(STAGE, file));
  }
}

// 4. Create README.md for teammate
const readmeContent = `# EmoSense + Chetana Edition
> Real-Time Emotion Intelligence Platform with Embodied Multimodal Humanoid AI Companion

---

## 🌸 Overview
This repository contains the complete, production-ready **EmoSense + Chetana Edition** integrating:
1. **EmoSense Affective Health Suite**:
   - Real-time **Affective Trajectory AreaChart** (Valence shifts & Stress Drift).
   - **2D Valence-Arousal Circumplex Radar** (Russell quadrant coordinates).
   - **8 Facial Action Units (FACS)** (AU1, AU2, AU4, AU6, AU12, AU15, AU25, AU26).
   - **Floating Face Affect Vision PIP** (MediaPipe landmark tracking & demo scenarios).
   - **Somatic Reset Interventions** (5-4-3-2-1 Sensory Grounding & 4-4-4-4 Box Breathing visual pacer).
   - **Stepped CareBridge** (Levels 1 to 4 triage & 24×7 Tele-MANAS \`14416\` / \`1800-89-14416\` SOS hotline).
   - **Web Audio Soundscapes** (Continuous 432 Hz Solfeggio Theta drone, Rain, Ocean, Forest).
2. **C.H.E.T.A.N.A. Embodied AI Avatar**:
   - **Kyoto-Style Anime Cel Stage**: Unobstructed, serene clinical presentation.
   - **Phonetic Lip-Sync & Visemes**: Smooth procedural syllable oscillation synchronized to speech.
   - **Guaranteed Female Voice**: \`Microsoft Zira\` / cloud female voice with feminine pitch tuning (1.18).
   - **Voice Input Microphone**: Speech-to-text recording with pulsing visual ring indicator in chat composer.
   - **Full Gemini Multimodal Emotion AI**: Live facial metrics & acoustic telemetry injected into Google Gemini (\`gemini-3.5-flash-lite\` / \`gemini-3.8-flash\`) with fluent English, Hindi, and Hinglish dialogue support.

---

## 🚀 Quick Start Guide

### Option 1: Development Server (Recommended)
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Launch Vite dev server
npm run dev
\`\`\`
Then open **\`http://localhost:5174/\`** in your browser.

### Option 2: Pre-Built Standalone Production Server
\`\`\`bash
# Run the pre-built server immediately (no build required)
node server.cjs
\`\`\`
Then open **\`http://localhost:5174/\`**.

### Option 3: One-Click Launch (Windows)
Double-click \`start.bat\` in the root directory.

---

## 🔑 Environment Configuration
The file `.env.local` should configure your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
This powers the multimodal chat intelligence on `/api/emotion-chat`.

---

## 📁 Key File Structure
\`\`\`
├── src/
│   ├── components/
│   │   ├── emosense/            # Trajectory chart, Radar, FACS, Vision PIP, Grounding, CareBridge
│   │   ├── avatar/              # Kyoto-style anime stage & biomechanical renderer
│   │   ├── voice/               # Voice input microphone component
│   │   └── ChetanaChatBanner.tsx# Top-docked expandable companion banner
│   ├── lib/
│   │   ├── geminiChat.ts        # Client-side Gemini chat with multimodal telemetry
│   │   ├── safetyCore.ts        # Deterministic crisis safety & Tele-MANAS triage
│   │   ├── emosenseAudioEngine.ts # 432 Hz Solfeggio synthesizer & voice modulation
│   │   └── emotionAutopilotEngine.ts # Affect classification & gesture kinematics
│   └── server/
│       └── emotionChatPlugin.ts # Vite dev server middleware for /api/emotion-chat
├── server.cjs                   # Standalone Node.js HTTP server with Gemini API endpoint
├── vite.config.ts               # Vite configuration with emotionChatDevPlugin
└── package.json                 # Project dependencies & scripts
\`\`\`

---
*Built with care for compassionate, accessible mental wellness.*
`;

fs.writeFileSync(path.join(STAGE, 'README.md'), readmeContent, 'utf8');

// 5. Compress stage directory using PowerShell Compress-Archive
console.log('🗜️ Compressing package with PowerShell Compress-Archive ...');
const psCommand = `powershell -Command "Compress-Archive -Path '${STAGE}\\*' -DestinationPath '${ZIP_PATH}' -CompressionLevel Optimal"`;
execSync(psCommand, { stdio: 'inherit' });

// 6. Verify generated zip size
const stat = fs.statSync(ZIP_PATH);
const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
console.log(`✅ Success! Generated ${ZIP_NAME}: ${sizeMB} MB`);

// Clean up stage folder
fs.rmSync(STAGE, { recursive: true, force: true });
console.log('🧹 Cleaned up temporary staging directory.');
