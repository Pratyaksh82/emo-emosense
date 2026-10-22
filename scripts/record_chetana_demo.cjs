const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  appUrl: 'http://localhost:5174/',
  outputPath: path.resolve('c:/Users/praty/Desktop/2d model/chetana_emosense_walkthrough.mp4'),
  artifactPath: path.resolve('C:/Users/praty/.gemini/antigravity-ide/brain/6e8ae898-d86b-41a0-b478-90996bf27902/chetana_emosense_walkthrough.mp4'),
  viewport: { width: 1440, height: 900 },
  fps: 20,
  quality: 85,
  crf: 20,
  ffmpegExecutable: (() => {
    try {
      return require('ffmpeg-static');
    } catch (e) {
      return 'ffmpeg';
    }
  })()
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log(`[1/5] Launching Puppeteer at ${CONFIG.viewport.width}x${CONFIG.viewport.height}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage();
  await page.setViewport(CONFIG.viewport);

  console.log(`[2/5] Loading application at ${CONFIG.appUrl}...`);
  await page.goto(CONFIG.appUrl, { waitUntil: 'networkidle2' });
  await sleep(1500);

  console.log('[3/5] Starting CDP screencast pipeline...');
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
    await sleep(20);
  }

  console.log(`[4/5] Spawning FFmpeg process -> ${CONFIG.outputPath}...`);
  const ffmpeg = spawn(CONFIG.ffmpegExecutable, [
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
    CONFIG.outputPath
  ]);

  ffmpeg.stderr.on('data', () => {});

  const intervalMs = Math.round(1000 / CONFIG.fps);
  const frameInterval = setInterval(() => {
    if (currentFrameBuffer && ffmpeg.stdin.writable) {
      ffmpeg.stdin.write(currentFrameBuffer);
    }
  }, intervalMs);

  console.log('[5/5] Executing high-definition live choreography...');

  try {
    // 1. Initial 3-Part Layout view: Chetana breathing in executive suite
    console.log(' - Scene 1: 3-Part Workspace Overview (Left Graphs, Center Chetana, Right Chat)');
    await sleep(3000);

    // 2. Trigger Therapist Acting Gestures: Double Nod
    console.log(' - Scene 2: Triggering Double Nod gesture');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.btn-acting-chip')).find(b => b.textContent.includes('Double Nod'));
      if (btn) btn.click();
    });
    await sleep(2500);

    // 3. Trigger Empathy Dip gesture
    console.log(' - Scene 3: Triggering Compassionate Empathy Dip gesture');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.btn-acting-chip')).find(b => b.textContent.includes('Empathy Dip'));
      if (btn) btn.click();
    });
    await sleep(2500);

    // 4. Trigger Camera Preset switch: Close-Up
    console.log(' - Scene 4: Switching camera framing to Close-Up');
    await page.evaluate(() => {
      const sel = Array.from(document.querySelectorAll('select')).find(s => s.value === 'medium');
      if (sel) {
        sel.value = 'closeup';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(3000);

    // 5. Trigger Camera Preset switch: Wide View
    console.log(' - Scene 5: Switching camera framing to Wide View');
    await page.evaluate(() => {
      const sel = Array.from(document.querySelectorAll('select')).find(s => s.value === 'closeup');
      if (sel) {
        sel.value = 'wide';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(2500);

    // Reset camera to Medium View
    await page.evaluate(() => {
      const sel = Array.from(document.querySelectorAll('select')).find(s => s.value === 'wide');
      if (sel) {
        sel.value = 'medium';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(1500);

    // 6. Conversational Chat Interaction: click "Loneliness & Grief" chip
    console.log(' - Scene 6: Triggering prompt chip: Loneliness & Grief');
    await page.evaluate(() => {
      const chip = Array.from(document.querySelectorAll('.quick-chip')).find(c => c.textContent.includes('Loneliness'));
      if (chip) chip.click();
    });
    await sleep(3500);

    // 7. Clinical Session Report: Click "Export PDF Report" button in Left Panel
    console.log(' - Scene 7: Opening Session Report Modal from Left Panel');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Export PDF Report') || b.textContent.includes('Export PDF'));
      if (btn) btn.click();
    });
    await sleep(3500);

    // 8. Close Modal and return to 3-part layout
    console.log(' - Scene 8: Closing Session Modal, returning to 3-part layout');
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.modal-close-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close') || b.textContent.includes('Done'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(2500);

    console.log('Choreography sequence completed successfully!');
  } catch (err) {
    console.error('Error in choreography:', err);
  } finally {
    clearInterval(frameInterval);
    await client.send('Page.stopScreencast');
    await browser.close();

    console.log('Finalizing FFmpeg encoding...');
    ffmpeg.stdin.end();

    await new Promise((resolve) => {
      ffmpeg.on('close', (code) => {
        console.log(`FFmpeg exited with code ${code}`);
        resolve();
      });
    });

    if (fs.existsSync(CONFIG.outputPath)) {
      const stats = fs.statSync(CONFIG.outputPath);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ SUCCESS: Walkthrough video saved to: ${CONFIG.outputPath} (${sizeMb} MB)`);

      // Copy to artifact directory
      fs.copyFileSync(CONFIG.outputPath, CONFIG.artifactPath);
      console.log(`Copied video to artifact directory: ${CONFIG.artifactPath}`);
    }
  }
}

main().catch(console.error);
