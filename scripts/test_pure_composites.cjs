const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  const cases = [
    { gesture: 'namaste', emotion: 'happy' },
    { gesture: 'wave', emotion: 'sad' },
    { gesture: 'chin_rest', emotion: 'empathy' },
    { gesture: 'empathy', emotion: 'tense' }
  ];

  for (const c of cases) {
    await page.evaluate(async (item) => {
      const cvs = document.createElement('canvas');
      cvs.width = 1200; cvs.height = 900;
      const ctx = cvs.getContext('2d');
      const load = (src) => new Promise(r => {
        const img = new Image(); img.onload = () => r(img); img.src = src;
      });

      const bg = await load('/poses/bg_wisteria_night.jpg');
      const torso = await load('/poses/stage_character_torso.png');
      const head = await load('/poses/emotion_head_layer_' + item.emotion + '.png');
      const hands = await load('/poses/pure_gesture_hands_' + item.gesture + '.png');
      const desk = await load('/poses/stage_fg_desk.png');

      ctx.drawImage(bg, 0, 0);
      ctx.drawImage(torso, 0, 0);
      ctx.drawImage(head, 0, 0);
      ctx.drawImage(hands, 0, 0);
      ctx.drawImage(desk, 0, 0);

      window.testCanvas = cvs;
    }, c);

    await page.evaluate(() => {
      document.body.innerHTML = '';
      document.body.appendChild(window.testCanvas);
    });

    const outPath = path.resolve(__dirname, `../public/poses/test_pure_composite_${c.gesture}_${c.emotion}.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
})();
