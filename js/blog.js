(function () {
    'use strict';

    var FALLBACK_POSTS = [
        {
            title: 'Reading the cards when the path forks',
            excerpt:
                'Tarot is not about predicting a fixed future. It is about naming the crossroads you are already standing in — and hearing what your intuition already knows.',
            image: 'img/optimized/testBlog1-480.webp',
        },
        {
            title: 'Your birth chart is a map, not a sentence',
            excerpt:
                'The placements in your natal chart describe patterns, not prisons. Here is how I read a chart as a living conversation with who you are becoming.',
            image: 'img/optimized/testBlog2-480.webp',
        },
        {
            title: 'Three questions I ask before every session',
            excerpt:
                'Before we pull a card or open a chart, we get clear on what you actually want from our time together. These three questions set the tone for honest work.',
            image: 'img/optimized/testBlog3-480.webp',
        },
    ];

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderPost(post) {
        var imgSrc = post.image;
        if (post.coverImage && typeof sanityImageUrl === 'function') {
            imgSrc = sanityImageUrl(post.coverImage.asset._ref, 480);
        }

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

    function showState(container, message, className) {
        container.innerHTML =
            '<p class="blog-state ' + className + '">' + escapeHtml(message) + '</p>';
    }

    function renderPosts(container, posts) {
        if (!posts.length) {
            showState(container, 'No blog posts yet. Check back soon.', 'blog-state--empty');
            return;
        }
        container.innerHTML = posts.map(renderPost).join('');
    }

    function loadBlog() {
        var container = document.querySelector('.blogBoxes');
        if (!container) return;

        showState(container, 'Loading posts…', 'blog-state--loading');

        if (typeof SANITY_CONFIGURED !== 'undefined' && SANITY_CONFIGURED) {
            var query =
                '*[_type == "post" && defined(publishedAt)] | order(publishedAt desc)[0...6]{title, excerpt, "coverImage": coverImage}';

            sanityQuery(query)
                .then(function (data) {
                    renderPosts(container, data.result || []);
                })
                .catch(function () {
                    renderPosts(container, FALLBACK_POSTS);
                });
        } else {
            renderPosts(container, FALLBACK_POSTS);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBlog);
    } else {
        loadBlog();
    }
})();
