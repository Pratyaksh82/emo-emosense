const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Puppeteer Voice Engineering & Patent Blueprint Engine...');
  const htmlPath = path.resolve(__dirname, '../dist/voice_master_engineering_blueprint.html');
  const pdfDistPath = path.resolve(__dirname, '../dist/EMOSENSE_VOICE_MASTER_ENGINEERING_AND_PATENT_BLUEPRINT.pdf');
  const pdfProjectRoot = path.resolve(__dirname, '../EMOSENSE_VOICE_MASTER_ENGINEERING_AND_PATENT_BLUEPRINT.pdf');
  const pdfDesktopRoot = path.resolve('C:/Users/praty/Desktop/EMOSENSE_VOICE_MASTER_ENGINEERING_AND_PATENT_BLUEPRINT.pdf');
  const pdfEmoGirlRoot = path.resolve('C:/Users/praty/Desktop/emo-girl/EMOSENSE_VOICE_MASTER_ENGINEERING_AND_PATENT_BLUEPRINT.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ HTML source not found: ${htmlPath}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
  
  console.log(`📄 Navigating to: file://${htmlPath}`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 90000 });

  const pageCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  console.log(`📄 Total pages detected in DOM: ${pageCount}`);

  // Generate PDF
  console.log('🖨️ Compiling A4 high-DPI PDF document...');
  await page.pdf({
    path: pdfDistPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  // Verify and copy
  const stats = fs.statSync(pdfDistPath);
  console.log(`✅ Voice Blueprint PDF generated successfully in dist!`);
  console.log(`📁 File: ${pdfDistPath}`);
  console.log(`⚖️ Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size.toLocaleString()} bytes)`);

  fs.copyFileSync(pdfDistPath, pdfProjectRoot);
  console.log(`📋 Copied to Project Root: ${pdfProjectRoot}`);

  fs.copyFileSync(pdfDistPath, pdfDesktopRoot);
  console.log(`📋 Copied to Desktop: ${pdfDesktopRoot}`);

  try {
    fs.copyFileSync(pdfDistPath, pdfEmoGirlRoot);
    console.log(`📋 Copied to Emo-Girl: ${pdfEmoGirlRoot}`);
  } catch (e) {
    console.log(`Note on emo-girl copy: ${e.message}`);
  }

  // Generate visual previews of key pages
  const previewPages = [1, 2, 3, 6, 7, 10, 11];
  console.log('📸 Generating visual inspection previews for key blueprint pages...');
  for (const pNum of previewPages) {
    try {
      const pageElem = await page.$(`#page-${pNum}`);
      if (pageElem) {
        const previewPath = path.resolve(__dirname, `../dist/voice_blueprint_page_${pNum}_preview.png`);
        await pageElem.screenshot({ path: previewPath });
        console.log(`   - Saved Page ${pNum} preview: ${previewPath}`);
      }
    } catch (err) {
      console.warn(`Could not capture page ${pNum}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('🎉 Voice Master Engineering & Patent Blueprint rendering complete!');
})();
