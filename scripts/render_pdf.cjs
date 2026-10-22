const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Puppeteer PDF Engine...');
  const htmlPath = path.resolve(__dirname, '../dist/performance_whitepaper.html');
  const pdfPath = path.resolve(__dirname, '../dist/EMOSENSE_CHETANA_AVATAR_PERFORMANCE_WHITEPAPER.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Error: HTML file not found at:', htmlPath);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--font-render-hinting=medium'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

  console.log('📖 Loading HTML document...');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  // Evaluate number of pages rendered
  const pageCount = await page.evaluate(() => {
    return document.querySelectorAll('.page').length;
  });
  console.log(`📄 Total pages detected in DOM: ${pageCount}`);

  console.log('🖨️ Printing high-definition A4 PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  await browser.close();

  const stats = fs.statSync(pdfPath);
  console.log(`✅ PDF successfully generated!`);
  console.log(`📁 File: ${pdfPath}`);
  console.log(`⚖️ Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
  console.log(`📄 Page Count: ${pageCount} pages`);
})();
