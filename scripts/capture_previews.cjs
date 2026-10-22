const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
  await page.goto(`file://${path.resolve(__dirname, '../dist/master_engineering_blueprint.html')}`, {
    waitUntil: 'networkidle0'
  });

  for (const pNum of [16, 24, 28, 30]) {
    const el = await page.$(`#page-${pNum}`);
    if (el) {
      const outPath = path.resolve(__dirname, `../dist/blueprint_page_${pNum}_preview.png`);
      await el.screenshot({ path: outPath });
      console.log(`Saved page ${pNum} preview: ${outPath}`);
    }
  }

  await browser.close();
  console.log('Previews done.');
})();
