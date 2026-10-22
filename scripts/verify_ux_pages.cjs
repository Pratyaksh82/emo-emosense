const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('📸 Capturing sample UX Blueprint previews...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1.5 });

  const htmlPath = path.resolve(__dirname, '../dist/ux_blueprint.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  const pagesToCapture = [1, 4, 7, 8, 12, 20];

  for (const pageNum of pagesToCapture) {
    const pageEl = await page.$(`#page-${pageNum}`);
    if (pageEl) {
      const outPath = path.resolve(__dirname, `../dist/ux_page_${pageNum}_preview.png`);
      await pageEl.screenshot({ path: outPath });
      console.log(`Saved preview of UX Page ${pageNum} to: ${outPath}`);
    }
  }

  await browser.close();
  console.log('✅ UX Blueprint previews complete!');
})();
