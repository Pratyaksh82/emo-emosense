const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../dist/master_engineering_blueprint.html'), 'utf8');
  const count = (html.match(/class="page"/g) || []).length;
  console.log('Page divs in HTML:', count);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file://${path.resolve(__dirname, '../dist/master_engineering_blueprint.html')}`, { waitUntil: 'networkidle0' });

  const heights = await page.evaluate(() => {
    const pages = document.querySelectorAll('.page');
    return Array.from(pages).map((p, i) => ({
      index: i + 1,
      id: p.id,
      offsetHeight: p.offsetHeight,
      scrollHeight: p.scrollHeight,
      styleBreak: window.getComputedStyle(p).pageBreakAfter,
      breakInside: window.getComputedStyle(p).breakInside,
      display: window.getComputedStyle(p).display
    }));
  });

  console.log('Evaluated pages count:', heights.length);
  for (let i = 0; i < Math.min(heights.length, 12); i++) {
    console.log(`Page ${heights[i].index} (${heights[i].id}): offset=${heights[i].offsetHeight}px, scroll=${heights[i].scrollHeight}px, breakAfter=${heights[i].styleBreak}`);
  }

  await browser.close();
})();
