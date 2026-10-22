const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, execFile } = require('child_process');

const PORT = process.env.PORT || 5174;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.webmanifest': 'application/manifest+json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.mpeg': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // EmoSense Neural TTS Endpoint
  if (reqPath === '/api/tts' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try {
        const body = JSON.parse(raw || '{}');
        const { text, voice } = body;
        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing text' }));
          return;
        }
        const venvPy = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
        const pyBin = fs.existsSync(venvPy) ? venvPy : 'python';
        const script = path.join(__dirname, 'scripts', 'synthesize_voice.py');
        const args = [script, text];
        if (voice) args.push(voice);
        execFile(pyBin, args, { encoding: 'utf-8' }, (err, stdout, stderr) => {
          if (err) {
            console.error('[TTS] Synthesis error:', err, stderr);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message, stderr }));
            return;
          }
          const audioUrl = stdout.trim().split('\n').pop().trim();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ audioUrl }));
        });
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // EmoSense Gemini Multimodal AI Endpoint
  if (reqPath === '/api/emotion-chat' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw || '{}');
        const { message, history = [], faceContext, voiceContext } = body;
        
        let apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          const envPath = path.join(__dirname, '.env.local');
          if (fs.existsSync(envPath)) {
            const m = fs.readFileSync(envPath, 'utf8').match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
            if (m) apiKey = m[1].trim();
          }
        }

        const systemInstruction = `You are Chetana (C.H.E.T.A.N.A.), an empathetic, emotionally attuned Indian AI companion and clinical confidant for EmoSense.
GUIDELINES:
- Speak like a deeply caring, emotionally attuned companion: warm, concise, and sincere (2 to 4 sentences).
- If the user uses Hindi or Hinglish, reply naturally in the same language.
- Never give cold or robotic advice. Always validate their feelings with authentic warmth.`;

        const contents = [];
        for (const h of history.slice(-8)) {
          contents.push({ role: h.role === 'assistant' || h.role === 'ai' ? 'model' : 'user', parts: [{ text: h.content }] });
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        let reply = "I am right here beside you. Take all the time you need, and share whatever feels comfortable.";
        if (apiKey) {
          for (const model of ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']) {
            try {
              const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  system_instruction: { parts: [{ text: systemInstruction }] },
                  contents,
                  generationConfig: { temperature: 0.75, maxOutputTokens: 350 }
                })
              });
              if (r.ok) {
                const j = await r.json();
                const t = j.candidates?.[0]?.content?.parts?.[0]?.text;
                if (t) { reply = t.trim(); break; }
              }
            } catch (err) {
              // fallback to next model
            }
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply, emotion: faceContext?.dominantEmotion || 'neutral', risk_level: 'none' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(DIST_DIR, reqPath);
  const publicPath = path.join(__dirname, 'public', reqPath);

  if (!fs.existsSync(filePath) && fs.existsSync(publicPath) && !fs.statSync(publicPath).isDirectory()) {
    filePath = publicPath;
  } else if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}/`;
  console.log('================================================================');
  console.log('   🌸 Chetana (C.H.E.T.A.N.A.) — 2D Indian Humanoid Companion Avatar Studio');
  console.log('================================================================');
  console.log(` Status    : Online`);
  console.log(` Local URL : ${url}`);
  console.log('================================================================');
});
