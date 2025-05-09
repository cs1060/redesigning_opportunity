# Redesigning Opportunity Test Suite

This document explains how to run the test suite for the Redesigning Opportunity application.

## Prerequisites

Before running the tests, make sure you have the following installed:
- Node.js (v16 or higher)
- npm (v7 or higher)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/redesigning_opportunity.git
   cd redesigning_opportunity
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running Tests

### Unit and Integration Tests

To run all unit and integration tests:

```
npm test
```

This will run all Jest tests and show the test results in the terminal.

For watching mode (tests run automatically when files change):

```
npm run test:watch
```

For test coverage report:

```
npm run test:coverage
```

### End-to-End Tests

To run end-to-end tests with Cypress in interactive mode:

```
npm run test:e2e
```

This will:
1. Start the development server
2. Open the Cypress test runner
3. Allow you to run tests interactively

To run end-to-end tests in headless mode (useful for CI/CD):

```
npm run test:e2e:headless
```

## Test Structure

The test suite consists of:

1. **Unit Tests**: Testing individual functions and components in isolation
   - Located in `__tests__/` directory
   - Examples: `Welcome.test.tsx`, `Move.test.tsx`, `Stay.test.tsx`

2. **Integration Tests**: Testing interactions between components and API calls
   - Also located in `__tests__/` directory
   - Examples: API interaction tests in `Move.test.tsx` and `Stay.test.tsx`

3. **End-to-End Tests**: Testing the full application flow in a browser
   - Located in `cypress/e2e/` directory
   - Examples: `welcome.cy.js`, `assessment-flow.cy.js`

## Loom Video Demonstration

A Loom video demonstrating how to run the test suite is available at: [Insert Loom Video URL Here]
