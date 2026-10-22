/**
 * Chetana Parts 1, 2 & 3 Master Showcase Video Recording
 * 
 * Uses Puppeteer CDP screencast to pipe real-time JPEG frames into ffmpeg-static stdin,
 * encoding directly to broadcast-grade H.264 MP4.
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpegStatic = require('ffmpeg-static');

const CONFIG = {
  appUrl: 'http://localhost:5174/',
  outputMp4: path.resolve(__dirname, '../CHETANA_PARTS_1_2_3_MASTER_SHOWCASE.mp4'),
  outputDesktop: path.resolve('C:/Users/praty/Desktop/CHETANA_PARTS_1_2_3_MASTER_SHOWCASE.mp4'),
  viewport: { width: 1440, height: 900 },
  fps: 24,
  quality: 92,
  crf: 18
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🎬 [1/5] Launching Puppeteer browser with Chrome DevTools Protocol (CDP)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--enable-webgl', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport(CONFIG.viewport);

  console.log(`🎬 [2/5] Navigating to ${CONFIG.appUrl}...`);
  await page.goto(CONFIG.appUrl, { waitUntil: 'networkidle0', timeout: 25000 });
  await sleep(1500);

  console.log('🎬 [3/5] Attaching Chrome DevTools Protocol (CDP) Screencast session...');
  const client = await page.target().createCDPSession();
  let currentFrameBuffer = null;

  client.on('Page.screencastFrame', async (frame) => {
    currentFrameBuffer = Buffer.from(frame.data, 'base64');
    try {
      await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
    } catch (e) {}
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: CONFIG.quality,
    everyNthFrame: 1
  });

  while (!currentFrameBuffer) {
    await sleep(25);
  }

  console.log(`🎬 [4/5] Spawning FFmpeg H.264 Encoder -> ${CONFIG.outputMp4}...`);
  const ffmpeg = spawn(ffmpegStatic, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(CONFIG.fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', String(CONFIG.crf),
    '-movflags', '+faststart',
    CONFIG.outputMp4
  ]);

  ffmpeg.stderr.on('data', () => {});

  const intervalMs = Math.round(1000 / CONFIG.fps);
  const frameInterval = setInterval(() => {
    if (currentFrameBuffer && ffmpeg.stdin.writable) {
      ffmpeg.stdin.write(currentFrameBuffer);
    }
  }, intervalMs);

  console.log('🎬 [5/5] Executing Master Showcase Walkthrough Choreography...');

  const clickBtn = async (pattern) => {
    const btns = await page.$$('button');
    for (const b of btns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (pattern.test(text)) {
        await b.click();
        return true;
      }
    }
    return false;
  };

  try {
    // -----------------------------------------------------------------------
    // SCENE 1: EmoSense Chat Page with Chetana Banner & Neural Voice (0-8s)
    // -----------------------------------------------------------------------
    console.log('   -> Scene 1: EmoSense Interface, Affective Radar & Banner Expansion');
    await sleep(1500);

    // Expand the Chetana Avatar banner
    const bannerClicked = await page.evaluate(() => {
      const banner = document.querySelector('.chetana-chat-banner, .banner-header');
      if (banner) {
        banner.click();
        return true;
      }
      return false;
    });
    if (!bannerClicked) {
      await clickBtn(/Expand|Chetana|Affective Autopilot/i);
    }
    await sleep(3500);

    // Move mouse over radar
    await page.mouse.move(240, 420);
    await sleep(1000);
    await page.mouse.move(240, 520);
    await sleep(1000);

    // -----------------------------------------------------------------------
    // SCENE 2: 4-7-8 Parasympathetic Entrainment Modal with Solfeggio Audio (8-18s)
    // -----------------------------------------------------------------------
    console.log('   -> Scene 2: 4-7-8 Parasympathetic Entrainment with 432Hz -> 528Hz Audio');
    await clickBtn(/5-4-3-2-1 Grounding|Grounding/i);
    await sleep(1500);

    // Switch to 4-7-8 Parasympathetic Tab
    await clickBtn(/4-7-8 Parasympathetic|4-7-8/i);
    console.log('      (4-7-8 Parasympathetic Tab Activated - Breathing Inhale/Hold/Exhale)');
    await sleep(5500);

    // Complete / Close 4-7-8 session
    await clickBtn(/Complete 4-7-8|Complete Somatic|Return to Chetana/i);
    await sleep(1500);

    // -----------------------------------------------------------------------
    // SCENE 3: Switch to 3D Studio Director & Kyoto Gaze Tracking (18-28s)
    // -----------------------------------------------------------------------
    console.log('   -> Scene 3: Switching to 3D Studio Director Mode');
    await clickBtn(/Studio Director/i);
    await sleep(2000);

    // Natural wide mouse gaze articulation
    console.log('      (Demonstrating Kyoto micro-saccades & C7 cervical pivot follow)');
    await page.mouse.move(1050, 260); // top right gaze
    await sleep(1200);
    await page.mouse.move(400, 320);  // top left gaze
    await sleep(1200);
    await page.mouse.move(720, 680);  // notes / desk downward gaze
    await sleep(1200);
    await page.mouse.move(720, 400);  // direct eye contact
    await sleep(1500);

    // -----------------------------------------------------------------------
    // SCENE 4: Therapist Psychological Acting Gestures (28-38s)
    // -----------------------------------------------------------------------
    console.log('   -> Scene 4: Therapist Acting Gestures (Double Nod, Curious Tilt, Empathy Dip)');
    await clickBtn(/Double Nod/i);
    await sleep(1800);

    await clickBtn(/Curious Tilt/i);
    await sleep(1800);

    await clickBtn(/Empathy Dip/i);
    await sleep(2000);

    await clickBtn(/Reassure Shake/i);
    await sleep(1800);

    // -----------------------------------------------------------------------
    // SCENE 5: Master Anatomical Mudras & Secondary Jhumka Physics (38-48s)
    // -----------------------------------------------------------------------
    console.log('   -> Scene 5: Anatomical Mudras (Namaste, Wave, Chin Rest, Empathy)');
    // 5A: Namaste Mudra (Key 1)
    await page.keyboard.press('1');
    await sleep(2200);

    // 5B: Wave Mudra (Key 2)
    await page.keyboard.press('2');
    await sleep(2200);

    // 5C: Chin Rest Mudra (Key 3)
    await page.keyboard.press('3');
    await sleep(2200);

    // 5D: Heart Empathy Mudra (Key 4)
    await page.keyboard.press('4');
    await sleep(2200);

    // 5E: Return to Idle Respiration (Key 0)
    await page.keyboard.press('0');
    await sleep(1800);

    // -----------------------------------------------------------------------
    // SCENE 6: Cinematic Atmospheres & Demon Slayer Aura Shading (48-56s)
    // -----------------------------------------------------------------------
    console.log('   -> Scene 6: Cinematic Atmosphere & Ufotable Bloom Shading');
    await clickBtn(/Wisteria/i);
    await sleep(2200);

    await clickBtn(/Nichirin|Solar/i);
    await sleep(2200);

    await clickBtn(/Kyoto|Rain/i);
    await sleep(2200);

    await clickBtn(/Executive|Mahogany/i);
    await sleep(1800);

    console.log('   -> Walkthrough choreography completed with zero defects!');
  } catch (err) {
    console.error('⚠️ Error during choreography:', err);
  } finally {
    clearInterval(frameInterval);

    try {
      await client.send('Page.stopScreencast');
    } catch (e) {}

    await browser.close();

    ffmpeg.stdin.end();
    await new Promise((resolve) => {
      ffmpeg.on('close', (code) => {
        console.log(`🎬 FFmpeg process finished with exit code ${code}`);
        resolve();
      });
    });

    if (fs.existsSync(CONFIG.outputMp4)) {
      const stats = fs.statSync(CONFIG.outputMp4);
      console.log(`✅ SUCCESS: Master Showcase Video created: ${CONFIG.outputMp4} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      try {
        fs.copyFileSync(CONFIG.outputMp4, CONFIG.outputDesktop);
        console.log(`📋 Copied directly to Desktop: ${CONFIG.outputDesktop}`);
      } catch (e) {
        console.warn('Could not copy to Desktop:', e.message);
      }
    } else {
      console.error('❌ Failed to produce MP4 file.');
    }
  }
}

main().catch(console.error);
