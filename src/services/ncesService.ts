/**
 * Service to interact with the SchoolDigger API
 */
import { SchoolData } from '../components/action-plan/types';

// Base URL for the SchoolDigger API
const SCHOOLDIGGER_API_BASE_URL = 'https://api.schooldigger.com/v1';

/**
 * Interface for school data returned from the NCES API
 */
export interface NCESSchool {
  id: string;
  school: {
    name: string;
    city: string;
    state: string;
    zip: string;
    school_url: string;
    price_calculator_url?: string;
    school_type?: string;
  };
  latest: {
    student: {
      size: number;
      demographics?: {
        race_ethnicity?: {
          white: number;
          black: number;
          hispanic: number;
          asian: number;
          aian: number;
          nhpi: number;
          two_or_more: number;
          non_resident_alien: number;
        };
      };
    };
    academics?: {
      program_percentage?: {
        [key: string]: number;
      };
    };
    admissions?: {
      admission_rate?: {
        overall?: number;
      };
    };
    completion?: {
      rate?: {
        overall?: number;
      };
    };
    cost?: {
      avg_net_price?: {
        overall?: number;
      };
    };
  };
}

/**
 * Interface for NCES API response
 */
export interface NCESApiResponse {
  metadata: {
    total: number;
    page: number;
    per_page: number;
  };
  results: NCESSchool[];
}

/**
 * Search for schools by ZIP code
 * @param zipCode - The ZIP code to search for schools
 * @param distance - Distance in miles from the ZIP code (default: 10)
 * @param schoolTypes - Types of schools to include (default: all)
 * @returns Promise with the list of schools
 */
export async function searchSchoolsByZipCode(
  zipCode: string,
  distance: number = 10
): Promise<NCESSchool[]> {
  try {
    // Get the SchoolDigger API key directly from the environment variable
    // This should match exactly what's in .env.local
    const apiKey = process.env.SCHOOLDIGGER_API_KEY;
    console.log('SchoolDigger API key available:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');
    
    if (!apiKey || apiKey.trim() === '') {
      console.warn('SchoolDigger API key is not configured, using mock data');
      return getMockSchoolsData(zipCode);
    }

    // Log environment variable names for debugging (without exposing values)
    console.log('Available environment variables:', Object.keys(process.env)
      .filter(key => key.includes('SCHOOLDIGGER') || key.includes('API_KEY'))
      .join(', '));

    // Build the URL for SchoolDigger API
    // SchoolDigger API format: /schools?st={state}&zip={zipCode}&distance={distance}&appKey={apiKey}
    const url = new URL(`${SCHOOLDIGGER_API_BASE_URL}/schools`);
    
    // Add query parameters
    url.searchParams.append('zip', zipCode);
    url.searchParams.append('distance', distance.toString());
    url.searchParams.append('perPage', '50'); // Limit results to 50 schools
    url.searchParams.append('page', '1');
    url.searchParams.append('appKey', apiKey);
    
    // Log the full URL (but mask the API key for security)
    const maskedUrl = url.toString().replace(apiKey, 'XXXXX');
    console.log('Fetching schools from SchoolDigger API:', maskedUrl);

    // Make the API request to SchoolDigger
    console.log('Starting API request...');
    const response = await fetch(url.toString());
    console.log('API response received, status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SchoolDigger API error: ${response.status} - ${errorText}`);
      
      // If API key is invalid or other error, use mock data instead
      console.error('Invalid API key or other API error detected, using mock data instead');
      return getMockSchoolsData(zipCode);
    }

    // Parse SchoolDigger response
    console.log('Parsing response body...');
    const data = await response.json();
    console.log('SchoolDigger API response structure:', 
      Object.keys(data), 
      'Number of schools:', data.schoolList ? data.schoolList.length : 0);
    
    // Check if we have actual school data
    if (data.schoolList && Array.isArray(data.schoolList) && data.schoolList.length > 0) {
      console.log('Found', data.schoolList.length, 'schools, sample school:', 
        data.schoolList[0].schoolName, 'in', data.schoolList[0].address?.city);
      
      // Convert SchoolDigger format to our internal format
      const convertedSchools = data.schoolList.map((school: SchoolDiggerSchool) => convertSchoolDiggerToNCES(school));
      console.log('Successfully converted', convertedSchools.length, 'schools to internal format');
      return convertedSchools;
    } else {
      console.warn('No schools found in API response, using mock data');
      return getMockSchoolsData(zipCode);
    }
  } catch (error) {
    console.error('Error fetching schools from SchoolDigger API:', error);
    // Return mock data instead of throwing an error
    console.warn('Falling back to mock school data due to error');
    return getMockSchoolsData(zipCode);
  }
}

