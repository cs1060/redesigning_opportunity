describe('Chatbot Rate Limiter Tests', () => {
  it('should allow a maximum of 5 requests per minute per user', () => {
    // Step 1: Load the main page
    cy.visit('http://localhost:3000');

    // Step 2: Click the chat button to open the chatbot
    cy.get('[data-cy=chat-button]').click();

    // Step 3: Send 5 requests within the allowed limit
    for (let i = 0; i < 5; i++) {
      cy.get('[data-cy=chat-input]').type('Test message {enter}');
      cy.get('[data-cy=chat-response]').should('exist');
    }

    // Step 4: Attempt to send a 6th request and expect a rate limit message
    cy.get('[data-cy=chat-input]').type('Another test message {enter}');
    cy.get('[data-cy=rate-limit-message]').should('contain', 'You have exceeded the maximum number of requests. Please try again later.');
  });

  it('should reset the rate limit after 1 minute', () => {
    // Step 1: Load the main page
    cy.visit('http://localhost:3000');

    // Step 2: Click the chat button to open the chatbot
    cy.get('[data-cy=chat-button]').click();

    // Step 3: Send 5 requests to reach the limit
    for (let i = 0; i < 5; i++) {
      cy.get('[data-cy=chat-input]').type('Test message {enter}');
      cy.get('[data-cy=chat-response]').should('exist');
    }

    // Step 4: Wait for 1 minute to reset the rate limit
    cy.wait(60000);

    // Step 5: Send another request and expect a response
    cy.get('[data-cy=chat-input]').type('New test message {enter}');
    cy.get('[data-cy=chat-response]').should('exist');
  });
});