const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Load the breath_0 image directly and measure its alpha pixels
  await page.goto('http://localhost:5174/poses/stage_cel_breath_0.png');
  
  const bounds = await page.evaluate(() => {
    const img = document.querySelector('img');
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const idata = ctx.getImageData(0, 0, c.width, c.height).data;
    
    let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
    // Count pixels per column
    const colCounts = new Array(c.width).fill(0);
    
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const a = idata[(y * c.width + x) * 4 + 3];
        if (a > 20) {
          colCounts[x]++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    // Find centroid X of non-transparent pixels
    let totalWeight = 0;
    let sumX = 0;
    for (let x = minX; x <= maxX; x++) {
      totalWeight += colCounts[x];
      sumX += x * colCounts[x];
    }
    const centroidX = Math.round(sumX / totalWeight);

    return {
      width: c.width,
      height: c.height,
      minX,
      maxX,
      minY,
      maxY,
      boxWidth: maxX - minX,
      boxHeight: maxY - minY,
      boxCenterX: Math.round((minX + maxX) / 2),
      centroidX
    };
  });
  
  console.log('CHETANA CEL BOUNDS:', JSON.stringify(bounds, null, 2));
  await browser.close();
})();
