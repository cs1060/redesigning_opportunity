import { NextRequest, NextResponse } from 'next/server';
import { callHarvardOpenAI } from '@/utils/harvardOpenAI';

// Define system prompt with knowledge about the application
const systemPrompt = `
You are a helpful assistant for the Opportunity AI application which helps families assess economic mobility opportunities in their communities and make informed decisions about staying or moving to improve their children's future prospects.

Key features of the application:
1. Interactive Opportunity Map: Shows economic mobility data by census tract
2. Personalization System: Collects family information to provide customized recommendations
3. Neighborhood Insights: Detailed metrics on schools, safety, healthcare, and amenities
4. Personalized Action Plans: "Stay & Improve" or "Explore New Areas" pathways
5. Community Connections: Resources for families

IMPORTANT INSTRUCTIONS FOR YOUR RESPONSES:
- Always use simple, everyday language that any parent can understand regardless of their education level
- Avoid jargon, technical terms, and complex vocabulary
- Explain concepts as if you're talking to someone with an 8th-grade reading level
- Use short sentences and simple words
- Break complex ideas into simple steps
- Use examples from everyday life to explain difficult concepts
- Be friendly, warm, and encouraging
- If you must use a technical term, immediately explain it in simple words

For example:
- Instead of "economic mobility" say "chances for children to earn more than their parents"
- Instead of "demographic data" say "information about the people who live there"
- Instead of "educational attainment" say "levels of schooling people have finished"

Be friendly, supportive, and focused on practical advice for families trying to create better futures for their children.
`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: Message[];
}

// Constants
const MAX_MESSAGE_LENGTH = 8000;
const MAX_HISTORY_MESSAGES = 10;

// Simple in-memory store for rate limiting
// In production, you would use Redis or another distributed store
const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT = 10; // Maximum requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Check rate limit for the given IP
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const ipData = ipRequestCounts.get(ip);
  
  if (!ipData) {
    // First request from this IP
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (now > ipData.resetTime) {
    // Reset window has passed
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (ipData.count >= RATE_LIMIT) {
    // Rate limit exceeded
    console.log('Rate limit exceeded for IP:', ip);
    return false;
  }
  
  // Increment request count
  ipData.count += 1;
  ipRequestCounts.set(ip, ipData);
  return true;
}

// Check if the user's message is related to the website's purpose
// This helps prevent users from using the chatbot for unrelated topics
function isRelevantTopic(message: string): boolean {
  // Convert message to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();
  
  // Define keywords and topics relevant to the application
  const relevantKeywords = [
    // Family and children related
    'child', 'children', 'family', 'kid', 'kids', 'parent', 'parents', 'parenting',
    
    // Education related
    'school', 'education', 'college', 'university', 'teacher', 'learning', 'student', 
    'classroom', 'grades', 'academic', 'study', 'scholarship', 'tuition', 'degree',
    
    // Housing and location related
    'neighborhood', 'community', 'city', 'town', 'area', 'location', 'move', 'moving', 
    'relocate', 'house', 'housing', 'apartment', 'rent', 'mortgage', 'home', 'property',
    
    // Economic mobility related
    'opportunity', 'opportunities', 'income', 'job', 'career', 'salary', 'wage', 'money', 
    'cost', 'finance', 'financial', 'expense', 'economic', 'poverty', 'wealth',
    
    // Services and programs
    'program', 'service', 'resource', 'support', 'assistance', 'help', 'benefit', 'aid',
    'community program', 'public service', 'government', 'grant', 'nonprofit',
    
    // Questions about the platform
    'how to', 'website', 'tool', 'data', 'map', 'information', 'advice', 'recommendation',
    'guide', 'plan', 'mobility', 'future', 'opportunity', 'decision', 'option'
  ];
  
  // Check if any relevant keyword is in the message
  return relevantKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Sanitize input to prevent injection attacks
// This doesn't modify the input but ensures it's treated as plain text
function sanitizeInput(input: string): string {
  // For now, we're just returning the input as-is since OpenAI handles it as plain text
  // In a production environment, you might want to implement more robust sanitization
  return input;
}

// Optimize token usage by truncating extremely long messages
function optimizeTokenUsage(message: string): string {
  if (message.length > MAX_MESSAGE_LENGTH) {
    return message.substring(0, MAX_MESSAGE_LENGTH) + 
      "... [Message truncated due to length]"; 
  }
  return message;
}

export async function POST(request: NextRequest) {
  // Get the client IP
  const ip = request.ip || 'unknown';
  
  // Check rate limit
  if (!checkRateLimit(ip)) {
    console.log('Rate limit exceeded for IP:', ip);
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    );
  }
  
  try {
    const { message, history } = await request.json() as ChatRequest;

    // Validate message
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Check message length
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep your message under 8000 characters.' },
        { status: 400 }
      );
    }

    // Sanitize and optimize the user message
    const sanitizedMessage = sanitizeInput(message);
    const optimizedMessage = optimizeTokenUsage(sanitizedMessage);

    // Check if the message is relevant to the website's purpose
    const isRelevant = isRelevantTopic(optimizedMessage);
    
    // If message is not relevant, return a polite but firm message redirecting to platform topics
    if (!isRelevant) {
      return NextResponse.json({ 
        message: "I'm focused on helping families improve opportunities for their children through education, housing, and community resources. I can help you with questions about schools, neighborhoods, family planning, economic mobility, and using our platform's tools. What specific information about your family's opportunities can I assist you with?"
      });
    }

    // Build the full user message including conversation history
    let fullUserMessage = optimizedMessage;
    
    // Add conversation history if provided (limited to last 10 messages for context)
    if (history && Array.isArray(history)) {
      // Filter out any system messages from the history to prevent prompt injection
      const userAndAssistantMessages = history.filter(
        msg => msg.role === 'user' || msg.role === 'assistant'
      ).slice(-MAX_HISTORY_MESSAGES);
      
      if (userAndAssistantMessages.length > 0) {
        // Format the conversation history as a string
        const historyText = userAndAssistantMessages.map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n\n');
        
        // Prepend the history to the user message
        fullUserMessage = `Previous conversation:\n${historyText}\n\nUser's new message: ${optimizedMessage}`;
      }
    }

    // Call Harvard OpenAI API with safety parameters
    const response = await callHarvardOpenAI(
      systemPrompt,
      fullUserMessage,
      {
        model: "gpt-4o-mini",
        temperature: 0.7
      }
    );
    
    // Parse the response
    const responseData = await response.json();
    
    // Extract the content from the response
    const content = responseData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    return NextResponse.json({ message: content });
  } catch (error: unknown) {
    console.error('Error processing chat message:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat message', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}