# Sanity CMS Setup — Youniverse

This site uses **Sanity as a hosted headless CMS**. Content is managed in the in-repo Studio at [`studio/`](../studio/) and published to the `production01` dataset.

## What you need before going live

| Variable | Where to set it | Example |
|----------|-----------------|---------|
| `projectId` | [`js/config.js`](../js/config.js) → `SITE_CONFIG.sanity.projectId` | `janrh8g1ID` |
| `dataset` | [`js/config.js`](../js/config.js) → `SITE_CONFIG.sanity.dataset` | `production01` |
| CORS origin | Sanity project → API → CORS origins | `https://yourdomain.com`, `http://localhost:8080`, `http://localhost:8765` |

When `projectId` is set to a real value (not `YOUR_SANITY_PROJECT_ID`), the site automatically fetches live content instead of fallback copy.

---

## Studio setup (developers)

The Studio lives in [`studio/`](../studio/) and is linked to the existing Sanity project.

### 1. Log in to Sanity

```sh
cd studio
npx sanity login
```

### 2. Install dependencies

```sh
cd studio
npm install
```

### 3. Start the Studio locally

```sh
cd studio
npm run dev
```

Open `http://localhost:3333` to create and edit content.

### 4. Deploy the schema

After changing schema types in `studio/schemaTypes/`:

```sh
cd studio
npm install
npm run schema:deploy
```

Or run the full setup script (schema deploy, dataset creation, CORS, optional seed):

```sh
cd studio
npx sanity login
chmod +x scripts/setup-sanity.sh
./scripts/setup-sanity.sh
```

> **Note:** Project `janrh8g1ID` exists but the `production01` dataset must be created on first setup. The setup script runs `sanity dataset create production01` automatically after login.

### 5. Add CORS origins

Allow the static site to fetch content from the browser:

```sh
cd studio
npx sanity cors add http://localhost:8080 --no-credentials
npx sanity cors add http://localhost:8765 --no-credentials
npx sanity cors add https://yourdomain.com --no-credentials
```

### 6. Seed sample blog posts (optional)

The seed script creates three sample posts matching the site's fallback copy in [`js/blog.js`](../js/blog.js). It also uploads cover images from [`img/optimized/`](../img/optimized/) (`testBlog1-480.webp`, `testBlog2-480.webp`, `testBlog3-480.webp`) and attaches them as `coverImage` on each post.

#### Create a write token (one-time)

