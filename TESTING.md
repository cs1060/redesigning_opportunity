# Testing Guide

This document provides guidelines for running tests and adding new tests to the project.

## Test Structure

The test suite is organized as follows:

```
__tests__/
├── api/                 # Tests for API routes
├── components/          # Tests for React components
├── pages/               # Tests for Next.js pages
├── utils/               # Tests for utility functions
└── types.d.ts           # TypeScript definitions for tests
```

## Running Tests

The project uses Jest as the test runner with React Testing Library for component testing. The following npm scripts are available:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

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
