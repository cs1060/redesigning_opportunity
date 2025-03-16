/**
 * @jest-environment jsdom
 */

import ChatWidget from '../js/chatWidget.js';
import { CONFIG } from '../js/config.js';

describe('ChatWidget', () => {
    let chatWidget;
    let mockFetch;

    beforeEach(() => {
        // Clear the DOM
        document.body.innerHTML = '';
        
        // Mock fetch with OpenAI response format
        mockFetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{
                        message: {
                            content: 'Test response from OpenAI'
                        }
                    }]
                })
            })
        );
        global.fetch = mockFetch;
        
        // Create new instance
        chatWidget = new ChatWidget();
        chatWidget.init();
    });

    afterEach(() => {
        // Cleanup
        jest.clearAllMocks();
    });

    test('should create chat interface elements', () => {
        const widget = document.querySelector('.chat-widget');
        const header = document.querySelector('.chat-header');
        const messages = document.querySelector('.chat-messages');
        const input = document.querySelector('.chat-input');
        const sendButton = document.querySelector('.chat-send-button');

        expect(widget).toBeTruthy();
        expect(header).toBeTruthy();
        expect(messages).toBeTruthy();
        expect(input).toBeTruthy();
        expect(sendButton).toBeTruthy();
    });

    test('should add welcome message on init', () => {
        const messages = document.querySelectorAll('.chat-message');
        const welcomeMessage = document.querySelector('.assistant-message');

        expect(messages.length).toBe(1);
        expect(welcomeMessage).toBeTruthy();
        expect(welcomeMessage.innerHTML).toContain('Welcome to Economic Mobility Guide');
    });

    test('should send message to OpenAI and receive response', async () => {
        const input = document.querySelector('.chat-input');
        const sendButton = document.querySelector('.chat-send-button');

        // Simulate user input
        input.value = 'Hello, test message';
        sendButton.click();

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if message was sent
        const messages = document.querySelectorAll('.chat-message');
        expect(messages.length).toBe(3); // Welcome message + user message + response

        // Check if fetch was called correctly with OpenAI configuration
        expect(mockFetch).toHaveBeenCalledWith(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.OPENAI_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant focused on providing guidance about economic mobility and opportunities for families. You help parents find better opportunities for their children, navigate educational resources, and understand community programs."
                    },
                    {
                        role: "user",
                        content: 'Hello, test message'
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        // Check if user message and response are displayed
        const userMessage = document.querySelector('.user-message');
        const assistantResponse = document.querySelectorAll('.assistant-message')[1];

        expect(userMessage.textContent).toBe('Hello, test message');
        expect(assistantResponse.textContent).toBe('Test response from OpenAI');
    });

    test('should handle OpenAI API errors gracefully', async () => {
        // Mock fetch to return an error
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500
            })
        );

        const input = document.querySelector('.chat-input');
        const sendButton = document.querySelector('.chat-send-button');

        // Simulate user input
        input.value = 'This should fail';
        sendButton.click();

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if error message is displayed
        const errorMessage = document.querySelectorAll('.assistant-message')[1];
        expect(errorMessage.textContent).toContain('I apologize, but I encountered an error');
    });

    test('should handle enter key press', () => {
        const input = document.querySelector('.chat-input');
        const sendMessageSpy = jest.spyOn(chatWidget, 'sendMessage');

        // Simulate enter key press
        const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
        input.value = 'Test message';
        input.dispatchEvent(enterEvent);

        expect(sendMessageSpy).toHaveBeenCalled();
    });

    test('should disable input while processing', async () => {
        const input = document.querySelector('.chat-input');
        const sendButton = document.querySelector('.chat-send-button');

        // Start sending a message
        input.value = 'Test message';
        sendButton.click();

        // Check if UI is disabled during processing
        expect(input.disabled).toBe(true);
        expect(sendButton.disabled).toBe(true);
        expect(input.placeholder).toBe('Processing...');

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if UI is enabled after processing
        expect(input.disabled).toBe(false);
        expect(sendButton.disabled).toBe(false);
        expect(input.placeholder).toBe('Ask about opportunities for your family...');
    });
});
