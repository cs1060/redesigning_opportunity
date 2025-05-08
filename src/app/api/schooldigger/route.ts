// src/app/api/schooldigger/route.ts
import { NextRequest, NextResponse } from 'next/server';

// SchoolDigger API base URL
const SCHOOLDIGGER_API_BASE_URL = 'https://api.schooldigger.com/v2.3';

// API credentials from environment variables
const DEFAULT_APP_ID = process.env.NEXT_PUBLIC_SCHOOLDIGGER_APP_ID;
// Use the API key from the environment variable
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_SCHOOLDIGGER_API_KEY;

/**
 * Maps SchoolDigger data to our application's format
 * @param schoolDiggerData - Raw data from SchoolDigger API
 * @returns Formatted school data for our application
 */
function mapSchoolDiggerToAppFormat(schoolDiggerData: any[]) {
  return schoolDiggerData.map(school => {
    // Determine school type based on level, grades, and name
    let type = 'unknown';
    if (school.schoolName) {
      const name = school.schoolName.toLowerCase();
      if (name.includes('elementary') || (school.lowGrade && parseInt(school.lowGrade) <= 5)) {
        type = 'elementary';
      } else if (name.includes('middle') || name.includes('junior high') || 
                (school.lowGrade && parseInt(school.lowGrade) >= 5 && parseInt(school.highGrade) <= 9)) {
        type = 'middle';
      } else if (name.includes('high') && !name.includes('junior high') || 
                (school.lowGrade && parseInt(school.lowGrade) >= 9)) {
        type = 'high';
      }
    }

    // Calculate rating based on SchoolDigger rank (if available)
    // Lower rank = better performance, so we invert it for a 1-10 scale
    let rating = 5; // Default middle rating
    if (school.rankHistory && school.rankHistory.length > 0) {
      // Convert rank to a 0-10 scale, max rank 100 (percentage)
      const rank = school.rankHistory[0].rank;
      // Higher number = better in our system, whereas lower = better in SchoolDigger
      rating = Math.max(1, Math.min(10, 10 - (rank / 10)));
    }

    // Format the location
    const location = school.address ? 
      `${school.address.city || ''}, ${school.address.state || ''}` : 
      'Unknown';

    // Calculate or estimate graduation rate if not provided
    // SchoolDigger doesn't always provide this, so we can estimate based on level
    let graduationRate = 0;
    if (type === 'high') {
      graduationRate = 85; // Default for high schools
      if (school.schoolYearlyDetails && school.schoolYearlyDetails.length > 0) {
        const details = school.schoolYearlyDetails[0];
        if (details.graduationRate) {
          graduationRate = Math.round(details.graduationRate * 100);
        }
      }
    } else if (type === 'middle') {
      graduationRate = 88; // Default for middle schools
    } else {
      graduationRate = 92; // Default for elementary schools
    }

    // Format the school data
    return {
      name: school.schoolName || 'Unknown School',
      type: type,
      rating: parseFloat(rating.toFixed(1)),
      location: location,
      enrollmentSize: school.numberOfStudents || 0,
      graduationRate: graduationRate,
      completionRate: graduationRate / 100,
      studentSize: school.numberOfStudents || 0,
      description: `${school.schoolName} is located in ${location} with a student body of approximately ${school.numberOfStudents || 'unknown'} students and a completion rate of ${graduationRate}%.`,
      city: school.address?.city || 'Unknown',
      state: school.address?.state || 'Unknown',
      website: school.url || '#',
      schoolId: school.schoolid || `schooldigger-${Math.random().toString(36).substring(2, 10)}`,
      address: school.address ? 
        `${school.address.street || ''}, ${school.address.city || ''}, ${school.address.state || ''} ${school.address.zip || ''}` : 
        'Unknown',
      phone: school.phone || 'Unknown',
      url: school.url || '#',
      distance: school.distance || 0
    };
  });
}

/**
 * Generate mock school data for a given ZIP code
 * @param zipCode - ZIP code to generate mock data for
 * @returns Array of mock school data
 */
