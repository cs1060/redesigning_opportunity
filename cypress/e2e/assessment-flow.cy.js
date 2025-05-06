describe('Assessment Flow', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000');
    
    // Navigate to the assessment section
    cy.contains('Start Your Assessment').click();
  });

  it('should complete the basic assessment form', () => {
    // Fill out the address form
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
  });

  it('should navigate to the Move recommendation flow', () => {
    // Fill out the form with minimal required information
    cy.get('input[name="street"]').type('123 Main Street');
    cy.get('input[name="city"]').type('Boston');
    cy.get('select[name="state"]').select('MA');
    cy.get('input[name="zipCode"]').type('02115');
    cy.contains('Are you currently employed?').parent().within(() => {
      cy.contains('Yes').click();
    });
    cy.get('select[name="income"]').select('50-75k');
    
    // Submit the form
    cy.contains('Submit').click();
    
    // On the results page, click the Move option
    cy.contains('Move to a Higher Opportunity Area').click();
    
    // Verify we're on the Move page
    cy.contains('Where Would You Like to Move?').should('be.visible');
    
    // Enter a ZIP code
    cy.get('input[placeholder="Enter ZIP code"]').type('12345');
    cy.contains('Update').click();
    
    // Check that recommendations are loaded
    cy.contains('Recommendations for').should('be.visible', { timeout: 10000 });
  });
});
