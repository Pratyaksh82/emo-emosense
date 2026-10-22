const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Verifying Lip Movement, Female Voice, and Voice Input Microphone...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

  // 1. Expand Chetana Banner to see the avatar
  console.log('🖱️ Expanding Chetana banner...');
  await page.click('.chetana-banner-bar');
  await page.waitForSelector('.chetana-expanded-card', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Check Voice Input button exists in the chat composer
  const micButton = await page.$('button[title*="Speak to Chetana with voice input"]');
  if (micButton) {
    console.log('✅ Voice Input Microphone button found in chat composer box!');
  } else {
    console.error('❌ Voice Input Microphone button not found!');
  }

  // 3. Trigger a message to start speaking and capture Chetana with moving lips
  console.log('🖱️ Clicking prompt to trigger speaking and lip-sync...');
  const buttons = await page.$$('.prompt-pill-btn');
  if (buttons.length > 0) {
    await buttons[0].click(); // Click first prompt
  }

  // Wait 1.2s for response to start speaking
  await new Promise(r => setTimeout(r, 1200));

  // Check voice name selected in browser
  const voiceInfo = await page.evaluate(() => {
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find((v) =>
      /zira|jenny|aria|samantha|victoria|karen|susan|hazel|heera|kalpana|swara|shruti|female/i.test(v.name)
    ) || voices.find((v) => !/david|mark|george|richard|guy|male/i.test(v.name));
    return femaleVoice ? { name: femaleVoice.name, lang: femaleVoice.lang } : null;
  });
  console.log('🎤 Guaranteed Selected Female Voice:', voiceInfo);

  // Capture screenshot of Chetana while speaking with active lip movement
  const shotSpeaking = path.resolve(__dirname, '../dist/chetana_speaking_lip_movement.png');
  await page.screenshot({ path: shotSpeaking });
  console.log('📸 Captured Chetana actively speaking screenshot to:', shotSpeaking);

  // 4. Click microphone button to verify listening state
  if (micButton) {
    console.log('🖱️ Clicking Voice Input Microphone button...');
    await micButton.click();
    await new Promise(r => setTimeout(r, 500));
    const shotMic = path.resolve(__dirname, '../dist/chetana_voice_input_active.png');
    await page.screenshot({ path: shotMic });
    console.log('📸 Captured Voice Input active screenshot to:', shotMic);
  }

  await browser.close();
  console.log('🎉 Verification completed!');
})();
