const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Launching Puppeteer browser to verify Therapist Seated Avatar...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('PAGE ERROR:', msg.text());
    }
  });

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  console.log('Page loaded successfully.');

  // Wait 2.5s for initial assets and 60fps canvas loop to settle
  await new Promise(r => setTimeout(r, 2500));

  // Screenshot 1: Baseline Seated Therapist Desk Idle with Notepad and Attentive Poise
  await page.screenshot({ path: 'public/poses/therapist_01_baseline_medium.png' });
  console.log('Captured: therapist_01_baseline_medium.png');

  // Trigger Close-Up Eye Contact camera preset
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Close-Up') || text === 'Close-Up') {
      await b.click();
      console.log('Clicked Close-Up Camera Preset');
      break;
    }
  }

  // Wait 1.8s for smooth camera ease push-in
  await new Promise(r => setTimeout(r, 1800));
  await page.screenshot({ path: 'public/poses/therapist_02_closeup_eye_contact.png' });
  console.log('Captured: therapist_02_closeup_eye_contact.png');

  // Trigger "Glance Notes" / "Notes Glance"
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Glance Notes') || text.includes('Notes Glance')) {
      await b.click();
      console.log('Clicked Glance Notes');
      break;
    }
  }

  // Wait 0.5s for gaze to dip down to notepad
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'public/poses/therapist_03_notes_glance_active.png' });
  console.log('Captured: therapist_03_notes_glance_active.png');

  // Trigger Namaste + Joyful Emotion
  const emoButtons = await page.$$('.emotion-btn');
  if (emoButtons.length >= 2) {
    await emoButtons[1].click(); // Happy / Joy
    console.log('Clicked Happy Emotion');
  }

  const gestureButtons = await page.$$('.gesture-btn');
  for (const b of gestureButtons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Namaste')) {
      await b.click();
      console.log('Clicked Namaste Pose');
      break;
    }
  }

  // Switch back to Medium camera
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Medium') || text === 'Medium') {
      await b.click();
      console.log('Clicked Medium Camera');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'public/poses/therapist_04_namaste_golden_aura.png' });
  console.log('Captured: therapist_04_namaste_golden_aura.png');

  // Trigger Hand to Heart + Empathetic Emotion
  if (emoButtons.length >= 4) {
    await emoButtons[3].click(); // Empathy
    console.log('Clicked Empathy Emotion');
  }

  for (const b of gestureButtons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Hand to Heart') || text.includes('Heart')) {
      await b.click();
      console.log('Clicked Hand to Heart Pose');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'public/poses/therapist_05_heart_empathy_aura.png' });
  console.log('Captured: therapist_05_heart_empathy_aura.png');

  await browser.close();
  console.log('All verification captures completed successfully!');
})();