/**
 * Convert NCES API school data to the application's SchoolData format
 * @param ncesSchools - Array of schools from NCES API
 * @returns Array of schools in the application's format
 */
/**
 * Calculate a quality score for a school based on available metrics
 * Higher score = better school
 */
function calculateSchoolQualityScore(school: NCESSchool): number {
  let score = 0;
  let factors = 0;
  
  // Factor 1: Completion rate (graduation rate)
  if (school.latest.completion?.rate?.overall !== undefined) {
    // Higher completion rate = higher score (max 40 points)
    score += school.latest.completion.rate.overall * 40;
    factors++;
  }
  
  // Factor 2: Selectivity (admission rate)
  if (school.latest.admissions?.admission_rate?.overall !== undefined) {
    // Lower admission rate = higher selectivity = higher score (max 30 points)
    score += (1 - school.latest.admissions.admission_rate.overall) * 30;
    factors++;
  }
  
  // Factor 3: Student body size (moderate size preferred)
  if (school.latest.student.size !== undefined) {
    const size = school.latest.student.size;
    // Ideal size around 500-2000 students
    if (size >= 500 && size <= 2000) {
      score += 15; // Optimal size
    } else if (size > 2000 && size <= 5000) {
      score += 10; // Larger but still good
    } else if (size > 0 && size < 500) {
      score += 8; // Smaller schools
    } else {
      score += 5; // Very large schools
    }
    factors++;
  }
  
  // Normalize score if we have factors
  if (factors > 0) {
    // Convert to 1-10 scale
    return Math.min(10, Math.max(1, score / (factors * 10)));
  }
  
  // Default rating if no factors available
  return 7;
}

/**
 * Interface for SchoolDigger API school data
 */
interface SchoolDiggerSchool {
  schoolid?: string;
  schoolName?: string;
  address?: {
    latLong?: {
      latitude?: number;
      longitude?: number;
    };
    city?: string;
    state?: string;
    zip?: string;
    street?: string;
  };
  url?: string;
  level?: string;
  schoolType?: string;
  isPrivate?: boolean;
  isCharterSchool?: boolean;
  isVirtualSchool?: boolean;
  numberOfStudents?: number;
  rankHistory?: Array<{
    year: number;
    rank: number;
    rankOf: number;
    rankStars: number;
    rankLevel: string;
    rankStatewidePercentage: number;
  }>;
  rankMovement?: string;
  schoolYearlyDetails?: Array<{
    year: number;
    numberOfStudents?: number;
    percentFreeDiscLunch?: number;
    percentofAfricanAmericanStudents?: number;
    percentofAsianStudents?: number;
    percentofHispanicStudents?: number;
    percentofIndianStudents?: number;
    percentofPacificIslanderStudents?: number;
    percentofWhiteStudents?: number;
    percentofTwoOrMoreRaceStudents?: number;
    percentofUnspecifiedRaceStudents?: number;
    teachersFulltime?: number;
    pupilTeacherRatio?: number;
    gradeLevels?: string;
  }>;
  testScores?: Array<{
    testName?: string;
    testScore?: number;
    grade?: string;
    year?: number;
    subject?: string;
  }>;
}

/**
 * Convert SchoolDigger school format to our internal NCESSchool format
 */
