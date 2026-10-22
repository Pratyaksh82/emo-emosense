const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Gather all essential files and folders
const rootDir = path.resolve('c:/Users/praty/Desktop/2d model');
const stagingDir = path.resolve(rootDir, 'staging_clean_zip');
const zipOutput = path.resolve(rootDir, 'chetana_project_small.zip');
const artifactZip = path.resolve('C:/Users/praty/.gemini/antigravity-ide/brain/6e8ae898-d86b-41a0-b478-90996bf27902/chetana_project_small.zip');

if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

console.log('[1/4] Copying core source code, config, and launchers...');
copyDir(path.join(rootDir, 'src'), path.join(stagingDir, 'src'));

const rootFiles = [
  'index.html',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'server.cjs',
  'start.bat'
];

rootFiles.forEach(f => {
  const p = path.join(rootDir, f);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(stagingDir, f));
});

// Copy scripts (excluding any large temporary files)
console.log('[2/4] Copying essential CI test & utility scripts...');
const scriptDir = path.join(stagingDir, 'scripts');
fs.mkdirSync(scriptDir, { recursive: true });
const scriptFiles = fs.readdirSync(path.join(rootDir, 'scripts')).filter(f => f.endsWith('.cjs') || f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.html'));
scriptFiles.forEach(f => {
  fs.copyFileSync(path.join(rootDir, 'scripts', f), path.join(scriptDir, f));
});

console.log('[3/4] Copying essential offline assets (models, audio, active cels)...');
const pubDest = path.join(stagingDir, 'public');
fs.mkdirSync(pubDest, { recursive: true });

// Copy offline models
copyDir(path.join(rootDir, 'public', 'models'), path.join(pubDest, 'models'));

// Copy audio cache
if (fs.existsSync(path.join(rootDir, 'public', 'audio_cache'))) {
  copyDir(path.join(rootDir, 'public', 'audio_cache'), path.join(pubDest, 'audio_cache'));
}
if (fs.existsSync(path.join(rootDir, 'public', 'audio'))) {
  copyDir(path.join(rootDir, 'public', 'audio'), path.join(pubDest, 'audio'));
}

// Copy ONLY the active master cels, expressions, and backgrounds used by Chetana
const posesDest = path.join(pubDest, 'poses');
fs.mkdirSync(posesDest, { recursive: true });

const activePoses = [
  'bg_wisteria_night.jpg',
  'bg_solar_sunset.jpg',
  'bg_kyoto_rain.jpg',
  'stage_bg_chair.jpg',
  'stage_cel_breath_0.png',
  'stage_cel_breath_1.png',
  'stage_cel_breath_2.png',
  'stage_cel_breath_3.png',
  'stage_cel_pose_namaste.png',
  'stage_cel_pose_wave.png',
  'stage_cel_pose_chin_rest.png',
  'stage_cel_pose_empathy.png',
  'stage_cel_emotion_happy.png',
  'stage_cel_emotion_calm.png',
  'stage_cel_emotion_empathy.png',
  'stage_cel_emotion_sad.png',
  'stage_cel_emotion_surprised.png',
  'stage_cel_emotion_tense.png',
  'stage_character_blink.png',
  'stage_character_mouth_half.png',
  'stage_character_mouth_ah.png',
  'stage_character_mouth_oh.png',
  'stage_character_mouth_ee.png',
  'stage_character_mouth_closed.png',
  'stage_fg_desk.png',
  'pose_idle.jpg',
  'pose_namaste.jpg',
  'pose_wave.jpg',
  'pose_chin_rest.jpg',
  'pose_empathy.jpg',
  'pose_blink.jpg',
  'stage_character_torso.png',
  'stage_character_head.png',
  'stage_character_pupils.png',
  'stage_character_jhumka_l.png',
  'stage_character_jhumka_r.png',
  'clean_expression_happy.png',
  'clean_expression_sad.png',
  'clean_expression_calm.png',
  'clean_expression_empathy.png',
  'clean_expression_surprised.png',
  'clean_expression_tense.png',
  'rig_sclera_clean.png',
  'rig_irises_feathered.png',
  'rig_eyelashes_protect.png',
  'rig_brow_left.png',
  'rig_brow_right.png',
  'rig_mouth_skin_cover.png',
  'bg_therapist_office.jpg',
  'executive_office_chair_bg.jpg',
  'executive_desk_fg.png'
];

let copiedCount = 0;
activePoses.forEach(file => {
  const srcFile = path.join(rootDir, 'public', 'poses', file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(posesDest, file));
    copiedCount++;
  }
});
console.log(`Copied ${copiedCount} active master poses & cels.`);

// Create README.md
const readmeContent = `# Chetana (C.H.E.T.A.N.A.) — 2D Embodied AI Companion

**Cognitive Humanoid Emotion-Tuned Autonomous Neural Avatar**

### Key Features
1. **Antigravity 3-Part Architecture**:
   - **Left**: Live Biometrics, Real-Time Affective Trajectory, 2D Russell Circumplex, FACS Action Units (AU1-AU15), and Clinical Session PDF Export.
   - **Middle**: Living 60 FPS Master Anime Stage with Executive Twilight Suite, Atmosphere & Camera Dropdowns, and Therapist Acting Controls.
   - **Right**: Dialogue Hub with hands-free voice input, timestamps, emotion chips, and 432 Hz Solfeggio soundscape.
2. **Biomechanical Invariance**: Fixed skull geometry eliminating rubber inflating/compressing, with physiological cervical pitch/roll translations.
3. **Clinical Session Reporting**: One-click encrypted clinical PDF report generation with jsPDF.
4. **Air-Gapped Offline Execution**: Offline MediaPipe face landmarker models, local WASM, and neural voice caching.

### Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`
Or build and start the standalone server:
\`\`\`bash
npm run build
node server.cjs
\`\`\`
On Windows, you can also double-click \`start.bat\`.
`;
fs.writeFileSync(path.join(stagingDir, 'README.md'), readmeContent, 'utf8');

console.log('[4/4] Creating small ZIP archive via PowerShell Compress-Archive...');
if (fs.existsSync(zipOutput)) fs.unlinkSync(zipOutput);

const psCommand = `powershell -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipOutput}' -CompressionLevel Optimal -Force"`;
execSync(psCommand, { stdio: 'inherit' });

const stats = fs.statSync(zipOutput);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`✅ SUCCESS: Small ZIP created at: ${zipOutput} (${sizeMb} MB)`);

// Copy to artifact directory
fs.copyFileSync(zipOutput, artifactZip);
console.log(`Copied to artifact directory: ${artifactZip}`);

// Clean up staging directory
fs.rmSync(stagingDir, { recursive: true, force: true });
console.log('Cleaned up temporary staging directory.');
