describe('Blog integration', function () {
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
            excerpt: 'This is a stubbed excerpt.',
            coverImage: null,
          },
        ],
      },
    }).as('sanityBlog');

    cy.visit('/blog.html');
    cy.wait('@sanityBlog');
    cy.contains('Test Post from CMS').should('be.visible');
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
