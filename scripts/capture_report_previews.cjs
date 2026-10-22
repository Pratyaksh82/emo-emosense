const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto('file://' + path.resolve(__dirname, '../dist/retrospective_report.html'), { waitUntil: 'networkidle0' });

  for (const num of [1, 4, 5]) {
    const el = await page.$(`#page-${num}`);
    if (el) {
      const p = path.resolve(__dirname, `../dist/preview_p${num}.png`);
      await el.screenshot({ path: p });
      console.log(`Saved preview page ${num}: ${p}`);
    }
  }
  await browser.close();
})();
