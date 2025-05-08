// app/api/openai-move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { batchVerify } from '../../../utils/factCheckUtils';
import { geocodeZipCode, isValidZipCode } from '../../../utils/geocodingUtils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false
});

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

/**
 * Fact-checks the AI-generated recommendations
 * @param recommendations - The recommendations object from OpenAI
 * @param zipCode - The ZIP code for context
 * @returns The recommendations with fact-checking results added
 */
// Define the structure of the recommendations object to avoid using 'any'
interface MoveRecommendations {
  townData: {
    name: string;
    website: string;
    description: string;
    verified?: boolean;
    verificationConfidence?: number;
    warning?: string;
    websiteVerified?: boolean;
    websiteWarning?: string;
  };
  neighborhoodData: {
    topNeighborhoods: Array<{
      name: string;
      score: number;
      description: string;
      verified?: boolean;
      verificationConfidence?: number;
      warning?: string;
    }>;
  };
  schoolData: Array<{
    name: string;
    rating: number;
    description: string;
    website: string;
    schoolType: string;
    verified?: boolean;
    verificationConfidence?: number;
    warning?: string;
    websiteVerified?: boolean;
    websiteWarning?: string;
  }>;
  communityProgramData: Array<{
    name: string;
    description: string;
    website: string;
    ageRanges: string[];
    genderFocus: string;
    tags: string[];
    verified?: boolean;
    verificationConfidence?: number;
    warning?: string;
    websiteVerified?: boolean;
    websiteWarning?: string;
  }>;
  communityDemographics: {
    population: number;
    medianAge: number;
    ethnicComposition: Array<{
      group: string;
      percentage: number;
    }>;
    medianHousehold: string;
    educationLevel: Array<{
      level: string;
      percentage: number;
    }>;
    religiousComposition: Array<{
      religion: string;
      percentage: number;
    }>;
  };
  housingOptions: Array<{
    type: string;
    priceRange: string;
    size: string;
    suitability: number;
  }>;
  jobSectors?: Array<{
    name: string;
    growthRate: number;
    medianSalary: string;
    description: string;
    demandLevel: string;
  }>;
  careerAdvice?: {
    forIncome: string;
    forFamilySize: string;
    generalAdvice: string;
    recommendedSectors: string[];
  };
  aiDisclaimer?: string;
  warning?: string;
}

