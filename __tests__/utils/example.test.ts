/**
 * Example test file to demonstrate how to write tests
 * 
 * This is a placeholder test that always passes.
 * Replace with actual tests for your utility functions.
 */

describe('Example Test Suite', () => {
  it('should demonstrate a passing test', () => {
    // Arrange
    const input = 1;
    const expected = 1;
    
    // Act
    const result = input;
    
    // Assert
    expect(result).toBe(expected);
  });

  it('should demonstrate how to test async functions', async () => {
    // Arrange
    const mockPromise = Promise.resolve('success');
    
    // Act
    const result = await mockPromise;
    
    // Assert
    expect(result).toBe('success');
  });
});