1. Go to [sanity.io/manage](https://sanity.io/manage) → project **janrh8g1** → **API** → **Tokens**
2. Click **Add API token**
3. Name it (e.g. `seed-script`) and choose **Editor** permissions
4. Copy the token (starts with `sk`) — it is shown only once

#### Run the seed

```sh
cd studio
SANITY_WRITE_TOKEN=sk... npm run seed
```

Expected output:

```
Uploading image for: Reading the cards when the path forks
  -> Asset: image-...
Creating post: seed-post-reading-the-cards-when-the-path-forks
...
Seeded 3 blog posts into production01.
```

#### Verify on platform

```sh
cd studio
npx sanity documents query '*[_type == "post"]{title, publishedAt, "hasImage": defined(coverImage)}'
```

You should see 3 posts, each with `hasImage: true`.

#### Re-run safely (idempotent)

The script uses stable document IDs (`seed-post-{slug}`) and `createOrReplace` mutations. Re-running the seed updates the same three documents instead of creating duplicates. Each run uploads fresh image assets; older assets remain in the project but are no longer referenced by these posts.

---

## Content types

Create these document types in the Studio with **exact field names** (the frontend queries depend on them). They are already defined in `studio/schemaTypes/`.

### 1. Blog Post (`post`)

| Field | Sanity type | Required | Used for |
|-------|-------------|----------|----------|
| `title` | string | yes | Headline on blog index + article page |
| `slug` | slug (from title) | yes | Future individual article URLs |
| `excerpt` | text | yes | Card summary on blog index |
| `coverImage` | image | recommended | Thumbnail + article hero image |
| `publishedAt` | datetime | yes | Only posts with this field appear on the site |
| `readMinutes` | number | optional | Meta line on article view |
| `body` | block content (Portable Text) | yes | Full article content |

**Site query** ([`js/blog.js`](../js/blog.js)):

```groq
*[_type == "post" && defined(publishedAt)] | order(publishedAt desc)[0...12]{
  title,
  slug,
  excerpt,
  publishedAt,
  readMinutes,
  body,
  coverImage
}
```

**Rendering:** `js/blog.js` includes a vanilla-JS Portable Text serializer (`renderPortableText`) that handles headings, blockquotes, lists, bold/italic, and links. Both the desktop article view and the mobile card-deck overlay use the same renderer.

**Preview:** Open [`blog-preview.html`](../blog-preview.html) to see the article layout, or click any post on `blog.html` (desktop) or the Blog card (mobile).

---

### 2. Service (`service`)

| Field | Sanity type | Required | Used for |
|-------|-------------|----------|----------|
| `title` | string | yes | Service card heading |
| `description` | text | yes | Service card body copy |
| `duration` | string | optional | Meta line (e.g. `60 min`) |
| `price` | string | optional | Meta line (e.g. `From $85`) |
| `order` | number | optional | Sort order (lower = first) |

**Site query** ([`js/services.js`](../js/services.js)):

```groq
*[_type == "service"] | order(order asc, title asc){title, description, duration, price}
```

---

### 3. Testimonial (`testimonial`)

| Field | Sanity type | Required | Used for |
|-------|-------------|----------|----------|
| `name` | string | yes | Author name |
| `quote` | text | yes | Testimonial text |
| `service` | string | optional | e.g. `Tarot Reading` |
| `approved` | boolean | yes | **Must be `true` to appear on site** |

**Site query** ([`js/testimonials.js`](../js/testimonials.js)):

```groq
*[_type == "testimonial" && approved == true] | order(_createdAt desc){name, quote, service}
```

User submissions via the website form go to **Web3Forms email** — they do **not** auto-create Sanity entries. Kai manually adds approved testimonials in Sanity.

---

## Steps for Kai to connect a personal Sanity account

If using a different Sanity project than the one in `js/config.js`:

1. **Create a Sanity account** at [sanity.io](https://www.sanity.io/) (free tier works).
2. **Create a new project** — note the **Project ID** shown in the dashboard.
3. **Create a dataset** named `production01` (or update `dataset` in `js/config.js` to match).
4. **Update `studio/sanity.config.ts` and `studio/sanity.cli.ts`** with the new project ID and dataset.
5. **Add CORS origins** in Project → API → CORS (see Studio setup above).
6. **Deploy schema** with `npm run schema:deploy` from `studio/`.
7. **Add sample content** — run `npm run seed` or create posts manually in Studio.
8. **Update `js/config.js`**:

   ```javascript
   sanity: {
       projectId: 'YOUR_ACTUAL_PROJECT_ID',
       dataset: 'production01',
       apiVersion: '2024-01-01',
   },
   ```

9. **Deploy** the static site. Content updates in Sanity appear automatically — no redeploy needed.

---

## Day-to-day content management (non-technical)

### Add a blog post
1. Run `npm run dev` in `studio/` (or use [sanity.io/manage](https://sanity.io/manage)).
2. Click **Create** → **Blog Post**.
3. Fill in title, excerpt, cover image, and body (rich text).
4. Set **Published At** to today's date/time.
5. Click **Publish**. The post appears on the Blog page within seconds.

### Delete a blog post
1. Open the post in Studio.
2. Click the **⋯** menu → **Delete**.
3. Confirm. It disappears from the site immediately.

### Add / edit / remove a service
Same flow — create or edit a **Service** document. Changes reflect on Book Online automatically.

### Approve a testimonial for the site
1. Create a **Testimonial** document in Sanity.
2. Paste the quote and name from the Web3Forms email.
3. Set **Approved** to `true`.
4. Publish. It appears on the Testimonials page.

### Hide a testimonial
Set **Approved** to `false` or delete the document.

---

## Test version notes

The current repo ships with project ID `janrh8g1ID` and dataset `production01`. Until schema is deployed and posts are published:
- Blog shows fallback sample posts
- Services show hard-coded fallback sessions
- Testimonials show an empty-state message

No API token is required for **read-only public** queries — Sanity serves published content via the CDN API using only the project ID and dataset. A write token is only needed for the optional seed script.
