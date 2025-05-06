describe('Full User Journey', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000');
  });

  it('should complete the entire user journey from welcome to action plan', () => {
    // Check welcome page elements
    cy.contains('Welcome to Opportunity Compass').should('be.visible');
    cy.contains('Your guide to economic mobility').should('be.visible');
    
    // Navigate to assessment
    cy.contains('Start Your Assessment').click();
    
    // Fill out the assessment form
    cy.get('input[name="street"]').type('123 Main Street');
    cy.get('input[name="city"]').type('Boston');
    cy.get('select[name="state"]').select('MA');
    cy.get('input[name="zipCode"]').type('02115');
    
    // Select employment status
    cy.contains('Are you currently employed?').parent().within(() => {
      cy.contains('Yes').click();
    });
    
    // Select income range
    cy.get('select[name="income"]').select('50-75k');
    
    // Add a child
    cy.contains('Add Child').click();
    cy.get('input[name="children[0].name"]').type('Test Child');
    cy.get('input[name="children[0].age"]').type('8');
    cy.get('select[name="children[0].gender"]').select('M');
    cy.get('select[name="children[0].ethnicity"]').select('W');
    
    // Submit the form
    cy.contains('Submit').click();
    
    // Check that the results page is shown
    cy.contains('Your Assessment Results').should('be.visible');
    
    // Test the Stay option
    cy.contains('Stay and Access Local Resources').click();
    
    // Wait for API response and verify content loads
    cy.contains('Township Information', { timeout: 10000 }).should('be.visible');
    
    // Select a school
    cy.contains('Local Schools').should('be.visible');
    cy.get('[data-testid="school-card"]').first().click();
    
    // Select a community program
    cy.contains('Community Programs').should('be.visible');
    cy.get('[data-testid="program-card"]').first().click();
    
    // Save choices
    cy.contains('Save My Choices').click();
    
    // Verify the action plan is created
    cy.contains('Your Action Plan').should('be.visible');
    
    // Go back to results
    cy.contains('Back to Results').click();
    
    // Test the Move option
    cy.contains('Move to a Higher Opportunity Area').click();
    
    // Enter a ZIP code
    cy.get('input[placeholder="Enter ZIP code"]').type('12345');
    cy.contains('Update').click();
    
    // Wait for recommendations to load
    cy.contains('Township Information', { timeout: 10000 }).should('be.visible');
    
    // Select a neighborhood
    cy.get('[data-testid="neighborhood-card"]').first().click();
    
    // Select a school
    cy.contains('Local Schools').should('be.visible');
    cy.get('[data-testid="school-card"]').first().click();
    
    // Select a community program
    cy.contains('Community Programs').should('be.visible');
    cy.get('[data-testid="program-card"]').first().click();
    
    // Select a housing option
    cy.contains('Housing Options').should('be.visible');
    cy.get('[data-testid="housing-card"]').first().click();
    
    // Save choices
    cy.contains('Save My Choices').click();
    
    // Verify the action plan is created
    cy.contains('Your Action Plan').should('be.visible');
  });
});
