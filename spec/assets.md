# spec/assets.md — Asset Manifest & Image Optimization Pipeline

> Single source of truth for the image/video optimization pipeline. Organized by page.
> All commands are **static-site-compatible** (one-off CLI or CI build step — no backend/runtime processing).
> Legend: ✅ referenced & present · ⚠️ present but oversized/placeholder · ❌ referenced but missing · 🗑️ orphaned (present, never referenced)

## Toolchain (install once)

```bash
# Node-based (recommended, cross-platform) — raster conversion
npm i -D sharp @squoosh/cli

# OR native CLIs
brew install webp libavif ffmpeg imagemagick   # macOS
```

- **sharp / @squoosh/cli** → WebP + AVIF generation and resizing for `srcset`.
- **ffmpeg** → video re-encode (H.264 MP4 + VP9/AV1 WebM) + poster frame extraction.
- **cwebp / avifenc** → native alternative for single-file conversions.

Output convention: place derivatives next to source in `img/optimized/` using the pattern
`name-<width>.webp` / `name-<width>.avif` (e.g. `img/optimized/testImg-480.avif`).

---

## Page: `main.html` (hero + bio)

### `img/spacestars.mp4` ⚠️ (31 MB — critical, hero background video)
- **Purpose:** Full-viewport looping background behind the site title (`.titleSection`).
- **Problem:** 31 MB autoplaying video is the single biggest performance liability, especially on mobile.
- **Recommended outputs:** compressed MP4 (H.264) + WebM (VP9/AV1) + a poster JPG/WebP; consider **not** autoplaying on mobile (show poster instead).
- **Target:** ≤ ~3–5 MB at 1080p, ~30fps, no audio track.

```bash
# Poster frame (LCP-friendly still)
ffmpeg -i img/spacestars.mp4 -vframes 1 -q:v 2 img/optimized/spacestars-poster.jpg
# Compressed MP4 (H.264, no audio)
ffmpeg -i img/spacestars.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 28 -preset slow -movflags +faststart img/optimized/spacestars-1080.mp4
# WebM (VP9, smaller)
ffmpeg -i img/spacestars.mp4 -an -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 img/optimized/spacestars-1080.webm
```

### `img/testImg.png` ⚠️❌ PLACEHOLDER (374 KB — Kai headshot)
- **Purpose:** Portrait of Kai in `.infoSectionImg` (right column of bio grid). `alt="KaiHeadshot"`.
- **Placeholder flag:** `testImg` is a stand-in — must be replaced with the real headshot before production.
- **Appears at:** ~35% column on desktop (≈ up to 500px wide), full-width capped at 400px tall on mobile (`max-height: 400px`, `@media max-width: 975px`).
- **Recommended outputs:** AVIF + WebP + JPG fallback.
- **srcset breakpoints:** 400, 600, 900 (2x for retina at the 400–500px display box).

```bash
for w in 400 600 900; do \
  npx @squoosh/cli --avif '{"cqLevel":30}' --resize "{\"width\":$w}" -d img/optimized img/testImg.png; \
  npx @squoosh/cli --webp '{"quality":75}' --resize "{\"width\":$w}" -d img/optimized img/testImg.png; \
done
```

### `img/bubbleStar.jpg` ⚠️ (1.9 MB — bio section background)
- **Purpose:** `background-image` of `.infoSection` (full-viewport bio backdrop).
- **Recommended outputs:** WebP + AVIF (referenced via `image-set()` in CSS with JPG fallback).
- **srcset/breakpoints:** background — generate 1280, 1920, 2560 for `image-set()` density switching.

```bash
for w in 1280 1920 2560; do \
  npx @squoosh/cli --avif '{"cqLevel":34}' --resize "{\"width\":$w}" -d img/optimized img/bubbleStar.jpg; \
  npx @squoosh/cli --webp '{"quality":72}' --resize "{\"width\":$w}" -d img/optimized img/bubbleStar.jpg; \
done
```

---

## Page: `services.html`

### `img/v933-audi-42-a.jpg` ⚠️ (2.6 MB — services background)
- **Purpose:** `background-image` of `.contentSection`.
- **Note:** Filename suggests a stock asset ("audi"/vecteezy) — confirm licensing and whether it's the intended brand image.
- **Recommended outputs:** WebP + AVIF via CSS `image-set()`.
- **Breakpoints:** 1280, 1920, 2560.

```bash
for w in 1280 1920 2560; do \
  npx @squoosh/cli --avif '{"cqLevel":34}' --resize "{\"width\":$w}" -d img/optimized img/v933-audi-42-a.jpg; \
  npx @squoosh/cli --webp '{"quality":72}' --resize "{\"width\":$w}" -d img/optimized img/v933-audi-42-a.jpg; \
done
```

---

## Page: `blog.html`

