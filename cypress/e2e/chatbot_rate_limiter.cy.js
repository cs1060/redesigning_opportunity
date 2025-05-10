describe('Chatbot Rate Limiter Tests', () => {
  it('should allow a maximum of 10 requests per minute per user', () => {
    // Step 1: Load the main page
    cy.visit('http://localhost:3000');

    // Step 2: Click the chat button to open the chatbot
    cy.get('[data-cy=chat-button]').click();

    // Step 3: Intercept the POST request to check for rate limit response
    cy.intercept('POST', '/api/chat').as('chatRequest');

    // Step 4: Send 10 requests within the allowed limit
    for (let i = 0; i < 10; i++) {
      cy.get('[data-cy=chat-input]').should('not.be.disabled').type('Test message {enter}');
      cy.wait('@chatRequest').its('response.statusCode').should('eq', 200);
    }

    // Step 5: Attempt to send an 11th request and check for rate limit message
    cy.get('[data-cy=chat-input]').should('not.be.disabled').type('Another test message {enter}');
    cy.wait('@chatRequest').its('response.body.error').should('eq', 'Too many requests, please try again later.');
  });

  it('should reset the rate limit after 1 minute', () => {
    // Step 1: Load the main page
    cy.visit('http://localhost:3000');

    cy.wait(60000);

    // Step 2: Click the chat button to open the chatbot
    cy.get('[data-cy=chat-button]').click();

    // Step 3: Intercept the POST request to check for rate limit response
    cy.intercept('POST', '/api/chat').as('chatRequest');

    // Step 4: Send 10 requests to reach the limit
    for (let i = 0; i < 10; i++) {
      cy.get('[data-cy=chat-input]').should('not.be.disabled').type('Test message {enter}');
      cy.wait('@chatRequest').its('response.body.error').should('not.eq', 'Too many requests, please try again later.');
    }

    // Step 5: Wait for 1 minute to reset the rate limit
    cy.wait(60000);

    // Step 6: Send another request and expect a response
    cy.get('[data-cy=chat-input]').should('not.be.disabled').type('New test message {enter}');
    cy.wait('@chatRequest').its('response.body.error').should('not.eq', 'Too many requests, please try again later.');
  });
});