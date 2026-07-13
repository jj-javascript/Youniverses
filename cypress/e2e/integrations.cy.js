describe('Blog integration', function () {
  var portableTextBody = [
    {
      _type: 'block',
      _key: 'intro',
      style: 'normal',
      children: [{ _type: 'span', text: 'Intro paragraph from CMS.', marks: [] }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'heading',
      style: 'h2',
      children: [{ _type: 'span', text: 'A useful heading', marks: [] }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'bullet1',
      style: 'normal',
      listItem: 'bullet',
      children: [{ _type: 'span', text: 'First list item', marks: [] }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'bullet2',
      style: 'normal',
      listItem: 'bullet',
      children: [{ _type: 'span', text: 'Second list item', marks: [] }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'link',
      style: 'normal',
      children: [
        { _type: 'span', text: 'Read more at ', marks: [] },
        { _type: 'span', text: 'Sanity', marks: ['link1'] },
      ],
      markDefs: [
        {
          _key: 'link1',
          _type: 'link',
          href: 'https://www.sanity.io',
        },
      ],
    },
  ];

  it('renders fallback posts when Sanity is not configured', function () {
    cy.visit('/blog.html');
    cy.get('.blogBoxes .blogBox', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('.blogBoxes .blogBox h3').first().should('not.be.empty');
  });

  it('renders CMS posts when Sanity responds', function () {
    cy.intercept('GET', '**/api.sanity.io/**', {
      statusCode: 200,
      body: {
        result: [
          {
            title: 'Test Post from CMS',
            slug: { current: 'test-post-from-cms' },
            excerpt: 'This is a stubbed excerpt.',
            publishedAt: '2026-03-01T12:00:00Z',
            readMinutes: 3,
            body: portableTextBody,
            coverImage: null,
          },
        ],
      },
    }).as('sanityBlog');

    cy.visit('/blog.html');
    cy.wait('@sanityBlog');
    cy.contains('Test Post from CMS').should('be.visible');
  });

  it('renders Portable Text in the desktop article view', function () {
    cy.intercept('GET', '**/api.sanity.io/**', {
      statusCode: 200,
      body: {
        result: [
          {
            title: 'Portable Text Post',
            slug: { current: 'portable-text-post' },
            excerpt: 'Rich text excerpt.',
            publishedAt: '2026-03-01T12:00:00Z',
            readMinutes: 4,
            body: portableTextBody,
            coverImage: null,
          },
        ],
      },
    }).as('sanityPortable');

    cy.visit('/blog.html');
    cy.wait('@sanityPortable');
    cy.get('.blogBoxes .blogBox').first().click();
    cy.get('.blog-article-view').should('not.be.hidden');
    cy.contains('Intro paragraph from CMS.').should('be.visible');
    cy.get('.blog-article__body h2').should('contain.text', 'A useful heading');
    cy.get('.blog-article__body ul li').should('have.length', 2);
    cy.get('.blog-article__body a')
      .should('have.attr', 'href', 'https://www.sanity.io')
      .and('contain.text', 'Sanity');
    cy.get('.blog-article-back').click();
    cy.get('.blog-article-view').should('be.hidden');
    cy.get('.blogBoxes .blogBox').should('be.visible');
  });
});

describe('Testimonials integration', function () {
  it('shows empty state when Sanity is not configured', function () {
    cy.visit('/testimonials.html');
    cy.get('.testimonials-list').should('contain.text', 'Submit yours below');
  });

  it('renders approved testimonials from stubbed Sanity', function () {
    cy.intercept('GET', '**/api.sanity.io/**', {
      statusCode: 200,
      body: {
        result: [{ name: 'Jane D.', quote: 'An amazing reading experience.' }],
      },
    }).as('sanityTestimonials');

    cy.visit('/testimonials.html');
    cy.wait('@sanityTestimonials');
    cy.contains('Jane D.').should('be.visible');
    cy.contains('An amazing reading experience').should('be.visible');
  });
});
