import { CONFIG } from './config.js';

class ChatWidget {
    constructor() {
        this.messages = [];
        this.container = null;
        this.messageList = null;
        this.inputField = null;
        this.sendButton = null;
        this.isProcessing = false;
    }

    init() {
        this.createChatInterface();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    createChatInterface() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'chat-widget';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'chat-header';
        header.innerHTML = '<h3>Economic Mobility Assistant</h3>';
        
        // Create messages container
        this.messageList = document.createElement('div');
        this.messageList.className = 'chat-messages';
        
        // Create input area
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chat-input-container';
        
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'chat-input-wrapper';
        
        this.inputField = document.createElement('input');
        this.inputField.type = 'text';
        this.inputField.className = 'chat-input';
        this.inputField.placeholder = 'Ask about opportunities for your family...';
        
        this.sendButton = document.createElement('button');
        this.sendButton.className = 'chat-send-button';
        this.sendButton.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>';
        
        inputWrapper.appendChild(this.inputField);
        inputWrapper.appendChild(this.sendButton);
        inputContainer.appendChild(inputWrapper);
        
        this.container.appendChild(header);
        this.container.appendChild(this.messageList);
        this.container.appendChild(inputContainer);
        
        document.body.appendChild(this.container);
    }

    attachEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = `<div class="welcome-message">
            <h3>Welcome to Economic Mobility Guide! 👋</h3>
            <p>I'm here to help you:</p>
            <ul><li>Find opportunities for your children</li><li>Navigate our Opportunity Map</li><li>Create personalized action plans</li><li>Connect with community resources</li></ul>
            <p>How can I assist you today?</p>
        </div>`;
        
        this.addMessageToChat('assistant', welcomeMessage);
    }

    async sendMessage() {
        if (this.isProcessing) return;

        const message = this.inputField.value.trim();
        if (!message) return;

        try {
            this.isProcessing = true;
            this.updateUIState(true);

            // Add user message to chat
            this.addMessageToChat('user', message);
            this.inputField.value = '';

            // Show typing indicator
            this.showTypingIndicator();

            const response = await this.sendToOpenAI(message);
            
            // Remove typing indicator and add response
            this.removeTypingIndicator();
            this.addMessageToChat('assistant', response);

        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessageToChat('assistant', 'I apologize, but I encountered an error. Please try again.');
        } finally {
            this.isProcessing = false;
            this.updateUIState(false);
        }
    }

    addMessageToChat(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = content;
        
        // Add margin between messages if they're from the same sender
        const lastMessage = this.messageList.lastElementChild;
        if (lastMessage && lastMessage.classList.contains(`${sender}-message`)) {
            messageDiv.style.marginTop = '4px';
        }
        
        this.messageList.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messages.push({ sender, content });
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        this.messageList.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = this.messageList.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.messageList.scrollTop = this.messageList.scrollHeight;
    }

    updateUIState(isProcessing) {
        this.inputField.disabled = isProcessing;
        this.sendButton.disabled = isProcessing;
        this.inputField.placeholder = isProcessing ? 'Processing...' : 'Ask about opportunities for your family...';
    }

    async sendToOpenAI(message) {
        const response = await fetch(CONFIG.API_ENDPOINT, {
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
                        content: "You are a helpful assistant focused on providing guidance about economic mobility and opportunities for families. Help parents find better opportunities for their children by providing specific, actionable advice about education, housing, and community resources. Format your responses with clear sections using markdown-style headers (e.g., ## Education, ## Housing) and bullet points for key takeaways. Keep responses informative but concise."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response from OpenAI');
        }

        const data = await response.json();
        return this.formatResponse(data.choices[0].message.content);
    }

    formatResponse(content) {
        // Handle markdown formatting
        content = content
            // Headers
            .replace(/^###\s+(.+)$/gm, '<h4>$1</h4>')
            .replace(/^##\s+(.+)$/gm, '<h3>$1</h3>')
            .replace(/^#\s+(.+)$/gm, '<h2>$1</h2>')
            
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            
            // Italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            
            // Lists
            .replace(/(?:^|\n)[-*]\s+([^\n]+)/g, (match, p1) => {
                if (!match.startsWith('\n')) {
                    return `<ul><li>${p1}</li></ul>`;
                }
                return `\n<ul><li>${p1}</li></ul>`;
            })
            
            // Merge adjacent lists
            .replace(/<\/ul>\s*<ul>/g, '')
            
            // Add minimal spacing between sections
            .replace(/<\/h[234]>/g, '</h$&><div style="margin: 4px 0;"></div>')
            
            // Handle code blocks
            .replace(/```(\w+)?\n([\s\S]+?)\n```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            
            // Convert remaining line breaks to paragraphs
            .split('\n')
            .filter(line => line.trim())
            .map(para => {
                if (para.match(/<(h[234]|ul|pre|code)>/)) return para;
                return `<p>${para}</p>`;
            })
            .join('');
        
        return content;
    }
}

// Export the ChatWidget class
export default ChatWidget;
