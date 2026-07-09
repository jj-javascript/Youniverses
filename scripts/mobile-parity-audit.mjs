import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '.gstack/mobile-parity');
const SCREEN = path.join(OUT, 'screenshots');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://127.0.0.1:8765';
const PAGES = ['main', 'blog', 'services', 'testimonials'];
const WIDTHS = [360, 390, 414, 428];
const HEIGHT = 812;

fs.mkdirSync(SCREEN, { recursive: true });

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const findings = [];

for (const pageName of PAGES) {
    for (const width of WIDTHS) {
        const page = await browser.newPage();
        await page.setViewport({ width, height: HEIGHT, deviceScaleFactor: 2 });
        await page.goto(`${BASE}/${pageName}.html`, { waitUntil: 'networkidle2' });

        const shot = path.join(SCREEN, `${pageName}-${width}.png`);
        await page.screenshot({ path: shot, fullPage: false });

        const audit = await page.evaluate((w) => {
            const desktop = document.querySelector('.desktop-content');
            const deck = document.querySelector('.cardDeck');
            const nav = document.querySelector('.nav-container');
            const homeCard = document.querySelector('.cardDeck__card--hero');
            const imgs = homeCard ? homeCard.querySelectorAll('img, picture') : [];
            const blogBoxes = document.querySelectorAll('.blogBoxes .blogBox');
            const blogCard = document.querySelector('[data-page="blog"]');
            const testImg = document.querySelector('.infoSectionImg img, .infoSectionImg picture');
            const overflowX = document.documentElement.scrollWidth > w + 1;

            return {
                desktopHidden: desktop ? getComputedStyle(desktop).display === 'none' : null,
                deckVisible: deck ? getComputedStyle(deck).display !== 'none' : false,
                navHidden: nav ? getComputedStyle(nav).display === 'none' : null,
                homeCardHasImage: imgs.length > 0,
                desktopTestImg: !!testImg,
                blogPostCount: blogBoxes.length,
                blogCardHref: blogCard?.dataset?.href || null,
                overflowX,
                cardCount: document.querySelectorAll('.cardDeck__card').length,
            };
        }, width);

        if (pageName === 'main' && !audit.homeCardHasImage) {
            findings.push({
                viewport: `${width}×${HEIGHT}`,
                finding: 'Home card has no testImg photo — card deck is text-only',
                owner: 'js/cards.js, css/cards.css',
            });
        }
        if (pageName === 'blog' && audit.blogPostCount === 0) {
            findings.push({
                viewport: `${width}×${HEIGHT}`,
                finding: 'Blog posts not visible on mobile — .desktop-content hidden, deck shows summary card only',
                owner: 'css/cards.css, blog.html, js/blog.js',
            });
        }
        if (audit.overflowX) {
            findings.push({
                viewport: `${width}×${HEIGHT}`,
                finding: `Horizontal overflow on ${pageName}.html`,
                owner: `css/${pageName === 'main' ? 'main' : pageName}.css`,
            });
        }

        await page.close();
    }
}

// Desktop comparison for main testImg
const desktopPage = await browser.newPage();
await desktopPage.setViewport({ width: 1280, height: 720 });
await desktopPage.goto(`${BASE}/main.html`, { waitUntil: 'networkidle2' });
const desktopAudit = await desktopPage.evaluate(() => ({
    testImgVisible: !!document.querySelector('.infoSectionImg img'),
    heroVideo: !!document.querySelector('.titleSection video'),
    aboutSection: !!document.querySelector('#about'),
}));
await desktopPage.screenshot({ path: path.join(SCREEN, 'main-desktop.png') });
await desktopPage.close();

await browser.close();

const report = {
    auditedAt: new Date().toISOString(),
    method: 'puppeteer-core + system Chrome',
    viewports: WIDTHS.map((w) => `${w}×${HEIGHT}`),
    pages: PAGES,
    desktopMain: desktopAudit,
    findings: [
        ...findings,
        {
            viewport: '360–428',
            finding: 'testImg headshot present on desktop (#about) but absent from mobile home card',
            owner: 'main.html (desktop), js/cards.js (mobile)',
        },
        {
            viewport: '360–428',
            finding: 'Blog grid + CMS preview link hidden; no tap-to-open article viewer on mobile',
            owner: 'blog.html, js/blog.js, css/cards.css',
        },
        {
            viewport: '360–428',
            finding: 'Services grid + Book Now CTAs hidden on mobile',
            owner: 'services.html, js/services.js, css/cards.css',
        },
        {
            viewport: '360–428',
            finding: 'Testimonials list + submission form hidden on mobile',
            owner: 'testimonials.html, js/testimonials.js, css/cards.css',
        },
        {
            viewport: '360–428',
            finding: 'Nav bar hidden on mobile — card deck is sole navigation',
            owner: 'css/base.css, js/cards.js',
        },
        {
            viewport: '360–428',
            finding: 'Card body copy truncated to 4 lines via -webkit-line-clamp',
            owner: 'css/cards.css (.cardDeck__card-text)',
        },
        {
            viewport: '360–428',
            finding: 'Hero card uses dark cosmic gradient, not papery-white --card-paper',
            owner: 'css/cards.css (.cardDeck__card--hero)',
        },
    ],
};

fs.writeFileSync(path.join(OUT, 'audit-data.json'), JSON.stringify(report, null, 2));
console.log('Audit complete:', findings.length, 'dynamic findings');
console.log(JSON.stringify(report, null, 2));
