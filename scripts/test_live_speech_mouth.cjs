const puppeteer = require('c:/Users/praty/Desktop/2d model/node_modules/puppeteer');

(async () => {
  console.log('Testing live lip sync mouth visual quality...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--enable-webgl', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const clickButtonByText = async (pattern) => {
      const btns = await page.$$('button');
      for (const b of btns) {
        const text = await page.evaluate(el => el.textContent, b);
        if (pattern.test(text)) {
          await b.click();
          return true;
        }
      }
      return false;
    };

    console.log('Triggering speech playback...');
    await clickButtonByText(/Play 5-Min Bilingual Showcase|Masterpiece Audio/i);
    
    // Capture at multiple intervals during speech
    for (let i = 1; i <= 3; i++) {
      await new Promise(r => setTimeout(r, 700));
      await page.screenshot({ path: `public/poses/live_speech_verify_${i}.png` });
      console.log(`Saved live_speech_verify_${i}.png`);
    }

    console.log('Live speech capture complete!');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
})();
