// app/api/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callHarvardOpenAI } from '@/utils/harvardOpenAI';

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured in environment variables');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, income, children } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Validate input data
    if (!Array.isArray(children)) {
      return NextResponse.json(
        { error: 'Children data must be an array' },
        { status: 400 }
      );
    }

    const systemMessage = `You are an AI assistant that provides personalized recommendations for families looking to 
                    improve their children's future opportunities in their current location. Format your response as valid JSON. 
                    Your entire response must be valid JSON that can be parsed with JSON.parse().
                    
                    IMPORTANT: You must provide REAL, FACTUAL information about schools and community programs 
                    for the specific location provided. If you're unsure about a particular school or program, 
                    it's better to provide fewer but more accurate recommendations than many potentially inaccurate ones.
                    DO NOT return "no schools found" unless you are absolutely certain there are no schools in the area.`;

    const userMessage = `Generate detailed, personalized recommendations for a family living at this address: ${address}.
                    Additional family information:
                    - Annual household income: ${income}
                    - Children: ${JSON.stringify(children)}
                    
                    Please include the following in your JSON response (your entire response must be valid JSON):
                    
                    1. townData: Information about their current town/city including name, website, and description.
                    
                    2. schoolData: Array of REAL, VERIFIED school recommendations in or near ${address} with:
                       - name, rating (1-10), description, website
                       - schoolType: "elementary", "middle", "high", or "all" based on grade levels
                       - Make sure each school is appropriate for the children's ages:
                         * Ages 5-10: elementary schools
                         * Ages 11-13: middle schools
                         * Ages 14-18: high schools
                       - IMPORTANT: These MUST be real schools that actually exist in the location. Include public, charter, 
                         private, and specialized schools. Most neighborhoods have multiple school options within reasonable distance.
                       - If you cannot find specific information about a school, provide at least its name and location.
                    
                    3. communityProgramData: Array of community program recommendations relevant to ${address} with:
                       - name, description, website
                       - ageRanges: Array of ["preschool", "elementary", "middle", "high", "all"]
                       - genderFocus: "all", "boys", or "girls" if applicable
                       - tags: Array of relevant categories like "stem", "arts", "sports", etc.
                       - Make recommendations based on the children's ages, genders, and family income
                       - Include local community centers, YMCAs, libraries, and other organizations that typically offer programs
                         for children in most communities.
                    
                    Format everything as valid JSON.
                    
                    CRITICAL: Be thorough in your research. Nearly every town and city has multiple schools and programs.
                    If you're unsure about specific details, it's better to provide basic information about real schools/programs
                    than to return "no schools found" or fabricate details.`;

    // Call the Harvard OpenAI API 
    const response = await callHarvardOpenAI(
      systemMessage,
      userMessage,
      {
        model: "gpt-4o-mini",
        temperature: 0.7,
        responseFormat: { type: "json_object" }
      }
    );

    // Extract the response content
    const responseData = await response.json();
    const responseContent = responseData.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No content in the API response');
    }

    try {
      // Clean the response content by removing markdown code blocks if present
      let cleanedResponse = responseContent;
      
      // Remove markdown code block syntax at the beginning (can be ```json, ``` json, etc.)
      cleanedResponse = cleanedResponse.replace(/^```\s*(?:json)?\s*\n/m, '');
      
      // Remove closing code block markers
      cleanedResponse = cleanedResponse.replace(/\n```\s*$/m, '');
      
      // If we still have a JSON parsing issue, try to extract JSON between code blocks
      if (cleanedResponse.includes('```')) {
        const jsonMatch = responseContent.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          cleanedResponse = jsonMatch[1];
        }
      }
      
      console.log('Cleaned response for parsing:', cleanedResponse.substring(0, 100) + '...');
      
      // Parse the JSON response
      const recommendations = JSON.parse(cleanedResponse);
      return NextResponse.json(recommendations);
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      console.log('Raw response:', responseContent);
      throw new Error('Failed to parse the AI response as JSON');
    }
  } catch (error) {
    console.error('Error in API call:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: errorMessage },
      { status: 500 }
    );
  }
}