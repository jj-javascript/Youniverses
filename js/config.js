/**
 * Site configuration — replace placeholders before production deploy.
 * Sanity: create project at sanity.io, add CORS origin for your domain.
 * Web3Forms: get access key at web3forms.com
 */
const SITE_CONFIG = {
    sanity: {
        projectId: 'YOUR_SANITY_PROJECT_ID',
        dataset: 'production',
        apiVersion: '2024-01-01',
    },
    web3forms: {
        accessKey: 'YOUR_WEB3FORMS_ACCESS_KEY',
    },
    /** Replace with your Calendly, Acuity, or booking page URL before production. */
    bookingUrl: 'https://calendly.com/YOUR_USERNAME',
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