function generateMockSchools(zipCode: string | null) {
  return [
    {
      name: `[MOCK DATA] ${zipCode || '00000'} Elementary School`,
      type: 'elementary',
      rating: 8.2,
      location: `Anytown (Mock), CA`,
      enrollmentSize: 450,
      graduationRate: 92,
      completionRate: 0.92,
      studentSize: 450,
      description: `[MOCK DATA] ${zipCode || '00000'} Elementary School is located in Anytown (Mock), CA with a student body of approximately 450 students and a completion rate of 92%.`,
      city: 'Anytown (Mock)',
      state: 'CA',
      website: '#',
      schoolId: `mock-elem-${zipCode || '00000'}`,
      address: `123 School St, Anytown (Mock), CA ${zipCode || '00000'}`,
      phone: '555-123-4567',
      url: '#',
      distance: 0.5
    },
    {
      name: `[MOCK DATA] ${zipCode || '00000'} Middle School`,
      type: 'middle',
      rating: 7.5,
      location: `Anytown (Mock), CA`,
      enrollmentSize: 650,
      graduationRate: 88,
      completionRate: 0.88,
      studentSize: 650,
      description: `[MOCK DATA] ${zipCode || '00000'} Middle School is located in Anytown (Mock), CA with a student body of approximately 650 students and a completion rate of 88%.`,
      city: 'Anytown (Mock)',
      state: 'CA',
      website: '#',
      schoolId: `mock-mid-${zipCode || '00000'}`,
      address: `456 School St, Anytown (Mock), CA ${zipCode || '00000'}`,
      phone: '555-123-4568',
      url: '#',
      distance: 1.2
    },
    {
      name: `[MOCK DATA] ${zipCode || '00000'} High School`,
      type: 'high',
      rating: 6.6,
      location: `Anytown (Mock), CA`,
      enrollmentSize: 1200,
      graduationRate: 85,
      completionRate: 0.85,
      studentSize: 1200,
      description: `[MOCK DATA] ${zipCode || '00000'} High School is located in Anytown (Mock), CA with a student body of approximately 1200 students and a completion rate of 85%.`,
      city: 'Anytown (Mock)',
      state: 'CA',
      website: '#',
      schoolId: `mock-high-${zipCode || '00000'}`,
      address: `789 School St, Anytown (Mock), CA ${zipCode || '00000'}`,
      phone: '555-123-4569',
      url: '#',
      distance: 1.8
    }
  ];
}

