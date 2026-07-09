# changes.md — Youniverse Revamp

> Plain-English summary of every change, organized by category and page.
> Status: **IMPLEMENTED** (build complete — configure `js/config.js` before production).

## Typography (all pages)
- **Add Cormorant Garamond as the display/heading font and a complementary sans-serif for UI/body** so the site gains an elegant, celestial editorial feel instead of the browser default. _(A1)_
- **Introduce CSS type tokens and font preloading** so type is consistent and text stays visible while fonts load. _(A1)_

## Navigation (all pages)
- **Recolor the nav bar and the "About Me" button to `#067BC2`**, replacing the current green/maroon nav, for a cleaner branded look. _(A3)_
- **Move the `<nav>` back inside `<body>` on `services.html`, `blog.html`, and `testimonials.html`**, where it is currently misplaced between `</head>` and `<body>` (invalid markup). _(A3)_
- **Fix nav alignment bugs** — the `height: 105%` overflow and invalid `margin-top: none` — so nav items sit centered on one row. _(A3)_
- **De-duplicate the nav CSS** by moving the block that is copy-pasted into all four stylesheets into one shared `base.css`. _(A1, A2)_
- **Replace the invisible `.planet` and `.search` icons** (empty `<i>` tags with no backing font/SVG) with real inline-SVG icons from a single sprite. _(A4)_

## Mobile UI — new card-deck (mobile only)
- **Add a stacked, fanned card deck that renders the four pages as swipeable cards on mobile**, using the reference palette (`#F8F5ED` background, `#726A53` border, `8px` radius, `200×275` base) — desktop stays exactly as-is. _(C1)_
- **Add swipe gestures with a seamless infinite loop** (top card animates out and re-inserts at the back), built in vanilla JS with pointer events and `requestAnimationFrame`. **Swipe-loop only — no flip.** _(C2; C3 cancelled)_
- **Give the hero (main) card special treatment** based on `KaiUniverse2.png` (zodiac wheel, thin-serif title, lavender CTA). _(C4)_

## Integrations (no backend)
- **Blog: populate `blog.html` from a headless CMS (Sanity) via client-side fetch**, so the content owner publishes posts in a hosted editor and they appear automatically with no redeploy. _(D1)_
- **Testimonials: collect submissions via a static form service and only display owner-approved ones** in `testimonials.html` (currently just a heading), keeping moderation in the owner's hands. _(D2)_
- **Drop the hard-coded `testBlog1/2/3.png` thumbnails** in favor of CMS-provided cover images. _(D1)_

## Performance (all pages)
- **Convert all images to AVIF + WebP with responsive `srcset`/`<picture>` and CSS `image-set()`**, cutting page weight dramatically. _(B1, B3)_
- **Re-encode the 31 MB `spacestars.mp4` hero video, add a poster + WebM, and rethink mobile autoplay** so the hero no longer dominates load time. _(B2, B3)_
- **Lazy-load below-the-fold images and eager-load only the true LCP asset per page.** _(B3)_
- **Add font/LCP preloading and cross-page prefetch** (shared blog/testimonials background) to speed page-to-page navigation. _(B4)_
- **Delete the orphaned 31 MB `bubbleStar2.jpg`** that is referenced nowhere. _(B5)_
- **Consolidate nav/social icons into one SVG sprite** to reduce requests. _(A4)_

## Quality & Testing
- **Add Cypress E2E test stubs** covering nav color, swipe + infinite loop, card flip, integration data population (stubbed), and mobile-vs-desktop layout. _(E1)_

## Structural / cleanup (per page)
- **`main.html`:** close the unterminated `<h2>MY NAME IS KAI!` tag and remove the no-op inline `background-size:cover` on the headshot `<img>`. `testImg.png` is **kept as a labeled placeholder** for now. _(A3)_
- **`services.html` / `blog.html` / `testimonials.html`:** nav relocated into `<body>`; shared CSS extracted. _(A2, A3)_
- **`index.html`:** unchanged (meta-refresh redirect to `main.html`).

## Design Audit Extension (2026-07-05)

- **Services and Testimonials flagged for full rework** — new layout, copy structure, and Sanity data layer integration authorized; explore directions via `/gstack-design-shotgun` before final HTML.
- **Mobile card viewport alignment** — at 375×812, one full card must be visible and interactable on first load without scrolling; documented in FINDING-011.
- **All audit findings prioritized** — high-impact items (FINDING-001 through FINDING-011) and polish-category items scheduled for a full implementation pass, not selective triage.
- **Integration & tooling inventory added** — status of `js/config.js`, `js/blog.js`, `js/testimonials.js`, `npm run optimize`, Cypress E2E, and HTML/asset mismatches documented in `.gstack/design-audit-20260705/AUDIT.md`.

## Audit remediation (2026-07-05)

