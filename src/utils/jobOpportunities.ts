import { JobOpportunity } from '../types/moveTypes';

// Assessment data interface
interface AssessmentData {
  income: string;
  children?: ChildData[];
  // Use Record<string, unknown> instead of any for additional properties
  [key: string]: string | ChildData[] | Record<string, unknown> | undefined;
}

interface ChildData {
  name: string;
  age: string;
  gender?: string;
  ethnicity?: string;
  // Use Record<string, unknown> instead of any for additional properties
  [key: string]: string | Record<string, unknown> | undefined;
}

// Default job opportunities data
export const defaultJobOpportunities: JobOpportunity[] = [
  {
    sector: 'Technology',
    growthRate: 14.5,
    medianSalary: 95000,
    description: 'The technology sector is growing rapidly with opportunities in software development, data science, and cybersecurity.',
    resources: [
      {
        name: 'Tech Jobs Board',
        url: 'https://techjobs.com',
        description: 'Find tech jobs in your area'
      },
      {
        name: 'Coding Bootcamps',
        url: 'https://bootcamps.com',
        description: 'Accelerated training programs for tech careers'
      }
    ]
  },
  {
    sector: 'Healthcare',
    growthRate: 12.8,
    medianSalary: 78000,
    description: 'Healthcare offers stable employment with positions ranging from medical practitioners to administrative roles.',
    resources: [
      {
        name: 'Healthcare Careers',
        url: 'https://healthcareers.org',
        description: 'Explore healthcare career paths'
      },
      {
        name: 'Medical Training Programs',
        url: 'https://medicaltraining.edu',
        description: 'Find medical certification programs'
      }
    ]
  },
  {
    sector: 'Education',
    growthRate: 8.2,
    medianSalary: 65000,
    description: 'Education sector provides opportunities for teachers, administrators, and support staff.',
    resources: [
      {
        name: 'Education Jobs',
        url: 'https://educationjobs.org',
        description: 'Find jobs in education'
      },
      {
        name: 'Teacher Certification',
        url: 'https://teachercert.org',
        description: 'Information on teacher certification requirements'
      }
    ]
  }
];

/**
 * Generates personalized job opportunity advice based on assessment data
 * @param assessmentData User assessment data including income and family information
 * @param jobOpportunities Available job opportunities in the area
 * @returns Personalized advice string
 */
export const generateJobOpportunityAdvice = (
  assessmentData: AssessmentData,
  jobOpportunities: JobOpportunity[] = defaultJobOpportunities
): string => {
  const { income, children = [] } = assessmentData;
  const hasChildren = children && children.length > 0;
  const hasYoungChildren = hasChildren && children.some((child: ChildData) => parseInt(child.age) < 10);
  
  // Base advice depending on income bracket
  let advice = '';
  
  // Income-based advice
  if (income === 'under-25k' || income === '25-50k') {
    advice = `Based on your income level, focus on entry-level positions with growth potential and training programs. `;
    
    if (hasYoungChildren) {
      advice += `Look for employers that offer childcare benefits or flexible schedules to accommodate your family needs. `;
    }
    
    advice += `Consider roles in ${getTopSectors(jobOpportunities, 2)} which offer stable employment and advancement opportunities without requiring advanced degrees.`;
  } 
  else if (income === '50-75k' || income === '75-100k') {
    advice = `With your mid-range income, explore career advancement opportunities that build on your existing skills. `;
    
    if (hasChildren) {
      advice += `Consider work-life balance when evaluating new positions, especially those with flexible scheduling. `;
    }
    
    advice += `The ${getTopSectors(jobOpportunities, 2)} sectors in this area offer competitive salaries and benefits that could improve your family's economic mobility.`;
  }
  else {
    advice = `With your higher income level, look for leadership positions, entrepreneurial opportunities, or specialized roles that maximize your earning potential. `;
    
    if (hasChildren) {
      advice += `Consider how career moves might affect your family's quality of life, including commute times and work flexibility. `;
    }
    
    advice += `The growing ${getTopSectors(jobOpportunities, 1)} sector offers particularly strong opportunities for professionals at your level.`;
  }
  
  return advice;
};

/**
 * Helper function to get top sectors by growth rate
 * @param jobOpportunities List of job opportunities
 * @param count Number of top sectors to return
 * @returns String listing the top sectors
 */
const getTopSectors = (jobOpportunities: JobOpportunity[], count: number): string => {
  if (!jobOpportunities || jobOpportunities.length === 0) {
    return 'healthcare and technology';
  }
  
  // Sort by growth rate and get top sectors
  const topSectors = [...jobOpportunities]
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, count)
    .map(job => job.sector);
  
  if (topSectors.length === 1) {
    return topSectors[0];
  }
  
  if (topSectors.length === 2) {
    return `${topSectors[0]} and ${topSectors[1]}`;
  }
  
  return topSectors.slice(0, -1).join(', ') + ', and ' + topSectors[topSectors.length - 1];
};
