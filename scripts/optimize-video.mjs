import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';

const input = 'img/spacestars.mp4';
const outDir = 'img/optimized';

if (!existsSync(input)) {
  console.error('Missing:', input);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

console.log('Extracting poster…');
execSync(
  `ffmpeg -y -i "${input}" -vframes 1 -q:v 2 "${outDir}/spacestars-poster.jpg"`,
  { stdio: 'inherit' }
);

console.log('Encoding MP4…');
execSync(
  `ffmpeg -y -i "${input}" -an -vf "scale=1920:-2" -c:v libx264 -crf 28 -preset slow -movflags +faststart "${outDir}/spacestars-1080.mp4"`,
  { stdio: 'inherit' }
);

console.log('Encoding WebM…');
try {
  execSync(
    `ffmpeg -y -i "${input}" -an -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 "${outDir}/spacestars-1080.webm"`,
    { stdio: 'inherit' }
  );
} catch {
  console.warn('WebM encode skipped (VP9 encoder unavailable). MP4 fallback will be used.');
}

console.log('Video optimization complete.');
