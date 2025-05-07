import { AssessData } from '../AssessProvider';

// Define types for the recommendations data
export type TownData = {
  name: string;
  website: string;
  description: string;
};

export type Neighborhood = {
  name: string;
  score: number;
  description: string;
};

export type NeighborhoodData = {
  topNeighborhoods: Neighborhood[];
};

export type SchoolData = {
  name: string;
  rating: number;
  description: string;
  website: string;
  schoolType?: 'elementary' | 'middle' | 'high' | 'all';
  // Additional data for enhanced functionality
  city?: string;
  state?: string;
  zip?: string;
  studentSize?: number;
  admissionRate?: number;
  completionRate?: number;
  avgNetPrice?: number;
  demographics?: {
    race_ethnicity?: {
      white?: number;
      black?: number;
      hispanic?: number;
      asian?: number;
      aian?: number; // American Indian/Alaska Native
      nhpi?: number; // Native Hawaiian/Pacific Islander
      two_or_more?: number;
      non_resident_alien?: number;
      [key: string]: number | undefined;
    };
  };
  qualityScore?: number; // Raw quality score for sorting
};

export type CommunityProgramData = {
  name: string;
  description: string;
  website: string;
  ageRanges?: ('preschool' | 'elementary' | 'middle' | 'high' | 'all')[];
  genderFocus?: 'all' | 'boys' | 'girls';
  tags?: string[];
};

export type EthnicGroup = {
  group: string;
  percentage: number;
};

export type EducationLevel = {
  level: string;
  percentage: number;
};

export type ReligiousGroup = {
  religion: string;
  percentage: number;
  displayName?: string;
};

export type CommunityDemographics = {
  population: number;
  medianAge: number;
  ethnicComposition: EthnicGroup[];
  medianHousehold: number;
  educationLevel: EducationLevel[];
  religiousComposition?: ReligiousGroup[];
};

export type HousingOption = {
  type: string;
  priceRange: string;
  averageSize: string;
  description: string;
  suitability?: number; // Family suitability score (1-5)
};

export type JobSector = {
  name: string;
  growthRate: number;
  medianSalary: string;
  description: string;
  demandLevel: 'high' | 'medium' | 'low';
};

export type CareerAdvice = {
  forIncome: string;
  forFamilySize: string;
  generalAdvice: string;
  recommendedSectors: string[];
};

export type MoveRecommendations = {
  townData: TownData;
  neighborhoodData: NeighborhoodData;
  schoolData: SchoolData[];
  communityProgramData: CommunityProgramData[];
  communityDemographics: CommunityDemographics;
  housingOptions: HousingOption[];
  jobSectors?: JobSector[];
  careerAdvice?: CareerAdvice;
};

// Helper functions
export const getSchoolTypeForAge = (age: string | number): 'elementary' | 'middle' | 'high' => {
  // Convert age to number if it's a string
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;
  
  if (ageNum < 11) {
    return 'elementary';
  } else if (ageNum < 15) {
    return 'middle';
  } else {
    return 'high';
  }
};

export const filterSchoolsByChildAge = (schools: SchoolData[], assessmentData: AssessData | undefined): SchoolData[] => {
  if (!assessmentData || !assessmentData.children || assessmentData.children.length === 0) {
    return schools;
  }

  // Determine which school types we need based on children's ages
  const neededSchoolTypes = assessmentData.children.map(child => {
    return getSchoolTypeForAge(child.age);
  });

  // Filter schools to only include those that match needed types or are marked as 'all'
  return schools.filter(school => {
    if (!school.schoolType || school.schoolType === 'all') {
      return true;
    }
    return neededSchoolTypes.includes(school.schoolType);
  });
};

export const filterCommunityPrograms = (
  programs: CommunityProgramData[], 
  assessmentData: AssessData | undefined
): CommunityProgramData[] => {
  if (!assessmentData || !assessmentData.children || assessmentData.children.length === 0) {
    return programs;
  }

  // Determine age ranges and genders of children
  const childAgeRanges = assessmentData.children.map(child => {
    // Convert age to number if it's a string
    const age = typeof child.age === 'string' ? parseInt(child.age, 10) : child.age;
    
    if (age < 5) return 'preschool' as const;
    if (age < 11) return 'elementary' as const;
    if (age < 15) return 'middle' as const;
    return 'high' as const;
  });
  
  const hasGirls = assessmentData.children.some(child => child.gender === 'female');
  const hasBoys = assessmentData.children.some(child => child.gender === 'male');

  // Filter programs to match children's profiles
  return programs.filter(program => {
    // Age range filter
    const ageMatch = !program.ageRanges || 
                     program.ageRanges.includes('all') || 
                     program.ageRanges.some(range => 
                       // Exclude 'all' from the check since it's handled above
                       range !== 'all' && childAgeRanges.includes(range as 'preschool' | 'elementary' | 'middle' | 'high')
                     );
    
    // Gender filter
    let genderMatch = true;
    if (program.genderFocus === 'girls' && !hasGirls) genderMatch = false;
    if (program.genderFocus === 'boys' && !hasBoys) genderMatch = false;
    
    return ageMatch && genderMatch;
  });
};

