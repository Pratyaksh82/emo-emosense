const http = require('http');

function postTTS(text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ text });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5174,
        path: '/api/tts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`[TTS] Text: "${text.slice(0, 30)}..." -> Status: ${res.statusCode}, Result: ${data.trim()}`);
          resolve(data);
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  await postTTS("Namaste, I am Chetana. Welcome to EmoSense. This is a gentle, judgment-free space tuned to your heart. How are you feeling right now, really?");
  await postTTS("नमस्ते, मैं चेतना हूँ। इमोसेंस में आपका स्वागत है। यह आपके दिल से जुड़ा एक शांत और सुरक्षित स्थान है। आप अभी कैसा महसूस कर रहे हैं?");
  await postTTS("Namaste! Kaise hain aap? Main Chetana hoon.");
}

main().catch(console.error);
