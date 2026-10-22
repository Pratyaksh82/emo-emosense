const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait 2.5s for canvas master rendering loop to initialize and render
  await new Promise(r => setTimeout(r, 2500));

  console.log('Taking default professional office screenshot...');
  const defaultPath = path.join(__dirname, '../public/poses/live_verified_office_default.png');
  await page.screenshot({ path: defaultPath });
  console.log('Saved:', defaultPath);

  // Test mouse gaze movement
  console.log('Moving mouse to upper-right to test head yaw & gaze tracking...');
  await page.mouse.move(1100, 200, { steps: 25 });
  await new Promise(r => setTimeout(r, 800));
  const gazePath = path.join(__dirname, '../public/poses/live_verified_mouse_gaze.png');
  await page.screenshot({ path: gazePath });
  console.log('Saved:', gazePath);

  // Return mouse to center
  await page.mouse.move(720, 450, { steps: 15 });
  await new Promise(r => setTimeout(r, 600));

  // Click Empathy Nod button
  console.log('Clicking Empathy Nod...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Empathy Dip'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 450)); // middle of nod dip
  const nodPath = path.join(__dirname, '../public/poses/live_verified_head_nod.png');
  await page.screenshot({ path: nodPath });
  console.log('Saved:', nodPath);

  // Click Curious Tilt button
  console.log('Clicking Curious Tilt...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Curious Tilt'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 550)); // peak of tilt
  const tiltPath = path.join(__dirname, '../public/poses/live_verified_head_tilt.png');
  await page.screenshot({ path: tiltPath });
  console.log('Saved:', tiltPath);

  // Test Namaste gesture (click Namaste button)
  console.log('Clicking Namaste...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Namaste'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const namastePath = path.join(__dirname, '../public/poses/live_verified_namaste.png');
  await page.screenshot({ path: namastePath });
  console.log('Saved:', namastePath);

  await browser.close();
  console.log('Verification run complete!');
})();