- **FINDING-001:** About Me scrolls to `#about`; hero and service Book Now links wired via `bookingUrl` in `js/config.js`.
- **FINDING-002:** Services page h1 aligned to nav label — "Book Online".
- **FINDING-003:** Non-functional Search removed from all nav bars.
- **FINDING-005:** Blog fallback copy rewritten in Kai's voice; cards use text scrims.
- **FINDING-006 / FINDING-010:** Services page rebuilt — card grid, brand-blue CTAs, `js/services.js` with Sanity-ready fetch.
- **FINDING-007 / FINDING-009 / FINDING-010:** Testimonials page rebuilt — two-panel layout, scrim panels, card-style quotes (no left-accent slop).
- **FINDING-008:** Removed missing `spacestars-1080.*` video sources; hero uses existing `img/spacestars.mp4`.
- **FINDING-011:** Mobile card deck uses `100svh`/`100dvh` flex centering; reduced card/stack sizing; hint in flow.
- **Touch targets:** Nav links, social icons, and buttons bumped to 44px minimum via `--touch-min` token.

## Design finalization (2026-07-06)

- **Services — Celestial Ledger (variant A):** 2×2 card grid on cosmic background, frosted hero panel, uppercase meta lines, brand-blue Book Now CTAs. Implemented in `services.html`, `css/services.css`, `js/services.js`.
- **Testimonials — Mirror Split + Letter Press palette:** Split layout (stories left, form right); cream `#f4f0e8`, ink `#2c2416`, gold `#c9a84c`; EB Garamond + Source Sans 3; featured quote carousel with dot nav when multiple testimonials load from Sanity. Implemented in `testimonials.html`, `css/testimonials.css`, `js/testimonials.js`.

## UI Remediation Pass (2026-07-06)

### Task 1 — Mobile UI audit
| Viewport | Finding | Fix |
|----------|---------|-----|
| 360×812 | Hero card title `_YOUNIVERSES` clipped by heart button + narrow width | Removed heart button (Task 2); added `clamp()` title sizing + `overflow-wrap` |
| 360×667 | Card deck fits without scroll | No change needed — verified |
| All mobile | No horizontal overflow on any page | Verified via browse JS checks |
| Blog grid (narrow desktop) | `minmax(280px)` could force overflow below 280px content width | Changed to `minmax(min(100%, 280px), 1fr)` |

### Task 2 — Card styling
- **Papery-white token:** `--card-paper: #F8F5ED` in `css/base.css` — warm off-white matching the card-deck reference palette; improves text contrast vs previous `#f8f8f8`.
- **Full page content on card face:** Expanded card body copy in `js/cards.js`; removed all like/heart buttons.
- **Translucence fix:** Front card (`:nth-last-child(1)`) stays `opacity: 1` with no brightness filter; background cards use reduced opacity only (0.55–0.85) with scale/offset for depth. Removed `filter: brightness()` that dimmed readable text during swipe.

### Task 3 — Nav alignment
- Switched `nav` to 3-column CSS grid (`1fr auto 1fr`) so `.centralNav` links center on the full nav bar, balanced against the YOUNIVERSES brand column.

### Task 4 — Hero button order
- Hero CTAs reordered: **About Me** (`#about`) first, **Book a Session** (`bookingUrl`) second in `.hero-cta-group`.
- Duplicate About Me button removed from bio section.
- `SITE_CONFIG.heroButtons` documents order in `js/config.js`; `initHeroButtons()` wires booking URL.

### Task 5 — Social links
- Removed BlueSky, X, LinkedIn, GitHub from `main.html`.
- Added Instagram icon to `img/icons.svg`; single link via `SITE_CONFIG.instagramUrl` placeholder.
- Touch target: 44px via existing `.social-list a` rules.

### Task 6 — Favicon
- `NewK.png` favicon + apple-touch-icon on all pages; `site.webmanifest` for home-screen shortcut.
- Attribution comment included exactly: `<!-- Photo by HI! ESTUDIO on Unsplash -->`
- **Kai approval item:** `NewK.png` is 2.2 MB — recommend generating a 32×32/180×180 optimized icon set.

### Task 7 — Blog article preview
- Created `blog-preview.html` — realistic article layout with scrim panel, cover image, body typography, blockquote.
- CMS field mapping panel shows how Sanity fields render.
- Linked from `blog.html` header.
- Full Sanity documentation in `docs/SANITY-SETUP.md`.

### Task 8 — Sanity integration (hosted-only test version)
- Frontend fetch already wired in `js/blog.js`, `js/services.js`, `js/testimonials.js`.
- `docs/SANITY-SETUP.md` — schema definitions, CORS steps, day-to-day Kai guide, connect-your-account steps.
- Placeholder `YOUR_SANITY_PROJECT_ID` until Kai provides credentials.

