const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Puppeteer Team Architecture Manual PDF Renderer...');
  const htmlPath = path.resolve(__dirname, '../dist/team_architecture_manual.html');
  const pdfDistPath = path.resolve(__dirname, '../dist/EMOSENSE_2D_AVATAR_STUDIO_TEAM_MANUAL.pdf');
  const pdfProjectRoot = path.resolve(__dirname, '../EMOSENSE_2D_AVATAR_STUDIO_TEAM_MANUAL.pdf');
  const pdfDesktopRoot = path.resolve('C:/Users/praty/Desktop/EMOSENSE_2D_AVATAR_STUDIO_TEAM_MANUAL.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ HTML source not found: ${htmlPath}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
  console.log(`🌐 Loading HTML manual: file://${htmlPath}`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 90000 });

  const pageCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  console.log(`📄 Total pages detected in DOM: ${pageCount}`);

  // Generate PDF
  console.log('🖨️ Generating A4 PDF...');
  await page.pdf({
    path: pdfDistPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  // Verify and copy
  const stats = fs.statSync(pdfDistPath);
  console.log(`✅ Team Architecture Manual PDF generated successfully in dist!`);
  console.log(`📁 File: ${pdfDistPath}`);
  console.log(`⚖️ Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);

  fs.copyFileSync(pdfDistPath, pdfProjectRoot);
  console.log(`📋 Copied to Project Root: ${pdfProjectRoot}`);

  fs.copyFileSync(pdfDistPath, pdfDesktopRoot);
  console.log(`📋 Copied to Desktop: ${pdfDesktopRoot}`);

  // Generate visual previews of key manual pages for quality check
  const previewPages = [1, 2, 3, 4, 5, 6, 9, 10, 12, 13, 14, 15, 16];
  console.log('📸 Generating visual inspection previews for key manual pages...');
  for (const pNum of previewPages) {
    try {
      const pageElem = await page.$(`#page-${pNum}`);
      if (pageElem) {
        const previewPath = path.resolve(__dirname, `../dist/team_manual_page_${pNum}_preview.png`);
        await pageElem.screenshot({ path: previewPath });
        console.log(`   - Saved Page ${pNum} preview: ${previewPath}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Warning generating preview for Page ${pNum}:`, err.message);
    }
  }

  await browser.close();
  console.log('🎉 All team architecture manual rendering and verification steps complete!');
})();
