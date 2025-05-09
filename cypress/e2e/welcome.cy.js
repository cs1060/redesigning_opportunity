describe('Welcome Page', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000');
    cy.wait(4000);
  });

  it('should load the welcome page successfully', () => {
    // Check that the main title is visible
    cy.contains('Building Your Child\'s Future').should('be.visible');
    cy.contains('A friendly guide to creating opportunities for your family!').should('be.visible');
    
    // Check that the descriptive paragraphs are rendered
    cy.contains('Discover the best places to live').should('be.visible');
    cy.contains('Search for the best schools').should('be.visible');
    cy.contains('Find local resources and community programs').should('be.visible');
  });

  it('should navigate to the assessment section when clicking the scroll button', () => {
    // Find the scroll button using its aria-label
    cy.get('[aria-label="Scroll to assessment quiz"]').click({force: true});
    cy.wait(500);

    // Check that the quiz section is visible (scrolled into view)
    // We'll verify this by checking if a quiz element is visible
    cy.get('#quiz-section').should('be.visible');
    cy.wait(500);
    
    // Alternatively, we can check if an element in the quiz section is visible
    cy.contains('Assess Your Community').should('be.visible');
  });
});
