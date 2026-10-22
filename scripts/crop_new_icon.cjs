const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\praty\\.gemini\\antigravity-ide\\brain\\6e8ae898-d86b-41a0-b478-90996bf27902';
const rawIconSrc = path.join(brainDir, 'emosense_app_icon_v2_1792445813689.jpg');
const iconsDir = path.resolve('public/icons');

// Copy raw image to public so it is served by the dev server
fs.copyFileSync(rawIconSrc, path.join(iconsDir, 'raw_icon.jpg'));

async function main() {
  console.log('[1/3] Launching Puppeteer to crop and export new master icon via HTTP...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Load from local dev server
  await page.goto('http://localhost:5174/icons/raw_icon.jpg', { waitUntil: 'networkidle2' });

  const result = await page.evaluate(() => {
    const img = document.querySelector('img');
    const sx = 185;
    const sy = 188;
    const sDim = 653;

    // 512x512
    const c512 = document.createElement('canvas');
    c512.width = 512;
    c512.height = 512;
    const ctx512 = c512.getContext('2d');
    ctx512.imageSmoothingEnabled = true;
    ctx512.imageSmoothingQuality = 'high';
    ctx512.drawImage(img, sx, sy, sDim, sDim, 0, 0, 512, 512);

    // 192x192
    const c192 = document.createElement('canvas');
    c192.width = 192;
    c192.height = 192;
    const ctx192 = c192.getContext('2d');
    ctx192.imageSmoothingEnabled = true;
    ctx192.imageSmoothingQuality = 'high';
    ctx192.drawImage(img, sx, sy, sDim, sDim, 0, 0, 192, 192);

    return {
      b64_512: c512.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''),
      b64_192: c192.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
    };
  });

  console.log('[2/3] Writing cropped icons to files...');
  const buf512 = Buffer.from(result.b64_512, 'base64');
  const buf192 = Buffer.from(result.b64_192, 'base64');

  fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), buf512);
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), buf512);
  fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), buf192);
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), buf192);

  // Save to brain directory for user viewing
  fs.writeFileSync(path.join(brainDir, 'emosense_app_icon_master_512.png'), buf512);
  fs.writeFileSync(path.join(brainDir, 'emosense_app_icon_master_192.png'), buf192);

  // Clean up temp
  if (fs.existsSync(path.join(iconsDir, 'raw_icon.jpg'))) {
    fs.unlinkSync(path.join(iconsDir, 'raw_icon.jpg'));
  }

  await browser.close();
  console.log('✅ SUCCESS: New master icons cropped and generated cleanly!');
}

main().catch(console.error);
