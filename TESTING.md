# Testing Guide

This document provides guidelines for running tests and adding new tests to the project.

## Test Structure

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

### 1. Unit Tests

Testing individual functions and components in isolation:

- **Component Tests**:
  - `Welcome.test.tsx`: Tests rendering, animations, scroll functionality, keyboard navigation
  - `Move.test.tsx`: Tests ZIP code input, API interactions, UI rendering, error handling
  - `Stay.test.tsx`: Tests address validation, school/program filtering, personalized advice
  - `OpportunityMap.test.tsx`: Tests map rendering, geocoding, address updates

- **Utility Function Tests**:
  - `jobOpportunities.test.ts`: Tests job opportunity advice generation for different demographics
  - Helper functions in Move/Stay components: Tests for school type inference, demographic formatting

### 2. Integration Tests

Testing interactions between components and API calls:

- API interaction tests in `Move.test.tsx` and `Stay.test.tsx`
- Component interaction tests with context providers (AssessProvider)
- Error handling and recovery flows

### 3. End-to-End Tests

Testing the full application flow in a browser:

- `welcome.cy.js`: Tests the welcome page and navigation
- `assessment-flow.cy.js`: Tests completing the assessment form and viewing results
- `full-user-journey.cy.js`: Tests the complete user flow from welcome to action plan creation

## Test Coverage

The test suite covers:

1. **UI Components**:
   - Rendering of all major components
   - Animation and transition effects
   - Interactive elements (buttons, forms, cards)
   - Responsive behavior

2. **Business Logic**:
   - Data processing and filtering
   - Personalized recommendation generation
   - School and program matching algorithms
   - Job opportunity advice generation

3. **API Interactions**:
   - Successful API requests and responses
   - Error handling for failed requests
   - Loading states during API calls
   - Fallback to default data when needed

4. **User Flows**:
   - Assessment completion
   - Viewing and selecting recommendations
   - Creating action plans
   - Navigation between different sections

5. **Edge Cases**:
   - Empty or invalid input handling
   - Missing data scenarios
   - API failures and recovery
   - Accessibility considerations (keyboard navigation)

## Creating a Loom Video

To create a Loom video demonstrating the test suite:

1. Install Loom from https://www.loom.com/
2. Open a terminal and navigate to the project directory
3. Run the following commands and narrate what's happening:
   ```
   npm test
   npm run test:coverage
   npm run test:e2e
   ```
4. Show the test results and explain key test cases
5. Share the Loom video URL in your submission

## Loom Video Demonstration

A Loom video demonstrating how to run the test suite is available at: [Insert Loom Video URL Here]

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests.

2. **Arrange-Act-Assert**: Structure your tests with these three phases:
   - Arrange: Set up the test data and conditions
   - Act: Perform the action being tested
   - Assert: Verify the results

3. **Mock External Dependencies**: Use Jest's mocking capabilities to isolate the code being tested.

4. **Test Coverage**: Aim for high test coverage, but focus on testing critical paths and edge cases.

5. **Descriptive Test Names**: Use descriptive names for your test suites and test cases.

## Continuous Integration

Tests are automatically run as part of the CI/CD pipeline. Make sure all tests pass before submitting a pull request.

## Troubleshooting

If you encounter issues with the test suite:

1. Make sure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npm run lint`
3. Try clearing the Jest cache: `npx jest --clearCache`

## Adding New Tests

### File Naming Convention

- Test files should be named with the `.test.ts` or `.test.tsx` extension
- Test files should be placed in the appropriate directory based on what they're testing
- The file name should match the name of the file being tested (e.g., `Button.tsx` → `Button.test.tsx`)

### Writing Tests

#### Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '@/components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<YourComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### API Tests

```tsx
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/your-api-route';

describe('Your API Route', () => {
  it('should return expected response for GET', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(/* expected response */);
  });
});
```

#### Utility Tests

```tsx
import { yourUtilityFunction } from '@/utils/yourUtility';

describe('yourUtilityFunction', () => {
  it('should return expected result', () => {
    const result = yourUtilityFunction(/* input */);
    expect(result).toEqual(/* expected output */);
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests.

2. **Arrange-Act-Assert**: Structure your tests with these three phases:
   - Arrange: Set up the test data and conditions
   - Act: Perform the action being tested
   - Assert: Verify the results

3. **Mock External Dependencies**: Use Jest's mocking capabilities to isolate the code being tested.

4. **Test Coverage**: Aim for high test coverage, but focus on testing critical paths and edge cases.

5. **Descriptive Test Names**: Use descriptive names for your test suites and test cases.

## Continuous Integration

Tests are automatically run as part of the CI/CD pipeline. Make sure all tests pass before submitting a pull request.

## Troubleshooting

If you encounter issues with the test suite:

1. Make sure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npm run lint`
3. Try clearing the Jest cache: `npx jest --clearCache`
