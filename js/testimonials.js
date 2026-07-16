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

    function fetchTestimonials() {
        if (typeof SANITY_CONFIGURED !== 'undefined' && SANITY_CONFIGURED) {
            var query =
                '*[_type == "testimonial" && approved == true] | order(_createdAt desc){name, quote, service}';

            return sanityQuery(query)
                .then(function (data) {
                    var items = data.result || [];
                    window.YouniverseTestimonials.cache = items;
                    return items;
                })
                .catch(function () {
                    window.YouniverseTestimonials.cache = [];
                    return [];
                });
        }

        window.YouniverseTestimonials.cache = [];
        return Promise.resolve([]);
    }

    function loadTestimonials() {
        var container = document.querySelector('.testimonials-list');
        if (!container) return;

        showState(container, 'Loading testimonials…', 'testimonial-state--loading');

        fetchTestimonials()
            .then(function (items) {
                renderList(container, items);
            })
            .catch(function () {
                showState(
                    container,
                    'Unable to load testimonials right now. Please try again later.',
                    'testimonial-state--error'
                );
            });
    }

    function submitToSanity(name, message) {
        var submitUrl = SITE_CONFIG.testimonialSubmitUrl || '/api/testimonial-submit';

        return fetch(submitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                message: message,
                botcheck: false,
            }),
        }).then(function (res) {
            return res.json().then(function (data) {
                // #region agent log
                fetch('http://127.0.0.1:7285/ingest/03fcad85-44a8-42f1-85e5-933424e51aaf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a05d5'},body:JSON.stringify({sessionId:'8a05d5',runId:'run1',hypothesisId:'H4',location:'testimonials.js:98',message:'Sanity function response',data:{ok:res.ok,status:res.status,error:data&&data.error,success:data&&data.success},timestamp:Date.now()})}).catch(function(){});
                // #endregion
                if (!res.ok) {
                    throw new Error(data.error || 'Sanity submit failed');
                }
                return data;
            });
        });
    }

    function submitTestimonial(name, message) {
        var accessKey = SITE_CONFIG.web3forms.accessKey;

        if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
            return Promise.reject(
                new Error(
                    'Form not yet configured. Update js/config.js with your Web3Forms access key.'
                )
            );
        }

        var formData = new FormData();
        formData.append('access_key', accessKey);
        formData.append('subject', 'New Youniverse Testimonial');
        formData.append('name', name);
        formData.append('message', message);
        formData.append('botcheck', '');

        return Promise.all([
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            }).then(function (res) {
                return res.json();
            }).then(function (w3) {
                // #region agent log
                fetch('http://127.0.0.1:7285/ingest/03fcad85-44a8-42f1-85e5-933424e51aaf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a05d5'},body:JSON.stringify({sessionId:'8a05d5',runId:'run1',hypothesisId:'H1',location:'testimonials.js:129',message:'Web3Forms response',data:{success:w3&&w3.success,message:w3&&w3.message},timestamp:Date.now()})}).catch(function(){});
                // #endregion
                return w3;
            }).catch(function (e) {
                // #region agent log
                fetch('http://127.0.0.1:7285/ingest/03fcad85-44a8-42f1-85e5-933424e51aaf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a05d5'},body:JSON.stringify({sessionId:'8a05d5',runId:'run1',hypothesisId:'H2/H3',location:'testimonials.js:131',message:'Web3Forms fetch/parse rejected',data:{error:String(e&&e.message||e)},timestamp:Date.now()})}).catch(function(){});
                // #endregion
                throw e;
            }),
            submitToSanity(name, message),
        ]).then(function (results) {
            var web3formsData = results[0];
            // #region agent log
            fetch('http://127.0.0.1:7285/ingest/03fcad85-44a8-42f1-85e5-933424e51aaf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a05d5'},body:JSON.stringify({sessionId:'8a05d5',runId:'run1',hypothesisId:'H1',location:'testimonials.js:134',message:'Promise.all resolved (both legs)',data:{w3success:web3formsData&&web3formsData.success,w3message:web3formsData&&web3formsData.message},timestamp:Date.now()})}).catch(function(){});
            // #endregion
            if (!web3formsData.success) {
                throw new Error(web3formsData.message || 'Submission failed');
            }
            return results;
        }).catch(function (err) {
            // #region agent log
            fetch('http://127.0.0.1:7285/ingest/03fcad85-44a8-42f1-85e5-933424e51aaf',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a05d5'},body:JSON.stringify({sessionId:'8a05d5',runId:'run1',hypothesisId:'H1-H4',location:'testimonials.js:140',message:'submitTestimonial rejected (error shown to user)',data:{error:String(err&&err.message||err)},timestamp:Date.now()})}).catch(function(){});
            // #endregion
            throw err;
        });
    }

    function bindForm() {
        var form = document.querySelector('.testimonial-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var status = form.querySelector('.form-status');
            var name = form.querySelector('#name').value;
            var message = form.querySelector('#quote').value;

            if (status) {
                status.textContent = 'Sending…';
                status.className = 'form-status form-status--loading';
            }

            submitTestimonial(name, message)
                .then(function () {
                    form.reset();
                    if (status) {
                        status.textContent =
                            'Thank you! Your testimonial has been submitted for review.';
                        status.className = 'form-status form-status--success';
                    }
                })
                .catch(function (err) {
                    if (status) {
                        status.textContent =
                            err && err.message && err.message.indexOf('configured') !== -1
                                ? err.message
                                : 'Something went wrong. Please try again later.';
                        status.className = 'form-status form-status--error';
                    }
                });
        });
    }

    window.YouniverseTestimonials = {
        cache: [],
        fetch: fetchTestimonials,
        escapeHtml: escapeHtml,
        submit: submitTestimonial,
    };

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
