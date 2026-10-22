const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Measure viewport_isolated.png directly
  const filePath = 'file:///C:/Users/praty/.gemini/antigravity-ide/brain/6e8ae898-d86b-41a0-b478-90996bf27902/viewport_isolated.png';
  await page.goto(filePath);
  
  const info = await page.evaluate(() => {
    const img = document.querySelector('img');
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Check pixel colors at y = c.height / 2 (y=205 for 411 height)
    // Find where the green kurta or face is
    const skinColumns = [];
    const idata = ctx.getImageData(0, 0, c.width, c.height).data;
    for (let x = 0; x < c.width; x++) {
      let isSkin = false;
      for (let y = 0; y < c.height; y++) {
        const idx = (y * c.width + x) * 4;
        const r = idata[idx], g = idata[idx+1], b = idata[idx+2];
        // Skin tone around [220, 170, 150]
        if (r > 200 && g > 150 && b > 130 && r > g && g > b) {
          isSkin = true;
          break;
        }
      }
      if (isSkin) skinColumns.push(x);
    }
    
    return {
      w: c.width,
      h: c.height,
      firstSkinX: skinColumns[0],
      lastSkinX: skinColumns[skinColumns.length - 1],
      skinCenterX: Math.round((skinColumns[0] + skinColumns[skinColumns.length - 1]) / 2),
      ratio: Math.round(((skinColumns[0] + skinColumns[skinColumns.length - 1]) / 2) / c.width * 100) + '%'
    };
  });
  
  console.log('VIEWPORT ISOLATED FACE INFO:', JSON.stringify(info, null, 2));
  await browser.close();
})();
