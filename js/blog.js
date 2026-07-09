(function () {
    'use strict';

    var FALLBACK_POSTS = [
        {
            title: 'Reading the cards when the path forks',
            excerpt:
                'Tarot is not about predicting a fixed future. It is about naming the crossroads you are already standing in — and hearing what your intuition already knows.',
            image: 'img/optimized/testBlog1-480.webp',
            publishedAt: '2026-03-12T12:00:00Z',
            readMinutes: 6,
            body: [
                'When someone sits across from me and asks, “What is going to happen?” I gently redirect. Tarot reads the terrain you are walking now — the weather, the fork in the road, the part of you that already knows which way leans true.',
                'In a session, we name what is moving. We look at what you are avoiding because it feels too honest. The cards do not sentence you to a fate; they mirror the conversation your inner guide is already trying to have.',
                'A three-card spread might hold past pattern, present tension, and the quality of energy asking to be integrated. That is different from fortune-telling. It is reflection with structure — a way to make intuition legible enough to act on.',
                '“The card does not decide for you. It helps you hear yourself decide.”',
                'If you are standing at a fork, the most useful question is rarely “Which path is correct?” It is closer to: “What do I need to honor in myself before I choose?” That is the work this blog — and these sessions — are here to support.',
            ],
        },
        {
            title: 'Your birth chart is a map, not a sentence',
            excerpt:
                'The placements in your natal chart describe patterns, not prisons. Here is how I read a chart as a living conversation with who you are becoming.',
            image: 'img/optimized/testBlog2-480.webp',
            publishedAt: '2026-02-20T12:00:00Z',
            readMinutes: 5,
            body: [
                'Your birth chart is not a verdict. It is a language for describing how energy moves through you — where you lean in, where you resist, where you are still learning to trust yourself.',
                'When I read a chart with someone, we are not hunting for a fixed identity. We are naming patterns that repeat, gifts that want expression, and tensions that ask for honest integration.',
                'A challenging placement is not punishment. It is often the part of the chart that asks the most growth — and offers the most depth when you meet it with curiosity instead of fear.',
                'The map changes meaning as you change. That is why chart work belongs in conversation, not in a single reading you file away and forget.',
            ],
        },
        {
            title: 'Three questions I ask before every session',
            excerpt:
                'Before we pull a card or open a chart, we get clear on what you actually want from our time together. These three questions set the tone for honest work.',
            image: 'img/optimized/testBlog3-480.webp',
            publishedAt: '2026-01-15T12:00:00Z',
            readMinutes: 4,
            body: [
                'Before any session, I want to know what brought you here today — not the polished version, the real one.',
                'Second: what would feel like a useful outcome when we are done? Clarity, validation, a next step, or simply space to be honest without performing.',
                'Third: what are you willing to look at if the cards or chart point there? This question sets the tone for work that is reflective, not performative.',
                'These three questions do not need perfect answers. They open the door so our time together can be grounded in what you actually need.',
            ],
        },
    ];

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function resolveImage(post, width) {
        width = width || 480;
        if (post.coverImage && typeof sanityImageUrl === 'function') {
            return sanityImageUrl(post.coverImage.asset._ref, width);
        }
        return post.image || '';
    }

    function formatPublishedDate(iso) {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (err) {
            return '';
        }
    }

    function normalizePost(post) {
        return {
            title: post.title || 'Untitled',
            excerpt: post.excerpt || '',
            image: resolveImage(post),
            publishedAt: post.publishedAt || '',
            readMinutes: post.readMinutes || null,
            body: Array.isArray(post.body)
                ? post.body
                : typeof post.body === 'string'
                  ? [post.body]
                  : [],
        };
    }

    function fetchPosts() {
        if (typeof SANITY_CONFIGURED !== 'undefined' && SANITY_CONFIGURED) {
            var query =
                '*[_type == "post" && defined(publishedAt)] | order(publishedAt desc)[0...6]{title, excerpt, publishedAt, body, "coverImage": coverImage}';

            return sanityQuery(query)
                .then(function (data) {
                    var posts = (data.result || []).map(normalizePost);
                    return posts.length ? posts : FALLBACK_POSTS.map(normalizePost);
                })
                .catch(function () {
                    return FALLBACK_POSTS.map(normalizePost);
                });
        }

        return Promise.resolve(FALLBACK_POSTS.map(normalizePost));
    }

    function renderPostCard(post) {
        var imgSrc = post.image;

        return (
            '<div class="blogBox text-scrim">' +
            '<img src="' +
            escapeHtml(imgSrc) +
            '" alt="" loading="lazy" decoding="async">' +
            '<h3>' +
            escapeHtml(post.title) +
            '</h3>' +
            '<p>' +
            escapeHtml(post.excerpt || '') +
            '</p>' +
            '</div>'
        );
    }

    function renderArticleHtml(post) {
        var metaParts = [];
        var published = formatPublishedDate(post.publishedAt);
        if (published) metaParts.push('Published ' + published);
        if (post.readMinutes) metaParts.push(post.readMinutes + ' min read');
        var meta = metaParts.join(' · ');

        var bodyHtml = (post.body || [])
            .map(function (paragraph, index) {
                if (paragraph.charAt(0) === '“' || paragraph.charAt(0) === '"') {
                    return '<blockquote>' + escapeHtml(paragraph) + '</blockquote>';
                }
                if (index === 2 && post.title.indexOf('cards') !== -1) {
                    return '<h2>What a spread actually offers</h2><p>' + escapeHtml(paragraph) + '</p>';
                }
                return '<p>' + escapeHtml(paragraph) + '</p>';
            })
            .join('');

        return (
            '<article class="blog-article text-scrim">' +
            '<header class="blog-article__header">' +
            (meta ? '<p class="blog-article__meta">' + escapeHtml(meta) + '</p>' : '') +
            '<h1 class="blog-article__title">' +
            escapeHtml(post.title) +
            '</h1>' +
            '<p class="blog-article__excerpt">' +
            escapeHtml(post.excerpt || '') +
            '</p>' +
            '</header>' +
            '<figure class="blog-article__cover">' +
            '<img src="' +
            escapeHtml(post.image) +
            '" alt="" loading="lazy" decoding="async">' +
            '</figure>' +
            '<div class="blog-article__body">' +
            bodyHtml +
            '</div>' +
            '</article>'
        );
    }

    function showState(container, message, className) {
        container.innerHTML =
            '<p class="blog-state ' + className + '">' + escapeHtml(message) + '</p>';
    }

    function renderPosts(container, posts) {
        if (!posts.length) {
            showState(container, 'No blog posts yet. Check back soon.', 'blog-state--empty');
            return;
        }
        container.innerHTML = posts.map(renderPostCard).join('');
    }

    function loadBlog() {
        var container = document.querySelector('.blogBoxes');
        if (!container) return;

        showState(container, 'Loading posts…', 'blog-state--loading');

        fetchPosts()
            .then(function (posts) {
                renderPosts(container, posts);
            })
            .catch(function () {
                renderPosts(container, FALLBACK_POSTS.map(normalizePost));
            });
    }

    window.YouniverseBlog = {
        fetchPosts: fetchPosts,
        renderArticleHtml: renderArticleHtml,
        escapeHtml: escapeHtml,
        resolveImage: resolveImage,
        formatPublishedDate: formatPublishedDate,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBlog);
    } else {
        loadBlog();
    }
})();
