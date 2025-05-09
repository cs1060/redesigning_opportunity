import { generateJobOpportunityAdvice } from '../../src/utils/jobOpportunities';
import { JobOpportunity } from '../../src/types/moveTypes';
import '@testing-library/jest-dom';

describe('Job Opportunities Utils', () => {
  // Test data
  const mockJobOpportunities: JobOpportunity[] = [
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
        }
      ]
    }
  ];

  test('generates appropriate advice for low income families', () => {
    const assessmentData = {
      income: 'under-25k',
      children: [{ name: 'Child', age: '5' }]
    };

    const advice = generateJobOpportunityAdvice(assessmentData, mockJobOpportunities);
    
    // Should include advice about training programs and childcare
    expect(advice).toContain('training program');
    expect(advice).toContain('childcare');
    expect(advice).toContain('entry-level');
  });

  test('generates appropriate advice for middle income families', () => {
    const assessmentData = {
      income: '50-75k',
      children: [{ name: 'Teen', age: '15' }]
    };

    const advice = generateJobOpportunityAdvice(assessmentData, mockJobOpportunities);
    
    // Should include advice about career advancement
    expect(advice).toContain('career advancement');
    expect(advice).toContain('skills');
    expect(advice).not.toContain('entry-level');
  });

  test('generates appropriate advice for high income families', () => {
    const assessmentData = {
      income: 'over-150k',
      children: []
    };

    const advice = generateJobOpportunityAdvice(assessmentData, mockJobOpportunities);
    
    // Should include advice about leadership positions
    expect(advice).toContain('leadership');
    expect(advice).toContain('entrepreneurial');
    expect(advice).not.toContain('childcare');
  });

  test('handles families with multiple children', () => {
    const assessmentData = {
      income: '25-50k',
      children: [
        { name: 'Child1', age: '3' },
        { name: 'Child2', age: '7' }
      ]
    };

    const advice = generateJobOpportunityAdvice(assessmentData, mockJobOpportunities);
    
    // Should include advice about childcare and flexibility for young children
    expect(advice).toContain('childcare');
    expect(advice).toContain('flexible');
  });

  test('handles case with no job opportunities data', () => {
    const assessmentData = {
      income: '50-75k',
      children: [{ name: 'Child', age: '10' }]
    };

    const advice = generateJobOpportunityAdvice(assessmentData, []);
    
    // Should still provide general advice even without specific job data
    expect(advice).toContain('career');
    expect(advice).toBeTruthy();
    expect(advice.length).toBeGreaterThan(50);
  });

  test('provides sector-specific advice based on available sectors', () => {
    const assessmentData = {
      income: '75-100k',
      children: []
    };

    const advice = generateJobOpportunityAdvice(assessmentData, mockJobOpportunities);
    
    // Should mention at least one of the sectors
    const mentionsSector = 
      advice.includes('Technology') || 
      advice.includes('Healthcare') || 
      advice.includes('Education');
    
    expect(mentionsSector).toBe(true);
  });
});
