const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');

  const results = await page.evaluate(async () => {
    const load = (src) => new Promise(res => {
      const img = new Image(); img.onload = () => res(img); img.src = src;
    });

    const c = document.createElement('canvas');
    c.width = 1200; c.height = 900;
    const ctx = c.getContext('2d');

    const hands = {};

    // 1. WAVE HANDS:
    // In stage_cel_pose_wave.png, the waving hand is on the right side:
    // x in [630, 800], y in [170, 530]
    // The face/head is around x in [500, 680], y in [240, 440]
    // We isolate the hand: x >= 640, or strictly outside the head contour!
    const waveImg = await load('/poses/stage_cel_pose_wave.png');
    ctx.clearRect(0, 0, 1200, 900);
    ctx.drawImage(waveImg, 0, 0);
    let imgData = ctx.getImageData(0, 0, 1200, 900);
    let data = imgData.data;

    for (let y = 0; y < 900; y++) {
      for (let x = 0; x < 1200; x++) {
        const idx = (y * 1200 + x) * 4;
        // Keep ONLY the waving hand & raised arm:
        // Hand is at x in [635, 785], y in [170, 530]
        // Remove any pixels belonging to head/hair (x < 640 or y < 170 or inside face)
        const isHand = (x >= 638 && x <= 790 && y >= 170 && y <= 530);
        // Exclude face cheek (x < 670 && y > 300 && y < 440)
        const isCheek = (x < 675 && y >= 290 && y <= 440);

        if (!isHand || isCheek) {
          data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    hands['wave'] = c.toDataURL('image/png');

    // 2. NAMASTE HANDS:
    // In stage_cel_pose_namaste.png, the hands in Anjali mudra are at:
    // x in [480, 720], y in [440, 690]
    // Strictly below chin (y >= 445)
    const namasteImg = await load('/poses/stage_cel_pose_namaste.png');
    ctx.clearRect(0, 0, 1200, 900);
    ctx.drawImage(namasteImg, 0, 0);
    imgData = ctx.getImageData(0, 0, 1200, 900);
    data = imgData.data;

    for (let y = 0; y < 900; y++) {
      for (let x = 0; x < 1200; x++) {
        const idx = (y * 1200 + x) * 4;
        // Keep ONLY the namaste hands and forearms
        const isHands = (x >= 470 && x <= 730 && y >= 448 && y <= 695);
        if (!isHands) {
          data[idx + 3] = 0;
        } else if (y < 460) {
          // Feather top fingertips smoothly
          const feather = (y - 448) / 12;
          data[idx + 3] = Math.round(data[idx + 3] * feather);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    hands['namaste'] = c.toDataURL('image/png');

    // 3. CHIN REST HAND:
    // In stage_cel_pose_chin_rest.png, hand under chin at:
    // x in [510, 690], y in [438, 620]
    const chinImg = await load('/poses/stage_cel_pose_chin_rest.png');
    ctx.clearRect(0, 0, 1200, 900);
    ctx.drawImage(chinImg, 0, 0);
    imgData = ctx.getImageData(0, 0, 1200, 900);
    data = imgData.data;

    for (let y = 0; y < 900; y++) {
      for (let x = 0; x < 1200; x++) {
        const idx = (y * 1200 + x) * 4;
        // Keep ONLY the chin rest hand and forearm
        const isHand = (x >= 510 && x <= 695 && y >= 438 && y <= 630);
        if (!isHand) {
          data[idx + 3] = 0;
        } else if (y < 448) {
          // Feather top knuckles touching chin
          const feather = (y - 438) / 10;
          data[idx + 3] = Math.round(data[idx + 3] * feather);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    hands['chin_rest'] = c.toDataURL('image/png');

    // 4. EMPATHY HAND (HAND TO HEART):
    // In stage_cel_pose_empathy.png, hand over heart at:
    // x in [475, 685], y in [460, 680]
    const empImg = await load('/poses/stage_cel_pose_empathy.png');
    ctx.clearRect(0, 0, 1200, 900);
    ctx.drawImage(empImg, 0, 0);
    imgData = ctx.getImageData(0, 0, 1200, 900);
    data = imgData.data;

    for (let y = 0; y < 900; y++) {
      for (let x = 0; x < 1200; x++) {
        const idx = (y * 1200 + x) * 4;
        const isHand = (x >= 475 && x <= 685 && y >= 460 && y <= 680);
        if (!isHand) {
          data[idx + 3] = 0;
        } else if (y < 475) {
          const feather = (y - 460) / 15;
          data[idx + 3] = Math.round(data[idx + 3] * feather);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    hands['empathy'] = c.toDataURL('image/png');

    return hands;
  });

  for (const [name, uri] of Object.entries(results)) {
    const b64 = uri.replace(/^data:image\/png;base64,/, '');
    const out = path.resolve(__dirname, `../public/poses/pure_gesture_hands_${name}.png`);
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log(`Saved: ${out} (${fs.statSync(out).size} bytes)`);
  }

  await browser.close();
})();
