
/**
 * Test suite for Chat API limits and constraints
 *
 * Tests various limits including:
 * - Maximum input length
 * - Maximum output length
 * - Rate limiting
 * - Token usage optimization
 */

// Polyfill for Request in Node.js environment
if (!global.Request) {
  global.Request = class MockRequest {
    constructor(input?: any, init?: any) {
      // No-op for mock
    }
  } as unknown as typeof Request;
}

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';

// Polyfill for Response in Node.js environment
if (!global.Response) {
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
}

// We need to mock the modules before importing them
const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    choices: [{ message: { content: 'Standard response' } }],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    }
  })
});

// Mock fetch
global.fetch = mockFetch;

// Mock the environment variable
process.env.OPENAI_API_KEY = 'test-api-key';

/**
 * Create a mock NextRequest with the given body
 */
function createMockRequest(body: any): NextRequest {
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

describe('Chat API Limits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should reject requests with no message', async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Message is required');
  });

  test('should reject messages exceeding maximum length', async () => {
    // Create a very long message
    const longMessage = 'a'.repeat(10000);
    const request = createMockRequest({ message: longMessage });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Message is too long. Please keep your message under 8000 characters.');
  });

  test('should call the Harvard API endpoint with correct parameters', async () => {
    const request = createMockRequest({ 
      message: 'Test message about children education opportunities' 
    });
    
    await POST(request);
    
    // Check that fetch was called with the correct parameters
    expect(mockFetch).toHaveBeenCalledWith(
      'https://go.apis.huit.harvard.edu/ais-openai-direct-limited-schools/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'api-key': 'test-api-key'
        }),
        body: expect.any(String)
      })
    );
    
    // Check the payload
    const callArgs = mockFetch.mock.calls[0];
    const payload = JSON.parse(callArgs[1].body);
    
    expect(payload.model).toBe('gpt-4o-mini');
    expect(payload.temperature).toBe(0.7);
    expect(payload.messages).toHaveLength(2);
    expect(payload.messages[0].role).toBe('system');
    expect(payload.messages[1].role).toBe('user');
    expect(payload.messages[1].content).toBe('Test message about children education opportunities');
  });

  test('should reject off-topic messages', async () => {
    const request = createMockRequest({ 
      message: 'Tell me about quantum physics and string theory' 
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    // Should return a polite redirection message, not an error
    expect(response.status).toBe(200);
    expect(data.message).toContain("I'm focused on helping families improve opportunities for their children");
    
    // Should not have called the API for off-topic messages
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API connection error'));
    
    const request = createMockRequest({ 
      message: 'How can I find better schools for my children?' 
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process chat message');
    expect(data.details).toBe('API connection error');
  });

  test('should include conversation history when provided', async () => {
    const history = [
      { role: 'user', content: 'What are good schools in Boston?' },
      { role: 'assistant', content: 'There are several excellent schools in Boston.' }
    ];
    
    const request = createMockRequest({ 
      message: 'Tell me more about charter schools there',
      history
    });
    
    await POST(request);
    
    // Check that the history was included in the user message
    const callArgs = mockFetch.mock.calls[0];
    const payload = JSON.parse(callArgs[1].body);
    
    expect(payload.messages[1].content).toContain('Previous conversation');
    expect(payload.messages[1].content).toContain('What are good schools in Boston?');
    expect(payload.messages[1].content).toContain('There are several excellent schools in Boston.');
    expect(payload.messages[1].content).toContain('Tell me more about charter schools there');
  });
});
