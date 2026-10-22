const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Puppeteer Retrospective PDF Rendering Engine...');
  const htmlPath = path.resolve(__dirname, '../dist/retrospective_report.html');
  const pdfDistPath = path.resolve(__dirname, '../dist/EMOSENSE_CHETANA_2DAY_RETROSPECTIVE_REPORT.pdf');
  const pdfProjectRoot = path.resolve(__dirname, '../EMOSENSE_CHETANA_2DAY_RETROSPECTIVE_REPORT.pdf');
  const pdfDesktopRoot = path.resolve('C:/Users/praty/Desktop/EMOSENSE_CHETANA_2DAY_RETROSPECTIVE_REPORT.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file does not exist:', htmlPath);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
  
  console.log('🌐 Loading HTML dossier into headless Chromium...');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 90000 });

  const pageCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  console.log(`📄 Total pages detected in DOM: ${pageCount}`);

  // Generate PDF
  console.log('🖨️ Printing high-DPI A4 PDF with background graphics...');
  await page.pdf({
    path: pdfDistPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  // Verify and copy
  const stats = fs.statSync(pdfDistPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`✅ Retrospective PDF generated successfully!`);
  console.log(`📁 File: ${pdfDistPath}`);
  console.log(`⚖️ Size: ${sizeMB} MB (${stats.size} bytes)`);

  fs.copyFileSync(pdfDistPath, pdfProjectRoot);
  console.log(`📋 Copied to Project Root: ${pdfProjectRoot}`);

  fs.copyFileSync(pdfDistPath, pdfDesktopRoot);
  console.log(`📋 Copied to Desktop: ${pdfDesktopRoot}`);

  await browser.close();
  console.log('🎉 PDF Generation & Deployment Complete!');
})();
