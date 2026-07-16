(function () {
    'use strict';

    var CARDS = [
        {
            id: 'home',
            href: 'main.html',
            title: '_YOUNIVERSES',
            body:
                'Explore your roadmap within — astrology, divination, and reflection for your whole authentic self.\n\nI am Kai, a heart(ist) and star guide strategist. My goal is to support you in navigating your universe. My offerings incorporate astrology, divination, and reflection practices as a guide to become your whole authentic self.',
            cta: 'SEE YOU IN THE SKY',
            ctaHref: 'https://calendly.com/youniverses-kl/30min',
            hero: true,
            image: {
                alt: 'Kai - headshot placeholder',
                layout: 'banner',
                avifSrcset:
                    'img/optimized/testImg-400.avif 400w, img/optimized/testImg-600.avif 600w, img/optimized/testImg-900.avif 900w',
                webpSrcset:
                    'img/optimized/testImg-400.webp 400w, img/optimized/testImg-600.webp 600w, img/optimized/testImg-900.webp 900w',
                fallback: 'img/testImg.png',
            },
        },
        {
            id: 'services',
            href: 'services.html',
            title: 'Book Online',
            body: 'Tarot readings, birth chart analysis, life coaching, and workshops. Each session blends astrology and divination to help you read your own roadmap.',
            cta: 'Book Sessions',
            action: 'booking-modal',
        },
        {
            id: 'blog',
            href: 'blog.html',
            title: 'Our Blog',
            body: 'Divination reflections, birth chart insights, and self-discovery guides — written in Kai\'s voice for seekers navigating their youniverse.',
            cta: 'Read Blog',
            action: 'blog-overlay',
        },
        {
            id: 'testimonials',
            href: 'testimonials.html',
            title: 'Testimonials',
            body: 'Stories from clients who explored their youniverse. Share yours — every submission is reviewed before publishing.',
            cta: 'Read Stories',
            action: 'testimonials-modal',
        },
    ];

    var BOOKING_OPTIONS = [
        {
            title: 'Tarot Reading',
            meta: '60 min · From $85',
            description:
                'A one-on-one spread to name what is moving in your life now and where the thread leads next.',
            bookingUrl: 'https://calendly.com/youniverses-kl/30min',
        },
        {
            title: 'Birth Chart Analysis',
            meta: '90 min · From $120',
            description:
                'Your natal map read as a living pattern — strengths, edges, and timing worth paying attention to.',
            bookingUrl: 'https://calendly.com/youniverses-kl/30min',
        },
        {
            title: 'Life Coaching Session',
            meta: '60 min · From $95',
            description:
                'Grounded conversation with astrology and divination as mirrors — clarity for the choice in front of you.',
            bookingUrl: 'https://calendly.com/youniverses-kl/30min',
        },
        {
            title: 'Tarot Reading Workshop',
            meta: '2 hr · From $65',
            description:
                'Learn to read for yourself and others in a small-group setting with guided practice spreads.',
            bookingUrl: 'https://calendly.com/youniverses-kl/30min',
        },
    ];

    var PAGE_MAP = {
        'main.html': 'home',
        'index.html': 'home',
        'services.html': 'services',
        'blog.html': 'blog',
        'testimonials.html': 'testimonials',
    };

    var SWIPE_THRESHOLD = 50;
    var SWAP_DURATION = 1100;
    var isAnimating = false;
    var overlayState = null;
    var overlayPosts = [];
    var overlayEl = null;
    var overlayContentEl = null;
    var overlayBackBtn = null;

    function currentPageId() {
        var path = window.location.pathname.split('/').pop() || 'main.html';
        return PAGE_MAP[path] || 'home';
    }

    function buildImageMarkup(image) {
        if (!image) return '';
        return (
            '<div class="cardDeck__card-photo">' +
            '<picture>' +
            '<source srcset="' +
            image.avifSrcset +
            '" type="image/avif">' +
            '<source srcset="' +
            image.webpSrcset +
            '" type="image/webp">' +
            '<img src="' +
            image.fallback +
            '" alt="' +
            image.alt +
            '" loading="eager" decoding="async">' +
            '</picture>' +
            '</div>'
        );
    }

    function buildCard(data) {
        var heroClass = data.hero ? ' cardDeck__card--hero' : '';
        var actionAttr = data.action ? ' data-action="' + data.action + '"' : '';
        var imageMarkup = buildImageMarkup(data.image);

        return (
            '<article class="cardDeck__card' +
            heroClass +
            '" data-page="' +
            data.id +
            '" data-href="' +
            data.href +
            '"' +
            actionAttr +
            '>' +
            imageMarkup +
            '<div class="cardDeck__card-header">' +
            '<h2 class="cardDeck__card-title">' +
            data.title +
            '</h2>' +
            '</div>' +
            '<div class="cardDeck__card-body">' +
            '<p class="cardDeck__card-text">' +
            data.body +
            '</p>' +
            '<a class="cardDeck__card-link" href="' +
            (data.ctaHref || data.href) +
            '"' +
            (data.ctaHref ? ' target="_blank" rel="noopener noreferrer"' : '') +
            (data.action ? ' data-action="' + data.action + '"' : '') +
            '>' +
            data.cta +
            '</a>' +
            '</div>' +
            '</article>'
        );
    }

    function createOverlay(section) {
        overlayEl = document.createElement('div');
        overlayEl.className = 'cardDeck__overlay';
        overlayEl.setAttribute('hidden', '');
        overlayEl.setAttribute('aria-hidden', 'true');

        var panel = document.createElement('div');
        panel.className = 'cardDeck__overlay-panel text-scrim';

        overlayBackBtn = document.createElement('button');
        overlayBackBtn.type = 'button';
        overlayBackBtn.className = 'cardDeck__overlay-back';
        overlayBackBtn.textContent = 'Back';

        overlayContentEl = document.createElement('div');
        overlayContentEl.className = 'cardDeck__overlay-content';

        panel.appendChild(overlayBackBtn);
        panel.appendChild(overlayContentEl);
        overlayEl.appendChild(panel);
        section.appendChild(overlayEl);

        overlayBackBtn.addEventListener('click', handleOverlayBack);
        overlayEl.addEventListener('click', function (e) {
            if (e.target === overlayEl) closeOverlay();
        });
    }

    function setOverlayOpen(open) {
        if (!overlayEl) return;
        if (open) {
            overlayEl.removeAttribute('hidden');
            overlayEl.setAttribute('aria-hidden', 'false');
            document.body.classList.add('cardDeck-overlay-open');
        } else {
            overlayEl.setAttribute('hidden', '');
            overlayEl.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('cardDeck-overlay-open');
            overlayState = null;
            overlayContentEl.innerHTML = '';
            setPanelTheme(false);
        }
    }

    function setPanelTheme(paper) {
        if (!overlayEl) return;
        var panel = overlayEl.querySelector('.cardDeck__overlay-panel');
        if (panel) {
            panel.classList.toggle('cardDeck__overlay-panel--paper', !!paper);
            panel.classList.toggle('text-scrim', !paper);
        }
    }

    function renderListModal(opts) {
        overlayState = opts.state;
        overlayBackBtn.textContent = 'Back to cards';
        setPanelTheme(true);

        var header =
            '<header class="cardDeck__overlay-header">' +
            '<h2 class="cardDeck__overlay-title">' +
            opts.title +
            '</h2>' +
            (opts.lead ? '<p class="cardDeck__overlay-lead">' + opts.lead + '</p>' : '') +
            '</header>';

        var body = opts.items.length
            ? '<div class="cardDeck__modal-list">' +
              opts.items.map(opts.renderItem).join('') +
              '</div>'
            : '<p class="cardDeck__overlay-state">' + opts.empty + '</p>';

        overlayContentEl.innerHTML = header + body;
        overlayContentEl.scrollTop = 0;
        setOverlayOpen(true);
    }

    function closeOverlay() {
        setOverlayOpen(false);
    }

    function handleOverlayBack() {
        if (overlayState === 'article') {
            renderBlogList();
            return;
        }
        if (overlayState === 'testimonial-form' || overlayState === 'testimonial-confirm') {
            var cached =
                window.YouniverseTestimonials && window.YouniverseTestimonials.cache
                    ? window.YouniverseTestimonials.cache
                    : [];
            renderTestimonialsModal(cached);
            return;
        }
        closeOverlay();
    }

    function renderBlogList() {
        if (!window.YouniverseBlog) {
            overlayContentEl.innerHTML =
                '<p class="cardDeck__overlay-state">Blog posts are loading. Please try again.</p>';
            overlayState = 'list';
            setPanelTheme(false);
            setOverlayOpen(true);
            return;
        }

        overlayState = 'list';
        overlayBackBtn.textContent = 'Back to cards';
        setPanelTheme(false);

        if (!overlayPosts.length) {
            overlayContentEl.innerHTML =
                '<p class="cardDeck__overlay-state">Loading posts…</p>';
            window.YouniverseBlog.fetchPosts().then(function (posts) {
                overlayPosts = posts;
                renderBlogListMarkup(posts);
            });
            setOverlayOpen(true);
            return;
        }

        renderBlogListMarkup(overlayPosts);
        setOverlayOpen(true);
    }

    function renderBlogListMarkup(posts) {
        var escapeHtml = window.YouniverseBlog.escapeHtml;
        var header =
            '<header class="cardDeck__overlay-header">' +
            '<h2 class="cardDeck__overlay-title">Our Blog</h2>' +
            '<p class="cardDeck__overlay-lead">Reflections on astrology, divination, and becoming whole.</p>' +
            '</header>';

        if (!posts.length) {
            overlayContentEl.innerHTML =
                header + '<p class="cardDeck__overlay-state">No blog posts yet. Check back soon.</p>';
            return;
        }

        var list = posts
            .map(function (post, index) {
                return (
                    '<button type="button" class="cardDeck__blog-item" data-post-index="' +
                    index +
                    '">' +
                    '<img class="cardDeck__blog-item-img" src="' +
                    escapeHtml(post.image) +
                    '" alt="" loading="lazy" decoding="async">' +
                    '<span class="cardDeck__blog-item-text">' +
                    '<span class="cardDeck__blog-item-title">' +
                    escapeHtml(post.title) +
                    '</span>' +
                    '<span class="cardDeck__blog-item-excerpt">' +
                    escapeHtml(post.excerpt || '') +
                    '</span>' +
                    '</span>' +
                    '</button>'
                );
            })
            .join('');

        overlayContentEl.innerHTML =
            header + '<div class="cardDeck__blog-list" role="list">' + list + '</div>';

        overlayContentEl.querySelectorAll('.cardDeck__blog-item').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(btn.dataset.postIndex, 10);
                if (!isNaN(idx) && overlayPosts[idx]) openBlogArticle(overlayPosts[idx]);
            });
        });
    }

    function openBlogArticle(post) {
        overlayState = 'article';
        overlayBackBtn.textContent = 'Back to posts';
        setPanelTheme(false);
        overlayContentEl.innerHTML = window.YouniverseBlog.renderArticleHtml(post);
        overlayContentEl.scrollTop = 0;
    }

    function openBlogOverlay(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        renderBlogList();
    }

    function openBookingModal(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        renderListModal({
            state: 'booking',
            title: 'Book a Session',
            lead: 'Choose a session to begin. Booking links coming soon.',
            items: BOOKING_OPTIONS,
            empty: 'Sessions coming soon.',
            renderItem: function (option) {
                var slot = option.bookingUrl
                    ? '<a class="cardDeck__modal-item-cta" href="' +
                      option.bookingUrl +
                      '" target="_blank" rel="noopener noreferrer">Book Now</a>'
                    : '<a class="cardDeck__modal-item-cta cardDeck__modal-item-cta--pending" href="#" data-booking-slot aria-disabled="true">Book Now</a>';

                return (
                    '<article class="cardDeck__modal-item">' +
                    '<h3 class="cardDeck__modal-item-title">' +
                    option.title +
                    '</h3>' +
                    (option.meta
                        ? '<p class="cardDeck__modal-item-meta">' + option.meta + '</p>'
                        : '') +
                    '<p class="cardDeck__modal-item-desc">' +
                    option.description +
                    '</p>' +
                    slot +
                    '</article>'
                );
            },
        });
    }

    function getTestimonialsEscapeHtml() {
        return window.YouniverseTestimonials && window.YouniverseTestimonials.escapeHtml
            ? window.YouniverseTestimonials.escapeHtml
            : function (str) {
                  return String(str);
              };
    }

    function renderTestimonialStoryItem(item, escapeHtml) {
        var author = escapeHtml(item.name);
        if (item.service) {
            author += ', ' + escapeHtml(item.service);
        }

        return (
            '<article class="cardDeck__modal-item">' +
            '<p class="cardDeck__modal-item-quote">\u201C' +
            escapeHtml(item.quote) +
            '\u201D</p>' +
            '<p class="cardDeck__modal-item-meta">\u2014 ' +
            author +
            '</p>' +
            '</article>'
        );
    }

    function renderTestimonialsModal(items) {
        var escapeHtml = getTestimonialsEscapeHtml();

        overlayState = 'testimonials';
        overlayBackBtn.textContent = 'Back to cards';
        setPanelTheme(true);

        var header =
            '<header class="cardDeck__overlay-header">' +
            '<h2 class="cardDeck__overlay-title">Testimonials</h2>' +
            '<p class="cardDeck__overlay-lead">Stories from clients exploring their youniverse.</p>' +
            '</header>';

        var shareBtn =
            '<button type="button" class="cardDeck__testimonial-share-btn">+ Share your story</button>';

        var listBody = items.length
            ? '<div class="cardDeck__modal-list">' +
              items.map(function (item) {
                  return renderTestimonialStoryItem(item, escapeHtml);
              }).join('') +
              '</div>'
            : '<p class="cardDeck__overlay-state">No testimonials yet. Be the first to share your experience!</p>';

        overlayContentEl.innerHTML = header + shareBtn + listBody;
        overlayContentEl.scrollTop = 0;
        setOverlayOpen(true);

        var shareTrigger = overlayContentEl.querySelector('.cardDeck__testimonial-share-btn');
        if (shareTrigger) {
            shareTrigger.addEventListener('click', renderTestimonialForm);
        }
    }

    function renderTestimonialForm() {
        overlayState = 'testimonial-form';
        overlayBackBtn.textContent = 'Back to stories';
        setPanelTheme(true);

        overlayContentEl.innerHTML =
            '<header class="cardDeck__overlay-header">' +
            '<h2 class="cardDeck__overlay-title">Share Yours</h2>' +
            '<p class="cardDeck__overlay-lead">Every submission is reviewed before publishing.</p>' +
            '</header>' +
            '<form class="cardDeck__testimonial-form" novalidate>' +
            '<div class="cardDeck__form-group">' +
            '<label for="cardDeck-testimonial-name">Name</label>' +
            '<input type="text" id="cardDeck-testimonial-name" name="name" required maxlength="100" autocomplete="name">' +
            '</div>' +
            '<div class="cardDeck__form-group">' +
            '<label for="cardDeck-testimonial-quote">Testimonial</label>' +
            '<textarea id="cardDeck-testimonial-quote" name="message" required maxlength="1000" rows="4"></textarea>' +
            '</div>' +
            '<button type="submit" class="cardDeck__form-submit">Submit for Review</button>' +
            '<p class="cardDeck__form-status" role="status"></p>' +
            '</form>';

        overlayContentEl.scrollTop = 0;

        var form = overlayContentEl.querySelector('.cardDeck__testimonial-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var status = form.querySelector('.cardDeck__form-status');
            var nameInput = form.querySelector('#cardDeck-testimonial-name');
            var quoteInput = form.querySelector('#cardDeck-testimonial-quote');
            var name = nameInput ? nameInput.value.trim() : '';
            var message = quoteInput ? quoteInput.value.trim() : '';

            if (!name || !message) {
                if (status) {
                    status.textContent = 'Please enter your name and testimonial.';
                    status.className = 'cardDeck__form-status cardDeck__form-status--error';
                }
                return;
            }

            if (!window.YouniverseTestimonials || !window.YouniverseTestimonials.submit) {
                if (status) {
                    status.textContent = 'Submission is not available right now. Please try again.';
                    status.className = 'cardDeck__form-status cardDeck__form-status--error';
                }
                return;
            }

            if (status) {
                status.textContent = 'Sending\u2026';
                status.className = 'cardDeck__form-status cardDeck__form-status--loading';
            }

            window.YouniverseTestimonials.submit(name, message)
                .then(function () {
                    renderTestimonialConfirm(name);
                })
                .catch(function (err) {
                    if (status) {
                        status.textContent =
                            err && err.message && err.message.indexOf('configured') !== -1
                                ? err.message
                                : 'Something went wrong. Please try again later.';
                        status.className = 'cardDeck__form-status cardDeck__form-status--error';
                    }
                });
        });
    }

    function renderTestimonialConfirm(name) {
        var escapeHtml = getTestimonialsEscapeHtml();

        overlayState = 'testimonial-confirm';
        overlayBackBtn.textContent = 'Back to stories';
        setPanelTheme(true);

        overlayContentEl.innerHTML =
            '<div class="cardDeck__confirm-card">' +
            '<div class="cardDeck__confirm-check" aria-hidden="true">\u2713</div>' +
            '<h3 class="cardDeck__confirm-title">Submitted for review</h3>' +
            '<p class="cardDeck__confirm-lead">Thank you, ' +
            escapeHtml(name) +
            '. Your testimonial is pending review and will appear once approved.</p>' +
            '<button type="button" class="cardDeck__confirm-back">Back to stories</button>' +
            '</div>';

        overlayContentEl.scrollTop = 0;

        var backBtn = overlayContentEl.querySelector('.cardDeck__confirm-back');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                var cached =
                    window.YouniverseTestimonials && window.YouniverseTestimonials.cache
                        ? window.YouniverseTestimonials.cache
                        : [];
                renderTestimonialsModal(cached);
            });
        }
    }

    function openTestimonialsModal(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!window.YouniverseTestimonials) {
            renderTestimonialsModal([]);
            return;
        }

        var cached = window.YouniverseTestimonials.cache || [];
        if (cached.length) {
            renderTestimonialsModal(cached);
            return;
        }

        overlayState = 'testimonials';
        overlayBackBtn.textContent = 'Back to cards';
        setPanelTheme(true);
        overlayContentEl.innerHTML =
            '<p class="cardDeck__overlay-state">Loading testimonials\u2026</p>';
        setOverlayOpen(true);

        window.YouniverseTestimonials.fetch().then(function (items) {
            if (overlayState === 'testimonials') {
                renderTestimonialsModal(items);
            }
        });
    }

    function openActionModal(action, e) {
        if (action === 'blog-overlay') return openBlogOverlay(e);
        if (action === 'booking-modal') return openBookingModal(e);
        if (action === 'testimonials-modal') return openTestimonialsModal(e);
    }

    function cardHasAction(card) {
        return card && card.dataset.action;
    }

    function injectDeck() {
        if (document.querySelector('.cardDeck')) return;

        var section = document.createElement('section');
        section.className = 'cardDeck';
        section.setAttribute('aria-label', 'Youniverse pages');

        var bg = document.createElement('video');
        bg.className = 'cardDeck__bg';
        bg.autoplay = true;
        bg.loop = true;
        bg.muted = true;
        bg.playsInline = true;
        bg.setAttribute('playsinline', '');
        bg.setAttribute('muted', '');
        bg.setAttribute('aria-hidden', 'true');
        bg.setAttribute('tabindex', '-1');
        bg.preload = 'auto';
        var bgSrc = document.createElement('source');
        bgSrc.src = 'img/spacestars.mp4';
        bgSrc.type = 'video/mp4';
        bg.appendChild(bgSrc);
        section.appendChild(bg);

        var stack = document.createElement('div');
        stack.className = 'cardDeck__stack';
        stack.setAttribute('role', 'list');

        CARDS.forEach(function (card) {
            stack.insertAdjacentHTML('beforeend', buildCard(card));
        });

        var hint = document.createElement('p');
        hint.className = 'cardDeck__hint';
        hint.textContent = 'Swipe to explore';

        section.appendChild(stack);
        section.appendChild(hint);
        createOverlay(section);

        var nav = document.querySelector('.nav-container');
        var anchor = nav ? nav.closest('.nav-shell') || nav : null;
        if (anchor && anchor.parentNode) {
            anchor.parentNode.insertBefore(section, anchor.nextSibling);
        } else {
            document.body.insertBefore(section, document.body.firstChild);
        }

        rotateToCurrentPage(stack);
        bindGestures(stack);
        bindOverlayTriggers(stack);
    }

    function bindOverlayTriggers(stack) {
        stack.addEventListener('click', function (e) {
            var trigger = e.target.closest('[data-action]');
            if (trigger && trigger.dataset.action) {
                openActionModal(trigger.dataset.action, e);
            }
        });
    }

    function rotateToCurrentPage(stack) {
        var pageId = currentPageId();
        var cards = Array.from(stack.querySelectorAll('.cardDeck__card'));
        var target = cards.find(function (c) {
            return c.dataset.page === pageId;
        });
        if (target) {
            stack.appendChild(target);
        }
    }

    function moveCard(stack) {
        if (isAnimating || overlayState) return;
        var lastCard = stack.lastElementChild;
        if (!lastCard || !lastCard.classList.contains('cardDeck__card')) return;

        isAnimating = true;
        lastCard.classList.add('swap');

        setTimeout(function () {
            lastCard.classList.remove('swap');
            stack.insertBefore(lastCard, stack.firstElementChild);
            isAnimating = false;
        }, SWAP_DURATION);
    }

    function bindGestures(stack) {
        var startX = 0;
        var startY = 0;
        var dragging = false;

        function onPointerDown(e) {
            if (isAnimating || overlayState) return;
            if (e.target.closest('.cardDeck__card-link')) return;
            if (e.target.closest('.cardDeck__overlay')) return;
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            try {
                stack.setPointerCapture(e.pointerId);
            } catch (err) {
                /* pointer capture unsupported */
            }
        }

        function onPointerMove(e) {
            if (!dragging) return;
        }

        function onPointerUp(e) {
            if (!dragging) return;
            dragging = false;
            try {
                stack.releasePointerCapture(e.pointerId);
            } catch (err) {
                /* pointer capture unsupported */
            }

            if (overlayState) return;

            var dx = e.clientX - startX;
            var dy = e.clientY - startY;

            if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
                moveCard(stack);
                return;
            }

            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
                var card = e.target.closest('.cardDeck__card');
                if (card && card === stack.lastElementChild && !e.target.closest('a')) {
                    if (cardHasAction(card)) {
                        openActionModal(card.dataset.action, e);
                        return;
                    }
                    window.location.href = card.dataset.href;
                }
            }
        }

        stack.addEventListener('pointerdown', onPointerDown);
        stack.addEventListener('pointermove', onPointerMove);
        stack.addEventListener('pointerup', onPointerUp);
        stack.addEventListener('pointercancel', function () {
            dragging = false;
        });

        stack.addEventListener('keydown', function (e) {
            if (overlayState) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                moveCard(stack);
            }
        });

        stack.setAttribute('tabindex', '0');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectDeck);
    } else {
        injectDeck();
    }
})();
