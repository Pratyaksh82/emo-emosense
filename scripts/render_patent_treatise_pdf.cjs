const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Puppeteer Patent & Hardware Treatise Engine...');
  const htmlPath = path.resolve(__dirname, '../dist/patent_master_treatise.html');
  const pdfDistPath = path.resolve(__dirname, '../dist/EMOSENSE_MASTER_PATENT_AND_HARDWARE_TREATISE.pdf');
  const pdfProjectRoot = path.resolve(__dirname, '../EMOSENSE_MASTER_PATENT_AND_HARDWARE_TREATISE.pdf');
  const pdfDesktopRoot = path.resolve('C:/Users/praty/Desktop/EMOSENSE_MASTER_PATENT_AND_HARDWARE_TREATISE.pdf');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
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
  console.log(`✅ Master Patent PDF generated successfully in dist!`);
  console.log(`📁 File: ${pdfDistPath}`);
  console.log(`⚖️ Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);

  fs.copyFileSync(pdfDistPath, pdfProjectRoot);
  console.log(`📋 Copied to Project Root: ${pdfProjectRoot}`);

  fs.copyFileSync(pdfDistPath, pdfDesktopRoot);
  console.log(`📋 Copied to Desktop: ${pdfDesktopRoot}`);

  // Generate visual previews of key pages
  const previewPages = [1, 2, 4, 9, 14, 20, 26, 30];
  console.log('📸 Generating visual inspection previews for key pages...');
  for (const pNum of previewPages) {
    const pageElem = await page.$(`#page-${pNum}`);
    if (pageElem) {
      const previewPath = path.resolve(__dirname, `../dist/patent_page_${pNum}_preview.png`);
      await pageElem.screenshot({ path: previewPath });
      console.log(`   - Saved Page ${pNum} preview: ${previewPath}`);
    }
  }

  await browser.close();
  console.log('🎉 All rendering and verification steps complete!');
})();
