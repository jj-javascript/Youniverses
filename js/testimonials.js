(function () {
    'use strict';

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderStory(item) {
        var author = escapeHtml(item.name);
        if (item.service) {
            author += ', ' + escapeHtml(item.service);
        }

        return (
            '<article class="testimonial-story">' +
            '<p class="testimonial-quote">"' +
            escapeHtml(item.quote) +
            '"</p>' +
            '<footer class="testimonial-author">— ' +
            author +
            '</footer>' +
            '</article>'
        );
    }

    function showState(container, message, className) {
        container.innerHTML =
            '<p class="testimonial-state ' + className + '">' + escapeHtml(message) + '</p>';
    }

    function renderList(container, items) {
        if (!items.length) {
            showState(
                container,
                'No testimonials yet. Be the first to share your experience!',
                'testimonial-state--empty'
            );
            return;
        }

        container.innerHTML = items.map(renderStory).join('');
    }

    function loadTestimonials() {
        var container = document.querySelector('.testimonials-list');
        if (!container) return;

        showState(container, 'Loading testimonials…', 'testimonial-state--loading');

        if (typeof SANITY_CONFIGURED !== 'undefined' && SANITY_CONFIGURED) {
            var query =
                '*[_type == "testimonial" && approved == true] | order(_createdAt desc){name, quote, service}';

            sanityQuery(query)
                .then(function (data) {
                    renderList(container, data.result || []);
                })
                .catch(function () {
                    showState(
                        container,
                        'Unable to load testimonials right now. Please try again later.',
                        'testimonial-state--error'
                    );
                });
        } else {
            showState(
                container,
                'Testimonials will appear here once configured. Submit yours below.',
                'testimonial-state--empty'
            );
        }
    }

    function bindForm() {
        var form = document.querySelector('.testimonial-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var status = form.querySelector('.form-status');
            var accessKey = SITE_CONFIG.web3forms.accessKey;

            if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
                if (status) {
                    status.textContent =
                        'Form not yet configured. Update js/config.js with your Web3Forms access key.';
                    status.className = 'form-status form-status--error';
                }
                return;
            }

            if (status) {
                status.textContent = 'Sending…';
                status.className = 'form-status form-status--loading';
            }

            var formData = new FormData(form);
            formData.append('access_key', accessKey);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            })
                .then(function (res) {
                    return res.json();
                })
                .then(function (data) {
                    if (data.success) {
                        form.reset();
                        if (status) {
                            status.textContent =
                                'Thank you! Your testimonial has been submitted for review.';
                            status.className = 'form-status form-status--success';
                        }
                    } else {
                        throw new Error(data.message || 'Submission failed');
                    }
                })
                .catch(function () {
                    if (status) {
                        status.textContent =
                            'Something went wrong. Please try again later.';
                        status.className = 'form-status form-status--error';
                    }
                });
        });
    }

    function init() {
        loadTestimonials();
        bindForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
