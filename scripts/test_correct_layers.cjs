const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  // Render 4 gestures with correct layer order:
  // Layer 0: BG
  // Layer 1: Torso
  // Layer 2: Head (with emotion)
  // Layer 3: Gesture Hands (Namaste / Wave / Chin Rest / Empathy)
  const gestures = ['wave', 'namaste', 'chin_rest', 'empathy'];

  for (const g of gestures) {
    await page.evaluate(async (gestureName) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');

      const load = (src) => new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
      });

      const bg = await load('/poses/bg_wisteria_night.jpg');
      const torso = await load('/poses/stage_character_torso.png');
      const head = await load('/poses/emotion_head_layer_happy.png');
      const gestureImg = await load('/poses/stage_gesture_' + gestureName + '.png');
      const desk = await load('/poses/stage_fg_desk.png');

      ctx.drawImage(bg, 0, 0);
      ctx.drawImage(torso, 0, 0);
      ctx.drawImage(head, 0, 0);
      ctx.drawImage(gestureImg, 0, 0);
      ctx.drawImage(desk, 0, 0);

      window.testCanvas = canvas;
    }, g);

    await page.evaluate(() => {
      document.body.innerHTML = '';
      document.body.appendChild(window.testCanvas);
    });

    const outPath = path.resolve(__dirname, `../public/poses/test_correct_layers_${g}.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved ${g} to ${outPath}`);
  }

  await browser.close();
})();
