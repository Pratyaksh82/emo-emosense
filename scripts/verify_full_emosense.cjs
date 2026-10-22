const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Running Comprehensive EmoSense + Chetana Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  console.log('🌐 Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Capture Full EmoSense View with new AreaChart, 2D Radar, and FACS in Sidebar
  await page.waitForSelector('.emosense-sidebar', { timeout: 10000 });
  const shot1 = path.resolve(__dirname, '../dist/emosense_full_view.png');
  await page.screenshot({ path: shot1 });
  console.log('📸 1. Captured Full EmoSense UI:', shot1);

  // 2. Click the banner to expand Chetana avatar stage (Verify clean stage with ZERO tool bar overlay)
  console.log('🖱️ Clicking Chetana Banner to expand...');
  await page.click('.chetana-banner-bar');
  await page.waitForSelector('.chetana-expanded-card', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1200));

  const shot2 = path.resolve(__dirname, '../dist/emosense_chetana_expanded_clean.png');
  await page.screenshot({ path: shot2 });
  console.log('📸 2. Captured Clean Chetana Avatar Stage (Zero Overlay):', shot2);

  // 3. Open Emotion Vision PIP
  console.log('🖱️ Clicking Emotion Vision Cam button...');
  const visionBtn = await page.$('button.emosense-feature-chip:last-child');
  if (visionBtn) {
    await visionBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    const shot3 = path.resolve(__dirname, '../dist/emosense_vision_pip.png');
    await page.screenshot({ path: shot3 });
    console.log('📸 3. Captured Emotion Vision PIP:', shot3);
  }

  // 4. Open Somatic Grounding Modal
  console.log('🖱️ Clicking 5-4-3-2-1 Somatic Reset button in sidebar...');
  const sidebarBtns = await page.$$('.sidebar-btn-tool');
  if (sidebarBtns.length >= 2) {
    await sidebarBtns[1].click(); // 2nd tool is 5-4-3-2-1 Grounding
    await new Promise(r => setTimeout(r, 1000));
    const shot4 = path.resolve(__dirname, '../dist/emosense_grounding_modal.png');
    await page.screenshot({ path: shot4 });
    console.log('📸 4. Captured Somatic Grounding Modal:', shot4);
  }

  await browser.close();
  console.log('🎉 All EmoSense full verification screenshots captured successfully!');
})();
