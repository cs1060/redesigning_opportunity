// Polyfill TextEncoder/TextDecoder for undici/fetch compatibility in Jest
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// Polyfill ReadableStream, WritableStream, and TransformStream for undici/fetch compatibility in Jest
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = require('stream/web').WritableStream;
}
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = require('stream/web').TransformStream;
}

// Polyfill MessagePort and MessageChannel for undici/fetch compatibility in Jest
if (typeof global.MessagePort === 'undefined') {
  const { MessagePort, MessageChannel } = require('worker_threads');
  global.MessagePort = MessagePort;
  global.MessageChannel = MessageChannel;
}

// Polyfill fetch, Request, and Response for Next.js API route compatibility in Jest
const undici = require('undici');
global.fetch = undici.fetch;
global.Request = undici.Request;
global.Response = undici.Response;

// Polyfill TextEncoder/TextDecoder for undici/fetch compatibility in Jest
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(() => Promise.resolve()),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
