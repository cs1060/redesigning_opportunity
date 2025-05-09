/**
 * Harvard OpenAI API integration utility
 * 
 * This utility provides a standardized way to call the Harvard OpenAI API
 * while maintaining the existing OPENAI_API_KEY environment variable.
 */

/**
 * Interface for the API payload
 */
interface ApiPayload {
  model: string;
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
  temperature: number;
  response_format?: { type: string };
}

/**
 * Call the Harvard OpenAI API with the provided system message and user message
 * 
 * @param systemMessage - The system message to set context for the model
 * @param userMessage - The user message/query to send to the model
 * @param options - Additional options for the API call
 * @returns The API response
 */
export async function callHarvardOpenAI(
  systemMessage: string,
  userMessage: string,
  options: {
    model?: string;
    temperature?: number;
    responseFormat?: { type: string };
  } = {}
) {
  const API_URL =
    'https://go.apis.huit.harvard.edu/ais-openai-direct-limited-schools/v1/chat/completions';

  // Set default options
  const model = options.model || 'gpt-4o-mini';
  const temperature = options.temperature || 0.7;
  const responseFormat = options.responseFormat || undefined;

  // Prepare payload
  const payload: ApiPayload = {
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ],
    temperature
  };

  // Add response format if specified
  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured in environment variables');
  }

  // Make the API request
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': `${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  // Check if the request was successful
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`);
  }

  // Return the response
  return resp;
} 