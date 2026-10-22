const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Puppeteer Chetana Elevation Roadmap PDF Renderer...');
  const htmlPath = path.resolve(__dirname, '../dist/chetana_elevation_blueprint.html');
  const pdfDistPath = path.resolve(__dirname, '../dist/CHETANA_ENGINEERING_ELEVATION_ROADMAP.pdf');
  const pdfProjectRoot = path.resolve(__dirname, '../CHETANA_ENGINEERING_ELEVATION_ROADMAP.pdf');

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
  console.log(`🌐 Loading HTML roadmap: file://${htmlPath}`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 90000 });

  const pageCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  console.log(`📄 Total pages detected in DOM: ${pageCount}`);

  // Generate lightweight high-resolution A4 PDF
  console.log('🖨️ Generating A4 PDF...');
  await page.pdf({
    path: pdfDistPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  // Verify and copy to project root
  const stats = fs.statSync(pdfDistPath);
  console.log(`✅ Chetana Elevation Roadmap PDF generated successfully!`);
  console.log(`📁 File: ${pdfDistPath}`);
  console.log(`⚖️ Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);

  fs.copyFileSync(pdfDistPath, pdfProjectRoot);
  console.log(`📋 Copied to Project Root: ${pdfProjectRoot}`);

  await browser.close();
  console.log('✨ All operations completed cleanly!');
})();
