const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  const result = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    const load = (src) => new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = src;
    });

    const body = await load('/poses/decoupled_body_wave.png');
    ctx.drawImage(body, 0, 0);
    const bodyData = ctx.getImageData(650, 400, 150, 150).data;

    let nonZeroBody = 0;
    for (let i = 3; i < bodyData.length; i += 4) {
      if (bodyData[i] > 10) nonZeroBody++;
    }

    return { nonZeroBody, totalPixels: bodyData.length / 4 };
  });

  console.log('Wave Body Pixels near right collar/hair:', result);
  await browser.close();
})();