### Task 9 — Web3Forms integration
- Form wired in `js/testimonials.js` + `testimonials.html`.
- `docs/WEB3FORMS-SETUP.md` — access key setup, moderation workflow, dashboard usage.
- Placeholder `YOUR_WEB3FORMS_ACCESS_KEY` until Kai provides credentials.

### Task 10 — Nav gap diagnosis
- **Root cause:** `.nav-reveal-zone` was in document flow (20px block) pushing `.nav-container` below the viewport top when auto-hide nav opened — visible gap above nav bar.
- **Fix:** Made `.nav-reveal-zone` `position: absolute` within `.nav-shell` so the nav bar sits flush at `y: 0` when revealed; reveal zone overlays top edge for hover detection only.
- **Reasoning:** Preserves auto-hide design intent without sacrificing flush nav alignment.

## Mobile Content Parity Pass (2026-07-08)

**Design-Shotgun concept selected:** Concept A — Photo top-banner (`.gstack/mobile-parity/CONCEPT-SELECTION.md`)

**Rationale:** `testImg` renders clearly at 360–428px without competing with body text; full papery-white `--card-paper` background preserves the opacity-only depth stack (no `filter: brightness()`); top-banner layout scales predictably with scrollable copy below.

### Remediation log

| Viewport | Finding | Fix | File(s) changed |
|----------|---------|-----|-----------------|
| 360×812 | Home card has no `testImg` photo | Added responsive `<picture>` banner (Concept A) to home card via `buildImageMarkup()` | `js/cards.js`, `css/cards.css` |
| 390×812 | Home card has no `testImg` photo | Same — AVIF/WebP/PNG srcset renders at all mobile widths | `js/cards.js`, `css/cards.css` |
| 414×812 | Home card has no `testImg` photo | Same — photo visible, not clipped or overflowed | `js/cards.js`, `css/cards.css` |
| 428×812 | Home card has no `testImg` photo | Same — verified `naturalWidth > 0` at all target viewports | `js/cards.js`, `css/cards.css` |
| 360–428 | Hero card used dark cosmic gradient, not papery-white | Removed dark `--hero` override; home card uses `--card-paper: #F8F5ED` | `css/cards.css` |
| 360–428 | Card body truncated to 4 lines (`-webkit-line-clamp`) | Removed line-clamp; made `.cardDeck__card-body` scrollable with `overflow-y: auto` | `css/cards.css` |
| 360–428 | Blog posts hidden on mobile (`.desktop-content` suppressed) | Added in-deck blog list overlay with all posts from shared `YouniverseBlog.fetchPosts()` | `js/cards.js`, `js/blog.js`, `css/cards.css` |
| 360–428 | No tap-to-open article viewer on mobile | Blog card CTA/tap opens overlay; post tap renders `.blog-article` layout matching `blog-preview.html` | `js/cards.js`, `js/blog.js`, `css/cards.css` |
| 360–428 | Blog card CTA navigated to `blog.html` (re-showed deck, no posts) | Blog CTA and card tap wired to `data-action="blog-overlay"` instead of page navigation | `js/cards.js` |
| 360–428 | `blog.js` not loaded on non-blog pages (overlay had no data) | Added `blog.js` + `blog.css` to `main.html`, `services.html`, `testimonials.html`; fixed script order on `blog.html` | `main.html`, `services.html`, `testimonials.html`, `blog.html` |
| 360–428 | Fallback posts lacked article body content | Added `body`, `publishedAt`, `readMinutes` to `FALLBACK_POSTS`; exposed `window.YouniverseBlog` API | `js/blog.js` |
| 360–428 | Services/Testimonials full content still deck-only summaries | Acknowledged — out of scope for this pass; deck summary cards + CTAs route correctly to target pages | — |
| 360–428 | Nav hidden on mobile (by design) | No change — card deck remains sole mobile navigation per architecture | — |
| 360–428 | Post-fix viewport sweep | Re-screenshotted all pages at 360/390/414/428; zero horizontal overflow detected | `.gstack/mobile-parity/screenshots/post-fix/` |

### Files modified
- `js/cards.js` — image support, Concept A home card, blog overlay (list + article), routing fix
- `js/blog.js` — shared post loader, article renderer, `YouniverseBlog` global
- `css/cards.css` — photo banner, papery-white hero, scrollable body, overlay styles
- `main.html`, `services.html`, `testimonials.html`, `blog.html` — `blog.js`/`blog.css` wiring

### Audit artifacts
- Gap report: `.gstack/mobile-parity/GAP-REPORT.md`
- Concept selection: `.gstack/mobile-parity/CONCEPT-SELECTION.md`
- Pre-fix screenshots: `.gstack/mobile-parity/screenshots/`
- Post-fix screenshots: `.gstack/mobile-parity/screenshots/post-fix/`
- Verification: `.gstack/mobile-parity/post-fix-audit.json` (`pass: true`)

