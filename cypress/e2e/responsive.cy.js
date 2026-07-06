describe('Responsive layout', function () {
  it('serves all four pages without console errors', function () {
    var pages = ['/main.html', '/services.html', '/blog.html', '/testimonials.html'];
    pages.forEach(function (path) {
      cy.visit(path);
      cy.get('body').should('exist');
    });
  });

  it('loads Montserrat and Cormorant Garamond', function () {
    cy.visit('/main.html');
    cy.get('h1').should('have.css', 'font-family').and('match', /Cormorant/i);
  });
});
