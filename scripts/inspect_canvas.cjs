const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 2000));

  const vp = await page.$('.anime-cel-viewport');
  if (vp) {
    const shotPath = path.resolve('C:\\Users\\praty\\.gemini\\antigravity-ide\\brain\\6e8ae898-d86b-41a0-b478-90996bf27902', 'viewport_isolated.png');
    await vp.screenshot({ path: shotPath });
    console.log('Saved viewport screenshot to:', shotPath);
  } else {
    console.log('Could not find .anime-cel-viewport');
  }

  const fullPath = path.resolve('C:\\Users\\praty\\.gemini\\antigravity-ide\\brain\\6e8ae898-d86b-41a0-b478-90996bf27902', 'fullpage_1440.png');
  await page.screenshot({ path: fullPath });
  console.log('Saved fullpage screenshot to:', fullPath);

  await browser.close();
})();
