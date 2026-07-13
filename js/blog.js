(function () {
    'use strict';

    var loadedPosts = [];

    function makeBlockKey() {
        return 'blk-' + Math.random().toString(36).slice(2, 11);
    }

    function makeSpanKey() {
        return 'spn-' + Math.random().toString(36).slice(2, 11);
    }

    function textBlock(text, style) {
        return {
            _type: 'block',
            _key: makeBlockKey(),
            style: style || 'normal',
            children: [
                {
                    _type: 'span',
                    _key: makeSpanKey(),
                    text: text,
                    marks: [],
                },
            ],
            markDefs: [],
        };
    }

    function paragraphsToPortableText(paragraphs) {
        return (paragraphs || []).map(function (paragraph) {
            var trimmed = String(paragraph || '').trim();
            if (!trimmed) return null;
            if (trimmed.charAt(0) === '“' || trimmed.charAt(0) === '"') {
                return textBlock(trimmed, 'blockquote');
            }
            return textBlock(trimmed, 'normal');
        }).filter(Boolean);
    }

    var FALLBACK_POSTS = [
        {
            title: 'Reading the cards when the path forks',
            slug: { current: 'reading-the-cards-when-the-path-forks' },
            excerpt:
                'Tarot is not about predicting a fixed future. It is about naming the crossroads you are already standing in — and hearing what your intuition already knows.',
            image: 'img/optimized/testBlog1-480.webp',
            publishedAt: '2026-03-12T12:00:00Z',
            readMinutes: 6,
            body: [
                textBlock(
                    'When someone sits across from me and asks, “What is going to happen?” I gently redirect. Tarot reads the terrain you are walking now — the weather, the fork in the road, the part of you that already knows which way leans true.'
                ),
                textBlock(
                    'In a session, we name what is moving. We look at what you are avoiding because it feels too honest. The cards do not sentence you to a fate; they mirror the conversation your inner guide is already trying to have.'
                ),
                textBlock('What a spread actually offers', 'h2'),
                textBlock(
                    'A three-card spread might hold past pattern, present tension, and the quality of energy asking to be integrated. That is different from fortune-telling. It is reflection with structure — a way to make intuition legible enough to act on.'
                ),
                textBlock(
                    '“The card does not decide for you. It helps you hear yourself decide.”',
                    'blockquote'
                ),
                textBlock(
                    'If you are standing at a fork, the most useful question is rarely “Which path is correct?” It is closer to: “What do I need to honor in myself before I choose?” That is the work this blog — and these sessions — are here to support.'
                ),
            ],
        },
        {
            title: 'Your birth chart is a map, not a sentence',
            slug: { current: 'your-birth-chart-is-a-map-not-a-sentence' },
            excerpt:
                'The placements in your natal chart describe patterns, not prisons. Here is how I read a chart as a living conversation with who you are becoming.',
            image: 'img/optimized/testBlog2-480.webp',
            publishedAt: '2026-02-20T12:00:00Z',
            readMinutes: 5,
            body: paragraphsToPortableText([
                'Your birth chart is not a verdict. It is a language for describing how energy moves through you — where you lean in, where you resist, where you are still learning to trust yourself.',
                'When I read a chart with someone, we are not hunting for a fixed identity. We are naming patterns that repeat, gifts that want expression, and tensions that ask for honest integration.',
                'A challenging placement is not punishment. It is often the part of the chart that asks the most growth — and offers the most depth when you meet it with curiosity instead of fear.',
                'The map changes meaning as you change. That is why chart work belongs in conversation, not in a single reading you file away and forget.',
            ]),
        },
        {
            title: 'Three questions I ask before every session',
            slug: { current: 'three-questions-i-ask-before-every-session' },
            excerpt:
                'Before we pull a card or open a chart, we get clear on what you actually want from our time together. These three questions set the tone for honest work.',
            image: 'img/optimized/testBlog3-480.webp',
            publishedAt: '2026-01-15T12:00:00Z',
            readMinutes: 4,
            body: paragraphsToPortableText([
                'Before any session, I want to know what brought you here today — not the polished version, the real one.',
                'Second: what would feel like a useful outcome when we are done? Clarity, validation, a next step, or simply space to be honest without performing.',
                'Third: what are you willing to look at if the cards or chart point there? This question sets the tone for work that is reflective, not performative.',
                'These three questions do not need perfect answers. They open the door so our time together can be grounded in what you actually need.',
            ]),
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
            var assetRef =
                post.coverImage.asset && post.coverImage.asset._ref
                    ? post.coverImage.asset._ref
                    : post.coverImage._ref;
            if (assetRef) {
                return sanityImageUrl(assetRef, width);
            }
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

    function isPortableTextBlock(value) {
        return (
            value &&
            typeof value === 'object' &&
            value._type === 'block' &&
            Array.isArray(value.children)
        );
    }

    function normalizeBody(body) {
        if (Array.isArray(body) && body.length && isPortableTextBlock(body[0])) {
            return body;
        }
        if (Array.isArray(body)) {
            return paragraphsToPortableText(body);
        }
        if (typeof body === 'string' && body.trim()) {
            return paragraphsToPortableText([body]);
        }
        return [];
    }

    function normalizePost(post) {
        return {
            title: post.title || 'Untitled',
            slug: post.slug && post.slug.current ? post.slug.current : '',
            excerpt: post.excerpt || '',
            image: resolveImage(post),
            publishedAt: post.publishedAt || '',
            readMinutes: post.readMinutes || null,
            body: normalizeBody(post.body),
        };
    }

    function renderSpan(span, markDefs) {
        if (!span || typeof span.text !== 'string') return '';
        var text = escapeHtml(span.text);
        var marks = span.marks || [];

        marks.forEach(function (mark) {
            if (mark === 'strong') {
                text = '<strong>' + text + '</strong>';
                return;
            }
            if (mark === 'em') {
                text = '<em>' + text + '</em>';
                return;
            }
            if (mark === 'code') {
                text = '<code>' + text + '</code>';
                return;
            }

            var def = (markDefs || []).find(function (item) {
                return item._key === mark;
            });
            if (def && def._type === 'link' && def.href) {
                text =
                    '<a href="' +
                    escapeHtml(def.href) +
                    '" target="_blank" rel="noopener noreferrer">' +
                    text +
                    '</a>';
            }
        });

        return text;
    }

    function renderBlockTag(style, innerHtml) {
        if (style === 'h1') return '<h1>' + innerHtml + '</h1>';
        if (style === 'h2') return '<h2>' + innerHtml + '</h2>';
        if (style === 'h3') return '<h3>' + innerHtml + '</h3>';
        if (style === 'h4') return '<h4>' + innerHtml + '</h4>';
        if (style === 'blockquote') return '<blockquote>' + innerHtml + '</blockquote>';
        return '<p>' + innerHtml + '</p>';
    }

    function renderPortableText(blocks) {
        if (!Array.isArray(blocks) || !blocks.length) return '';

        var html = '';
        var index = 0;

        while (index < blocks.length) {
            var block = blocks[index];

            if (!isPortableTextBlock(block)) {
                index += 1;
                continue;
            }

            if (block.listItem) {
                var listType = block.listItem === 'number' ? 'ol' : 'ul';
                html += '<' + listType + '>';
                while (index < blocks.length) {
                    var listBlock = blocks[index];
                    if (!isPortableTextBlock(listBlock) || listBlock.listItem !== block.listItem) {
                        break;
                    }
                    var listInner = (listBlock.children || [])
                        .map(function (child) {
                            return renderSpan(child, listBlock.markDefs);
                        })
                        .join('');
                    html += '<li>' + listInner + '</li>';
                    index += 1;
                }
                html += '</' + listType + '>';
                continue;
            }

            var innerHtml = (block.children || [])
                .map(function (child) {
                    return renderSpan(child, block.markDefs);
                })
                .join('');
            html += renderBlockTag(block.style || 'normal', innerHtml);
            index += 1;
        }

        return html;
    }

    function fetchPosts() {
        if (typeof SANITY_CONFIGURED !== 'undefined' && SANITY_CONFIGURED) {
            var query =
                '*[_type == "post" && defined(publishedAt)] | order(publishedAt desc)[0...12]{title, slug, excerpt, publishedAt, readMinutes, body, coverImage}';

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

    function renderPostCard(post, index) {
        return (
            '<button type="button" class="blogBox text-scrim blogBox--clickable" data-post-index="' +
            index +
            '">' +
            '<img src="' +
            escapeHtml(post.image) +
            '" alt="" loading="lazy" decoding="async">' +
            '<h3>' +
            escapeHtml(post.title) +
            '</h3>' +
            '<p>' +
            escapeHtml(post.excerpt || '') +
            '</p>' +
            '</button>'
        );
    }

    function renderArticleHtml(post) {
        var metaParts = [];
        var published = formatPublishedDate(post.publishedAt);
        if (published) metaParts.push('Published ' + published);
        if (post.readMinutes) metaParts.push(post.readMinutes + ' min read');
        var meta = metaParts.join(' · ');
        var bodyHtml = renderPortableText(post.body);

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
            (post.image
                ? '<figure class="blog-article__cover">' +
                  '<img src="' +
                  escapeHtml(post.image) +
                  '" alt="" loading="lazy" decoding="async">' +
                  '</figure>'
                : '') +
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
        loadedPosts = posts;
        if (!posts.length) {
            showState(container, 'No blog posts yet. Check back soon.', 'blog-state--empty');
            return;
        }
        container.innerHTML = posts.map(renderPostCard).join('');
        container.querySelectorAll('.blogBox--clickable').forEach(function (button) {
            button.addEventListener('click', function () {
                var idx = parseInt(button.dataset.postIndex, 10);
                if (!isNaN(idx) && loadedPosts[idx]) {
                    openDesktopArticle(loadedPosts[idx]);
                }
            });
        });
    }

    function openDesktopArticle(post) {
        var articleView = document.querySelector('.blog-article-view');
        var articleContent = document.querySelector('.blog-article-view__content');
        var blogPage = document.querySelector('.blog-page');
        if (!articleView || !articleContent || !blogPage) return;

        articleContent.innerHTML = renderArticleHtml(post);
        articleView.hidden = false;
        blogPage.classList.add('blog-page--article-open');
        articleView.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closeDesktopArticle() {
        var articleView = document.querySelector('.blog-article-view');
        var blogPage = document.querySelector('.blog-page');
        if (!articleView || !blogPage) return;

        articleView.hidden = true;
        blogPage.classList.remove('blog-page--article-open');
    }

    function initDesktopArticleView() {
        var backButton = document.querySelector('.blog-article-back');
        if (backButton) {
            backButton.addEventListener('click', closeDesktopArticle);
        }
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
        renderPortableText: renderPortableText,
        escapeHtml: escapeHtml,
        resolveImage: resolveImage,
        formatPublishedDate: formatPublishedDate,
        openDesktopArticle: openDesktopArticle,
        closeDesktopArticle: closeDesktopArticle,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initDesktopArticleView();
            loadBlog();
        });
    } else {
        initDesktopArticleView();
        loadBlog();
    }
})();