function convertSchoolDiggerToNCES(schoolDiggerSchool: SchoolDiggerSchool): NCESSchool {
  // Get the most recent yearly details if available
  const yearlyDetails = schoolDiggerSchool.schoolYearlyDetails && 
                       schoolDiggerSchool.schoolYearlyDetails.length > 0 ? 
                       schoolDiggerSchool.schoolYearlyDetails[0] : null;
  
  // Get the most recent rank if available
  const rankInfo = schoolDiggerSchool.rankHistory && 
                  schoolDiggerSchool.rankHistory.length > 0 ? 
                  schoolDiggerSchool.rankHistory[0] : null;
  
  // Calculate a completion rate based on rank stars if available (approximation)
  const completionRate = rankInfo ? 
                        (rankInfo.rankStars / 5) * 0.95 + 0.05 : // Scale 1-5 stars to 0.05-1.0 range
                        0.85; // Default completion rate if no rank data
  
  return {
    id: schoolDiggerSchool.schoolid || '',
    school: {
      name: schoolDiggerSchool.schoolName || '',
      city: schoolDiggerSchool.address?.city || '',
      state: schoolDiggerSchool.address?.state || '',
      zip: schoolDiggerSchool.address?.zip || '',
      school_url: schoolDiggerSchool.url || '',
      school_type: determineSchoolType(schoolDiggerSchool.level || '')
    },
    latest: {
      student: {
        size: yearlyDetails?.numberOfStudents || 0,
        demographics: {
          race_ethnicity: {
            white: yearlyDetails?.percentofWhiteStudents ? yearlyDetails.percentofWhiteStudents / 100 : 0,
            black: yearlyDetails?.percentofAfricanAmericanStudents ? yearlyDetails.percentofAfricanAmericanStudents / 100 : 0,
            hispanic: yearlyDetails?.percentofHispanicStudents ? yearlyDetails.percentofHispanicStudents / 100 : 0,
            asian: yearlyDetails?.percentofAsianStudents ? yearlyDetails.percentofAsianStudents / 100 : 0,
            aian: yearlyDetails?.percentofIndianStudents ? yearlyDetails.percentofIndianStudents / 100 : 0,
            nhpi: yearlyDetails?.percentofPacificIslanderStudents ? yearlyDetails.percentofPacificIslanderStudents / 100 : 0,
            two_or_more: yearlyDetails?.percentofTwoOrMoreRaceStudents ? yearlyDetails.percentofTwoOrMoreRaceStudents / 100 : 0,
            non_resident_alien: 0 // SchoolDigger doesn't provide this data
          }
        }
      },
      completion: {
        rate: {
          overall: completionRate
        }
      },
      admissions: {
        admission_rate: {
          overall: schoolDiggerSchool.isPrivate ? 0.7 : 1.0 // Private schools have selective admission
        }
      },
      cost: {
        avg_net_price: {
          overall: schoolDiggerSchool.isPrivate ? 15000 : 0 // Estimate for private schools
        }
      }
    }
  };
}

/**
 * Determine school type from SchoolDigger school level
 */
function determineSchoolType(schoolLevel: string): string {
  if (!schoolLevel) return 'all';
  
  const level = schoolLevel.toLowerCase();
  if (level.includes('elementary')) return 'elementary';
  if (level.includes('middle') || level.includes('junior')) return 'middle';
  if (level.includes('high')) return 'high';
  if (level.includes('primary')) return 'elementary';
  if (level.includes('secondary')) return 'high';
  if (level.includes('k-8')) return 'elementary';
  if (level.includes('k-12')) return 'all';
  return 'all';
}

/**
 * Generate mock school data for a given ZIP code
 * This is used as a fallback when the SchoolDigger API is unavailable or the API key is invalid
 */
