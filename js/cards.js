(function () {
    'use strict';

    var CARDS = [
        {
            id: 'home',
            href: 'main.html',
            title: '_YOUNIVERSES',
            body: 'Explore your roadmap within — astrology, divination, and reflection for your whole authentic self.',
            cta: 'SEE YOU IN THE SKY',
            hero: true,
        },
        {
            id: 'services',
            href: 'services.html',
            title: 'Book Online',
            body: 'Tarot readings, birth chart analysis, life coaching, and workshops. Each session blends astrology and divination to help you read your own roadmap.',
            cta: 'View Services',
        },
        {
            id: 'blog',
            href: 'blog.html',
            title: 'Our Blog',
            body: 'Divination reflections, birth chart insights, and self-discovery guides — written in Kai\'s voice for seekers navigating their youniverse.',
            cta: 'Read Blog',
        },
        {
            id: 'testimonials',
            href: 'testimonials.html',
            title: 'Testimonials',
            body: 'Stories from clients who explored their youniverse. Share yours — every submission is reviewed before publishing.',
            cta: 'Read Stories',
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

    function currentPageId() {
        var path = window.location.pathname.split('/').pop() || 'main.html';
        return PAGE_MAP[path] || 'home';
    }

    function buildCard(data) {
        var heroClass = data.hero ? ' cardDeck__card--hero' : '';
        return (
            '<article class="cardDeck__card' +
            heroClass +
            '" data-page="' +
            data.id +
            '" data-href="' +
            data.href +
            '">' +
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
            data.href +
            '">' +
            data.cta +
            '</a>' +
            '</div>' +
            '</article>'
        );
    }

    function injectDeck() {
        if (document.querySelector('.cardDeck')) return;

        var section = document.createElement('section');
        section.className = 'cardDeck';
        section.setAttribute('aria-label', 'Youniverse pages');

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

        var nav = document.querySelector('.nav-container');
        var anchor = nav ? nav.closest('.nav-shell') || nav : null;
        if (anchor && anchor.parentNode) {
            anchor.parentNode.insertBefore(section, anchor.nextSibling);
        } else {
            document.body.insertBefore(section, document.body.firstChild);
        }

        rotateToCurrentPage(stack);
        bindGestures(stack);
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
        if (isAnimating) return;
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
            if (isAnimating) return;
            if (e.target.closest('.cardDeck__card-link')) return;
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

            var dx = e.clientX - startX;
            var dy = e.clientY - startY;

            if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
                moveCard(stack);
                return;
            }

            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
                var card = e.target.closest('.cardDeck__card');
                if (card && card === stack.lastElementChild && !e.target.closest('a')) {
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
