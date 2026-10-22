const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  const poses = ['namaste', 'wave', 'chin_rest', 'empathy'];
  for (const p of poses) {
    await page.evaluate(async (poseName) => {
      const c = document.createElement('canvas');
      c.width = 1200; c.height = 900;
      const ctx = c.getContext('2d');
      const load = (src) => new Promise(r => {
        const img = new Image(); img.onload = () => r(img); img.src = src;
      });
      const bg = await load('/poses/bg_wisteria_night.jpg');
      const poseImg = await load('/poses/stage_cel_pose_' + poseName + '.png');
      ctx.drawImage(bg, 0, 0);
      ctx.drawImage(poseImg, 0, 0);
      window.testCanvas = c;
    }, p);

    await page.evaluate(() => {
      document.body.innerHTML = '';
      document.body.appendChild(window.testCanvas);
    });
    const out = path.resolve(__dirname, `../public/poses/view_raw_stage_cel_${p}.png`);
    await page.screenshot({ path: out });
    console.log('Saved:', out);
  }
  await browser.close();
})();
