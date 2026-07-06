# Visual Design Re-Audit — Youniverse (Screenshot-Backed)

URL audited: http://127.0.0.1:8765 (local static server)  
Evidence: 12 screenshots in `.gstack/design-audit-20260705/screenshots/youniverse-design-audit-20260705/`  
Method: gstack $B browse — desktop 1280×720, tablet 768×1024, mobile 375×812

## Headline Scores

| Metric | Grade | Verdict |
|--------|-------|---------|
| Design Score | C+ | Strong cosmic brand and a polished mobile card deck, undercut by dead CTAs, nav/content mismatches, and AI-generic blog copy |
| AI Slop Score | C | Three-column blog cards with "Are you seeking…" openers; otherwise distinctive typography and space theme save it |

## Phase 1: First Impression (Home — Desktop)

Screenshots: `first-impression-desktop.png`, `main-desktop.png`

I'm landing on a starfield video with _YOUNIVERSES in huge serif type — immediately cosmic and intentional. The site communicates a mystical personal brand (astrology, divination, self-discovery). I notice the hero is visually spectacular but has no primary CTA in the first viewport — only the subtitle "Explore your roadmap within." My eye goes to spectacle, not action.

The first 3 things my eye goes to are:

1. Giant _YOUNIVERSES headline (intended ✓)
2. Star/nebula video background (atmosphere ✓, competes with text)
3. Blue nav bar pulling attention away from the hero

If I had to describe this in one word: Cosmic — with unfinished as the runner-up.

Page area test: Hero and bio sections are clear. The "About Me" button reads as actionable but does nothing when clicked (verified: URL stays on main.html).

## Phase 2: Inferred Design System (Live DOM)

| Element | Finding |
|---------|---------|
| Fonts | Cormorant Garamond (display) + Montserrat (UI) — 2 families, on-brand ✓ |
| Colors | Nav blue #067BC2, white on dark, purple #7b2d7b on Services buttons (outside token system) |
| Heading scale | Hero h1 ~102px; Services h1 48px; Blog/Testimonials h1 ~64px — inconsistent |
| Semantic order (home) | h1 → h3 "HI!" → h2 "MY NAME IS KAI!" — skipped level |

### Touch targets (measured in browser)

| Element | Size | Min 44px? |
|---------|------|-----------|
| Nav links | ~47×19 | ✗ |
| Social icons | 16×16 | ✗ |
| About Me button | 173×34 | ✗ height |
| Book Now buttons | ~85×22 | ✗ |

## Phase 3: Page-by-Page Findings

### FINDING-001 — Dead primary CTAs

**Impact:** High · **Evidence:** `first-impression-desktop.png`, click test

- About Me clicked → no navigation, no scroll, URL unchanged
- Book Now (×4 on Services) clicked → URL unchanged
- Screenshot shows buttons that look real; behavior breaks trust

### FINDING-002 — Nav label ≠ page title (Trunk Test fail)

**Impact:** High · **Evidence:** `services-desktop-v2.png`, ux-audit

- On Services, nav highlights "Book Online" but the page h1 is "SERVICES."
- ux-audit reports youAreHere: "Book Online" while pageName: "Services".

### FINDING-003 — Fake search affordance

**Impact:** High · **Evidence:** all desktop screenshots

- "Search" + magnifying glass appear in every nav bar.
- ux-audit: `"search": { "found": false }`. Non-functional.

### FINDING-004 — Mobile: no nav, card deck only

**Impact:** High · **Evidence:** `main-mobile.png`, `services-mobile.png`, `blog-mobile.png`

- At 375px, desktop content is hidden (`display: none` on `.desktop-content`).
- Users only see the swipeable card deck — no persistent nav, no trunk test pass.
- Bright spot: The card deck itself is polished — stacked depth, lavender CTAs, "Swipe to explore" hint (`main-mobile.png`).

### FINDING-005 — Blog: AI slop copy + 3-column template

**Impact:** Medium · **Evidence:** `blog-desktop.png`

