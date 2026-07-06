describe('Mobile card deck', function () {
  beforeEach(function () {
    cy.viewport(390, 844);
    cy.visit('/main.html');
  });

  it('shows card deck and hides desktop content on mobile', function () {
    cy.get('.cardDeck').should('be.visible');
    cy.get('.desktop-content').should('not.be.visible');
  });

  it('renders four cards in the stack', function () {
    cy.get('.cardDeck__card').should('have.length', 4);
  });

  it('loops cards on swipe gesture', function () {
    cy.get('.cardDeck__stack').then(function ($stack) {
      var topBefore = $stack.find('.cardDeck__card').last().attr('data-page');
      cy.get('.cardDeck__stack')
        .trigger('pointerdown', { clientX: 300, clientY: 400, pointerId: 1, force: true })
        .trigger('pointerup', { clientX: 100, clientY: 400, pointerId: 1, force: true });
      cy.wait(1200);
      cy.get('.cardDeck__stack .cardDeck__card').last().should('not.have.attr', 'data-page', topBefore);
    });
  });
});

describe('Desktop layout', function () {
  it('hides card deck and shows desktop content', function () {
    cy.viewport(1280, 720);
    cy.visit('/main.html');
    cy.get('.cardDeck').should('not.be.visible');
    cy.get('.desktop-content').should('be.visible');
  });
});
