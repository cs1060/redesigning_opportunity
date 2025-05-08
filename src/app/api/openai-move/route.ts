// app/api/openai-move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isValidZipCode } from '../../../utils/geocodingUtils';

// Harvard custom API endpoint
const API_URL = 'https://go.apis.huit.harvard.edu/ais-openai-direct-limited-schools/v1/chat/completions';

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured in environment variables');
}

/**
 * Validates a US ZIP code
 * @param zipCode - The ZIP code to validate
 * @returns boolean indicating if the ZIP code is valid
 */
function validateZipCode(zipCode: string): boolean {
  // Check if the ZIP code is a valid US ZIP code format (5 digits or 5+4 format)
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

export async function POST(req: NextRequest) {
  try {
    console.log('Received request to /api/openai-move');
    
    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { zipCode, income, children, includeJobData = false } = body;

    if (!zipCode) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      );
    }

    // Format validation
    if (!validateZipCode(zipCode)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format' },
        { status: 400 }
      );
    }

    // Existence validation - check if the ZIP code actually exists
    const zipCodeExists = await isValidZipCode(zipCode);
    if (!zipCodeExists) {
      return NextResponse.json(
        { error: 'This ZIP code does not appear to be valid' },
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured', details: 'Please set the OPENAI_API_KEY environment variable' },
        { status: 500 }
      );
    }
    
    console.log('Making request to Harvard API endpoint');
    
    // Prepare the system message
    const systemMessage = `You are an AI assistant that provides personalized recommendations for families looking to 
move to improve their children's future opportunities. Format your response as valid JSON. 
Your entire response must be valid JSON that can be parsed with JSON.parse().`;

    // Prepare the user message
    const userMessage = `Generate detailed, personalized recommendations for a family considering moving to ZIP code: ${zipCode}.
Additional family information:
- Annual household income: ${income}
- Children: ${JSON.stringify(children)}

Please include the following in your JSON response (your entire response must be valid JSON):

1. townData: Information about the town/city in this ZIP code including name, website, and description.

2. neighborhoodData: Object with a topNeighborhoods array listing top 3 neighborhoods with scores (1-10) and descriptions.

3. schoolData: Array of school recommendations with:
   - name, rating (1-10), description, website
   - schoolType: "elementary", "middle", "high", or "all" based on grade levels
   - Make sure each school is appropriate for the children's ages:
      * Ages 5-10: elementary schools
      * Ages 11-13: middle schools
      * Ages 14-18: high schools

4. communityProgramData: Array of recommendations with:
   - name, description, website
   - ageRanges: Array of ["preschool", "elementary", "middle", "high", "all"]
   - genderFocus: "all", "boys", or "girls" if applicable
   - tags: Array of relevant categories like "stem", "arts", "sports", etc.

5. communityDemographics: Information about the community including:
   - population: Total population
   - medianAge: Median age of residents
   - ethnicComposition: Array of { group, percentage } objects
   - medianHousehold: Median household income
   - educationLevel: Array of { level, percentage } objects
   - religiousComposition: Array of objects with religion name and percentage

6. housingOptions: Array of housing recommendations with:
   - type: Housing type (e.g., "Single Family Home", "Apartment", etc.)
   - priceRange: Estimated price range as a string
   - averageSize: Average size as a string (e.g., "1,500 sq ft")
   - description: Brief description
   - suitability: Score (1-10) indicating how suitable this housing type is for the family
${includeJobData ? `

7. jobSectors: Array of promising job sectors in the area with:
   - name: Sector name
   - growthRate: Percentage growth rate as a number
   - medianSalary: Median salary as a string
   - description: Brief description
   - demandLevel: "high", "medium", or "low"

8. careerAdvice: Object with:
   - forIncome: Advice specific to the family's income level
   - forFamilySize: Advice specific to the family size
   - generalAdvice: General career advice for the area
   - recommendedSectors: Array of sector names that would be good matches` : ''}

Format everything as valid JSON.`;

    // Prepare the payload for the Harvard API endpoint
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }  // Force JSON output
    };

    // Make the API call to the Harvard endpoint
    let completion;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': `${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      // Check if the API call was successful
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        return NextResponse.json(
          { error: `API returned status code ${response.status}: ${response.statusText}` },
          { status: 500 }
        );
      }

      // Parse the API response
      completion = await response.json();
    } catch (apiError) {
      console.error('Error calling Harvard API:', apiError);
      return NextResponse.json(
        { 
          error: 'Failed to generate recommendations from API', 
          details: apiError instanceof Error ? apiError.message : String(apiError) 
        },
        { status: 500 }
      );
    }

    // Extract the response content
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      console.error('No content in the API response');
      return NextResponse.json(
        { error: 'Empty response from API', rawResponse: JSON.stringify(completion) },
        { status: 500 }
      );
    }

    try {
      // Parse the JSON response
      const recommendations = JSON.parse(responseContent);
      
      // Validate the response structure
      if (!recommendations.townData || !recommendations.schoolData) {
        console.error('Invalid response structure:', recommendations);
        // Instead of throwing an error, return the data we have with a warning
        return NextResponse.json({
          ...recommendations,
          warning: 'Response may be missing some required fields'
        });
      }
      
      return NextResponse.json(recommendations);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      
      // Try to determine if the response is actually valid JSON but not in our expected format
      try {
        // If this is valid JSON but not in our expected format, let's return it anyway
        const jsonData = JSON.parse(responseContent);
        console.log('Response is valid JSON but not in expected format');
        
        return NextResponse.json({
          ...jsonData,
          warning: 'Response format may not match expected structure'
        });
      } catch {
        // If we get here, it's really not valid JSON
        return NextResponse.json(
          { error: 'Failed to parse the AI response as JSON', rawResponse: responseContent },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: errorMessage },
      { status: 500 }
    );
  }
}