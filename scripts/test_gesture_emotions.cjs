const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));

    // Test combinations:
    // 1. Namaste + Happy
    // 2. Wave + Calm
    // 3. Chin Rest + Empathy
    // 4. Hand to Heart + Surprised
    
    // Select Namaste
    console.log('Testing Namaste + Happy...');
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Namaste')) {
        await b.click();
        break;
      }
    }
    // Click Happy
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Happy')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    const out1 = path.resolve(__dirname, '../public/poses/test_live_namaste_happy.png');
    await page.screenshot({ path: out1 });
    console.log('Saved:', out1);

    // Select Wave + Sad
    console.log('Testing Wave + Sad...');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Wave')) {
        await b.click();
        break;
      }
    }
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Sad')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    const out2 = path.resolve(__dirname, '../public/poses/test_live_wave_sad.png');
    await page.screenshot({ path: out2 });
    console.log('Saved:', out2);

    // Select Chin Rest + Empathy
    console.log('Testing Chin Rest + Empathy...');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Listen') || text.includes('Chin')) {
        await b.click();
        break;
      }
    }
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Empathetic')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    const out3 = path.resolve(__dirname, '../public/poses/test_live_chin_rest_empathy.png');
    await page.screenshot({ path: out3 });
    console.log('Saved:', out3);

    // Select Hand to Heart + Tense
    console.log('Testing Hand to Heart + Tense...');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Heart') || text.includes('Hand to Heart')) {
        await b.click();
        break;
      }
    }
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Stress') || text.includes('Tense')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    const out4 = path.resolve(__dirname, '../public/poses/test_live_heart_tense.png');
    await page.screenshot({ path: out4 });
    console.log('Saved:', out4);

  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    await browser.close();
  }
})();
