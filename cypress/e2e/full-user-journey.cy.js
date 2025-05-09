describe('Full User Journey', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000');
    cy.wait(4000);
  });

  it('should complete the entire user journey from welcome to action plan', () => {
    // Check welcome page elements
    cy.contains('Building Your Child\'s Future').should('be.visible');
    cy.contains('A friendly guide to creating opportunities for your family').should('be.visible');
    
    // Navigate to assessment
    cy.contains('Assess Your Community').click();
    
    // Fill out the assessment form
    cy.get('input[name="street"]').type('32 Mill Street');
    cy.wait(500);
    cy.get('input[name="city"]').type('Cambridge');
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
    cy.get('select[name="child-ethnicity"]').select('W');
    cy.wait(500);

    // Submit the form
    cy.contains('Submit').click();
    cy.wait(4000);
    
    // Check that the results page is shown
    cy.contains('Your Opportunity Score').should('be.visible');
    
    // Test the Stay option
    cy.contains('Stay & Improve').click();
    cy.wait(5000);

    // Wait for API response and verify content loads
    cy.contains('Township Information', { timeout: 15000 }).should('be.visible');
    cy.wait(500);

    // Select a school
    cy.contains('Local Schools').should('be.visible');
    cy.contains('h3', 'Local Schools').parent().find('.border.rounded-lg.p-4').first().click({force: true});
    cy.wait(500);

    // Select a community program
    cy.contains('Community Programs').should('be.visible');
    cy.contains('h3', 'Community Programs').parent().find('.border.rounded-lg.p-4').first().click({force: true});
    cy.wait(500);

    // Save choices
    cy.contains('Save My Choices').click();
    cy.wait(500);
    // Verify the action plan is created
    cy.contains('Your Saved Choices').should('be.visible');
    
    // Test the Move option
    cy.contains('Explore New Areas').click();
    
    // Enter a ZIP code
    // Find the ZIP code input by ID instead of name
    cy.get('input#zipCode').then($zip => {
      if ($zip.length > 0) {
        cy.wrap($zip).type('02139', {force: true});
      } else {
        // Try with generic fallback if not found by ID
        cy.get('input[type="text"]').eq(3).type('02139', {force: true});
      }
    });
  cy.wait(500);

    cy.wait(5000);
    
    // Wait for recommendations to load
    cy.contains('Township Information', { timeout: 30000 }).should('be.visible');
    cy.wait(500);

    // Select a neighborhood
    cy.contains('Top Neighborhoods in 02139').should('be.visible');
    cy.contains('h3', 'Top Neighborhoods in 02139').parent().find('.border.rounded-lg.p-4').first().click({force: true});
    cy.wait(500);

    // Select a school
    cy.contains('Local Schools').should('be.visible');
    cy.contains('h3', 'Local Schools').parent().find('.border.rounded-lg.p-4').first().click({force: true});
    cy.wait(500);

    // Select a community program
    cy.contains('Community Programs').should('be.visible');
    cy.contains('h3', 'Community Programs').parent().find('.border.rounded-lg.p-4').first().click({force: true});
    cy.wait(500);

    // Select a housing option
    cy.get('h3').contains(/housing/i).parent().find('.border.rounded-lg.p-4').first().click({force: true});
    cy.wait(500);
    
    // Save choices
    cy.get('button').contains(/save/i).then($btn => {
      if ($btn.length > 0) {
        cy.wrap($btn).click({force: true});
      }
    });
    cy.wait(500);
    
    // Verify the action plan is created
    cy.contains('Your Saved Choices').should('be.visible');
  });
});
