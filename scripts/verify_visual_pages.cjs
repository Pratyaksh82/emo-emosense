const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('📸 Capturing sample page previews for verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1.5 });

  const htmlPath = path.resolve(__dirname, '../dist/performance_whitepaper.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  const pagesToCapture = [1, 14, 21, 22, 34, 35, 49, 50];

  for (const pageNum of pagesToCapture) {
    const pageEl = await page.$(`#page-${pageNum}`);
    if (pageEl) {
      const outPath = path.resolve(__dirname, `../dist/page_${pageNum}_preview.png`);
      await pageEl.screenshot({ path: outPath });
      console.log(`Saved preview of Page ${pageNum} to: ${outPath}`);
    } else {
      console.log(`Page #${pageNum} element not found`);
    }
  }

  await browser.close();
  console.log('✅ Visual verification screenshots complete!');
})();
