const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    console.log('Clicking Play 5-Min Bilingual Showcase...');
    const btns = await page.$$('button');
    for (const b of btns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Play 5-Min') || text.includes('Bilingual Showcase')) {
        await b.click();
        break;
      }
    }

    // Wait for audio to play and visemes to trigger
    await new Promise(r => setTimeout(r, 2200));

    const out = path.resolve(__dirname, '../public/poses/master_live_07_audio_speaking.png');
    await page.screenshot({ path: out });
    console.log('Saved speaking screenshot to:', out);

  } catch (err) {
    console.error('Error during audio lip-sync test:', err);
  } finally {
    await browser.close();
  }
})();
