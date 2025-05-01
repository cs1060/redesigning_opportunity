// This file contains global type definitions for the test environment
import '@testing-library/jest-dom';

// Declare global Jest types
declare global {
  // eslint-disable-next-line no-var
  var jest: any;
  
  // Declare Jest test functions
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void): void;
  function it(name: string, fn: () => Promise<void>): void;
  function expect<T>(actual: T): jest.Matchers<T>;
  function beforeEach(fn: () => void): void;
  function afterEach(fn: () => void): void;
  function beforeAll(fn: () => void): void;
  function afterAll(fn: () => void): void;
}

// Mock namespace for Jest
namespace jest {
  interface Matchers<R> {
    toHaveBeenCalled(): R;
    toHaveBeenCalledTimes(count: number): R;
    toHaveBeenCalledWith(...args: any[]): R;
    toBeInTheDocument(): R;
    toHaveTextContent(text: string | RegExp): R;
    toBe(expected: any): R;
    toEqual(expected: any): R;
    // Add other matchers as needed
  }

  function fn(): any;
  function fn<T>(implementation?: (...args: any[]) => T): any;
}
