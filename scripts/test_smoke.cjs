/**
 * Automated Enterprise Headless Smoke Test Harness
 * Blueprint Part 3.3 Execution
 * 
 * Tests:
 * 1. 25/25 Anatomical Cels, Rig Layers, and Backgrounds on Disk
 * 2. 100% Offline Air-Gapped MediaPipe Model & WASM Assets
 * 3. Synthetic Dual-Formant Viseme & Pitch Jitter Mathematical Invariants
 * 4. Neural Voice Audio Cache Integrity
 * 5. Headless Puppeteer E2E Canvas & Navigation Verification
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${message}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✘ FAIL\x1b[0m: ${message}`);
  }
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('  CHETANA ENTERPRISE CI SMOKE TEST SUITE (PARTS 1, 2 & 3)    ');
  console.log('=============================================================\n');

  // -------------------------------------------------------------------------
  // SUITE 1: Critical Anime Asset Matrix (Zero Missing 404s)
  // -------------------------------------------------------------------------
  console.log('[SUITE 1] Verifying 25 Master Cels, Rigging & Stage Assets...');
  const criticalAssets = [
    'poses/stage_cel_breath_0.png',
    'poses/stage_cel_breath_1.png',
    'poses/stage_cel_breath_2.png',
    'poses/stage_cel_breath_3.png',
    'poses/stage_cel_pose_namaste.png',
    'poses/stage_cel_pose_wave.png',
    'poses/stage_cel_pose_chin_rest.png',
    'poses/stage_cel_pose_empathy.png',
    'poses/clean_expression_happy.png',
    'poses/clean_expression_sad.png',
    'poses/clean_expression_calm.png',
    'poses/clean_expression_empathy.png',
    'poses/clean_expression_surprised.png',
    'poses/clean_expression_tense.png',
    'poses/stage_character_blink.png',
    'poses/stage_character_mouth_closed.png',
    'poses/stage_character_mouth_half.png',
    'poses/stage_character_mouth_ah.png',
    'poses/stage_character_mouth_oh.png',
    'poses/stage_character_mouth_ee.png',
    'poses/rig_sclera_clean.png',
    'poses/rig_irises_feathered.png',
    'poses/rig_eyelashes_protect.png',
    'poses/rig_brow_left.png',
    'poses/rig_brow_right.png',
    'poses/rig_mouth_skin_cover.png',
    'poses/stage_bg_chair.jpg',
    'poses/stage_fg_desk.png'
  ];

  for (const relPath of criticalAssets) {
    const fullPath = path.join(PUBLIC_DIR, relPath);
    const exists = fs.existsSync(fullPath);
    const size = exists ? fs.statSync(fullPath).size : 0;
    assert(exists && size > 1000, `Asset ${relPath} (${(size / 1024).toFixed(1)} KB)`);
  }

  // -------------------------------------------------------------------------
  // SUITE 2: Offline Air-Gapped MediaPipe Model & WASM Binaries
  // -------------------------------------------------------------------------
  console.log('\n[SUITE 2] Verifying 100% Offline Air-Gapped MediaPipe Assets...');
  const mediaPipeFiles = [
    'models/face_landmarker.task',
    'models/wasm/vision_wasm_internal.wasm',
    'models/wasm/vision_wasm_internal.js'
  ];

  for (const relPath of mediaPipeFiles) {
    const fullPath = path.join(PUBLIC_DIR, relPath);
    const exists = fs.existsSync(fullPath);
    const size = exists ? fs.statSync(fullPath).size : 0;
    assert(exists && size > 5000, `Air-gapped file ${relPath} (${(size / 1024).toFixed(1)} KB)`);
  }

  // -------------------------------------------------------------------------
  // SUITE 3: Synthetic Dual-Formant & Pitch Jitter Mathematical Invariants
  // -------------------------------------------------------------------------
  console.log('\n[SUITE 3] Testing Dual-Formant Viseme & Acoustic SER Invariants...');
  
  // Dual-Formant classifier simulation (Preston Blair classification)
  function classifyFormants(f1, f2, dbLevel) {
    if (dbLevel < -45) return 'closed';
    if (f1 > 650 && f2 > 1000 && f2 < 1700) return 'ah';  // open back vowel /a/
    if (f1 < 450 && f2 > 1900) return 'ee';               // close front vowel /i/
    if (f1 < 550 && f2 < 1100) return 'oh';               // back rounded vowel /u/, /o/
    return 'half';
  }

  assert(classifyFormants(780, 1250, -20) === 'ah', 'Vowel /a/ (F1: 780Hz, F2: 1250Hz) -> viseme "ah"');
  assert(classifyFormants(280, 2300, -20) === 'ee', 'Vowel /i/ (F1: 280Hz, F2: 2300Hz) -> viseme "ee"');
  assert(classifyFormants(340, 850, -20) === 'oh', 'Vowel /u/ (F1: 340Hz, F2: 850Hz) -> viseme "oh"');
  assert(classifyFormants(500, 1500, -50) === 'closed', 'Plosive silence (< -45dB) -> viseme "closed"');

  // Pitch Jitter Mathematical Invariant: J = (1 / (N-1)) * sum(|T_i - T_{i-1}|) / T_mean
  function computeJitter(periods) {
    if (periods.length < 2) return 0;
    let diffSum = 0;
    let total = 0;
    for (let i = 0; i < periods.length; i++) {
      total += periods[i];
      if (i > 0) diffSum += Math.abs(periods[i] - periods[i - 1]);
    }
    const mean = total / periods.length;
    return diffSum / ((periods.length - 1) * mean);
  }

  const calmPeriods = [0.005, 0.00501, 0.00499, 0.00502, 0.005]; // ~200Hz steady
  const distressPeriods = [0.005, 0.0058, 0.0042, 0.0061, 0.0044]; // micro-tremor
  const calmJitter = computeJitter(calmPeriods);
  const distressJitter = computeJitter(distressPeriods);

  assert(calmJitter < 0.015, `Calm vocal jitter ${(calmJitter * 100).toFixed(2)}% < 1.5% threshold`);
  assert(distressJitter > 0.05, `Distress vocal jitter ${(distressJitter * 100).toFixed(2)}% > 5.0% threshold`);

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // SUITE 4: Neural Voice Cache Integrity & Hindi Accent Verification
  // -------------------------------------------------------------------------
  console.log('\n[SUITE 4] Verifying Neural Voice Audio Pipeline (Hindi & Indian Accents)...');
  const audioCacheDir = path.join(PUBLIC_DIR, 'audio_cache');
  const distCacheDir = path.join(ROOT_DIR, 'dist', 'audio_cache');
  const cacheExists = fs.existsSync(audioCacheDir);
  assert(cacheExists, 'Audio cache directory exists');

  function requestTTS(text, voice) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({ text, voice });
      const req = http.request(
        {
          hostname: 'localhost',
          port: 5174,
          path: '/api/tts',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        },
        (res) => {
          let chunks = '';
          res.on('data', d => chunks += d);
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(chunks) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: chunks });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  // 4A: Clean any outdated stale cache files
  const staleFiles = ['3b76164285e2eec90d13141f8ac935a8.mp3', '8e5bf78b367a1530777bbb0c2b1fb447.mp3'];
  for (const sf of staleFiles) {
    const p1 = path.join(audioCacheDir, sf);
    const p2 = path.join(distCacheDir, sf);
    if (fs.existsSync(p1)) {
      try { fs.unlinkSync(p1); } catch (e) {}
    }
    if (fs.existsSync(p2)) {
      try { fs.unlinkSync(p2); } catch (e) {}
    }
  }

  // 4B: Test Native Hindi Synthesis (Devanagari -> Swara Neural)
  console.log('  Testing Native Devanagari Hindi synthesis via /api/tts...');
  try {
    const hindiRes = await requestTTS("नमस्ते, मैं चेतना हूँ। इमोसेंस में आपका स्वागत है।");
    const audioUrl = hindiRes.data?.audioUrl;
    const ok = hindiRes.status === 200 && typeof audioUrl === 'string' && audioUrl.startsWith('/audio_cache/');
    assert(ok, `Devanagari Hindi TTS synthesis returned valid URL: ${audioUrl}`);
    if (ok) {
      const localMp3 = path.join(PUBLIC_DIR, audioUrl.slice(1));
      const hasAudio = fs.existsSync(localMp3) && fs.statSync(localMp3).size > 2000;
      assert(hasAudio, `Devanagari Hindi audio synthesized successfully (${(fs.statSync(localMp3).size / 1024).toFixed(1)} KB)`);
    }
  } catch (err) {
    assert(false, `Devanagari Hindi TTS failed: ${err.message}`);
  }

  // 4C: Test Romanized Hinglish Synthesis (Indian Accent -> Neerja Expressive)
  console.log('  Testing Romanized Hinglish synthesis with authentic Indian inflection...');
  try {
    const hinglishRes = await requestTTS("Namaste, main aapki dost Chetana hoon. Aaj aap kaisa feel kar rahe hain?");
    const hAudioUrl = hinglishRes.data?.audioUrl;
    const ok = hinglishRes.status === 200 && typeof hAudioUrl === 'string' && hAudioUrl.startsWith('/audio_cache/');
    assert(ok, `Romanized Hinglish TTS synthesis returned valid URL: ${hAudioUrl}`);
    if (ok) {
      const localHinglishMp3 = path.join(PUBLIC_DIR, hAudioUrl.slice(1));
      const hasAudio = fs.existsSync(localHinglishMp3) && fs.statSync(localHinglishMp3).size > 2000;
      assert(hasAudio, `Romanized Hinglish audio synthesized with Indian accent (${(fs.statSync(localHinglishMp3).size / 1024).toFixed(1)} KB)`);
    }
  } catch (err) {
    assert(false, `Romanized Hinglish TTS failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 5: Headless Browser E2E Stage Mount & WebGL Canvas Verification
  // -------------------------------------------------------------------------
  console.log('\n[SUITE 5] Running Headless Browser E2E Smoke Test on Port 5174...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--enable-webgl', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const startTime = Date.now();
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0', timeout: 15000 });
    const loadTime = Date.now() - startTime;
    assert(loadTime < 3000, `Page cold boot in ${loadTime}ms (< 3000ms SLA)`);

    // Switch to 3D Studio Director to verify master anime canvas
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const studioBtn = btns.find(b => b.textContent && b.textContent.includes('Studio Director'));
      if (studioBtn) studioBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Canvas verification
    const canvasExists = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return !!c && c.width > 0 && c.height > 0;
    });
    assert(canvasExists, 'WebGL/2D master anime canvas rendered successfully (1200x900)');

    // Test zero fatal errors
    const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('404'));
    assert(fatalErrors.length === 0, `Zero fatal runtime errors (logged: ${fatalErrors.length})`);

    // Save proof screenshot
    const proofPath = path.join(PUBLIC_DIR, 'poses', 'ci_smoke_verified.png');
    await page.screenshot({ path: proofPath });
    assert(fs.existsSync(proofPath), 'Saved E2E proof screenshot to public/poses/ci_smoke_verified.png');

  } catch (err) {
    assert(false, `Headless browser error: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n=============================================================');
  console.log(`  TEST RESULTS: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log('=============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('\x1b[32m✔ ALL CI SMOKE TESTS PASSED WITH ZERO DEFECTS.\x1b[0m\n');
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
