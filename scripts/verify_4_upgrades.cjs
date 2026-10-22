const puppeteer = require('c:/Users/praty/Desktop/2d model/node_modules/puppeteer');
const path = require('path');

(async () => {
  console.log('Starting Puppeteer verification for 4 Anime Acting Upgrades...');
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
    await page.screenshot({ path: 'public/poses/live_upgrade_final_01_idle.png' });
    console.log('Saved live_upgrade_final_01_idle.png');

    // 2. Trigger Notes Glance (Floating Pupils socket glide down towards notes)
    console.log('Testing Notes Glance...');
    await clickButtonByText(/Glance Notes|Notes Glance/i);
    await new Promise(r => setTimeout(r, 450));
    await page.screenshot({ path: 'public/poses/live_upgrade_final_02_notes.png' });
    console.log('Saved live_upgrade_final_02_notes.png');
    await new Promise(r => setTimeout(r, 1200));

    // 3. Trigger Curious Tilt (Articulated Eyebrows + Secondary Hair Lag)
    console.log('Testing Curious Tilt...');
    await clickButtonByText(/Curious Tilt/i);
    await new Promise(r => setTimeout(r, 450));
    await page.screenshot({ path: 'public/poses/live_upgrade_final_03_curious.png' });
    console.log('Saved live_upgrade_final_03_curious.png');
    await new Promise(r => setTimeout(r, 1200));

    // 4. Trigger Empathy Dip (Deep Empathy Nod + Secondary Hair Inertia)
    console.log('Testing Empathy Dip...');
    await clickButtonByText(/Empathy Dip/i);
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'public/poses/live_upgrade_final_04_empathy.png' });
    console.log('Saved live_upgrade_final_04_empathy.png');
    await new Promise(r => setTimeout(r, 1500));

    // 5. Trigger Candidate C Masterpiece Speech (Visemes with 3D Oral Cavity Depth)
    console.log('Testing Candidate C Masterpiece Speech Lip-Sync...');
    await clickButtonByText(/Play 5-Min Bilingual Showcase|Masterpiece Audio/i);
    await new Promise(r => setTimeout(r, 900));
    await page.screenshot({ path: 'public/poses/live_upgrade_final_05_speech.png' });
    console.log('Saved live_upgrade_final_05_speech.png');

    console.log('All 5 live verification states captured successfully!');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
})();
