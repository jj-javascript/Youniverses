import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONCEPTS = path.join(ROOT, '.gstack/mobile-parity/concepts');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WIDTHS = [360, 390, 414, 428];
const VARIANTS = ['A', 'B', 'C'];

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox'],
});

for (const v of VARIANTS) {
    for (const w of WIDTHS) {
        const page = await browser.newPage();
        await page.setViewport({ width: w, height: 812, deviceScaleFactor: 2 });
        const file = path.join(CONCEPTS, `concept-${v}.html`);
        await page.goto(`file://${file}`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: path.join(CONCEPTS, `concept-${v}-${w}.png`) });
        await page.close();
    }
}

await browser.close();
console.log('Concept screenshots done');
