describe('Navigation', function () {
  var pages = [
    { path: '/main.html', link: 'Home' },
    { path: '/services.html', link: 'Book Online' },
    { path: '/blog.html', link: 'Blog' },
    { path: '/testimonials.html', link: 'Testimonials' },
  ];

  pages.forEach(function (page) {
    it('nav bar uses #067BC2 on ' + page.path, function () {
      cy.visit(page.path);
      cy.get('.nav-container').should('have.css', 'background-color', 'rgb(6, 123, 194)');
    });
  });

  it('About Me button uses #067BC2 on main', function () {
    cy.visit('/main.html');
    cy.get('.about-btn').should('have.css', 'background-color', 'rgb(6, 123, 194)');
  });
});