function getMockSchoolsData(zipCode: string): NCESSchool[] {
  console.log('GENERATING MOCK SCHOOL DATA for ZIP:', zipCode);
  // Create some mock schools with realistic data - clearly labeled as mock data
  return [
    {
      id: 'mock-elem-1',
      school: {
        name: `[MOCK DATA] ${zipCode} Elementary School`,
        city: 'Anytown (Mock)',
        state: 'CA',
        zip: zipCode,
        school_url: 'www.elementaryschool.edu',
        school_type: 'elementary'
      },
      latest: {
        student: {
          size: 450,
          demographics: {
            race_ethnicity: {
              white: 0.45,
              black: 0.15,
              hispanic: 0.2,
              asian: 0.1,
              aian: 0.02,
              nhpi: 0.01,
              two_or_more: 0.05,
              non_resident_alien: 0.02
            }
          }
        },
        completion: {
          rate: {
            overall: 0.92
          }
        },
        cost: {
          avg_net_price: {
            overall: 0
          }
        }
      }
    },
    {
      id: 'mock-middle-1',
      school: {
        name: `[MOCK DATA] ${zipCode} Middle School`,
        city: 'Anytown (Mock)',
        state: 'CA',
        zip: zipCode,
        school_url: 'www.middleschool.edu',
        school_type: 'middle'
      },
      latest: {
        student: {
          size: 650,
          demographics: {
            race_ethnicity: {
              white: 0.4,
              black: 0.18,
              hispanic: 0.22,
              asian: 0.12,
              aian: 0.01,
              nhpi: 0.01,
              two_or_more: 0.04,
              non_resident_alien: 0.02
            }
          }
        },
        completion: {
          rate: {
            overall: 0.88
          }
        },
        cost: {
          avg_net_price: {
            overall: 0
          }
        }
      }
    },
    {
      id: 'mock-high-1',
      school: {
        name: `[MOCK DATA] ${zipCode} High School`,
        city: 'Anytown (Mock)',
        state: 'CA',
        zip: zipCode,
        school_url: 'www.highschool.edu',
        school_type: 'high'
      },
      latest: {
        student: {
          size: 1200,
          demographics: {
            race_ethnicity: {
              white: 0.42,
              black: 0.16,
              hispanic: 0.21,
              asian: 0.13,
              aian: 0.01,
              nhpi: 0.01,
              two_or_more: 0.04,
              non_resident_alien: 0.02
            }
          }
        },
        admissions: {
          admission_rate: {
            overall: 1.0
          }
        },
        completion: {
          rate: {
            overall: 0.85
          }
        },
        cost: {
          avg_net_price: {
            overall: 0
          }
        }
      }
    }
  ];
}

export function convertNCESToSchoolData(ncesSchools: NCESSchool[]): SchoolData[] {
  // Calculate ratings and convert all schools
  const schoolsWithRatings = ncesSchools.map(school => {
    // Calculate quality score
    const qualityScore = calculateSchoolQualityScore(school);
    
    // Round to one decimal place
    const rating = Math.round(qualityScore * 10) / 10;
    
    // Determine school type based on programs
    const schoolType: 'elementary' | 'middle' | 'high' | 'all' = 'all';
    
    // Generate a description based on available data
    let description = `${school.school.name} is located in ${school.school.city}, ${school.school.state}`;
    
    if (school.latest.student.size) {
      description += ` with a student body of approximately ${school.latest.student.size} students`;
    }
    
    if (school.latest.completion?.rate?.overall) {
      description += ` and a completion rate of ${Math.round(school.latest.completion.rate.overall * 100)}%`;
    }
    
    description += '.';
    
    // Format the website URL
    let website = school.school.school_url || '';
    if (website && !website.startsWith('http')) {
      website = 'https://' + website;
    }
    
    return {
      name: school.school.name,
      rating,
      description,
      website,
      schoolType,
      // Add additional data that might be useful
      city: school.school.city,
      state: school.school.state,
      zip: school.school.zip,
      studentSize: school.latest.student.size,
      admissionRate: school.latest.admissions?.admission_rate?.overall,
      completionRate: school.latest.completion?.rate?.overall,
      avgNetPrice: school.latest.cost?.avg_net_price?.overall,
      demographics: school.latest.student.demographics?.race_ethnicity ? {
        race_ethnicity: school.latest.student.demographics.race_ethnicity
      } : undefined,
      qualityScore // Include the raw quality score for sorting
    };
  });
  
  // Sort schools by rating (highest first)
  schoolsWithRatings.sort((a, b) => b.rating - a.rating);
  
  // Return the sorted schools
  return schoolsWithRatings;
}
