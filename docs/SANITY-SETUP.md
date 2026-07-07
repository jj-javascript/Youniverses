# Sanity CMS Setup — Youniverse

This site uses **Sanity as a hosted headless CMS**. There is no Studio code in this repo — Kai manages content at [sanity.io/manage](https://sanity.io/manage) (hosted Studio).

## What you need before going live

| Variable | Where to set it | Example |
|----------|-----------------|---------|
| `projectId` | [`js/config.js`](../js/config.js) → `SITE_CONFIG.sanity.projectId` | `abc123xy` |
| `dataset` | [`js/config.js`](../js/config.js) → `SITE_CONFIG.sanity.dataset` | `production` |
| CORS origin | Sanity project → API → CORS origins | `https://yourdomain.com` and `http://localhost:8765` for local testing |

When `projectId` is set to a real value (not `YOUR_SANITY_PROJECT_ID`), the site automatically fetches live content instead of fallback copy.

---

## Content types to create in Sanity Studio

Create these document types in your Sanity project with **exact field names** (the frontend queries depend on them).

### 1. Blog Post (`post`)

| Field | Sanity type | Required | Used for |
|-------|-------------|----------|----------|
| `title` | string | yes | Headline on blog index + article page |
| `slug` | slug (from title) | yes | Future individual article URLs |
| `excerpt` | text | yes | Card summary on blog index |
| `coverImage` | image | recommended | Thumbnail + article hero image |
| `publishedAt` | datetime | yes | Only posts with this field appear on the site |
| `body` | block content (Portable Text) | yes | Full article content |

**Site query** ([`js/blog.js`](../js/blog.js)):
```groq
*[_type == "post" && defined(publishedAt)] | order(publishedAt desc)[0...6]{title, excerpt, "coverImage": coverImage}
```

**Preview:** Open [`blog-preview.html`](../blog-preview.html) to see exactly how a published article renders.

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

1. **Create a Sanity account** at [sanity.io](https://www.sanity.io/) (free tier works).
2. **Create a new project** — note the **Project ID** shown in the dashboard.
3. **Create a dataset** named `production` (or update `dataset` in `js/config.js` to match).
4. **Add CORS origins** in Project → API → CORS:
   - Your production domain (e.g. `https://youniverse.example.com`)
   - `http://localhost:8765` for local testing
5. **Create the three document types** above in Sanity Studio (Schema tab or Vision tool).
6. **Add sample content** — at least one post with `publishedAt`, one service, one approved testimonial.
7. **Update `js/config.js`**:
   ```javascript
   sanity: {
       projectId: 'YOUR_ACTUAL_PROJECT_ID',
       dataset: 'production',
       apiVersion: '2024-01-01',
   },
   ```
8. **Deploy** the static site. Content updates in Sanity appear automatically — no redeploy needed.

---

## Day-to-day content management (non-technical)

### Add a blog post
1. Log in at [sanity.io/manage](https://sanity.io/manage) → open your project.
2. Click **Create** → **Post**.
3. Fill in title, excerpt, cover image, and body.
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

The current repo ships with placeholder `YOUR_SANITY_PROJECT_ID`. Until Kai replaces it:
- Blog shows fallback sample posts
- Services show hard-coded fallback sessions
- Testimonials show an empty-state message

No API token is required for **read-only public** queries — Sanity serves published content via the CDN API using only the project ID and dataset.
