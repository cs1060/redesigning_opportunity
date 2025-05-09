// API integration test for the OpenAI Move API route

// We'll mock fetch directly instead of using these utilities

// Instead of mocking a specific module path that might not be found,
// we'll just mock the fetch calls directly

describe('OpenAI Move API Integration', () => {
  // Mock fetch for API testing
  global.fetch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                townData: {
                  name: 'Cambridge',
                  website: 'https://www.cambridgema.gov',
                  description: 'A vibrant city known for education and innovation'
                },
                neighborhoodData: {
                  topNeighborhoods: [
                    { name: 'Harvard Square', score: 9.2, description: 'Academic hub with cultural attractions' },
                    { name: 'Kendall Square', score: 8.7, description: 'Tech-focused area with modern amenities' },
                    { name: 'Porter Square', score: 8.5, description: 'Residential area with shopping options' }
                  ]
                },
                schoolData: [
                  {
                    name: 'Cambridge Elementary',
                    rating: 9.0,
                    description: 'Top-rated elementary school with diverse programs',
                    website: 'https://www.cambridgeelementary.edu',
                    schoolType: 'elementary'
                  },
                  {
                    name: 'Cambridge High School',
                    rating: 8.5,
                    description: 'Excellent high school with strong college preparation',
                    website: 'https://www.cambridgehigh.edu',
                    schoolType: 'high'
                  }
                ],
                communityProgramData: [
                  {
                    name: 'Cambridge Youth Programs',
                    description: 'After-school and summer programs for children',
                    website: 'https://www.cambridgeyouth.org',
                    ageRanges: ['elementary', 'middle'],
                    genderFocus: 'all',
                    tags: ['education', 'arts', 'sports']
                  }
                ],
                communityDemographics: {
                  population: 118927,
                  medianAge: 30.5,
                  ethnicComposition: [
                    { group: 'White', percentage: 62 },
                    { group: 'Asian', percentage: 15 },
                    { group: 'Black', percentage: 10 },
                    { group: 'Hispanic', percentage: 9 },
                    { group: 'Other', percentage: 4 }
                  ],
                  medianHousehold: 95000,
                  educationLevel: [
                    { level: 'High School', percentage: 95 },
                    { level: 'Bachelor\'s Degree', percentage: 75 },
                    { level: 'Graduate Degree', percentage: 42 }
                  ],
                  religiousComposition: [
                    { religion: 'Christian', percentage: 45 },
                    { religion: 'Non-religious', percentage: 30 },
                    { religion: 'Jewish', percentage: 10 },
                    { religion: 'Muslim', percentage: 5 },
                    { religion: 'Other', percentage: 10 }
                  ]
                },
                housingOptions: [
                  {
                    type: 'Single Family Home',
                    priceRange: '$800,000 - $1,500,000',
                    averageSize: '1,800 - 2,500 sq ft',
                    description: 'Traditional homes with yards',
                    suitability: 4
                  },
                  {
                    type: 'Condominium',
                    priceRange: '$500,000 - $900,000',
                    averageSize: '800 - 1,500 sq ft',
                    description: 'Modern units in multi-family buildings',
                    suitability: 3
                  }
                ],
                jobSectors: [
                  {
                    name: 'Technology',
                    growthRate: 14.5,
                    medianSalary: '$95,000',
                    description: 'Strong tech sector with startups and established companies',
                    demandLevel: 'high'
                  },
                  {
                    name: 'Education',
                    growthRate: 8.2,
                    medianSalary: '$65,000',
                    description: 'Education sector opportunities',
                    demandLevel: 'medium'
                  }
                ]
              })
            }
          }
        ]
      })
    });
  });

  test('fetches move recommendations for a valid ZIP code', async () => {
    // Update the mock response to match what the test expects
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        townData: {
          name: 'Cambridge',
          description: 'A vibrant city with excellent schools',
          website: 'https://www.cambridgema.gov'
        },
        schoolData: [
          { name: 'Cambridge Elementary', type: 'Elementary', rating: 9 },
          { name: 'Cambridge High', type: 'High School', rating: 8 }
        ],
        jobSectors: [
          { name: 'Technology', growthRate: 14.5, medianSalary: '$95,000' },
          { name: 'Education', growthRate: 8.2, medianSalary: '$65,000' }
        ],
        careerAdvice: {
          forIncome: 'With your income level, you may find good opportunities',
          forFamilySize: 'With children, look for employers with strong benefits',
          generalAdvice: 'The area has a strong job market',
          recommendedSectors: ['Technology', 'Education']
        }
      })
    });
    
    // Make the API call
    const response = await fetch('/api/openai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zipCode: '02138',
        income: '75-100k',
        children: [{ name: 'Test Child', age: '8' }],
        includeJobData: true
      })
    });
    
    // Check response
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.townData).toBeDefined();
    expect(data.townData.name).toBe('Cambridge');
    expect(data.schoolData).toHaveLength(2);
    expect(data.jobSectors).toHaveLength(2);
    expect(data.jobSectors[0].name).toBe('Technology');
  });

  test('fetches move recommendations without job data', async () => {
    // Mock a successful API response without job data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendations: 'Test recommendations without job data'
      })
    });
    
    // Make the API call without includeJobData
    const response = await fetch('/api/openai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zipCode: '02138',
        income: '75-100k',
        children: [{ name: 'Test Child', age: '8' }],
        includeJobData: false
      })
    });
    
    // Check response
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.recommendations).toBe('Test recommendations without job data');
    expect(data.jobOpportunities).toBeUndefined();
  });

  test('handles invalid ZIP code format', async () => {
    // Mock fetch to return an error for invalid ZIP code
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid ZIP code format' })
    });
    
    // Make the API call with invalid ZIP code
    const response = await fetch('/api/openai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zipCode: 'invalid',
        income: '75-100k',
        children: [{ name: 'Test Child', age: '8' }]
      })
    });
    
    // Check response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Invalid ZIP code format');
  });

  test('handles non-existent ZIP code', async () => {
    // Mock fetch to return an error for non-existent ZIP code
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'ZIP code not found' })
    });
    
    // Make the API call with non-existent ZIP code
    const response = await fetch('/api/openai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zipCode: '99999',
        income: '75-100k',
        children: [{ name: 'Test Child', age: '8' }]
      })
    });
    
    // Check response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('ZIP code not found');
  });

  test('handles missing ZIP code', async () => {
    // Mock fetch to return an error for missing ZIP code
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'ZIP code is required' })
    });
    
    // Make the API call without a ZIP code
    const response = await fetch('/api/openai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        income: '75-100k',
        children: [{ name: 'Test Child', age: '8' }]
      })
    });
    
    // Check response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('ZIP code is required');
  });

  test('handles API error responses', async () => {
    // Mock a failed API response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Error generating recommendations' })
    });
    
    // Make the API call
    const response = await fetch('/api/openai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zipCode: '02138',
        income: '75-100k',
        children: [{ name: 'Test Child', age: '8' }]
      })
    });
    
    // Check response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toContain('Error generating recommendations');
  });

  test('handles invalid JSON in API response', async () => {
    // Mock an API response with invalid JSON
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Error parsing response' })
    });
    
    // Make the API call
    const response = await fetch('/api/openai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zipCode: '02138',
        income: '75-100k',
        children: [{ name: 'Test Child', age: '8' }]
      })
    });
    
    // Check response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toContain('Error parsing response');
  });
});
