// Initialize Socket.IO
const socket = io();

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const voiceButton = document.getElementById('voiceButton');

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
}

// Load chat history when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    addWelcomeMessage();
});

function loadChatHistory() {
    fetch('/api/chat-history')
        .then(response => response.json())
        .then(messages => {
            chatMessages.innerHTML = '';
            messages.forEach(message => {
                appendMessage(message.content, message.is_bot, new Date(message.timestamp));
            });
            scrollToBottom();
        });
}

function addWelcomeMessage() {
    const welcomeMessage = `Hi! I'm your Action Plan Assistant. I can help you:
    • Show your next steps
    • Mark steps as completed
    • Check your progress
    
    Just ask me what you'd like to know!`;
    
    setTimeout(() => {
        appendMessage(welcomeMessage, true);
    }, 500);
}

// Message Handling
function sendMessage(message) {
    if (message.trim() === '') return;
    
    // Append user message
    appendMessage(message, false);
    
    // Clear input
    messageInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to server
    socket.emit('send_message', { message: message });
}

// Socket.IO Event Handlers
socket.on('receive_message', function(data) {
    // Remove typing indicator
    removeTypingIndicator();
    
    // Append bot message
    appendMessage(data.message, true);
});

function appendMessage(content, isBot, timestamp = new Date()) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatTime(timestamp);
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timeDiv);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator bot-message';
    indicator.innerHTML = `
        <div class="message-content">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Voice Recognition
function toggleVoiceRecognition() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
    }
    
    if (voiceButton.classList.contains('recording')) {
        recognition.stop();
    } else {
        recognition.start();
        voiceButton.classList.add('recording');
    }
}

recognition?.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript;
    sendMessage(transcript);
    voiceButton.classList.remove('recording');
});

recognition?.addEventListener('end', () => {
    voiceButton.classList.remove('recording');
});

// Action Plan Generation
function generateActionPlan() {
    const focusArea = document.getElementById('focusArea').value;
    if (!focusArea) {
        alert('Please select a focus area');
        return;
    }
    
    fetch('/api/action-steps/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ focus_area: focusArea })
    })
    .then(response => response.json())
    .then(data => {
        appendMessage(data.message, true);
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('Sorry, there was an error generating your action plan. Please try again.', true);
    });
}

// Utility Functions
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(date);
}

// Event Listeners
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage(this.value);
    }
});

sendButton.addEventListener('click', function() {
    sendMessage(messageInput.value);
});

voiceButton.addEventListener('click', toggleVoiceRecognition);

// Handle mobile keyboard issues
messageInput.addEventListener('focus', function() {
    setTimeout(scrollToBottom, 300);
});

// Prevent form submission
document.addEventListener('submit', function(e) {
    e.preventDefault();
});
