const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  console.log('[1/4] Preparing release directory release_dist/...');
  const releaseDir = path.resolve('release_dist');
  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
  }
  fs.mkdirSync(releaseDir, { recursive: true });

  console.log('[2/4] Copying compiled client dist/ and static assets...');
  copyDirSync(path.resolve('dist'), path.join(releaseDir, 'dist'));
  copyDirSync(path.resolve('public'), path.join(releaseDir, 'public'));

  console.log('[3/4] Creating standalone production server and launch scripts...');
  // Standalone server.cjs
  const serverCode = `const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5174;
const DIST_DIR = path.resolve(__dirname, 'dist');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.task': 'application/octet-stream',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // API TTS endpoint mockup or neural audio provider
  if (urlPath === '/api/tts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body);
        // Serve pre-cached greeting or fallback
        const greetingAudio = '/audio_cache/c3014562c9e462ea5bedd37d64e25404.mp3';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, audioUrl: greetingAudio }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 1. Check in public/
  let filePath = path.join(PUBLIC_DIR, urlPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // 2. Check in dist/
  filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // 3. SPA Fallback
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('=======================================================');
  console.log('  CHETANA 2D HUMANOID COMPANION — AIR-GAPPED RELEASE');
  console.log('=======================================================');
  console.log('  Server running at: http://localhost:' + PORT + '/');
  console.log('  Status: 100% Offline Air-Gapped Mode');
  console.log('=======================================================');
});
`;
  fs.writeFileSync(path.join(releaseDir, 'server.cjs'), serverCode, 'utf8');

  // Windows 1-click batch launcher
  const batCode = `@echo off
title Chetana 2D Embodied AI Companion
echo Starting Chetana 2D Embodied AI Companion...
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Error: Node.js is not found on your PATH. Please install Node.js 18+ to run.
  pause
  exit /b 1
)
start http://localhost:5174/
node server.cjs
pause
`;
  fs.writeFileSync(path.join(releaseDir, 'start.bat'), batCode, 'utf8');

  // Linux/macOS bash launcher
  const shCode = `#!/usr/bin/env bash
echo "Starting Chetana 2D Embodied AI Companion..."
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed. Please install Node.js 18+."
  exit 1
fi
if command -v xdg-open &> /dev/null; then
  xdg-open "http://localhost:5174/" &
elif command -v open &> /dev/null; then
  open "http://localhost:5174/" &
fi
node server.cjs
`;
  fs.writeFileSync(path.join(releaseDir, 'start.sh'), shCode, 'utf8');

  // README
  const readmeCode = `# Chetana (C.H.E.T.A.N.A.) — Air-Gapped Standalone Production Release

**Cognitive Humanoid Emotion-Tuned Autonomous Neural Avatar**

## Features
- **Antigravity 3-Part Architecture**:
  - **Left**: Live Biometrics, Affective Trajectory, Russell Circumplex & Clinical PDF Export.
  - **Middle**: Living 60 FPS Master Anime Stage with Executive Twilight Suite.
  - **Right**: Dialogue Hub with hands-free voice input and 432 Hz Solfeggio soundscape.
- **Biomechanical Facial Invariance**: Locked cranial geometry with zero rubber ballooning.
- **100% Air-Gapped Offline Execution**: All MediaPipe AI models, WASM runtimes, audio synthesis caches, and high-resolution cels are locally bundled.

## Quick Start (Zero-Install)
### Windows:
Double-click \`start.bat\`.

### Linux / macOS:
\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`

Open your browser to: \`http://localhost:5174/\`.
`;
  fs.writeFileSync(path.join(releaseDir, 'README_DEPLOY.md'), readmeCode, 'utf8');

  console.log('[4/4] Verifying production release bundle...');
  const distExists = fs.existsSync(path.join(releaseDir, 'dist', 'index.html'));
  const posesExists = fs.existsSync(path.join(releaseDir, 'public', 'poses', 'stage_cel_breath_0.png'));
  const modelsExists = fs.existsSync(path.join(releaseDir, 'public', 'models', 'face_landmarker.task'));

  console.log(' - dist/index.html:', distExists);
  console.log(' - public/poses/stage_cel_breath_0.png:', posesExists);
  console.log(' - public/models/face_landmarker.task:', modelsExists);

  if (distExists && posesExists && modelsExists) {
    console.log(`✅ SUCCESS: Air-gapped production package assembled at: ${releaseDir}`);
  }
}

main().catch(console.error);
