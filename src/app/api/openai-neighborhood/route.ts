// app/api/openai-neighborhood/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false
});

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured in environment variables');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that provides detailed neighborhood analysis data. 
                    Format your response as valid JSON. Your entire response must be valid JSON 
                    that can be parsed with JSON.parse().`
        },
        {
          role: "user",
          content: `Generate detailed neighborhood analysis data for this address: ${address}.
                    
                    Please include the following in your JSON response (your entire response must be valid JSON):
                    
                    "neighborhoodData": {
                      "schoolQuality": {
                        "score": [number between 1-10],
                        "description": [brief description of school quality],
                        "details": [array of 3-5 specific details about schools]
                      },
                      "safety": {
                        "score": [number between 1-10],
                        "description": [brief description of safety],
                        "details": [array of 3-5 specific details about safety]
                      },
                      "healthcare": {
                        "score": [number between 1-10],
                        "description": [brief description of healthcare],
                        "details": [array of 3-5 specific details about healthcare]
                      },
                      "amenities": {
                        "score": [number between 1-10],
                        "description": [brief description of amenities],
                        "details": [array of 3-5 specific details about amenities]
                      },
                      "housing": {
                        "score": [number between 1-10],
                        "description": [brief description of housing],
                        "details": [array of 3-5 specific details about housing]
                      },
                      "transportation": {
                        "score": [number between 1-10],
                        "description": [brief description of transportation],
                        "details": [array of 3-5 specific details about transportation]
                      }
                    }
                    
                    Each score should be a number between 1 and 10, where 10 is the best.
                    Make the data realistic and specific to the location provided.
                    Format everything as valid JSON.`
        }
      ]
    });

    // Extract the response content
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No content in the OpenAI response');
    }

    try {
      // Parse the JSON response
      const neighborhoodData = JSON.parse(responseContent);
      return NextResponse.json(neighborhoodData);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      throw new Error('Failed to parse the AI response as JSON');
    }
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to generate neighborhood data', details: errorMessage },
      { status: 500 }
    );
  }
}
