import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWidget from '../../src/components/ChatWidget';
import '@testing-library/jest-dom';
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ChatWidget Component', () => {
  // Setup default mock responses
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        message: 'This is a response from the AI assistant.',
        error: null
      })
    });
    
    // Mock scrollIntoView to prevent errors
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
  });
  
  // Restore mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('should render chat button initially', () => {
    render(<ChatWidget />);
    
    // Chat button should be visible
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    expect(chatButton).toBeInTheDocument();
    
    // Chat window should not be visible initially
    const chatWindow = screen.queryByText('Opportunity AI Assistant');
    expect(chatWindow).not.toBeInTheDocument();
  });

  test('should show popup after delay', async () => {
    render(<ChatWidget />);
    
    // Popup should not be visible initially
    expect(screen.queryByText('Chat with me! 👋')).not.toBeInTheDocument();
    
    // Advance timers to trigger the popup
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Popup should now be visible
    expect(screen.getByText('Chat with me! 👋')).toBeInTheDocument();
  });

  test('should open chat when button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<ChatWidget />);
    
    // Click the chat button
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Chat window should be visible
    const chatHeader = screen.getByText('Opportunity AI Assistant');
    expect(chatHeader).toBeInTheDocument();
    
    // Initial welcome message should be displayed
    expect(screen.getByText(/Hi there! 👋 How can I help you/i)).toBeInTheDocument();
  });

  test('should close chat when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<ChatWidget />);
    
    // Open the chat
    const openButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(openButton);
    
    // Chat window should be visible
    expect(screen.getByText('Opportunity AI Assistant')).toBeInTheDocument();
    
    // Click the close button in the header - using getAllByLabelText since there might be multiple
    const closeButtons = screen.getAllByLabelText('Close chat');
    // Use the smaller one which is likely in the header
    const headerCloseButton = closeButtons.find(button => 
      button.querySelector('svg[height="16"]') !== null
    );
    await user.click(headerCloseButton || closeButtons[0]);
    
    // Chat window should no longer be visible
    expect(screen.queryByText('Opportunity AI Assistant')).not.toBeInTheDocument();
  });

  test('should send message and display response', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<ChatWidget />);
    
    // Open the chat
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Type a message
    const inputField = screen.getByPlaceholderText('Type your question...');
    await user.type(inputField, 'Hello, how are you?');
    
    // Send the message - find the send button by its disabled state first
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).not.toBeDisabled();
    await user.click(sendButton);
    
    // User message should be displayed
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    
    // Wait for API response
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
    }, { timeout: 2000 });
    
    // Simulate API response
    await waitFor(() => {
      expect(screen.getByText('This is a response from the AI assistant.')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Input field should be cleared
    expect(inputField).toHaveValue('');
  });

  test('should send message with Enter key', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<ChatWidget />);
    
    // Open the chat
const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Type a message and press Enter
    const inputField = screen.getByPlaceholderText('Type your question...');
    await user.type(inputField, 'Hello{Enter}');
    
    // User message should be displayed
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Wait for API response
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
    }, { timeout: 2000 });
  });

  test('should not send empty messages', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<ChatWidget />);
    
    // Open the chat
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Try to send an empty message
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    // No new messages should be displayed (only the welcome message)
    const messages = screen.getAllByText(/./i, { selector: '.p-3.rounded-lg' });
    expect(messages.length).toBe(1); // Only welcome message
    
    // API should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should handle API errors gracefully', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock a failed API response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    
    render(<ChatWidget />);
    
    // Open the chat
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Type and send a message
    const inputField = screen.getByPlaceholderText('Type your question...');
    await user.type(inputField, 'Hello');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    // Wait for API call to fail
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    }, { timeout: 2000 });
    
    // Check if the loading state is cleared
    await waitFor(() => {
      expect(inputField).not.toBeDisabled();
    }, { timeout: 2000 });
    
    // Clean up
    consoleSpy.mockRestore();
  });

  test('should clear chat history when clear button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<ChatWidget />);
    
    // Open the chat
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Type and send a message
    const inputField = screen.getByPlaceholderText('Type your question...');
    await user.type(inputField, 'Hello');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    // Wait for API response
    await waitFor(() => {
      expect(screen.getByText('This is a response from the AI assistant.')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Click the clear button
    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);
    
    // Check that localStorage was called to update the messages
    expect(localStorageMock.setItem).toHaveBeenCalledWith('chat-messages', expect.any(String));
    
    // Check that the initial message is still there
    expect(screen.getByText(/Hi there! 👋/)).toBeInTheDocument();
  });

  test('should persist messages in localStorage', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    // Mock localStorage.getItem to return a specific value for the second render
    const mockMessages = JSON.stringify([
      {
        role: 'assistant',
        content: 'Hi there! 👋 How can I help you with your family\'s opportunities today?',
        timestamp: new Date().toISOString()
      },
      {
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant',
        content: 'This is a response from the AI assistant.',
        timestamp: new Date().toISOString()
      }
    ]);
    
    // First render and interaction to verify setItem is called
    const { unmount } = render(<ChatWidget />);
    
    // Open the chat
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Type and send a message
    const inputField = screen.getByPlaceholderText('Type your question...');
    await user.type(inputField, 'Hello');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    // Verify localStorage.setItem was called
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chat-messages', expect.any(String));
    }, { timeout: 2000 });
    
    // Unmount the component
    unmount();
    
    // Mock localStorage.getItem for the second render
    localStorageMock.getItem.mockReturnValueOnce(mockMessages);
    
    // Render the component again
    render(<ChatWidget />);
    
    // Open the chat again
    const newChatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(newChatButton);
    
    // Previous messages should be loaded from localStorage
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('should format timestamps correctly', async () => {
    // This test is simplified to just test the timestamp formatting
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    // Directly render the component
    render(<ChatWidget />);
    
    // Open the chat
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Check that the initial message has a timestamp
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2} [AP]M/, { exact: false });
    expect(timeElements.length).toBeGreaterThan(0);
  });

  test('should handle shift+enter for new lines', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<ChatWidget />);
    
    // Open the chat
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Type a message with shift+enter
    const inputField = screen.getByPlaceholderText('Type your question...');
    await user.type(inputField, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
    
    // Message should contain a newline and not be sent
    expect(inputField).toHaveValue('Line 1\nLine 2');
    expect(global.fetch).not.toHaveBeenCalled();
    
    // Now send the message
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    // Wait for the message to be displayed
    await waitFor(() => {
      // Use a more flexible approach to find the text with newlines
      const messages = screen.getAllByText(/Line 1/, { exact: false });
      expect(messages.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  test('should disable input during loading', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    // Delay the API response
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: async () => ({ 
              message: 'This is a response from the AI assistant.',
              error: null
            })
          }), 
          1000
        )
      )
    );
    
    render(<ChatWidget />);
    
    // Open the chat
    const chatButton = screen.getByRole('button', { name: /open chat/i });
    await user.click(chatButton);
    
    // Type and send a message
    const inputField = screen.getByPlaceholderText('Type your question...');
    await user.type(inputField, 'Hello');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    // Input should be disabled during loading
    expect(inputField).toBeDisabled();
    
    // Advance timers to complete the API call
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Wait for API response
    await waitFor(() => {
      expect(screen.getByText('This is a response from the AI assistant.')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Input should be enabled again
    expect(inputField).not.toBeDisabled();
  });
});
