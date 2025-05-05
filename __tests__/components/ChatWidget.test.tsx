/**
 * Test suite for the ChatWidget component and chat API
 *
 * Tests functionality, security, and performance aspects of the chat feature
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWidget from '@/components/ChatWidget';

// Polyfill for Response in Node.js environment
global.Response = class MockResponse {
  status: number;
  headers: Headers;
  body: string | null;
  
  constructor(body?: BodyInit | null, options?: ResponseInit) {
    this.body = body ? String(body) : null;
    this.status = options?.status || 200;
    this.headers = new Headers(options?.headers);
  }
  
  async json() {
    return this.body ? JSON.parse(this.body) : null;
  }
} as unknown as typeof Response;

// Mock scrollIntoView - not available in Jest DOM environment
Element.prototype.scrollIntoView = jest.fn();

// Mock the fetch function
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Instead of mocking the API route directly, we'll mock the fetch function
// which is used by the ChatWidget component to call the API

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: 'This is a mock response from the assistant.'
                }
              }]
            })
          }
        }
      };
    })
  };
});

// Mock next/server
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation(function(input: RequestInfo | URL, init?: RequestInit) {
      return new Request(input, init);
    }),
    NextResponse: {
      json: jest.fn((body, options) => {
        return new Response(JSON.stringify(body), {
          ...options,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    }
  };
});

describe('ChatWidget Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Test response from API' })
    });
    
    // Set initial messages in localStorage to simulate existing chat history
    localStorageMock.setItem('chat-messages', JSON.stringify([
      { role: 'assistant', content: "Hi there! \ud83d\udc4b How can I help you with your family's opportunities today?", timestamp: new Date().toISOString() },
      { role: 'user', content: 'Previous message', timestamp: new Date().toISOString() },
      { role: 'assistant', content: 'Previous response', timestamp: new Date().toISOString() }
    ]));
  });

  it('renders the chat widget with initial message', () => {
    render(<ChatWidget />);
    
    // Check if the chat button is rendered
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
    
    // Open the chat
    fireEvent.click(screen.getByLabelText('Open chat'));
    
    // Check if the initial message is displayed
    expect(screen.getByText("Hi there! \ud83d\udc4b How can I help you with your family's opportunities today?")).toBeInTheDocument();
  });

  it('allows users to send messages and displays responses', async () => {
    render(<ChatWidget />);
    
    // Open the chat
    fireEvent.click(screen.getByLabelText('Open chat'));
    
    // Type a message
    const textarea = screen.getByPlaceholderText('Type your question...');
    fireEvent.change(textarea, { target: { value: 'Hello, how can I improve my child\'s education?' } });
    
    // Send the message
    fireEvent.click(screen.getByLabelText('Send message'));
    
    // Check if user message is displayed
    expect(screen.getByText("Hello, how can I improve my child's education?")).toBeInTheDocument();
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByText('Test response from API')).toBeInTheDocument();
    });
    
    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: expect.any(String)
    });
    
    // Verify the request body
    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(requestBody.message).toBe("Hello, how can I improve my child's education?");
    expect(Array.isArray(requestBody.history)).toBe(true);
  });

  it('persists chat history in localStorage', async () => {
    // Mock the implementation of localStorage.setItem to capture the messages
    let capturedMessages: Array<{ role: string; content: string; timestamp?: string }> = [];
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      if (key === 'chat-messages') {
        capturedMessages = JSON.parse(value);
      }
    });
    
    render(<ChatWidget />);
    
    // Open the chat
    fireEvent.click(screen.getByLabelText('Open chat'));
    
    // Type a message
    const textarea = screen.getByPlaceholderText('Type your question...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    
    // Send the message
    fireEvent.click(screen.getByLabelText('Send message'));
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByText('Test response from API')).toBeInTheDocument();
    });
    
    // Verify localStorage was called
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Verify that the captured messages include our test message and response
    expect(capturedMessages.length).toBeGreaterThanOrEqual(3); // Initial + user + response
    expect(capturedMessages.some(msg => msg.content === 'Test message')).toBe(true);
    expect(capturedMessages.some(msg => msg.content === 'Test response from API')).toBe(true);
  });

  it('clears chat history when clear button is clicked', async () => {
    render(<ChatWidget />);
    
    // Open the chat
    fireEvent.click(screen.getByLabelText('Open chat'));
    
    // Send a message
    const textarea = screen.getByPlaceholderText('Type your question...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    
    // Wait for the response
    await waitFor(() => {
      expect(screen.getByText('Test response from API')).toBeInTheDocument();
    });
    
    // Clear the chat
    fireEvent.click(screen.getByText('Clear'));
    
    // Verify only the initial message remains
    const messages = screen.getAllByText(/Hi there|Test message|Test response/i);
    expect(messages.length).toBe(1);
    expect(screen.getByText("Hi there! \ud83d\udc4b How can I help you with your family's opportunities today?")).toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    expect(screen.queryByText('Test response from API')).not.toBeInTheDocument();
  });
});

describe('Chat Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Test response from API' })
    });
  });
  
  it('sanitizes user input to prevent injection attacks', async () => {
    // Create a potentially malicious input with script tags
    const maliciousInput = '<script>alert("XSS Attack")</script>Tell me about opportunities';
    
    render(<ChatWidget />);
    
    // Open the chat
    fireEvent.click(screen.getByLabelText('Open chat'));
    
    // Type the malicious message
    const textarea = screen.getByPlaceholderText('Type your question...');
    fireEvent.change(textarea, { target: { value: maliciousInput } });
    
    // Send the message
    fireEvent.click(screen.getByLabelText('Send message'));
    
    // Verify the message is displayed as text, not executed as HTML
    const messageElement = screen.getByText(maliciousInput);
    expect(messageElement).toBeInTheDocument();
    expect(messageElement.innerHTML).not.toBe(maliciousInput); // Should be escaped
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByText('Test response from API')).toBeInTheDocument();
    });
    
    // Verify fetch was called with the malicious input
    expect(global.fetch).toHaveBeenCalled();
    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(requestBody.message).toBe(maliciousInput);
  });
});