export const filterHousingOptions = (
  options: HousingOption[], 
  assessmentData: AssessData | undefined
): HousingOption[] => {
  if (!assessmentData) {
    return options;
  }

  // Calculate family size
  const familySize = (assessmentData.children?.length || 0) + 1; // Add 1 for the parent
  
  // Calculate housing suitability based on family characteristics
  return options.map(option => {
    let suitability = option.suitability || 3; // Default to middle score if not provided
    
    // Adjust suitability based on family size
    if (familySize > 4 && option.type === 'Apartment') {
      suitability -= 1; // Large families may need more space than typical apartments
    }
    if (familySize > 4 && option.type === 'Single Family Home') {
      suitability += 1; // Large families benefit from more space
    }
    if (familySize <= 2 && option.type === 'Townhouse') {
      suitability += 1; // Small families or couples might prefer townhouses
    }
    
    // Adjust based on income
    const income = assessmentData.income;
    if (income === '<25k' && option.type === 'Single Family Home') {
      suitability -= 2; // Less affordable
    }
    if (income === '25k-50k' && option.type === 'Single Family Home') {
      suitability -= 1; // May be less affordable
    }
    if (income === '>100k' && option.type === 'Single Family Home') {
      suitability += 1; // More affordable for higher incomes
    }
    
    // Ensure suitability stays within 1-5 range
    suitability = Math.max(1, Math.min(5, suitability));
    
    return { ...option, suitability };
  }).sort((a, b) => (b.suitability || 0) - (a.suitability || 0)); // Sort by suitability
};

export const inferSchoolType = (school: SchoolData): SchoolData => {
  if (school.schoolType) {
    return school;
  }
  
  // Infer school type from name if not provided
  const name = school.name.toLowerCase();
  if (name.includes('elementary')) {
    return { ...school, schoolType: 'elementary' };
  } else if (name.includes('middle')) {
    return { ...school, schoolType: 'middle' };
  } else if (name.includes('high')) {
    return { ...school, schoolType: 'high' };
  }
  
  return { ...school, schoolType: 'all' };
};

export const getSchoolLevelMessage = (assessmentData: AssessData | undefined): string => {
  if (!assessmentData || !assessmentData.children || assessmentData.children.length === 0) {
    return "Showing all schools in the area.";
  }
  
  // Get the school types needed based on children's ages
  const schoolTypes = assessmentData.children.map(child => getSchoolTypeForAge(child.age));
  
  // Count occurrences of each school type
  const elementaryCount = schoolTypes.filter(type => type === 'elementary').length;
  const middleCount = schoolTypes.filter(type => type === 'middle').length;
  const highCount = schoolTypes.filter(type => type === 'high').length;
  
  // Create a message based on the school types needed
  const message = "Showing schools relevant for your ";
  const schoolTypeMessages = [];
  
  if (elementaryCount > 0) {
    schoolTypeMessages.push(`elementary school child${elementaryCount > 1 ? 'ren' : ''}`);
  }
  if (middleCount > 0) {
    schoolTypeMessages.push(`middle school child${middleCount > 1 ? 'ren' : ''}`);
  }
  if (highCount > 0) {
    schoolTypeMessages.push(`high school child${highCount > 1 ? 'ren' : ''}`);
  }
  
  return message + schoolTypeMessages.join(', ') + '.';
};

