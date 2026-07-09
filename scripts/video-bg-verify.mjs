import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '.gstack/mobile-video-bg');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://127.0.0.1:8765';
const WIDTHS = [360, 390, 414, 428];
const HEIGHT = 812;

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox'],
});

const results = [];

for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: HEIGHT, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/main.html`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.cardDeck__bg', { timeout: 5000 });

    const audit = await page.evaluate((w) => {
        const deck = document.querySelector('.cardDeck');
        const video = document.querySelector('.cardDeck__bg');
        const card = document.querySelector('.cardDeck__card--hero');
        const stack = document.querySelector('.cardDeck__stack');
        const videoStyle = video ? getComputedStyle(video) : null;
        const cardStyle = card ? getComputedStyle(card) : null;
        const stackStyle = stack ? getComputedStyle(stack) : null;
        const overflowX = document.documentElement.scrollWidth > w + 1;

        return {
            deckVisible: deck && getComputedStyle(deck).display !== 'none',
            hasVideo: !!video,
            videoSrc: video?.querySelector('source')?.src || null,
            videoAutoplay: video?.autoplay === true,
            videoLoop: video?.loop === true,
            videoMuted: video?.muted === true,
            videoPlaysInline: video?.playsInline === true,
            videoHasControls: video?.hasAttribute('controls'),
            videoHasPoster: video?.hasAttribute('poster'),
            videoZIndex: videoStyle?.zIndex,
            videoObjectFit: videoStyle?.objectFit,
            stackZIndex: stackStyle?.zIndex,
            cardBg: cardStyle?.backgroundColor,
            cardPaper: cardStyle?.backgroundColor === 'rgb(248, 245, 237)',
            overflowX,
        };
    }, width);

    results.push({ width, audit });
    await page.screenshot({ path: path.join(OUT, `main-${width}.png`) });
    await page.close();
}

// Desktop: card deck hidden
const desktopPage = await browser.newPage();
await desktopPage.setViewport({ width: 1280, height: 800 });
await desktopPage.goto(`${BASE}/main.html`, { waitUntil: 'networkidle2' });

const desktopAudit = await desktopPage.evaluate(() => {
    const deck = document.querySelector('.cardDeck');
    const video = document.querySelector('.cardDeck__bg');
    const desktop = document.querySelector('.desktop-content');
    return {
        deckDisplay: deck ? getComputedStyle(deck).display : null,
        videoPresent: !!video,
        desktopVisible: desktop ? getComputedStyle(desktop).display !== 'none' : false,
    };
});

results.push({ viewport: 'desktop-1280', audit: desktopAudit });
await desktopPage.screenshot({ path: path.join(OUT, 'main-desktop.png') });
await desktopPage.close();

await browser.close();

const mobileResults = results.filter((r) => r.width);
const pass =
    mobileResults.every(
        (r) =>
            r.audit.hasVideo &&
            r.audit.videoAutoplay &&
            r.audit.videoLoop &&
            r.audit.videoMuted &&
            r.audit.videoPlaysInline &&
            !r.audit.videoHasControls &&
            !r.audit.videoHasPoster &&
            r.audit.videoZIndex === '0' &&
            r.audit.stackZIndex === '1' &&
            r.audit.cardPaper &&
            !r.audit.overflowX
    ) &&
    desktopAudit.deckDisplay === 'none' &&
    desktopAudit.desktopVisible;

const report = { verifiedAt: new Date().toISOString(), pass, results };
fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
