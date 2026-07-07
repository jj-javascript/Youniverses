# Youniverses

Static site for Kai's astrology and divination practice.

## Before production

Edit [`js/config.js`](js/config.js):

| Key | Purpose |
|-----|---------|
| `sanity.projectId` | Sanity CMS project for blog posts, services, and approved testimonials |
| `web3forms.accessKey` | Web3Forms key for testimonial submissions |
| `web3forms.recipientEmail` | Email where Web3Forms delivers submissions |
| `bookingUrl` | Calendly or booking page URL for Book Now / Book a Session links |
| `instagramUrl` | Live Instagram profile URL |
| `heroButtons` | Documents hero CTA order (About Me first, Book a Session second) |

Setup guides:
- Sanity CMS: [`docs/SANITY-SETUP.md`](docs/SANITY-SETUP.md)
- Web3Forms: [`docs/WEB3FORMS-SETUP.md`](docs/WEB3FORMS-SETUP.md)
- Blog article preview: [`blog-preview.html`](blog-preview.html)

Run `npm install` then `npm run optimize` to regenerate optimized images. Run `npm run optimize:video` (requires `ffmpeg`) to produce hero video variants.

Cypress E2E specs live in `cypress/e2e/` — run with `npm run test:e2e` after install.

Design audit: [`.gstack/design-audit-20260705/AUDIT.md`](.gstack/design-audit-20260705/AUDIT.md)
