describe('Assessment Flow', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000');
    cy.wait(4000);
    
    // Navigate to the assessment section
    cy.contains('Assess Your Community').click();
  });

  it('should complete the basic assessment form', () => {
    // Fill out the address form
    cy.get('input[name="street"]').type('123 Main Street');
    cy.wait(500);
    cy.get('input[name="city"]').type('Boston');
    cy.wait(500);
    cy.get('select[name="state"]').select('MA');
    cy.wait(500);
    
    // Select employment status
    cy.contains('Are you currently employed?').parent().within(() => {
      cy.contains('Yes').click();
    });
    cy.wait(500);
    
    // Select income range
    cy.get('select[name="income"]').select('50-75k');
    cy.wait(500);
    
    // Add a child
    cy.get('input[name="child-name"]').type('Test Child', {force: true});
    cy.wait(500);
    cy.get('input[name="child-age"]').type('8');
    cy.wait(500);
    cy.get('select[name="child-gender"]').select('M');
    cy.wait(500);
    cy.get('select[name="child-ethnicity"]').select('W');
    cy.wait(500);
    
    // Submit the form
    cy.contains('Submit').click();
    cy.wait(4000);

    // Check that the results page is shown
    cy.contains('Your Opportunity Score').should('be.visible');
    cy.wait(500);
  });

  it('should navigate to the Move recommendation flow', () => {
    // Fill out the form with minimal required information
    cy.get('input[name="street"]').type('123 Main Street');
    cy.wait(500);
    cy.get('input[name="city"]').type('Boston');
    cy.wait(500);
    cy.get('select[name="state"]').select('MA');
    cy.wait(500);

    cy.contains('Are you currently employed?').parent().within(() => {
      cy.contains('Yes').click();
    });
    cy.wait(500);
    cy.get('select[name="income"]').select('50-75k');
    cy.wait(500);

    // Add a child
    cy.get('input[name="child-name"]').type('Test Child', {force: true});
    cy.wait(500);
    cy.get('input[name="child-age"]').type('8');
    cy.wait(500);
    cy.get('select[name="child-gender"]').select('M');
    cy.wait(500);
    cy.get('select[name="child-ethnicity"]').select('W');
    cy.wait(500);
    
    // Submit the form
    cy.contains('Submit').click();
    cy.wait(4000);
    
    // On the results page, click the Move option
    cy.contains('Explore New Areas').click();
    cy.wait(500);
    
    // Verify we're on the Move page
    cy.contains('Where Would You Like to Move?').should('be.visible');
    cy.wait(500);

    // Enter a ZIP code
    cy.get('input#zipCode').then($zip => {
      if ($zip.length > 0) {
        cy.wrap($zip).type('02139', {force: true});
      } else {
        // Try with generic fallback if not found by ID
        cy.get('input[type="text"]').eq(3).type('02139', {force: true});
      }
    });
    cy.wait(5000);
    
    // Check that recommendations are loaded
    cy.contains('Next Steps').should('be.visible', { timeout: 20000 });
  });
});
