describe('Community Connections Translation Tests', () => {
  it('should translate the "Share Your Story" form when language is switched', () => {
    // Step 1: Load the website
    cy.visit('http://localhost:3000');
    cy.wait(4000);

    // Step 2: Switch to a different language in the navbar
    cy.get('[data-cy=language-selector]').click();
    cy.get('button[role="option"]').contains('Spanish').click(); 

    // Step 3: Navigate to Community Connections
    cy.get('[data-cy=nav-bar]').contains('Comunidad').click();

    // Step 4: Click on "Share Your Story"
    cy.contains('button', 'Comparte Tu Historia').click();

    // Step 5: Verify that the form is translated
    cy.contains('Su Nombre').should('exist');
  });

  it('should translate comments when language is switched', () => {
    // Step 1: Load the website
    cy.visit('http://localhost:3000');
    cy.wait(4000);

    // Step 2: Switch to a different language in the navbar
    cy.get('[data-cy=language-selector]').click();
    cy.get('button[role="option"]').contains('Chinese').click(); 

    // Step 3: Navigate to Community Connections
    cy.get('[data-cy=nav-bar]').contains('社区').click();

    // Step 4: Verify that the comments are translated
    cy.get('[data-cy=comments]').each(($comment) => {
      cy.wrap($comment).should('not.contain', 'This was great! Thanks so much');
    });
    cy.contains('太棒了！非常感谢').should('exist');
    cy.contains('This was great! Thanks so much').should('not.exist');
  });
});