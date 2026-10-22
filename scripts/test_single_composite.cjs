const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
    protocolTimeout: 60000
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  await page.evaluate(async () => {
    const cvs = document.createElement('canvas');
    cvs.width = 1200; cvs.height = 900;
    const ctx = cvs.getContext('2d');
    const load = (src) => new Promise(r => {
      const img = new Image(); img.onload = () => r(img); img.src = src;
    });

    const bg = await load('/poses/bg_wisteria_night.jpg');
    const torso = await load('/poses/stage_character_torso.png');
    const head = await load('/poses/emotion_head_layer_happy.png');
    const hands = await load('/poses/pure_gesture_hands_namaste.png');
    const desk = await load('/poses/stage_fg_desk.png');

    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(torso, 0, 0);
    ctx.drawImage(head, 0, 0);
    ctx.drawImage(hands, 0, 0);
    ctx.drawImage(desk, 0, 0);

    document.body.innerHTML = '';
    document.body.appendChild(cvs);
  });

  const out = path.resolve(__dirname, '../public/poses/test_single_namaste_happy.png');
  await page.screenshot({ path: out });
  console.log('Saved:', out);

  await browser.close();
})();
