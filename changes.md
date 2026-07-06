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
