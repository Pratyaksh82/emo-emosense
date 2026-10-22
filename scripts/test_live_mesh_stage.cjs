const puppeteer = require('c:/Users/praty/Desktop/2d model/node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--enable-webgl', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  try {
    console.log('Navigating to http://localhost:5174/...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

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

    // 1. Capture Idle Rest state
    console.log('Capturing Idle Rest State...');
    await page.screenshot({ path: 'public/poses/live_01_idle_rest.png' });
    console.log('Saved live_01_idle_rest.png');

    // 2. Trigger Double Nod and capture during downward dip
    console.log('Testing Double Nod...');
    await clickButtonByText(/Double Nod/i);
    await new Promise(r => setTimeout(r, 320));
    await page.screenshot({ path: 'public/poses/live_02_double_nod_dip.png' });
    console.log('Saved live_02_double_nod_dip.png');
    await new Promise(r => setTimeout(r, 1200));

    // 3. Trigger Empathy Dip
    console.log('Testing Empathy Dip...');
    await clickButtonByText(/Empathy Dip/i);
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'public/poses/live_03_empathy_dip_deep.png' });
    console.log('Saved live_03_empathy_dip_deep.png');
    await new Promise(r => setTimeout(r, 1500));

    // 4. Trigger Curious Tilt
    console.log('Testing Curious Tilt...');
    await clickButtonByText(/Curious Tilt/i);
    await new Promise(r => setTimeout(r, 450));
    await page.screenshot({ path: 'public/poses/live_04_curious_tilt.png' });
    console.log('Saved live_04_curious_tilt.png');
    await new Promise(r => setTimeout(r, 1200));

    // 5. Trigger Reassure Shake
    console.log('Testing Reassure Shake...');
    await clickButtonByText(/Reassure Shake/i);
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: 'public/poses/live_05_reassure_shake.png' });
    console.log('Saved live_05_reassure_shake.png');
    await new Promise(r => setTimeout(r, 1400));

    // 6. Test with Namaste Gesture + Nod
    console.log('Testing Namaste Gesture + Nod...');
    await clickButtonByText(/Namaste Bow/i);
    await new Promise(r => setTimeout(r, 600));
    await clickButtonByText(/Double Nod/i);
    await new Promise(r => setTimeout(r, 320));
    await page.screenshot({ path: 'public/poses/live_06_namaste_nod.png' });
    console.log('Saved live_06_namaste_nod.png');

    console.log('Live WebGL Mesh verification successfully completed!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
