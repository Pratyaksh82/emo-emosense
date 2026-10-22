const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  const emotions = ['neutral', 'happy', 'calm', 'empathy', 'sad', 'tense', 'surprised'];

  const results = await page.evaluate(async (emotionList) => {
    const load = (src) => new Promise(r => {
      const img = new Image(); img.onload = () => r(img); img.src = src;
    });

    const c = document.createElement('canvas');
    c.width = 1200; c.height = 900;
    const ctx = c.getContext('2d');

    const baseBody = await load('/poses/stage_character_body.png');

    // For neutral: face is directly on baseBody
    // For others: load stage_cel_emotion_[emo].png
    const faceDataURIs = {};

    for (const emo of emotionList) {
      let srcImg = baseBody;
      if (emo !== 'neutral') {
        srcImg = await load('/poses/stage_cel_emotion_' + emo + '.png');
      }

      ctx.clearRect(0, 0, 1200, 900);
      ctx.drawImage(srcImg, 0, 0);

      // Create radial/elliptical soft feathered mask around face center (600, 370)
      // Radius X: 110, Radius Y: 130
      const imgData = ctx.getImageData(0, 0, 1200, 900);
      const data = imgData.data;

      // Also create a Chin-Rest safe version where chin area y > 430 is excluded so hand isn't covered
      for (let y = 0; y < 900; y++) {
        for (let x = 0; x < 1200; x++) {
          const idx = (y * 1200 + x) * 4;
          const dx = (x - 600) / 105;
          const dy = (y - 370) / 115;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist >= 1.0) {
            data[idx + 3] = 0; // outside face oval
          } else if (dist > 0.75) {
            // Soft feather edge
            const feather = (1.0 - dist) / 0.25;
            data[idx + 3] = Math.round(data[idx + 3] * feather);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      faceDataURIs[emo] = c.toDataURL('image/png');
    }

    return faceDataURIs;
  }, emotions);

  // Save the face layers to public/poses
  for (const emo of emotions) {
    const dataUri = results[emo];
    const base64 = dataUri.replace(/^data:image\/png;base64,/, '');
    const outPath = path.resolve(__dirname, `../public/poses/perfect_face_${emo}.png`);
    fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
    console.log(`Saved: ${outPath} (${fs.statSync(outPath).size} bytes)`);
  }

  await browser.close();
})();
