describe('Welcome Page', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000');
  });

  it('should load the welcome page successfully', () => {
    // Check that the main title is visible
    cy.contains('Welcome to Opportunity Compass').should('be.visible');
    cy.contains('Your guide to economic mobility').should('be.visible');
    
    // Check that the descriptive paragraphs are rendered
    cy.contains('Discover resources in your community').should('be.visible');
    cy.contains('Search for opportunities').should('be.visible');
    cy.contains('Find a path to economic mobility').should('be.visible');
  });

  it('should navigate to the assessment section when clicking the scroll button', () => {
    // Find and click the scroll button
    cy.contains('Scroll to assessment quiz').click();
    
    // Check that the quiz section is visible (scrolled into view)
    // We'll verify this by checking if a quiz element is visible
    cy.get('#quiz-section').should('be.visible');
    
    // Alternatively, we can check if an element in the quiz section is visible
    cy.contains('Start Your Assessment').should('be.visible');
  });
});
