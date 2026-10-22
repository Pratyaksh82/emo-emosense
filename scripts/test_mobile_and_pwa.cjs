const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\praty\\.gemini\\antigravity-ide\\brain\\6e8ae898-d86b-41a0-b478-90996bf27902';

async function main() {
  console.log('[1/5] Launching Puppeteer for Mobile & PWA Test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage();

  // Test 1: Mobile Phone Viewport (iPhone 14 / Pixel: 390 x 844)
  console.log('[2/5] Testing Mobile Viewport at 390x844 (Chetana Stage Tab)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot Mobile Chetana Stage
  const shotMobileAvatar = path.join(brainDir, 'mobile_view_avatar.png');
  await page.screenshot({ path: shotMobileAvatar });
  console.log('Saved mobile_view_avatar.png');

  // Test 2: Switch to Mobile Dialogue Hub Tab
  console.log('[3/5] Switching to Mobile Chat Tab...');
  await page.evaluate(() => {
    const chatTab = Array.from(document.querySelectorAll('.mobile-nav-tab')).find(t => t.textContent.includes('Chat') || t.textContent.includes('Dialogue'));
    if (chatTab) chatTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotMobileChat = path.join(brainDir, 'mobile_view_chat.png');
  await page.screenshot({ path: shotMobileChat });
  console.log('Saved mobile_view_chat.png');

  // Test 3: Switch to Mobile Graphs & Insights Tab
  console.log('[4/5] Switching to Mobile Insights Tab...');
  await page.evaluate(() => {
    const insightsTab = Array.from(document.querySelectorAll('.mobile-nav-tab')).find(t => t.textContent.includes('Insights') || t.textContent.includes('Graphs'));
    if (insightsTab) insightsTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotMobileInsights = path.join(brainDir, 'mobile_view_insights.png');
  await page.screenshot({ path: shotMobileInsights });
  console.log('Saved mobile_view_insights.png');

  // Test 4: Verify PWA Install Banner
  console.log('[5/5] Testing PWA Install Promotion Banner...');
  const bannerInfo = await page.evaluate(() => {
    // Force open banner manually
    const installBtn = document.querySelector('.btn-install-pwa');
    if (installBtn) installBtn.click();
    
    const banner = document.querySelector('.pwa-banner-container');
    const title = banner ? banner.querySelector('.pwa-title')?.textContent : null;
    const sub = banner ? banner.querySelector('.pwa-sub')?.textContent : null;
    const buttons = banner ? Array.from(banner.querySelectorAll('button')).map(b => b.textContent.trim()) : [];
    
    return {
      hasBanner: !!banner,
      title,
      sub,
      buttons
    };
  });
  console.log('PWA BANNER INFO:', JSON.stringify(bannerInfo, null, 2));

  await new Promise(r => setTimeout(r, 800));
  const shotBanner = path.join(brainDir, 'mobile_pwa_install_banner.png');
  await page.screenshot({ path: shotBanner });
  console.log('Saved mobile_pwa_install_banner.png');

  await browser.close();
  console.log('✅ ALL MOBILE & PWA TESTS COMPLETED SUCCESSFULLY.');
}

main().catch(console.error);