- Visible copy: "Are you on a quest for self-discovery…", "Look no further than Youniverses…" — classic AI opener pattern.
- Three equal cards over nebula background matches the slop checklist (#2 three-column feature grid vibe).

### FINDING-006 — Services layout stress at desktop width

**Impact:** Medium · **Evidence:** `services-desktop-v2.png`

- "Testimonials" nav link wraps to a second line while other links stay on row 1 — header flex/grid stress at 1280px.
- Book Now buttons are small (~85×22) with purple outline disconnected from brand tokens.

### FINDING-007 — Busy backgrounds behind text

**Impact:** Medium · **Evidence:** `first-impression-desktop.png`, `blog-desktop.png`, `testimonials-desktop.png`

- Bio paragraph, blog card text, and form labels all sit directly over high-detail cosmic imagery.
- Readable at desktop size, but contrast drops where orange nebula peaks behind white text.

### FINDING-008 — Missing optimized assets (404s)

**Impact:** Medium · **Evidence:** console/network on blog load

- Repeated 404s for `img/optimized/spacestars-1080.webm` and `.mp4` — video fallbacks referenced in HTML but not present.
- Console shows errors on every page load that includes the hero video markup.

### FINDING-009 — Testimonials: functional form, empty state

**Impact:** Polish · **Evidence:** `testimonials-desktop.png`

- Form UI is the most complete interaction on the site — visible labels, frosted panel, blue submit button.
- Empty state copy is clear. Testimonial list uses left-accent border styling (mild AI slop signal from prior audit).

### FINDING-010 — Services and Testimonials pages: full rework authorized

**Impact:** High · **Evidence:** `services-desktop-v2.png`, `testimonials-desktop.png`, `services-mobile.png`

- Both the Services and Testimonials pages are approved for complete redesign.
- Do not treat as incremental fixes — layout, structure, content hierarchy, and interaction patterns may all be replaced from scratch.
- Includes new copy structure and integrated data layer (Sanity where applicable).
- Existing implementations referenced only as baseline to improve against, not as constraints.
- **Design exploration:** use `/gstack-design-shotgun` to generate and compare visual directions before writing production HTML. Audit screenshots and the `$B` evolve path (screenshot current pages) inform the brief.

### FINDING-011 — Mobile card deck: viewport alignment required

**Impact:** High · **Evidence:** `main-mobile.png`, `css/cards.css`

- Cards must be sized and positioned so at least one full card is visible and interactable within the initial viewport at 375×812 without scrolling.
- **Root cause (CSS):**
  - `.cardDeck { min-height: 100vh }` (`cards.css:6`) — `100vh` includes area behind the mobile URL bar, pushing centered content below the visible fold.
  - `.cardDeck__stack { top: 50%; transform: translateY(-50%); height: min(72vh, 440px) }` (`cards.css:13-20`) — centers against the full `100vh` block, not the visible viewport.
  - `.cardDeck__card { height: clamp(250px, 68vw, 330px) }` (`cards.css:28`) — at 375px width ≈ 255px tall; combined with stack offset, card bottom can sit below fold.
  - `.cardDeck__hint { bottom: 1.5rem }` (`cards.css:207`) — anchored to bottom of `100vh` block, below fold on arrival.
  - `.nav-container { display: none }` on mobile (`base.css:148-151`); deck injected after nav in `js/cards.js:113-118`.
- **Required fix:** center against `svh`/`dvh` via flex layout instead of `100vh` + `top: 50%`; verify active card bounding box and hint fit within initial 375×812 visible viewport.

## Phase 4: Interaction Flow (Verified in Browser)

| Flow | Result |
|------|--------|
| Home → About Me | ✗ Dead button |
| Services → Book Now | ✗ Dead button |
| Nav → all pages | ✓ Works (desktop) |
| Mobile card → tap CTA | ✓ Navigates (card deck) |
| Mobile → see blog posts | ✗ Must navigate via cards; no direct content view |
| Search | ✗ Non-functional |
| Testimonials form | ✓ Renders; submit not tested (external Web3Forms) |

## Phase 5: Cross-Page Consistency

| Element | Consistent? |
|---------|-------------|
| Nav structure | ✓ Same 4 links everywhere (desktop) |
| Font pairing | ✓ |
| h1 sizing | ✗ 48px vs ~64px vs hero clamp |
| Background theme | ✓ Cosmic on all inner pages |
| Button styles | ✗ Nav blue / purple outline / lavender cards |
| Mobile experience | ✓ Card deck consistent; ✗ no page parity with desktop |

## Phase 6: Category Grades

| Category | Grade | Key evidence |
|----------|-------|--------------|
| Visual Hierarchy | B− | Strong hero; no hero CTA; busy backgrounds |
| Typography | B | Good pairing; inconsistent scale |
| Spacing & Layout | C+ | Nav wrap on Services; percentage grids |
| Color & Contrast | B− | Tokens exist; purple scattered |
| Interaction States | D | Dead buttons confirmed by click test |
| Responsive | B | Card deck excellent; content hidden on mobile |
| Content Quality | C | Placeholder headshot; AI blog copy |
| AI Slop | C | Blog 3-up + generic copy |
| Motion | B | Hero video + card swipe |
| Performance Feel | B− | 404 asset errors; heavy backgrounds |

## Quick Wins (< 30 min each)

- Wire Book Now and About Me — even a Calendly link or `#bio` anchor
- Remove or hide Search until it works
- Align nav "Book Online" with page h1 "Services"
- Bump touch targets — min 44px hit area on nav links, social icons, Book Now
- Replace blog fallback copy with Kai's voice (drop "Are you seeking…" pattern)
- Generate or remove missing `img/optimized/spacestars-1080.*` video files to stop 404 spam
- Populate `js/config.js` with Sanity project ID and Web3Forms access key before production
- Fix mobile card deck viewport alignment (`svh`/`dvh` flex centering)

## Integration & Tooling Inventory

| Item | Status | Note |
|------|--------|------|
| `js/config.js` | **Placeholder** | `projectId` and `accessKey` are literal `YOUR_*` values; `SANITY_CONFIGURED` is false; `sanityQuery`/`sanityImageUrl` helpers wired correctly |
| `js/blog.js` | **Configured (code) / Placeholder (data)** | Sanity fetch when configured; else `FALLBACK_POSTS` with `-480.webp` images; fallback copy matches AI-slop pattern (FINDING-005) |
| `js/testimonials.js` | **Configured (code) / Placeholder (data)** | Approved-testimonial Sanity query + Web3Forms submit; graceful "not configured" empty state |
| `npm run optimize` | **Configured** | `scripts/optimize-assets.mjs` present; `sharp ^0.33.5` declared; optimized images exist; requires `npm install` |
| `npm run optimize:video` / hero video | **Blocked / Missing** | `main.html:44-45` reference `spacestars-1080.webm`/`.mp4` (404); only `spacestars-poster.jpg` in `img/optimized/`; fallback `img/spacestars.mp4` present; needs `ffmpeg` |
| Cypress E2E (`cypress/e2e/*.cy.js`) | **Blocked** | 4 specs + `cypress.config.js` present; `cypress ^13.17.0` declared; install cache error on audit machine |
| HTML ↔ asset mismatches | **Flagged** | Missing optimized hero video sources are the canonical example of referenced-but-absent assets |

## Priority & Scope

All findings in this audit — FINDING-001 through FINDING-011 and polish-category items — are prioritized for implementation. This is a full pass, not selective triage. Quick wins and integration status are included in the implementation plan.

## Screenshot Index

| File | What it shows |
|------|---------------|
| `first-impression-desktop.png` | Home hero + bio split |
| `main-mobile.png` | Mobile card deck (hero card) |
| `services-desktop-v2.png` | Services list + Book Now buttons |
| `services-mobile.png` | Mobile "View Services" card |
| `blog-desktop.png` | Three blog cards with AI copy |
| `blog-mobile.png` | Mobile "Read Blog" card |
| `testimonials-desktop.png` | Form + empty state |
| `main-{mobile,tablet,desktop}.png` | Responsive set for home |
| `services-{mobile,tablet,desktop}.png` | Responsive set for services |