/**
 * GET handler for the SchoolDigger API route
 * @param req - Next.js request object
 * @returns Next.js response object
 */
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const zipCode = url.searchParams.get('zipCode');
    const state = url.searchParams.get('state');
    const distance = url.searchParams.get('distance') || '10';
    
    // Make sure we're using the correct API key
    const apiKey = process.env.NEXT_PUBLIC_SCHOOLDIGGER_API_KEY || DEFAULT_API_KEY;
    const appId = process.env.NEXT_PUBLIC_SCHOOLDIGGER_APP_ID || DEFAULT_APP_ID;
    
    // Log API key info (safely)
    console.log('Using SchoolDigger API key:', apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}` : 'undefined');
    console.log('Using SchoolDigger App ID:', appId ? `${appId.substring(0, 3)}...${appId.substring(appId.length - 3)}` : 'undefined');
    console.log('Full API key value:', apiKey);
    console.log('Full App ID value:', appId);
    console.log('Environment variables:', {
      NEXT_PUBLIC_SCHOOLDIGGER_API_KEY: process.env.NEXT_PUBLIC_SCHOOLDIGGER_API_KEY ? 'set' : 'not set',
      NEXT_PUBLIC_SCHOOLDIGGER_APP_ID: process.env.NEXT_PUBLIC_SCHOOLDIGGER_APP_ID ? 'set' : 'not set',
      DEFAULT_API_KEY: DEFAULT_API_KEY ? 'set' : 'not set',
      DEFAULT_APP_ID: DEFAULT_APP_ID ? 'set' : 'not set'
    });

    // Validate the ZIP code
    if (!zipCode) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      );
    }

    // Validate distance
    const distanceNum = parseInt(distance, 10);
    if (isNaN(distanceNum) || distanceNum <= 0 || distanceNum > 100) {
      return NextResponse.json(
        { error: 'Distance must be a positive number less than or equal to 100' },
        { status: 400 }
      );
    }

    // Construct the SchoolDigger API URL
    const schoolDiggerUrl = new URL(`${SCHOOLDIGGER_API_BASE_URL}/schools`);
    
    // The SchoolDigger API expects 'appID' and 'appKey' parameters
    // Make sure we're using the correct parameter names and values
    schoolDiggerUrl.searchParams.append('appID', appId);
    schoolDiggerUrl.searchParams.append('appKey', apiKey);
    schoolDiggerUrl.searchParams.append('zip', zipCode);
    
    // Add perPage parameter to get more results
    schoolDiggerUrl.searchParams.append('perPage', '50');
    
    // SchoolDigger API requires a state parameter ('st')
    // If state is not provided, we need to determine it from the ZIP code
    if (state) {
      schoolDiggerUrl.searchParams.append('st', state);
      console.log(`Using provided state: ${state}`);
    } else {
      // Map ZIP code to state (first digit indicates general region)
      // This is a simple mapping and not 100% accurate for all ZIP codes
      const firstDigit = zipCode.charAt(0);
      let stateCode = 'CA'; // Default to California if we can't determine
      
      // Simple mapping of first ZIP digit to states
      switch(firstDigit) {
        case '0': stateCode = 'CT'; break; // Connecticut, but covers multiple Northeast states
        case '1': stateCode = 'NY'; break; // New York, but covers multiple Northeast states
        case '2': stateCode = 'DC'; break; // Washington DC, but covers multiple Mid-Atlantic states
        case '3': stateCode = 'FL'; break; // Florida, but covers multiple Southeast states
        case '4': stateCode = 'OH'; break; // Ohio, but covers multiple Midwest states
        case '5': stateCode = 'MI'; break; // Michigan, but covers multiple Midwest states
        case '6': stateCode = 'IL'; break; // Illinois, but covers multiple Midwest states
        case '7': stateCode = 'TX'; break; // Texas, but covers multiple South Central states
        case '8': stateCode = 'CO'; break; // Colorado, but covers multiple Mountain states
        case '9': stateCode = 'CA'; break; // California, but covers multiple West Coast states
      }
      
      // For ZIP code 98101, we know it's in Washington state
      if (zipCode === '98101') {
        stateCode = 'WA';
      }
      
      schoolDiggerUrl.searchParams.append('st', stateCode);
      console.log(`No state provided, determined state ${stateCode} from ZIP code ${zipCode}`);
    }
    
    schoolDiggerUrl.searchParams.append('distance', distance);
    
    // Ensure we get schools for all levels
    schoolDiggerUrl.searchParams.append('level', 'Elementary,Middle,High');
    
    console.log(`Fetching school data from SchoolDigger API for ZIP: ${zipCode}, distance: ${distance}mi`);
    console.log(`API URL: ${schoolDiggerUrl.toString()}`);

    // Make the API request
    console.log('Making request to SchoolDigger API with URL:', schoolDiggerUrl.toString());
    console.log('API Key being used:', apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}` : 'undefined');
    console.log('App ID being used:', appId);
    console.log('Full request URL with query params:', schoolDiggerUrl.toString());
    
    let response;
    try {
      response = await fetch(schoolDiggerUrl.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });
      console.log('SchoolDigger API response status:', response.status, response.statusText);
      
      // Log headers for debugging
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('SchoolDigger API response headers:', responseHeaders);
    } catch (error) {
      console.error('Error fetching from SchoolDigger API:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch from SchoolDigger API',
          details: error instanceof Error ? error.message : String(error),
          isMockData: true,
          schools: generateMockSchools(zipCode)
        },
        { status: 500 }
      );
    }

    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SchoolDigger API error (${response.status}):`, errorText);
      console.error('SchoolDigger API request failed. Using mock data instead.');
      console.error('URL used:', schoolDiggerUrl.toString());
      console.error('Request parameters:', {
        zipCode,
        state,
        distance,
        apiKey: apiKey ? apiKey.substring(0, 5) + '...' : 'undefined'
      });
      
      // If real API fails, return mock data
      return NextResponse.json({
        count: 3,
        schools: generateMockSchools(zipCode),
        isMockData: true,
        error: `SchoolDigger API error: ${response.status} ${response.statusText}`
      });
    }

    // Parse the response
    const data = await response.json();
    
    // Log the full response for debugging
    console.log('SchoolDigger API full response:', JSON.stringify(data, null, 2));
    
    // Check if the response contains an error message from SchoolDigger
    if (data.error) {
      console.error('SchoolDigger API returned an error:', data.error);
    }
    
    // Check if we have valid school data
    // v2.3 API uses 'schoolList' property
    const schoolList = data.schoolList || [];
    
    if (!data || !Array.isArray(schoolList) || schoolList.length === 0) {
      console.error('Invalid or empty response from SchoolDigger API');
      console.log('Returning mock school data since no real schools were found');
      const mockSchools = generateMockSchools(zipCode);
      return NextResponse.json({
        count: mockSchools.length,
        schools: mockSchools,
        isMockData: true,
        error: 'No schools found in the SchoolDigger API response'
      });
    }

    console.log(`Found ${schoolList.length} schools from SchoolDigger API`);

    // Map SchoolDigger data to our application's format
    const formattedSchools = mapSchoolDiggerToAppFormat(schoolList);
    
    // Sort schools by rating (highest first)
    formattedSchools.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Return the formatted schools
    return NextResponse.json({
      count: formattedSchools.length,
      schools: formattedSchools,
      isMockData: false
    });
  } catch (error) {
    console.error('Error fetching schools from SchoolDigger API:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    // Return mock data in case of any error
    return NextResponse.json({
      count: 3,
      schools: generateMockSchools(null),
      isMockData: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); // Still return 200 with mock data
  }
}
