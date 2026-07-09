import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '.gstack/mobile-parity');
const SCREEN = path.join(OUT, 'screenshots/post-fix');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://127.0.0.1:8765';
const WIDTHS = [360, 390, 414, 428];
const HEIGHT = 812;

fs.mkdirSync(SCREEN, { recursive: true });

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

    const homeAudit = await page.evaluate((w) => {
        const card = document.querySelector('.cardDeck__card--hero');
        const img = card?.querySelector('.cardDeck__card-photo img');
        const style = card ? getComputedStyle(card) : null;
        const overflowX = document.documentElement.scrollWidth > w + 1;
        return {
            hasPhoto: !!img && img.naturalWidth > 0,
            photoSrc: img?.currentSrc || img?.src || null,
            cardBg: style?.backgroundColor,
            bodyScrollable: getComputedStyle(card?.querySelector('.cardDeck__card-body')).overflowY === 'auto',
            overflowX,
        };
    }, width);

    results.push({ width, homeAudit });

    await page.screenshot({ path: path.join(SCREEN, `main-${width}.png`) });
    await page.close();
}

// Blog overlay flow at 390px
const blogPage = await browser.newPage();
await blogPage.setViewport({ width: 390, height: HEIGHT, deviceScaleFactor: 2 });
await blogPage.goto(`${BASE}/main.html`, { waitUntil: 'networkidle2' });

// Swipe blog card to front by clicking through or navigating to blog.html
await blogPage.goto(`${BASE}/blog.html`, { waitUntil: 'networkidle2' });

const blogCardAudit = await blogPage.evaluate(() => {
    const blogCard = document.querySelector('[data-page="blog"]');
    const isTop = blogCard === document.querySelector('.cardDeck__stack')?.lastElementChild;
    const cta = blogCard?.querySelector('.cardDeck__card-link');
    return {
        blogCardTop: isTop,
        ctaAction: cta?.dataset?.action || null,
        ctaHref: cta?.getAttribute('href') || null,
    };
});

await blogPage.click('[data-page="blog"] .cardDeck__card-link');
await blogPage.waitForFunction(() => document.querySelectorAll('.cardDeck__blog-item').length > 0, {
    timeout: 10000,
});

const listAudit = await blogPage.evaluate(() => {
    const items = document.querySelectorAll('.cardDeck__blog-item');
    return {
        overlayOpen: !document.querySelector('.cardDeck__overlay')?.hasAttribute('hidden'),
        postCount: items.length,
    };
});

await blogPage.screenshot({ path: path.join(SCREEN, 'blog-list-390.png') });

if (listAudit.postCount > 0) {
    await blogPage.click('.cardDeck__blog-item');
    await blogPage.waitForSelector('.blog-article__title');
    const articleAudit = await blogPage.evaluate(() => ({
        hasTitle: !!document.querySelector('.blog-article__title'),
        hasCover: !!document.querySelector('.blog-article__cover img'),
        hasBody: !!document.querySelector('.blog-article__body p'),
    }));
    await blogPage.screenshot({ path: path.join(SCREEN, 'blog-article-390.png') });
    results.push({ flow: 'blog-article', articleAudit });
}

results.push({ flow: 'blog-card', blogCardAudit, listAudit });

// Routing checks
const routingPage = await browser.newPage();
await routingPage.setViewport({ width: 390, height: HEIGHT });
await routingPage.goto(`${BASE}/main.html`, { waitUntil: 'networkidle2' });

const routing = await routingPage.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.cardDeck__card'));
    return cards.map((c) => ({
        page: c.dataset.page,
        href: c.dataset.href,
        action: c.dataset.action || null,
        ctaAction: c.querySelector('.cardDeck__card-link')?.dataset?.action || null,
    }));
});
results.push({ flow: 'routing', routing });

await browser.close();

const report = {
    verifiedAt: new Date().toISOString(),
    results,
    pass:
        results.filter((r) => r.homeAudit).every((r) => r.homeAudit.hasPhoto && !r.homeAudit.overflowX) &&
        results.some((r) => r.listAudit?.postCount >= 3),
};

fs.writeFileSync(path.join(OUT, 'post-fix-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
