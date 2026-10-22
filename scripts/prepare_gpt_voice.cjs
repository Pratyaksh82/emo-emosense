const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const targetDir = path.resolve('gpt voice');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const dlDir = 'C:\\Users\\praty\\Downloads';
const files = [
  'WhatsApp Video 2026-10-20 at 3.41.08 AM.mp4',
  'WhatsApp Video 2026-10-20 at 3.46.17 AM.mp4'
];

files.forEach(f => {
  const src = path.join(dlDir, f);
  const dest = path.join(targetDir, f);
  console.log(`Copying ${f}...`);
  fs.copyFileSync(src, dest);

  const baseName = f.replace('.mp4', '');
  const audioWav = path.join(targetDir, baseName + '.wav');
  const audioMp3 = path.join(targetDir, baseName + '.mp3');

  console.log(`Extracting audio for ${f}...`);
  execSync(`"${ffmpeg}" -y -i "${dest}" -vn -acodec pcm_s16le -ar 24000 -ac 1 "${audioWav}"`, { stdio: 'inherit' });
  execSync(`"${ffmpeg}" -y -i "${dest}" -vn -acodec libmp3lame -b:a 192k "${audioMp3}"`, { stdio: 'inherit' });
});

console.log('✅ SUCCESS: Copied videos and extracted audio to gpt voice/');
