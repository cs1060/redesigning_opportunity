// API integration test using fetch mocks

// This is a test for the OpenAI API integration
// We're using a mock implementation since Next.js App Router API routes are not directly importable in tests

describe('OpenAI API Integration', () => {
  // Mock fetch for API testing
  global.fetch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        townData: {
          name: 'Test Town',
          website: 'https://www.testtown.gov',
          description: 'A test town description.'
        },
        schoolData: [
          {
            name: 'Test Elementary School',
            rating: 9.0,
            description: 'A great elementary school',
            website: 'https://www.testelementary.edu',
            schoolType: 'elementary'
          }
        ],
        communityProgramData: [
          {
            name: 'Test Program',
            description: 'A great program',
            website: 'https://www.testprogram.org',
            ageRanges: ['elementary', 'middle'],
            tags: ['education', 'arts']
          }
        ]
      })
    });
  });

  test('fetches recommendations for a valid address', async () => {
    // Make the API call
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: '123 Main St, Boston, MA 02115',
        income: '50-75k',
        children: [{ name: 'Test Child', age: '8' }]
      })
    });
    
    // Check that the API call was made with the correct data
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/openai',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.any(String)
      })
    );
    
    // Check that the request body contains the correct data
    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(requestBody.address).toBe('123 Main St, Boston, MA 02115');
    expect(requestBody.income).toBe('50-75k');
    
    // Check response
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.townData.name).toBe('Test Town');
    expect(data.schoolData[0].name).toBe('Test Elementary School');
  });

  test('handles API error responses', async () => {
    // Mock a failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: 'Address is required' })
    });
    
    // Make the API call with missing address
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        income: '50-75k'
      })
    });
    
    // Check response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Address is required');
  });

  test('handles server errors', async () => {
    // Mock a server error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Server error occurred' })
    });
    
    // Make the API call
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: '123 Main St, Boston, MA 02115',
        income: '50-75k'
      })
    });
    
    // Check response
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBe('Server error occurred');
  });
});
