// Types for Move component and related functionality

// Job Opportunity type
export interface JobOpportunity {
  sector: string;
  growthRate: number;
  medianSalary: number;
  description: string;
  resources: JobResource[];
}

// Job Resource type
export interface JobResource {
  name: string;
  url: string;
  description: string;
}

// Housing option type
export interface HousingOption {
  type: string;
  priceRange: string;
  averageSize: string;
  description: string;
  suitability: number;
}

// School type
export interface School {
  name: string;
  rating: number;
  description: string;
  website: string;
  schoolType: 'elementary' | 'middle' | 'high' | 'all';
}

// Community program type
export interface CommunityProgram {
  name: string;
  description: string;
  website: string;
  ageRanges: ('preschool' | 'elementary' | 'middle' | 'high' | 'all')[];
  tags: string[];
  genderFocus?: 'all' | 'boys' | 'girls';
}

// Neighborhood type
export interface Neighborhood {
  name: string;
  score: number;
  description: string;
}

// Town data type
export interface TownData {
  name: string;
  website: string;
  description: string;
}

// Move recommendations interface
export interface MoveRecommendations {
  townData: TownData;
  neighborhoodData: {
    topNeighborhoods: Neighborhood[];
  };
  schoolData: School[];
  communityProgramData: CommunityProgram[];
  communityDemographics: {
    population: number;
    medianAge?: number;
    ethnicComposition?: {
      group: string;
      percentage: number;
    }[];
    medianHousehold?: number;
    educationLevel?: {
      level: string;
      percentage: number;
    }[];
    religiousComposition?: {
      religion: string;
      percentage: number;
    }[];
  };
  housingOptions: HousingOption[];
  jobOpportunities?: JobOpportunity[];
  careerAdvice?: {
    forIncome?: string;
    forFamilySize?: string;
    generalAdvice?: string;
    recommendedSectors?: string[];
  };
}

// Move choices interface
export interface MoveChoices {
  town: string;
  selectedNeighborhood: string;
  selectedSchool: string;
  selectedCommunityPrograms: string[];
  selectedHousingType: string;
}
