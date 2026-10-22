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
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    // Wait for canvas / character to render
    await new Promise(r => setTimeout(r, 2000));
    
    const outPath = path.resolve(__dirname, '../public/poses/live_stage_screenshot.png');
    await page.screenshot({ path: outPath });
    console.log(`Saved screenshot to: ${outPath}`);
  } catch (err) {
    console.error('Error capturing screenshot:', err);
  } finally {
    await browser.close();
  }
})();
