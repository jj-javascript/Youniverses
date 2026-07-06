(function () {
    'use strict';

    var FALLBACK_SERVICES = [
        {
            title: 'Tarot Reading',
            description:
                'A one-on-one spread to name what is moving in your life now and where the thread leads next.',
            duration: '60 min',
            price: 'From $85',
        },
        {
            title: 'Birth Chart Analysis',
            description:
                'Your natal map read as a living pattern — strengths, edges, and timing worth paying attention to.',
            duration: '90 min',
            price: 'From $120',
        },
        {
            title: 'Life Coaching Session',
            description:
                'Grounded conversation with astrology and divination as mirrors — clarity for the choice in front of you.',
            duration: '60 min',
            price: 'From $95',
        },
        {
            title: 'Tarot Reading Workshop',
            description:
                'Learn to read for yourself and others in a small-group setting with guided practice spreads.',
            duration: '2 hr',
            price: 'From $65',
        },
    ];

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function bookingLink() {
        var url = SITE_CONFIG.bookingUrl || '#';
        var configured = url.indexOf('YOUR_USERNAME') === -1;
        return {
            href: configured ? url : '#services-list',
            external: configured,
        };
    }

    function renderService(service) {
        var link = bookingLink();
        var targetAttr = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return (
            '<article class="service-card text-scrim">' +
            '<div class="service-card__body">' +
            '<h2 class="service-card__title">' +
            escapeHtml(service.title) +
            '</h2>' +
            '<p class="service-card__desc">' +
            escapeHtml(service.description || '') +
            '</p>' +
            '<ul class="service-card__meta">' +
            (service.duration
                ? '<li><span class="service-card__label">Duration</span> ' +
                  escapeHtml(service.duration) +
                  '</li>'
                : '') +
            (service.price
                ? '<li><span class="service-card__label">Investment</span> ' +
                  escapeHtml(service.price) +
                  '</li>'
                : '') +
            '</ul>' +
            '</div>' +
            '<a class="book-btn service-card__cta" href="' +
            escapeHtml(link.href) +
            '"' +
            targetAttr +
            '>Book Now</a>' +
            '</article>'
        );
    }

    function showState(container, message, className) {
        container.innerHTML =
            '<p class="services-state ' + className + '">' + escapeHtml(message) + '</p>';
    }

    function renderServices(container, services) {
        if (!services.length) {
            showState(container, 'Sessions coming soon. Reach out to book directly.', 'services-state--empty');
            return;
        }
        container.innerHTML = services.map(renderService).join('');
    }

    function loadServices() {
        var container = document.getElementById('services-list');
        if (!container) return;

        if (typeof SANITY_CONFIGURED !== 'undefined' && SANITY_CONFIGURED) {
            showState(container, 'Loading sessions…', 'services-state--loading');

            var query =
                '*[_type == "service"] | order(order asc, title asc){title, description, duration, price}';

            sanityQuery(query)
                .then(function (data) {
                    var items = data.result || [];
                    renderServices(container, items.length ? items : FALLBACK_SERVICES);
                })
                .catch(function () {
                    renderServices(container, FALLBACK_SERVICES);
                });
        } else {
            renderServices(container, FALLBACK_SERVICES);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadServices);
    } else {
        loadServices();
    }
})();
