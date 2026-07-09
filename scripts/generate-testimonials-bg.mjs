import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '.gstack/testimonials-bg');
const W = 1920;
const H = 1080;

function starField(count, w, h, seed = 1) {
    let s = seed;
    const rand = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            cx: rand() * w,
            cy: rand() * h,
            r: rand() * 1.8 + 0.4,
            opacity: rand() * 0.5 + 0.15,
        });
    }
    return stars;
}

function constellationSvg(w, h) {
    const stars = [
        [180, 120], [260, 90], [340, 140], [420, 80], [520, 130],
        [1480, 180], [1560, 120], [1640, 200], [1720, 150],
        [200, 880], [280, 920], [360, 860], [440, 940],
        [1500, 900], [1580, 860], [1660, 940], [1740, 880],
    ];
    const lines = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [5, 6], [6, 7], [7, 8],
        [9, 10], [10, 11], [11, 12],
        [13, 14], [14, 15], [15, 16],
    ];
    const gold = '#c9a84c';
    const ink = '#2c2416';

    let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs><radialGradient id="warm" cx="50%" cy="45%" r="70%">
        <stop offset="0%" stop-color="#f8f5ed"/>
        <stop offset="55%" stop-color="#f4f0e8"/>
        <stop offset="100%" stop-color="#e8e0d0"/>
    </radialGradient></defs>`;
    svg += `<rect width="100%" height="100%" fill="url(#warm)"/>`;

    // Subtle paper grain dots
    const grain = starField(400, w, h, 42);
    grain.forEach((g) => {
        svg += `<circle cx="${g.cx.toFixed(1)}" cy="${g.cy.toFixed(1)}" r="${g.r.toFixed(2)}" fill="${ink}" opacity="${(g.opacity * 0.08).toFixed(3)}"/>`;
    });

    lines.forEach(([a, b]) => {
        const [x1, y1] = stars[a];
        const [x2, y2] = stars[b];
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${gold}" stroke-width="0.8" opacity="0.35"/>`;
    });

    stars.forEach(([x, y], i) => {
        const r = i % 3 === 0 ? 3.5 : 2;
        svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${gold}" opacity="0.55"/>`;
        svg += `<circle cx="${x}" cy="${y}" r="${r + 4}" fill="${gold}" opacity="0.08"/>`;
    });

    // Central calm band hint
    svg += `<rect x="${w * 0.2}" y="${h * 0.15}" width="${w * 0.35}" height="${h * 0.7}" fill="#f4f0e8" opacity="0.15" rx="8"/>`;

    svg += '</svg>';
    return svg;
}

async function generateConceptA() {
    const svg = constellationSvg(W, H);
    const outPath = path.join(OUT, 'concept-A/background.png');
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log('Generated', outPath);
}

async function generateConceptB() {
    const src = path.join(ROOT, 'img/bubbleStar.jpg');
    const outPath = path.join(OUT, 'concept-B/background.png');

    // Base: resized bubbleStar with blur and darken
    const base = await sharp(src)
        .resize(W, H, { fit: 'cover', position: 'centre' })
        .modulate({ brightness: 0.85, saturation: 1.1 })
        .blur(1.5)
        .toBuffer();

    // Cream reading-band overlay (center-left)
    const creamBand = Buffer.from(
        `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="read" cx="35%" cy="50%" r="55%">
                    <stop offset="0%" stop-color="#f4f0e8" stop-opacity="0.72"/>
                    <stop offset="60%" stop-color="#f4f0e8" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#f4f0e8" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#0a0e2a" stop-opacity="0.5"/>
                    <stop offset="50%" stop-color="#0a0e2a" stop-opacity="0.1"/>
                    <stop offset="100%" stop-color="#0a0e2a" stop-opacity="0.55"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#read)"/>
            <rect width="100%" height="100%" fill="url(#edge)"/>
        </svg>`
    );

    await sharp(base)
        .composite([{ input: creamBand, blend: 'over' }])
        .png()
        .toFile(outPath);

    console.log('Generated', outPath);
}

async function generateConceptC() {
    const src = path.join(ROOT, 'img/fire-cloud-space-background.jpg');
    const outPath = path.join(OUT, 'concept-C/background.png');

    const base = await sharp(src)
        .resize(W, H, { fit: 'cover', position: 'top' })
        .modulate({ brightness: 0.7, saturation: 1.15 })
        .toBuffer();

    // Dark lower field for text readability + gold accent sparks
    const overlay = Buffer.from(
        `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#000" stop-opacity="0"/>
                    <stop offset="35%" stop-color="#0a0508" stop-opacity="0.3"/>
                    <stop offset="65%" stop-color="#0a0508" stop-opacity="0.75"/>
                    <stop offset="100%" stop-color="#0a0508" stop-opacity="0.92"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#fade)"/>
            ${starField(80, W, H, 99)
                .filter((_, i) => i % 2 === 0)
                .map(
                    (s) =>
                        `<circle cx="${s.cx.toFixed(0)}" cy="${(s.cy * 0.6 + H * 0.35).toFixed(0)}" r="${(s.r + 0.5).toFixed(1)}" fill="#c9a84c" opacity="${(s.opacity * 0.6).toFixed(2)}"/>`
                )
                .join('')}
        </svg>`
    );

    await sharp(base)
        .composite([{ input: overlay, blend: 'over' }])
        .png()
        .toFile(outPath);

    console.log('Generated', outPath);
}

fs.mkdirSync(path.join(OUT, 'concept-A'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'concept-B'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'concept-C'), { recursive: true });

await generateConceptA();
await generateConceptB();
await generateConceptC();

console.log('All concepts generated.');
