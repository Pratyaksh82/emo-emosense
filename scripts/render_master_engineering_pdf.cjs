const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Puppeteer Master Engineering & Patent Blueprint Engine...');
  const htmlPath = path.resolve(__dirname, '../dist/master_engineering_blueprint.html');
  const pdfDistPath = path.resolve(__dirname, '../dist/EMOSENSE_MASTER_ENGINEERING_AND_PATENT_BLUEPRINT.pdf');
  const pdfProjectRoot = path.resolve(__dirname, '../EMOSENSE_MASTER_ENGINEERING_AND_PATENT_BLUEPRINT.pdf');
  const pdfDesktopRoot = path.resolve('C:/Users/praty/Desktop/EMOSENSE_MASTER_ENGINEERING_AND_PATENT_BLUEPRINT.pdf');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 90000 });

  const pageCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  console.log(`📄 Total pages detected in DOM: ${pageCount}`);

  // Generate PDF
  await page.pdf({
    path: pdfDistPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  // Verify and copy
  const stats = fs.statSync(pdfDistPath);
  console.log(`✅ Master Engineering PDF generated successfully in dist!`);
  console.log(`📁 File: ${pdfDistPath}`);
  console.log(`⚖️ Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);

  fs.copyFileSync(pdfDistPath, pdfProjectRoot);
  console.log(`📋 Copied to Project Root: ${pdfProjectRoot}`);

  fs.copyFileSync(pdfDistPath, pdfDesktopRoot);
  console.log(`📋 Copied to Desktop: ${pdfDesktopRoot}`);

  // Generate visual previews of key dossier covers and engineering modules
  const previewPages = [1, 2, 4, 5, 13, 14, 18, 21, 22, 24, 30];
  console.log('📸 Generating visual inspection previews for key dossier pages...');
  for (const pNum of previewPages) {
    try {
      const pageElem = await page.$(`#page-${pNum}`);
      if (pageElem) {
        const previewPath = path.resolve(__dirname, `../dist/blueprint_page_${pNum}_preview.png`);
        await pageElem.screenshot({ path: previewPath });
        console.log(`   - Saved Page ${pNum} preview: ${previewPath}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Warning generating preview for Page ${pNum}:`, err.message);
    }
  }

  await browser.close();
  console.log('🎉 All rendering and verification steps complete!');
})();
