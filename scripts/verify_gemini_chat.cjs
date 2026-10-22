const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Launching Puppeteer to verify Gemini Chat Replies in EmoSense...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });

  // Wait for composer input
  await page.waitForSelector('input[type="text"], textarea');
  console.log('✅ Chat composer input found!');

  // Type a test prompt
  const testInput = "Chetana, I had an exhausting day and feel like nobody understands the pressure I'm under.";
  await page.type('input[type="text"]', testInput);

  // Click Send button
  console.log('🖱️ Clicking Send button...');
  await page.click('button.composer-btn-send, button[type="submit"], button:has(svg.lucide-send)');

  // Wait for AI response bubble to appear
  console.log('⏳ Waiting for Gemini AI response...');
  await page.waitForFunction(() => {
    const bubbles = document.querySelectorAll('.chat-bubble-container.assistant .bubble-text-box');
    return bubbles.length > 1; // More than initial welcome message
  }, { timeout: 15000 });

  const aiReply = await page.evaluate(() => {
    const bubbles = document.querySelectorAll('.chat-bubble-container.assistant .bubble-text-box');
    return bubbles[bubbles.length - 1].textContent;
  });

  console.log('💬 Received Gemini AI Response in Chat:');
  console.log(aiReply);

  // Wait 1.5s for avatar lip movement/speech to settle
  await new Promise(r => setTimeout(r, 1500));

  const screenshotPath = path.join(__dirname, '../dist/gemini_ai_chat_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('📸 Screenshot captured to:', screenshotPath);

  await browser.close();
  console.log('🎉 Verification completed successfully!');
})();
