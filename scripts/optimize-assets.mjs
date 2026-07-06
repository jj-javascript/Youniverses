import sharp from 'sharp';
import { mkdir, access } from 'fs/promises';
import { join, parse } from 'path';

const OUT = 'img/optimized';

const backgrounds = [
  { file: 'img/bubbleStar.jpg', widths: [1280, 1920, 2560] },
  { file: 'img/v933-audi-42-a.jpg', widths: [1280, 1920, 2560] },
  { file: 'img/fire-cloud-space-background.jpg', widths: [1280, 1920, 2560] },
];

const images = [
  { file: 'img/testImg.png', widths: [400, 600, 900] },
  { file: 'img/testBlog1.png', widths: [320, 480, 720] },
  { file: 'img/testBlog2.png', widths: [320, 480, 720] },
  { file: 'img/testBlog3.png', widths: [320, 480, 720] },
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function optimizeImage(file, widths) {
  if (!(await exists(file))) {
    console.warn('Skip (missing):', file);
    return;
  }

  const base = parse(file).name;

  for (const w of widths) {
    const avifOut = join(OUT, `${base}-${w}.avif`);
    const webpOut = join(OUT, `${base}-${w}.webp`);

    await sharp(file).resize(w, null, { withoutEnlargement: true }).avif({ quality: 65 }).toFile(avifOut);
    await sharp(file).resize(w, null, { withoutEnlargement: true }).webp({ quality: 75 }).toFile(webpOut);
    console.log('  ✓', avifOut, webpOut);
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log('Optimizing backgrounds…');
  for (const { file, widths } of backgrounds) {
    console.log(file);
    await optimizeImage(file, widths);
  }

  console.log('Optimizing images…');
  for (const { file, widths } of images) {
    console.log(file);
    await optimizeImage(file, widths);
  }

  console.log('Done.');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
