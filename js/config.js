/**
 * Site configuration — replace placeholders before production deploy.
 * Sanity: create project at sanity.io, add CORS origin for your domain.
 * Web3Forms: get access key at web3forms.com
 */
const SITE_CONFIG = {
    sanity: {
        projectId: 'janrh8g1ID',
        dataset: 'production01',
        apiVersion: '2024-01-01',
    },
    web3forms: {
        accessKey: 'YOUR_WEB3FORMS_ACCESS_KEY',
        /** Email where Web3Forms delivers submissions (configured in web3forms.com dashboard). */
        recipientEmail: 'YOUR_EMAIL@example.com',
    },
    /** Replace with your Calendly, Acuity, or booking page URL before production. */
    bookingUrl: 'https://calendly.com/YOUR_USERNAME',
    /** Hero CTA order on main.html — About Me first, Book a Session second. */
    heroButtons: [
        { label: 'About Me', href: '#about', type: 'scroll' },
        { label: 'Book a Session', hrefKey: 'bookingUrl', type: 'external' },
    ],
    /** Only Instagram is shown site-wide. Replace handle before production. */
    instagramUrl: 'https://instagram.com/YOUR_HANDLE',
};

const SANITY_CONFIGURED =
    SITE_CONFIG.sanity.projectId &&
    SITE_CONFIG.sanity.projectId !== 'YOUR_SANITY_PROJECT_ID';

function sanityQuery(query) {
    const { projectId, dataset, apiVersion } = SITE_CONFIG.sanity;
    const url =
        'https://' +
        projectId +
        '.api.sanity.io/v' +
        apiVersion +
        '/data/query/' +
        dataset +
        '?query=' +
        encodeURIComponent(query);
    return fetch(url).then(function (res) {
        if (!res.ok) throw new Error('Sanity request failed: ' + res.status);
        return res.json();
    });
}

function sanityImageUrl(ref, width) {
    if (!ref) return '';
    const { projectId, dataset } = SITE_CONFIG.sanity;
    const parts = ref.replace('image-', '').split('-');
    const id = parts.slice(0, -1).join('-');
    const ext = parts[parts.length - 1];
    return (
        'https://cdn.sanity.io/images/' +
        projectId +
        '/' +
        dataset +
        '/' +
        id +
        '.' +
        ext +
        '?w=' +
        width +
        '&auto=format'
    );
}

function initHeroButtons() {
    var bookLink = document.querySelector('.hero-book-link');
    if (bookLink) {
        var url = SITE_CONFIG.bookingUrl || '#';
        var configured = url.indexOf('YOUR_USERNAME') === -1;
        bookLink.href = configured ? url : 'services.html';
        if (configured) {
            bookLink.target = '_blank';
            bookLink.rel = 'noopener noreferrer';
        }
    }
}

function initSocialLinks() {
    var instagramLinks = document.querySelectorAll('[data-instagram-link]');
    var url = SITE_CONFIG.instagramUrl || 'https://instagram.com/YOUR_HANDLE';
    instagramLinks.forEach(function (link) {
        link.href = url;
    });
}

function initSiteConfig() {
    initHeroButtons();
    initSocialLinks();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteConfig);
} else {
    initSiteConfig();
}
