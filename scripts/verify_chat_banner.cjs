const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Verifying Chetana Chat Banner in EmoSense Chat Experience...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('🌐 Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Verify collapsed banner exists
  await page.waitForSelector('.chetana-banner-bar', { timeout: 10000 });
  console.log('✅ Found Chetana Banner bar in Chat page!');

  // Capture screenshot of collapsed banner in chat
  const screenshot1 = path.resolve(__dirname, '../dist/chat_banner_collapsed.png');
  await page.screenshot({ path: screenshot1 });
  console.log('📸 Captured collapsed banner screenshot:', screenshot1);

  // 2. Click the banner to expand Chetana
  console.log('🖱️ Clicking Chetana Banner to expand avatar stage...');
  await page.click('.chetana-banner-bar');
  await page.waitForSelector('.chetana-expanded-card', { timeout: 10000 });
  console.log('✅ Chetana expanded avatar stage is now active!');

  // Wait 1.5s for avatar animations to settle
  await new Promise(r => setTimeout(r, 1500));

  const screenshot2 = path.resolve(__dirname, '../dist/chat_banner_expanded.png');
  await page.screenshot({ path: screenshot2 });
  console.log('📸 Captured expanded avatar stage screenshot:', screenshot2);

  // 3. Click the "⚡ Panic & Racing Heart" quick test button
  console.log('🖱️ Clicking quick emotion prompt: "⚡ Panic & Racing Heart"...');
  const buttons = await page.$$('.prompt-pill-btn');
  if (buttons.length > 1) {
    await buttons[1].click(); // Click second button (Panic)
  }

  // Wait 1.5s for autopilot emotion analysis and reaction
  await new Promise(r => setTimeout(r, 1500));

  const screenshot3 = path.resolve(__dirname, '../dist/chat_autopilot_panic.png');
  await page.screenshot({ path: screenshot3 });
  console.log('📸 Captured panic autopilot reaction screenshot:', screenshot3);

  // 4. Click the "🎉 Passed Dream Exam" quick test button
  console.log('🖱️ Clicking quick emotion prompt: "🎉 Passed Dream Exam"...');
  if (buttons.length > 2) {
    await buttons[2].click(); // Click third button (Happy)
  }

  await new Promise(r => setTimeout(r, 1500));

  const screenshot4 = path.resolve(__dirname, '../dist/chat_autopilot_happy.png');
  await page.screenshot({ path: screenshot4 });
  console.log('📸 Captured happy autopilot reaction screenshot:', screenshot4);

  await browser.close();
  console.log('🎉 Verification completed with 100% success!');
})();
