const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const brainDir = 'C:\\Users\\praty\\.gemini\\antigravity-ide\\brain\\6e8ae898-d86b-41a0-b478-90996bf27902';
const rootDir = 'c:\\Users\\praty\\Desktop\\2d model';

async function main() {
  console.log('[1/3] Copying App Icons to brain directory...');
  fs.copyFileSync(
    path.join(rootDir, 'public/icons/icon-512x512.png'),
    path.join(brainDir, 'emosense_app_icon_512.png')
  );
  fs.copyFileSync(
    path.join(rootDir, 'public/icons/icon-192x192.png'),
    path.join(brainDir, 'emosense_app_icon_192.png')
  );

  console.log('[2/3] Launching Puppeteer to capture isolated banner cards...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 750, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2200));

  // 1. Android / Chrome Banner Card Isolated
  const bannerEl = await page.$('.pwa-card');
  if (bannerEl) {
    const shotPath = path.join(brainDir, 'install_banner_card_android.png');
    await bannerEl.screenshot({ path: shotPath });
    console.log('Saved install_banner_card_android.png');
  }

  // 2. iOS Guide Card Isolated
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2200));

  const iosBannerEl = await page.$('.pwa-card');
  if (iosBannerEl) {
    const shotPath = path.join(brainDir, 'install_banner_card_ios.png');
    await iosBannerEl.screenshot({ path: shotPath });
    console.log('Saved install_banner_card_ios.png');
  }

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