export const generatePersonalizedCareerAdvice = (assessmentData: AssessData | undefined): CareerAdvice => {
  // Default advice if no assessment data is available
  const defaultAdvice: CareerAdvice = {
    forIncome: "Consider roles that match your current skill set while providing opportunities for advancement.",
    forFamilySize: "Look for positions with flexible scheduling and good benefits to support your family needs.",
    generalAdvice: "Network within your community and consider additional training to increase your earning potential.",
    recommendedSectors: ['Healthcare', 'Education']
  };
  
  if (!assessmentData) {
    return defaultAdvice;
  }
  
  // Customize advice based on income level
  let incomeAdvice = defaultAdvice.forIncome;
  let recommendedSectors = [...defaultAdvice.recommendedSectors];
  
  switch (assessmentData.income) {
    case '<25k':
      incomeAdvice = "Focus on roles with training opportunities and clear advancement paths. Consider certificate programs that can quickly increase your earning potential.";
      recommendedSectors = ['Healthcare', 'Skilled Trades', 'Customer Service'];
      break;
    case '25k-50k':
      incomeAdvice = "Look for positions that offer skill development and educational benefits. Consider roles that allow you to leverage your existing experience while building new skills.";
      recommendedSectors = ['Healthcare', 'Education', 'Manufacturing'];
      break;
    case '50k-75k':
      incomeAdvice = "Target roles that balance your current expertise with growth opportunities. Consider specialized positions that can lead to higher compensation.";
      recommendedSectors = ['Technology', 'Healthcare', 'Financial Services'];
      break;
    case '75k-100k':
      incomeAdvice = "Leverage your professional experience to find roles with leadership potential. Consider positions that offer both competitive compensation and work-life balance.";
      recommendedSectors = ['Technology', 'Management', 'Consulting'];
      break;
    case '>100k':
      incomeAdvice = "Focus on strategic positions that align with your expertise. Consider roles that offer equity or performance-based compensation to maximize your earning potential.";
      recommendedSectors = ['Technology', 'Executive Management', 'Specialized Consulting'];
      break;
  }
  
  // Customize advice based on family size
  let familySizeAdvice = defaultAdvice.forFamilySize;
  const childrenCount = assessmentData.children?.length || 0;
  
  if (childrenCount > 0) {
    if (childrenCount > 2) {
      familySizeAdvice = "With multiple children, prioritize employers offering comprehensive benefits, especially healthcare and childcare assistance. Consider remote or flexible work arrangements to balance family responsibilities.";
    } else {
      familySizeAdvice = "With children in your household, look for family-friendly employers offering good benefits and flexible scheduling options. Consider proximity to schools and childcare in your job search.";
    }
  } else {
    familySizeAdvice = "Without children in your household, you may have more flexibility to consider roles requiring travel or non-traditional hours if they offer better compensation or growth opportunities.";
  }
  
  // General advice
  const generalAdvice = "Research the job market in your target location before moving. Update your resume to highlight transferable skills, and start networking in your new community before you arrive.";
  
  return {
    forIncome: incomeAdvice,
    forFamilySize: familySizeAdvice,
    generalAdvice,
    recommendedSectors
  };
};

export const generatePersonalizedAdvice = (assessmentData: AssessData | undefined): string => {
  if (!assessmentData) {
    return "Based on the information you've provided, we recommend exploring neighborhoods with good schools and community programs that match your family's needs.";
  }
  
  // Generate personalized advice based on family composition
  const childrenCount = assessmentData.children?.length || 0;
  const hasYoungChildren = assessmentData.children?.some(child => {
    const age = typeof child.age === 'string' ? parseInt(child.age, 10) : child.age;
    return age < 10;
  }) || false;
  const hasTeenagers = assessmentData.children?.some(child => {
    const age = typeof child.age === 'string' ? parseInt(child.age, 10) : child.age;
    return age >= 13;
  }) || false;
  
  let advice = "Based on your family profile, ";
  
  if (childrenCount > 0) {
    advice += "we recommend focusing on ";
    
    const considerations = [];
    
    if (hasYoungChildren) {
      considerations.push("neighborhoods with quality elementary schools");
    }
    
    if (hasTeenagers) {
      considerations.push("areas with strong middle and high schools");
    }
    
    considerations.push("community programs that match your children's interests");
    
    // Add income-based housing advice
    if (assessmentData.income === '<25k' || assessmentData.income === '25k-50k') {
      considerations.push("housing options with good affordability");
    } else if (assessmentData.income === '>100k') {
      considerations.push("neighborhoods that offer the quality of life you're looking for");
    } else {
      considerations.push("housing that balances quality and affordability");
    }
    
    advice += considerations.join(", ") + ".";
  } else {
    advice += "consider areas that align with your lifestyle preferences and career opportunities. Look for housing options that fit your budget while providing the amenities you value.";
  }
  
  return advice;
};

