const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  try {
    console.log('Navigating to http://localhost:5174/...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    const clickEmotion = async (name) => {
      const btns = await page.$$('.emotion-btn');
      for (const b of btns) {
        const text = await page.evaluate(el => el.textContent, b);
        if (new RegExp(name, 'i').test(text)) {
          await b.click();
          return true;
        }
      }
      return false;
    };

    // 1. Capture Baseline: Idle + Neutral
    await page.keyboard.press('0');
    await clickEmotion('Neutral');
    await new Promise(r => setTimeout(r, 600));
    const out1 = path.resolve(__dirname, '../public/poses/master_live_01_idle_neutral.png');
    await page.screenshot({ path: out1 });
    console.log('Saved:', out1);

    // 2. Namaste + Happy / Joy
    console.log('Activating Namaste + Happy...');
    await page.keyboard.press('1');
    await clickEmotion('Happy');
    await new Promise(r => setTimeout(r, 900));
    const out2 = path.resolve(__dirname, '../public/poses/master_live_02_namaste_happy.png');
    await page.screenshot({ path: out2 });
    console.log('Saved:', out2);

    // 3. Wave + Sad / Comfort
    console.log('Activating Wave + Sad...');
    await page.keyboard.press('2');
    await clickEmotion('Sad');
    await new Promise(r => setTimeout(r, 900));
    const out3 = path.resolve(__dirname, '../public/poses/master_live_03_wave_sad.png');
    await page.screenshot({ path: out3 });
    console.log('Saved:', out3);

    // 4. Chin Rest + Empathy
    console.log('Activating Chin Rest + Empathy...');
    await page.keyboard.press('3');
    await clickEmotion('Empathetic');
    await new Promise(r => setTimeout(r, 900));
    const out4 = path.resolve(__dirname, '../public/poses/master_live_04_chin_rest_empathy.png');
    await page.screenshot({ path: out4 });
    console.log('Saved:', out4);

    // 5. Hand to Heart + Tense / De-escalate Stress
    console.log('Activating Hand to Heart + Tense...');
    await page.keyboard.press('4');
    await clickEmotion('Stress');
    await new Promise(r => setTimeout(r, 900));
    const out5 = path.resolve(__dirname, '../public/poses/master_live_05_heart_tense.png');
    await page.screenshot({ path: out5 });
    console.log('Saved:', out5);

    // 6. Test Mouse Movement (Gaze Tracking)
    console.log('Testing Mouse Movement & Gaze Tracking...');
    await page.mouse.move(250, 200);
    await new Promise(r => setTimeout(r, 400));
    const out6 = path.resolve(__dirname, '../public/poses/master_live_06_gaze_tracking.png');
    await page.screenshot({ path: out6 });
    console.log('Saved:', out6);

  } catch (err) {
    console.error('Error during demo capture:', err);
  } finally {
    await browser.close();
  }
})();
