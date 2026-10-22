const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  // Render composite on page canvas
  await page.evaluate(async () => {
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
    const waveGesture = await load('/poses/stage_gesture_wave.png');
    const headNeutral = await load('/poses/emotion_head_layer_neutral.png');

    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(torso, 0, 0);
    ctx.drawImage(waveGesture, 0, 0);
    ctx.drawImage(headNeutral, 0, 0);

    // Save to window
    window.testCanvas = canvas;
  });

  // Screenshot canvas
  const canvasElement = await page.evaluateHandle(() => window.testCanvas);
  const outPath = path.resolve(__dirname, '../public/poses/test_stage_layer_wave.png');
  // Draw to document to screenshot
  await page.evaluate(() => {
    document.body.innerHTML = '';
    document.body.appendChild(window.testCanvas);
  });
  await page.screenshot({ path: outPath });
  console.log('Saved test composite to:', outPath);

  await browser.close();
})();