// Default data to use as fallback
export const defaultRecommendations: MoveRecommendations = {
  townData: {
    name: 'Arlington Heights',
    website: 'https://www.arlingtonheights.gov',
    description: 'A vibrant suburban community known for excellent educational opportunities and strong family support systems. Located in a region with diverse economic prospects and community-driven initiatives.',
  },
  neighborhoodData: {
    topNeighborhoods: [
      { name: 'Arlington Heights', score: 9.2, description: 'Family-friendly area with excellent schools' },
      { name: 'Riverside Park', score: 8.7, description: 'Diverse community with great amenities' },
      { name: 'Greenwood Estates', score: 8.5, description: 'Quiet suburban neighborhood with parks' }
    ]
  },
  schoolData: [
    {
      name: 'Arlington Elementary',
      rating: 9.0,
      description: 'A top-rated elementary school with advanced educational programs and strong community involvement.',
      website: 'https://www.arlingtonelementary.edu',
      schoolType: 'elementary'
    },
    {
      name: 'Riverside Middle School',
      rating: 8.5,
      description: 'Innovative middle school offering specialized STEM and arts programs with small class sizes.',
      website: 'https://www.riversidems.edu',
      schoolType: 'middle'
    },
    {
      name: 'Greenwood High School',
      rating: 8.3,
      description: 'Community-focused high school with comprehensive enrichment programs and strong parent engagement.',
      website: 'https://www.greenwoodhs.edu',
      schoolType: 'high'
    }
  ],
  communityProgramData: [
    {
      name: 'Arlington Youth Leadership',
      description: 'Comprehensive youth development program focusing on leadership skills, community service, and personal growth.',
      website: 'https://www.arlingtonyouth.org',
      ageRanges: ['middle', 'high'],
      genderFocus: 'all',
      tags: ['leadership', 'community service']
    },
    {
      name: 'Riverside Sports League',
      description: 'Inclusive sports program offering basketball, soccer, and baseball leagues for children of all abilities.',
      website: 'https://www.riversidesports.org',
      ageRanges: ['elementary', 'middle'],
      genderFocus: 'all',
      tags: ['sports', 'teamwork']
    },
    {
      name: 'Girls in STEM',
      description: 'Empowering program that introduces girls to science, technology, engineering, and mathematics through hands-on projects.',
      website: 'https://www.girlsinstem.org',
      ageRanges: ['elementary', 'middle', 'high'],
      genderFocus: 'girls',
      tags: ['stem', 'education', 'technology']
    },
    {
      name: 'Creative Arts Center',
      description: 'Arts program offering classes in visual arts, music, theater, and dance for children and teens.',
      website: 'https://www.creativearts.org',
      ageRanges: ['elementary', 'middle', 'high'],
      tags: ['arts', 'music', 'theater']
    }
  ],
  communityDemographics: {
    population: 45672,
    medianAge: 38.5,
    ethnicComposition: [
      { group: 'White', percentage: 62 },
      { group: 'Asian', percentage: 22 },
      { group: 'Hispanic', percentage: 8 },
      { group: 'Black', percentage: 5 },
      { group: 'Other', percentage: 3 }
    ],
    medianHousehold: 85000,
    educationLevel: [
      { level: "Bachelor's or higher", percentage: 45 },
      { level: "Some College", percentage: 28 },
      { level: "High School", percentage: 22 },
      { level: "Less than High School", percentage: 5 }
    ],
    religiousComposition: [
      { religion: 'Christian', percentage: 65 },
      { religion: 'Non-religious', percentage: 18 },
      { religion: 'Jewish', percentage: 8 },
      { religion: 'Muslim', percentage: 5 },
      { religion: 'Hindu', percentage: 3 },
      { religion: 'Other', percentage: 1 }
    ]
  },
  housingOptions: [
    {
      type: 'Single Family Home',
      priceRange: '$450,000 - $750,000',
      averageSize: '2,200 - 3,500 sq ft',
      description: 'Spacious homes with yards, ideal for families',
      suitability: 4
    },
    {
      type: 'Townhouse',
      priceRange: '$350,000 - $500,000',
      averageSize: '1,500 - 2,200 sq ft',
      description: 'Multi-level homes with modern amenities',
      suitability: 3
    },
    {
      type: 'Apartment',
      priceRange: '$1,800 - $3,200/month',
      averageSize: '800 - 1,500 sq ft',
      description: 'Convenient options with amenities',
      suitability: 2
    }
  ],
  jobSectors: [
    {
      name: 'Healthcare',
      growthRate: 15,
      medianSalary: '$75,000',
      description: 'Healthcare professionals are in high demand across the country, with opportunities in hospitals, clinics, and home care.',
      demandLevel: 'high'
    },
    {
      name: 'Technology',
      growthRate: 18,
      medianSalary: '$95,000',
      description: 'The technology sector continues to grow rapidly with opportunities in software development, IT support, and cybersecurity.',
      demandLevel: 'high'
    },
    {
      name: 'Education',
      growthRate: 8,
      medianSalary: '$58,000',
      description: 'Teaching and administrative positions in K-12 schools, colleges, and educational support services.',
      demandLevel: 'medium'
    },
    {
      name: 'Service Industry',
      growthRate: 5,
      medianSalary: '$42,000',
      description: 'Customer service, retail, and food service positions are widely available but may offer lower wages and fewer benefits.',
      demandLevel: 'medium'
    }
  ],
  careerAdvice: {
    forIncome: 'Consider roles that match your current skill set while providing opportunities for advancement.',
    forFamilySize: 'Look for positions with flexible scheduling and good benefits to support your family needs.',
    generalAdvice: 'Network within your community and consider additional training to increase your earning potential.',
    recommendedSectors: ['Healthcare', 'Education']
  }
};

// Format number with commas
export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  try {
    return value.toLocaleString();
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(value || 'N/A');
  }
};
