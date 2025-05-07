/**
 * Service to interact with the NCES (National Center for Education Statistics) API
 */
import { SchoolData } from '../components/action-plan/types';

// Base URL for the NCES API
const NCES_API_BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

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
  distance: number = 10,
  schoolTypes: string[] = []
): Promise<NCESSchool[]> {
  try {
    if (!process.env.NEXT_PUBLIC_NCES_API_KEY) {
      throw new Error('NCES API key is not configured');
    }

    // Build the query parameters
    const params = new URLSearchParams({
      api_key: process.env.NEXT_PUBLIC_NCES_API_KEY,
      'school.zip': zipCode,
      distance: distance.toString(),
      per_page: '50', // Limit results to 50 schools
      fields: [
        'id',
        'school.name',
        'school.city',
        'school.state',
        'school.zip',
        'school.school_url',
        'school.price_calculator_url',
        'latest.student.size',
        'latest.academics.program_percentage',
        'latest.admissions.admission_rate.overall',
        'latest.completion.rate.overall',
        'latest.cost.avg_net_price.overall',
        'latest.student.demographics.race_ethnicity'
      ].join(',')
    });

    // Add school type filter if specified
    if (schoolTypes.length > 0) {
      params.append('school.degrees_awarded.predominant', schoolTypes.join(','));
    }

    // Make the API request
    const response = await fetch(`${NCES_API_BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NCES API error: ${response.status} - ${errorText}`);
    }

    const data: NCESApiResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching schools from NCES API:', error);
    throw error;
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
