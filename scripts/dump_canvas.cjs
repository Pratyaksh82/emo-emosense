const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const dataUrl = await page.evaluate(() => {
    const canvas = document.querySelector('.anime-cel-canvas');
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  });

  if (dataUrl) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('C:\\Users\\praty\\.gemini\\antigravity-ide\\brain\\6e8ae898-d86b-41a0-b478-90996bf27902\\direct_canvas_dump.png', base64Data, 'base64');
    console.log('Saved direct_canvas_dump.png');
  } else {
    console.log('Canvas not found');
  }

  await browser.close();
})();
