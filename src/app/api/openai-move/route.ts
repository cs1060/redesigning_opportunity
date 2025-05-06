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
async function factCheckRecommendations(recommendations: Record<string, any>, zipCode: string) {
  // Get state information for the ZIP code to provide context
  const zipInfo = await geocodeZipCode(zipCode);
  
  // Items to verify
  const verificationItems = [];
  
  // Add town for verification
  if (recommendations.townData?.name) {
    verificationItems.push({
      type: 'place' as const,
      name: recommendations.townData.name,
      zipCode
    });
  }
  
  // Add town website for verification
  if (recommendations.townData?.website) {
    verificationItems.push({
      type: 'website' as const,
      name: recommendations.townData.website
    });
  }
  
  // Add neighborhoods for verification
  if (recommendations.neighborhoodData?.topNeighborhoods) {
    for (const neighborhood of recommendations.neighborhoodData.topNeighborhoods) {
      if (neighborhood.name) {
        verificationItems.push({
          type: 'place' as const,
          name: neighborhood.name,
          context: zipInfo?.state || '',
          zipCode
        });
      }
    }
  }
  
  // Add schools for verification
  if (recommendations.schoolData) {
    for (const school of recommendations.schoolData) {
      if (school.name) {
        verificationItems.push({
          type: 'school' as const,
          name: school.name,
          context: zipInfo?.state || ''
        });
      }
      if (school.website) {
        verificationItems.push({
          type: 'website' as const,
          name: school.website
        });
      }
    }
  }
  
  // Add community programs websites for verification
  if (recommendations.communityProgramData) {
    for (const program of recommendations.communityProgramData) {
      if (program.website) {
        verificationItems.push({
          type: 'website' as const,
          name: program.website
        });
      }
    }
  }
  
  // Perform batch verification
  const verificationResults = await batchVerify(verificationItems);
  
  // Process verification results
  // Create a map of verification items to their results
  const resultMap = new Map();
  verificationItems.forEach(item => {
    const key = `${item.type}:${item.name}`;
    resultMap.set(item, verificationResults[key]);
  });
  
  // Update town verification
  if (recommendations.townData?.name) {
    const townItem = verificationItems.find(item => 
      item.type === 'place' && item.name === recommendations.townData.name
    );
    if (townItem) {
      const result = resultMap.get(townItem);
      recommendations.townData.verified = result.exists;
      recommendations.townData.verificationConfidence = result.confidence || 0;
      if (!result.exists) {
        recommendations.townData.warning = `We couldn't verify that ${recommendations.townData.name} is a real town in this ZIP code.`;
      }
    }
  }
  
  // Update town website verification
  if (recommendations.townData?.website) {
    const websiteItem = verificationItems.find(item => 
      item.type === 'website' && item.name === recommendations.townData.website
    );
    if (websiteItem) {
      const result = resultMap.get(websiteItem);
      recommendations.townData.websiteVerified = result.exists;
      if (!result.exists) {
        recommendations.townData.websiteWarning = `We couldn't verify the township website.`;
      }
    }
  }
  
  // Update neighborhoods verification
  if (recommendations.neighborhoodData?.topNeighborhoods) {
    for (const neighborhood of recommendations.neighborhoodData.topNeighborhoods) {
      if (neighborhood.name) {
        const neighborhoodItem = verificationItems.find(item => 
          item.type === 'place' && item.name === neighborhood.name
        );
        if (neighborhoodItem) {
          const result = resultMap.get(neighborhoodItem);
          neighborhood.verified = result.exists;
          neighborhood.verificationConfidence = result.confidence || 0;
          if (!result.exists) {
            neighborhood.warning = `We couldn't verify that ${neighborhood.name} is a real neighborhood in this area.`;
          }
        }
      }
    }
  }
  
  // Update schools verification
  if (recommendations.schoolData) {
    for (const school of recommendations.schoolData) {
      if (school.name) {
        const schoolItem = verificationItems.find(item => 
          item.type === 'school' && item.name === school.name
        );
        if (schoolItem) {
          const result = resultMap.get(schoolItem);
          school.verified = result.exists;
          school.verificationConfidence = result.confidence || 0;
          if (!result.exists) {
            school.warning = `We couldn't verify that ${school.name} is a real school in this area.`;
          }
        }
      }
      if (school.website) {
        const websiteItem = verificationItems.find(item => 
          item.type === 'website' && item.name === school.website
        );
        if (websiteItem) {
          const result = resultMap.get(websiteItem);
          school.websiteVerified = result.exists;
          if (!result.exists) {
            school.websiteWarning = `We couldn't verify the school website.`;
          }
        }
      }
    }
  }
  
  // Update community programs website verification
  if (recommendations.communityProgramData) {
    for (const program of recommendations.communityProgramData) {
      if (program.website) {
        const websiteItem = verificationItems.find(item => 
          item.type === 'website' && item.name === program.website
        );
        if (websiteItem) {
          const result = resultMap.get(websiteItem);
          program.websiteVerified = result.exists;
          if (!result.exists) {
            program.websiteWarning = `We couldn't verify this website.`;
          }
        }
      }
    }
  }
  
  // Add a disclaimer to the recommendations
  recommendations.aiDisclaimer = "This information is generated by AI and may not be completely accurate. Please verify any important details before making decisions.";
  
  return recommendations;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    const completion = await openai.chat.completions.create({
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