async function factCheckRecommendations(recommendations: MoveRecommendations, zipCode: string): Promise<MoveRecommendations> {
  // Get location information for context
  const locationInfo = await geocodeZipCode(zipCode);
  const state = locationInfo?.stateCode || '';
  const city = locationInfo?.city || '';
  
  // Create a list of items to verify
  const itemsToVerify = [];
  
  // Add town name to verification list
  if (recommendations.townData && recommendations.townData.name) {
    itemsToVerify.push({
      id: 'town',
      claim: recommendations.townData.name,
      context: `town or city in ZIP code ${zipCode} ${state ? 'in ' + state : ''}`
    });
  }
  
  // Add town website to verification list
  if (recommendations.townData && recommendations.townData.website) {
    itemsToVerify.push({
      id: 'town-website',
      claim: recommendations.townData.website,
      context: `website for ${recommendations.townData.name || 'town'}`
    });
  }
  
  // Add neighborhoods to verification list
  if (recommendations.neighborhoodData && recommendations.neighborhoodData.topNeighborhoods) {
    recommendations.neighborhoodData.topNeighborhoods.forEach((neighborhood, index) => {
      if (neighborhood.name) {
        itemsToVerify.push({
          id: `neighborhood-${index}`,
          claim: neighborhood.name,
          context: `neighborhood in ${recommendations.townData?.name || ''} ${zipCode}`
        });
      }
    });
  }
  
  // Add schools to verification list
  if (recommendations.schoolData) {
    recommendations.schoolData.forEach((school, index) => {
      if (school.name) {
        itemsToVerify.push({
          id: `school-${index}`,
          claim: school.name,
          context: `school in ${recommendations.townData?.name || ''} ${zipCode}`
        });
      }
      
      if (school.website) {
        itemsToVerify.push({
          id: `school-website-${index}`,
          claim: school.website,
          context: `website for ${school.name || 'school'}`
        });
      }
    });
  }
  
  // Add community programs to verification list
  if (recommendations.communityProgramData) {
    recommendations.communityProgramData.forEach((program, index) => {
      if (program.name) {
        itemsToVerify.push({
          id: `program-${index}`,
          claim: program.name,
          context: `community program in ${recommendations.townData?.name || ''} ${zipCode}`
        });
      }
      
      if (program.website) {
        itemsToVerify.push({
          id: `program-website-${index}`,
          claim: program.website,
          context: `website for ${program.name || 'program'}`
        });
      }
    });
  }
  
  // Batch verify all items
  if (itemsToVerify.length > 0) {
    const verificationResults = await batchVerify(itemsToVerify);
    
    // Create a map of results for easy lookup
    const resultMap = new Map();
    verificationResults.forEach(result => {
      resultMap.set(result.id, result);
    });
    
    // Update town data with verification results
    const townItem = resultMap.get('town');
    if (townItem) {
      recommendations.townData.verified = townItem.exists;
      recommendations.townData.verificationConfidence = townItem.confidence;
      if (!townItem.exists) {
        recommendations.townData.warning = `We couldn't verify this town name. It might be incorrect or the AI may have generated a fictional name.`;
      }
    }
    
    const townWebsiteItem = resultMap.get('town-website');
    if (townWebsiteItem) {
      recommendations.townData.websiteVerified = townWebsiteItem.exists;
      if (!townWebsiteItem.exists) {
        recommendations.townData.websiteWarning = `We couldn't verify this website.`;
      }
    }
    
    // Update neighborhood data with verification results
    if (recommendations.neighborhoodData && recommendations.neighborhoodData.topNeighborhoods) {
      recommendations.neighborhoodData.topNeighborhoods.forEach((neighborhood, index) => {
        const neighborhoodItem = resultMap.get(`neighborhood-${index}`);
        if (neighborhoodItem) {
          neighborhood.verified = neighborhoodItem.exists;
          neighborhood.verificationConfidence = neighborhoodItem.confidence;
          if (!neighborhoodItem.exists) {
            neighborhood.warning = `We couldn't verify this neighborhood. It might be incorrect or the AI may have generated a fictional name.`;
          }
        }
      });
    }
    
    // Update school data with verification results
    if (recommendations.schoolData) {
      recommendations.schoolData.forEach((school, index) => {
        const schoolItem = resultMap.get(`school-${index}`);
        if (schoolItem) {
          school.verified = schoolItem.exists;
          school.verificationConfidence = schoolItem.confidence;
          if (!schoolItem.exists) {
            school.warning = `We couldn't verify this school. It might be incorrect or the AI may have generated a fictional name.`;
          }
        }
        
        const schoolWebsiteItem = resultMap.get(`school-website-${index}`);
        if (schoolWebsiteItem) {
          school.websiteVerified = schoolWebsiteItem.exists;
          if (!schoolWebsiteItem.exists) {
            school.websiteWarning = `We couldn't verify this website.`;
          }
        }
      });
    }
    
    // Update community program data with verification results
    if (recommendations.communityProgramData) {
      recommendations.communityProgramData.forEach((program, index) => {
        const programItem = resultMap.get(`program-${index}`);
        if (programItem) {
          program.verified = programItem.exists;
          program.verificationConfidence = programItem.confidence;
          if (!programItem.exists) {
            program.warning = `We couldn't verify this program. It might be incorrect or the AI may have generated a fictional name.`;
          }
        }
        
        const websiteItem = resultMap.get(`program-website-${index}`);
        if (websiteItem) {
          program.websiteVerified = websiteItem.exists;
          if (!websiteItem.exists) {
            program.websiteWarning = `We couldn't verify this website.`;
          }
        }
      });
    }
  }
  
  // Add a disclaimer to the recommendations
  recommendations.aiDisclaimer = "This information is generated by AI and may not be completely accurate. Please verify any important details before making decisions.";
  
  return recommendations;
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
    
    console.log('Making request to OpenAI API with model: gpt-3.5-turbo-1106');
    console.log('OpenAI API key available:', !!process.env.OPENAI_API_KEY);
    
    // Make the OpenAI API request
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106", // Using a more reliable model
        // Note: Not using response_format: { type: "json_object" } with project-scoped API keys
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that provides personalized recommendations for families looking to 
                      move to improve their children's future opportunities. Format your response as valid JSON. 
                      Your entire response must be valid JSON that can be parsed with JSON.parse().`
          },
          {
            role: "user",
            content: `Generate detailed, personalized recommendations for a family considering moving to ZIP code: ${zipCode}.
                      Additional family information:
                      - Annual household income: ${income}
                      - Children: ${JSON.stringify(children)}
                      
                      Please include the following in your JSON response (your entire response must be valid JSON):
                      
                      1. townData: Information about the town/city in this ZIP code including name, website, and description.
                      
                      2. neighborhoodData: Object with a topNeighborhoods array listing top 3 neighborhoods with scores (1-10) and descriptions.
                      
                      3. schoolData: Array of school recommendations with:
                         - name, rating (1-10), description
                         - For the website field, DO NOT try to provide the exact school website URL. Instead, provide a Google search URL in this format: "https://www.google.com/search?q=school+name+town+state" (replace spaces with +)
                         - schoolType: "elementary", "middle", "high", or "all" based on grade levels
                         - Make sure each school is appropriate for the children's ages:
                           * Ages 5-10: elementary schools
                           * Ages 11-13: middle schools
                           * Ages 14-18: high schools
                      
                      4. communityProgramData: Array of recommendations with:
                         - name, description
                         - For the website field, provide a Google search URL in this format: "https://www.google.com/search?q=program+name+town+state" (replace spaces with +)
                         - ageRanges: Array of ["preschool", "elementary", "middle", "high", "all"]
                         - genderFocus: "all", "boys", or "girls" if applicable
                         - tags: Array of relevant categories like "stem", "arts", "sports", etc.
                         - Make recommendations based on the children's ages, genders, and family income
                      
                      5. communityDemographics: Include the following data:
                         - population: Total population number
                         - medianAge: Median age of residents
                         - ethnicComposition: Array of objects with group name and percentage
                         - medianHousehold: Median household income
                         - educationLevel: Array of objects with education level and percentage
                         - religiousComposition: Array of objects with religion name and percentage (include major religions like Christian, Jewish, Muslim, Hindu, Non-religious, etc.)
                      
                      6. housingOptions: Array with different housing types, price ranges, and sizes
                         - Include a suitability field (1-5) indicating how suitable each option is for this family's size and income
                      
                      ${includeJobData ? `
                      7. jobSectors: Array of job sectors in the area with:
                         - name: Sector name (e.g., "Healthcare", "Technology", "Education")
                         - growthRate: Percentage growth rate (numeric value)
                         - medianSalary: Median salary as string (e.g., "$75,000")
                         - description: Brief description of job opportunities in this sector
                         - demandLevel: "high", "medium", or "low" indicating demand for workers
                      
                      8. careerAdvice: Object with personalized career advice for this family:
                         - forIncome: Advice specific to their income level
                         - forFamilySize: Advice considering their family size
                         - generalAdvice: General career advice for the area
                         - recommendedSectors: Array of sector names that would be good matches
                      ` : ''}
                      
                      Format everything as valid JSON.`
          }
        ]
      });
    } catch (openaiError) {
      console.error('Error calling OpenAI API:', openaiError);
      return NextResponse.json(
        { 
          error: 'Failed to generate recommendations from OpenAI API', 
          details: openaiError instanceof Error ? openaiError.message : String(openaiError) 
        },
        { status: 500 }
      );
    }

    // Extract the response content
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No content in the OpenAI response');
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
      
      // Fact-check the recommendations
      const factCheckedRecommendations = await factCheckRecommendations(recommendations, zipCode);
      
      return NextResponse.json(factCheckedRecommendations);
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