### `img/fire-cloud-space-background.jpg` ⚠️ (7 MB — blog + testimonials background)
- **Purpose:** `background-image` of `.contentSection` (blog) and `body` (testimonials) — **shared across two pages.**
- **Recommended outputs:** WebP + AVIF via `image-set()`; single set reused on both pages (good cache reuse — see prefetch note in changes.md).
- **Breakpoints:** 1280, 1920, 2560.

```bash
for w in 1280 1920 2560; do \
  npx @squoosh/cli --avif '{"cqLevel":36}' --resize "{\"width\":$w}" -d img/optimized img/fire-cloud-space-background.jpg; \
  npx @squoosh/cli --webp '{"quality":70}' --resize "{\"width\":$w}" -d img/optimized img/fire-cloud-space-background.jpg; \
done
```

### `img/testBlog1.png` · `img/testBlog2.png` · `img/testBlog3.png` ⚠️❌ PLACEHOLDERS (~350–400 KB each)
- **Purpose:** Thumbnail images in each `.blogBox` card.
- **Placeholder flag:** `testBlogN` are stand-ins. In the final design these should come **dynamically from the blog CMS** (see integrations plan), not be hard-coded files.
- **Appears at:** `.blogBox` is `width: 30%`, image `width: 95%` → ≈ 300–360px display width on desktop; full-width on mobile once cards stack.
- **Recommended outputs:** AVIF + WebP + PNG/JPG fallback.
- **srcset breakpoints:** 320, 480, 720.

```bash
for f in testBlog1 testBlog2 testBlog3; do \
  for w in 320 480 720; do \
    npx @squoosh/cli --avif '{"cqLevel":32}' --resize "{\"width\":$w}" -d img/optimized img/$f.png; \
    npx @squoosh/cli --webp '{"quality":74}' --resize "{\"width\":$w}" -d img/optimized img/$f.png; \
  done; \
done
```

---

## Page: `testimonials.html`
- Reuses `img/fire-cloud-space-background.jpg` (see blog page). No unique assets today.
- Future testimonial avatars (if added) should be served from the CMS/form pipeline, not committed as files.

---

## Icons (all pages, in `<nav>`)

### `.planet` and `.search` ❌ MISSING BACKING ASSET
- Referenced as empty `<i class="planet">` / `<i class="search">` in every page's nav, but **no font, background-image, or SVG is defined** anywhere in CSS → they render nothing.
- **Recommendation:** Replace with inline SVG (consistent with the social icons already inlined in `main.html`) and combine repeated nav/social glyphs into **one SVG sprite** (`img/icons.svg` + `<use>`), or a CSS sprite sheet. This removes per-icon requests and fixes the invisible-icon bug.

---

## Orphaned / unreferenced assets

### `img/bubbleStar2.jpg` ✅ DELETED (was 31 MB, referenced nowhere)
- Removed with owner approval — cut ~31 MB from the deploy.

---

## Reference assets (now present — used for the card deck, not deployed)

| Asset | Purpose | Status |
|---|---|---|
| `spec/assets/KaiUniverse1.png` | Card aesthetic reference (white card, serif head + sans body, cosmic bg) | ✅ present |
| `spec/assets/KaiUniverse2.png` | Hero card model (zodiac wheel, thin-serif title, lavender CTA) | ✅ present |
| `spec/assets/KaiUniverse3.png` | Target fanned-deck visual (title top-left, heart top-right, dimmed back cards) | ✅ present |
| `spec/references/Stacked_Cards_UI.txt` | `moveCard`/`swap` loop + `nth-last-child` depth | ✅ present |
| `spec/references/CodePen_Card_Flip.txt` | Card-flip interaction (`preserve-3d` + `rotateY`) | ✅ present |

**Aesthetic note (decision point):** the reference `.txt` files use a papery card
(`#F8F5ED`, `1px solid #726A53`, `8px` radius), but the actual brand mockups
(`KaiUniverse1/3`) show a **whiter card, larger ~16–20px radius, no brown border, on a
cosmic-navy background with a lavender accent** and a title-top-left / heart-top-right
layout. Recommendation: adopt the KaiUniverse visual look while keeping the reference
**stacking/loop mechanics**. These reference images live under `spec/` and are **not**
part of the deployed site (no optimization needed).

---

## Summary of pipeline decisions
- **Raster:** AVIF (primary) + WebP (fallback) + original as last resort, delivered via `<picture>`/`srcset` for `<img>` and `image-set()` for CSS backgrounds.
- **Video:** ffmpeg re-encode + poster; reconsider mobile autoplay.
- **Lazy loading:** `loading="lazy"` + `decoding="async"` on all non-LCP `<img>`; `preload="none"` on the hero video (poster shown first).
- **Preload:** fonts + LCP image/poster via `<link rel="preload">`.
- **Prefetch:** shared background (`fire-cloud-space-background`) prefetched between blog↔testimonials.
- **Sprites:** consolidate nav/social icons into one SVG sprite.
