const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  const testCases = [
    { pose: 'stage_cel_pose_namaste.png', emo: 'perfect_face_happy.png', name: 'namaste_happy' },
    { pose: 'stage_cel_pose_wave.png', emo: 'perfect_face_sad.png', name: 'wave_sad' },
    { pose: 'stage_cel_pose_chin_rest.png', emo: 'perfect_face_empathy.png', name: 'chin_rest_empathy' },
    { pose: 'stage_cel_pose_empathy.png', emo: 'perfect_face_tense.png', name: 'empathy_tense' },
    { pose: 'stage_character_body.png', emo: 'perfect_face_surprised.png', name: 'idle_surprised' }
  ];

  for (const tc of testCases) {
    await page.evaluate(async (testCase) => {
      const c = document.createElement('canvas');
      c.width = 1200; c.height = 900;
      const ctx = c.getContext('2d');
      const load = (src) => new Promise(r => {
        const img = new Image(); img.onload = () => r(img); img.src = src;
      });
      const bg = await load('/poses/bg_wisteria_night.jpg');
      const poseImg = await load('/poses/' + testCase.pose);
      const faceImg = await load('/poses/' + testCase.emo);

      ctx.drawImage(bg, 0, 0);
      ctx.drawImage(poseImg, 0, 0);
      ctx.drawImage(faceImg, 0, 0);

      window.testCanvas = c;
    }, tc);

    await page.evaluate(() => {
      document.body.innerHTML = '';
      document.body.appendChild(window.testCanvas);
    });

    const outPath = path.resolve(__dirname, `../public/poses/verify_face_composite_${tc.name}.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
})();
