const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function encodeBase64(imageFilePath) {
  if (fs.existsSync(imageFilePath)) {
    const ext = path.extname(imageFilePath).replace('.', '');
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    const data = fs.readFileSync(imageFilePath);
    return `data:image/${mime};base64,${data.toString('base64')}`;
  }
  console.warn(`[WARN] Image not found: ${imageFilePath}`);
  return '';
}

async function main() {
  console.log('[1/4] Encoding embedded visual assets to Base64...');
  const brainDir = 'C:\\Users\\praty\\.gemini\\antigravity-ide\\brain\\6e8ae898-d86b-41a0-b478-90996bf27902';
  
  const fullpageB64 = encodeBase64(path.join(brainDir, 'fullpage_1440.png'));
  const canvasB64 = encodeBase64(path.join(brainDir, 'direct_canvas_dump.png'));
  
  // Find after session report click screenshot
  let reportB64 = '';
  const files = fs.readdirSync(brainDir);
  const repFile = files.find(f => f.startsWith('after_session_report_click') && f.endsWith('.png'));
  if (repFile) {
    reportB64 = encodeBase64(path.join(brainDir, repFile));
  } else {
    reportB64 = fullpageB64;
  }

  console.log('[2/4] Reading and preparing HTML template...');
  const templatePath = path.resolve('scripts/chetana_report_template.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html.replace('{{FULLPAGE_IMAGE_BASE64}}', fullpageB64);
  html = html.replace('{{CANVAS_IMAGE_BASE64}}', canvasB64);
  html = html.replace('{{REPORT_IMAGE_BASE64}}', reportB64);

  const compiledHtmlPath = path.resolve('scripts/compiled_report.html');
  fs.writeFileSync(compiledHtmlPath, html, 'utf8');

  console.log('[3/4] Launching Puppeteer for A4 vector compilation...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage();
  const fileUrl = `file:///${compiledHtmlPath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('[4/4] Generating exact A4 PDF with high-DPI rasterization...');
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  const outputPdfPath = path.resolve('c:/Users/praty/Desktop/2d model/chetana_engineering_and_clinical_report.pdf');
  const artifactPdfPath = path.resolve('C:/Users/praty/.gemini/antigravity-ide/brain/6e8ae898-d86b-41a0-b478-90996bf27902/chetana_engineering_and_clinical_report.pdf');

  fs.writeFileSync(outputPdfPath, pdfBuffer);
  fs.writeFileSync(artifactPdfPath, pdfBuffer);

  const sizeMb = (pdfBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✅ SUCCESS: Generated publication-grade PDF report at: ${outputPdfPath} (${sizeMb} MB)`);
  console.log(`Saved copy to artifact directory: ${artifactPdfPath}`);

  await browser.close();
}

main().catch(console.error);
