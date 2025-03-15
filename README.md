# Resource Chatbot - Attempt 2

## Overview
Enhanced version with improved chat flow and dynamic resource generation using OpenAI's GPT model. This iteration focuses on making the chatbot more interactive and personalized.

## Features
- Integration with OpenAI API
- Dynamic resource generation
- Improved chat flow
- Enhanced error handling
- Session management
- Basic emergency resource handling

## Improvements from Attempt 1
1. Added OpenAI integration for dynamic responses
2. Implemented session management
3. Enhanced error handling
4. Improved UI responsiveness
5. Added basic emergency resource handling

## Structure
```
backend/
  ├── app.py         # Enhanced Flask server with OpenAI integration
  └── .env           # Environment variables (OpenAI API key)
frontend/
  └── src/
      ├── App.js     # Improved React chat interface
      └── App.css    # Enhanced styling
```

## Key Features
- Dynamic resource generation using GPT
- Session-based chat history
- Emergency vs non-emergency flow
- Improved error handling and user feedback

## Limitations
- Resources not well-organized
- Limited personalization
- Basic UI presentation
- No detailed resource information

## Learning Points
- OpenAI API integration
- Session management in Flask
- Enhanced error handling
- Improved state management
