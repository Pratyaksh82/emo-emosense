const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  try {
    console.log('Navigating to http://localhost:5174/...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const clickButtonByText = async (pattern) => {
      const btns = await page.$$('button');
      for (const b of btns) {
        const text = await page.evaluate(el => el.textContent, b);
        if (pattern.test(text)) {
          await b.click();
          return true;
        }
      }
      return false;
    };

    // 1. Capture Double Nod during peak dip (Up/Down + Front/Back + Side/Side)
    console.log('Testing Double Nod...');
    await clickButtonByText(/Double Nod/i);
    // Wait ~280ms into the nod dip
    await new Promise(r => setTimeout(r, 280));
    const nodPic = path.resolve(__dirname, '../public/poses/test_nod_down_front.png');
    await page.screenshot({ path: nodPic });
    console.log('Saved:', nodPic);

    // Wait for nod recovery
    await new Promise(r => setTimeout(r, 1100));

    // 2. Capture Deep Empathy Dip
    console.log('Testing Deep Empathy Dip...');
    await clickButtonByText(/Empathy Dip/i);
    // Wait ~450ms into deep dip
    await new Promise(r => setTimeout(r, 450));
    const empathyPic = path.resolve(__dirname, '../public/poses/test_empathy_dip_front.png');
    await page.screenshot({ path: empathyPic });
    console.log('Saved:', empathyPic);

    await new Promise(r => setTimeout(r, 1500));

    // 3. Capture Curious Side-to-Side Tilt
    console.log('Testing Curious Tilt...');
    await clickButtonByText(/Curious Tilt/i);
    await new Promise(r => setTimeout(r, 400));
    const tiltPic = path.resolve(__dirname, '../public/poses/test_curious_side_tilt.png');
    await page.screenshot({ path: tiltPic });
    console.log('Saved:', tiltPic);

    await new Promise(r => setTimeout(r, 1200));

    // 4. Capture Reassuring Side-to-Side Shake
    console.log('Testing Reassure Shake...');
    await clickButtonByText(/Reassure Shake/i);
    await new Promise(r => setTimeout(r, 250));
    const shakePic = path.resolve(__dirname, '../public/poses/test_reassure_shake_side.png');
    await page.screenshot({ path: shakePic });
    console.log('Saved:', shakePic);

    console.log('All nodding & head motion captures completed!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
