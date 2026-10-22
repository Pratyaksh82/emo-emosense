const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function main() {
  const iconsDir = path.resolve('public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // HTML SVG template for EmoSense Icon
  const getSvgHtml = (size, isMaskable) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: ${size}px;
          height: ${size}px;
          background: ${isMaskable ? '#060911' : 'transparent'};
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="50%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#7F77DD" />
          </linearGradient>
          <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#e0e7ff" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="${size * 0.04}" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        ${isMaskable ? `
          <!-- Safe-area bounded container for maskable icon -->
          <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${size * 0.2}" fill="url(#bgGrad)" filter="url(#glow)" />
        ` : `
          <!-- Full squircle container -->
          <rect x="${size * 0.04}" y="${size * 0.04}" width="${size * 0.92}" height="${size * 0.92}" rx="${size * 0.22}" fill="url(#bgGrad)" />
        `}

        <!-- Glowing border accent -->
        <rect x="${isMaskable ? size * 0.1 : size * 0.04}" y="${isMaskable ? size * 0.1 : size * 0.04}" 
              width="${isMaskable ? size * 0.8 : size * 0.92}" height="${isMaskable ? size * 0.8 : size * 0.92}" 
              rx="${isMaskable ? size * 0.2 : size * 0.22}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="${size * 0.015}" />

        <!-- Bold Stylized 'E' -->
        <text x="50%" y="${isMaskable ? '56%' : '56%'}" text-anchor="middle" dominant-baseline="middle" 
              font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" 
              font-size="${size * 0.52}" font-weight="800" fill="url(#textGrad)">
          E
        </text>

        <!-- Sparkle accent in top right -->
        <circle cx="${size * (isMaskable ? 0.76 : 0.80)}" cy="${size * (isMaskable ? 0.24 : 0.20)}" r="${size * 0.035}" fill="#a5f3fc" />
      </svg>
    </body>
    </html>
  `;

  // 1. Generate 192x192
  await page.setViewport({ width: 192, height: 192, deviceScaleFactor: 1 });
  await page.setContent(getSvgHtml(192, false));
  await page.screenshot({ path: path.join(iconsDir, 'icon-192x192.png'), omitBackground: true });
  console.log('Generated icon-192x192.png');

  // 2. Generate 512x512
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.setContent(getSvgHtml(512, false));
  await page.screenshot({ path: path.join(iconsDir, 'icon-512x512.png'), omitBackground: true });
  console.log('Generated icon-512x512.png');

  // 3. Generate 512x512 maskable
  await page.setContent(getSvgHtml(512, true));
  await page.screenshot({ path: path.join(iconsDir, 'icon-maskable-512x512.png'), omitBackground: false });
  console.log('Generated icon-maskable-512x512.png');

  // 4. Generate Apple Touch Icon (180x180)
  await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
  await page.setContent(getSvgHtml(180, false));
  await page.screenshot({ path: path.join(iconsDir, 'apple-touch-icon.png'), omitBackground: false });
  console.log('Generated apple-touch-icon.png');

  await browser.close();
  console.log('All PWA icons generated successfully in public/icons/');
}

main().catch(console.error);
