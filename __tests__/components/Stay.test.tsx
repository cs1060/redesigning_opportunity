import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Stay, { getSchoolTypeForAge, filterSchoolsByChildAge, filterCommunityPrograms, generatePersonalizedAdvice } from '../../src/components/action-plan/Stay';
import { AssessProvider, type AssessData } from '../../src/components/AssessProvider';
import '@testing-library/jest-dom';

// Mock the translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    // Return the key as is for simple testing
    if (key === 'clickToLearnMore') return 'Click to learn more';
    if (key === 'description') return 'Description';
    if (key === 'localSchools') return 'Local Schools';
    if (key === 'selectSchool') return 'Select a school for your child';
    if (key === 'rating') return 'Rating';
    return key;
  }
}));

// Mock fetch for API testing
global.fetch = jest.fn();

describe('Stay Component', () => {
  // Define types for test data
  type SchoolType = 'elementary' | 'middle' | 'high' | 'all';
  type AgeRange = 'preschool' | 'elementary' | 'middle' | 'high' | 'all';
  type GenderFocus = 'all' | 'boys' | 'girls';

  // Create a complete assessment data factory function
  const createTestAssessData = (overrides?: Partial<AssessData>): AssessData => ({
    street: '123 Test St',
    city: 'Test City',
    state: 'CA',
    address: '123 Test St, Test City, CA 12345',
    country: 'USA',
    isEmployed: true,
    income: '50-75k',
    children: [{ name: 'Test Child', age: '8', gender: 'M', ethnicity: 'W' }],
    ...overrides
  });
  
  // Setup default mock responses
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
            schoolType: 'elementary' as SchoolType
          },
          {
            name: 'Test High School',
            rating: 8.5,
            description: 'A great high school',
            website: 'https://www.testhigh.edu',
            schoolType: 'high' as SchoolType
          }
        ],
        communityProgramData: [
          {
            name: 'Test Program 1',
            description: 'A great program',
            website: 'https://www.testprogram1.org',
            ageRanges: ['elementary', 'middle'] as AgeRange[],
            tags: ['education', 'arts']
          },
          {
            name: 'Test Program 2',
            description: 'Another great program',
            website: 'https://www.testprogram2.org',
            ageRanges: ['high'] as AgeRange[],
            tags: ['sports']
          }
        ]
      })
    });
    
    // Mock scrollIntoView to prevent errors
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });
  
  // Restore mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should show error when no address is available', () => {
    // When no assessment data is provided, the component should show an error
    render(
      <AssessProvider>
        <Stay />
      </AssessProvider>
    );
    
    // Check for error message instead of loading spinner
    expect(screen.getByText('No address provided. Please complete the assessment form first.')).toBeInTheDocument();
  });

  test('should display error message when no address is provided', async () => {
    // Create a minimal assessment data object with empty values
    const emptyAssessmentData: AssessData = {
      street: '',
      city: '',
      state: '',
      address: '',
      country: '',
      isEmployed: false,
      income: '',
      children: []
    };
    
    render(
      <AssessProvider>
        <Stay assessmentData={emptyAssessmentData} />
      </AssessProvider>
    );
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('No address provided. Please complete the assessment form first.')).toBeInTheDocument();
    });
  });

  test('should fetch and display recommendations with valid address', async () => {
    const assessmentData = createTestAssessData();
    
    render(
      <AssessProvider>
        <Stay assessmentData={assessmentData} />
      </AssessProvider>
    );
    
    // Wait for API call to be triggered
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/openai', expect.any(Object));
    });
    
    // Check request body contains correct data
    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(requestBody.address).toBe('123 Test St, Test City, CA 12345');
    expect(requestBody.income).toBe('50-75k');
    
    // Wait for town information to appear
    await waitFor(() => {
      expect(screen.getByText('Township Information')).toBeInTheDocument();
    });
    
    // Check town details are displayed
    expect(screen.getByText('Test Town')).toBeInTheDocument();
    expect(screen.getByText('A test town description.')).toBeInTheDocument();
  });

  test('should display schools filtered by child age', async () => {
    const user = userEvent.setup();
    
    // Mock assessment data with a child of elementary school age
    const assessmentData = createTestAssessData({
      children: [{ name: 'Test Child', age: '8', gender: 'M', ethnicity: 'W' }]
    });
    
    render(
      <AssessProvider>
        <Stay assessmentData={assessmentData} />
      </AssessProvider>
    );
    
    // Wait for schools to appear
    await waitFor(() => {
      expect(screen.getByText('Local Schools')).toBeInTheDocument();
    });
    
    // Check that elementary school is displayed (since child is 8)
    expect(screen.getByText('Test Elementary School')).toBeInTheDocument();
    
    // Select a school
    const school = screen.getByText('Test Elementary School').closest('div');
    await user.click(school!);
    
    // Check that selection is acknowledged
    await waitFor(() => {
      expect(screen.getByText('Test Elementary School school looks like a great option for your child!')).toBeInTheDocument();
    });
  });

  test('should display community programs and allow multiple selections', async () => {
    const user = userEvent.setup();
    
    const assessmentData = createTestAssessData();
    
    render(
      <AssessProvider>
        <Stay assessmentData={assessmentData} />
      </AssessProvider>
    );
    
    // Wait for community programs to appear
    await waitFor(() => {
      expect(screen.getByText('Community Programs')).toBeInTheDocument();
    });
    
    // Check program options are displayed
    expect(screen.getByText('Test Program 1')).toBeInTheDocument();
    
    // Select a program
    const program = screen.getByText('Test Program 1').closest('div');
    await user.click(program!);
    
    // Check that selection is acknowledged
    await waitFor(() => {
      expect(screen.getByText('Test Program 1 looks like a great option for your child!')).toBeInTheDocument();
    });
  });

  test('should enable Save Choices button when all selections are made', async () => {
    const user = userEvent.setup();
    const onSaveChoicesMock = jest.fn();
    
    const assessmentData = createTestAssessData();
    
    render(
      <AssessProvider>
        <Stay assessmentData={assessmentData} onSaveChoices={onSaveChoicesMock} />
      </AssessProvider>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Township Information')).toBeInTheDocument();
    });
    
    // Make all required selections
    const school = screen.getByText('Test Elementary School').closest('div');
    await user.click(school!);
    
    const program = screen.getByText('Test Program 1').closest('div');
    await user.click(program!);
    
    // Check that Save button is enabled and visible
    await waitFor(() => {
      expect(screen.getByText('Save My Choices')).toBeInTheDocument();
    });
    
    // Click Save button
    await user.click(screen.getByText('Save My Choices'));
    
    // Check that onSaveChoices was called with correct data
    expect(onSaveChoicesMock).toHaveBeenCalledWith({
      town: 'Test Town',
      selectedSchool: 'Test Elementary School',
      selectedCommunityPrograms: ['Test Program 1']
    });
  });

  test('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock a failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => { throw new Error('response.json is not a function'); }
    });
    
    const assessmentData = createTestAssessData();
    
    render(
      <AssessProvider>
        <Stay assessmentData={assessmentData} />
      </AssessProvider>
    );
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load personalized recommendations/)).toBeInTheDocument();
    });
    
    // Wait for the component to render the default data after error
    await waitFor(() => {
      // Check that we're showing the error message
      expect(screen.getByText(/Please make sure you've completed the assessment form with your address/)).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('should display personalized advice based on assessment data', async () => {
    // Test with a family with young children
    const assessmentDataWithYoungChildren = createTestAssessData({
      children: [{ name: 'Young Child', age: '5', gender: 'M', ethnicity: 'W' }]
    });
    
    render(
      <AssessProvider>
        <Stay assessmentData={assessmentDataWithYoungChildren} />
      </AssessProvider>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Township Information')).toBeInTheDocument();
    });
    
    // Check for personalized advice section
    expect(screen.getByText('Personalized Advice')).toBeInTheDocument();
    
    // Test the advice content directly with the helper function
    const advice = generatePersonalizedAdvice(assessmentDataWithYoungChildren);
    expect(advice).toContain('For your younger child, look for schools with strong early literacy programs');
  });

  test('should have clickable links in town information, schools, and programs', async () => {
    const assessmentData = createTestAssessData();
    
    render(
      <AssessProvider>
        <Stay assessmentData={assessmentData} />
      </AssessProvider>
    );
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Township Information')).toBeInTheDocument();
    });
    
    // Check town website link is clickable
    const townWebsiteLink = screen.getByText('https://www.testtown.gov');
    expect(townWebsiteLink).toBeInTheDocument();
    expect(townWebsiteLink.tagName).toBe('A');
    expect(townWebsiteLink).toHaveAttribute('href', 'https://www.testtown.gov');
    expect(townWebsiteLink).toHaveAttribute('target', '_blank');
    expect(townWebsiteLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    // Check school website link is clickable
    const schoolWebsiteLink = screen.getAllByText('Website')[0];
    expect(schoolWebsiteLink).toBeInTheDocument();
    expect(schoolWebsiteLink.tagName).toBe('A');
    expect(schoolWebsiteLink).toHaveAttribute('href', 'https://www.testelementary.edu');
    expect(schoolWebsiteLink).toHaveAttribute('target', '_blank');
    expect(schoolWebsiteLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    // Check community program website link is clickable
    const programWebsiteLink = screen.getAllByText('Website')[1];
    expect(programWebsiteLink).toBeInTheDocument();
    expect(programWebsiteLink.tagName).toBe('A');
    expect(programWebsiteLink).toHaveAttribute('href', 'https://www.testprogram1.org');
    expect(programWebsiteLink).toHaveAttribute('target', '_blank');
    expect(programWebsiteLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // Test helper functions
  test('getSchoolTypeForAge returns correct school type', () => {
    expect(getSchoolTypeForAge(5)).toBe('elementary');
    expect(getSchoolTypeForAge(8)).toBe('elementary');
    expect(getSchoolTypeForAge(10)).toBe('elementary');
    expect(getSchoolTypeForAge(11)).toBe('middle');
    expect(getSchoolTypeForAge(13)).toBe('middle');
    expect(getSchoolTypeForAge(14)).toBe('high');
    expect(getSchoolTypeForAge(17)).toBe('high');
    expect(getSchoolTypeForAge(4)).toBe('elementary'); // Default for very young children
  });

  test('filterSchoolsByChildAge correctly filters schools', () => {
    const schools = [
      { name: 'Elementary School', rating: 9, description: 'Test', website: 'test.com', schoolType: 'elementary' as SchoolType },
      { name: 'Middle School', rating: 8, description: 'Test', website: 'test.com', schoolType: 'middle' as SchoolType },
      { name: 'High School', rating: 7, description: 'Test', website: 'test.com', schoolType: 'high' as SchoolType },
      { name: 'All Grades', rating: 9, description: 'Test', website: 'test.com', schoolType: 'all' as SchoolType }
    ];
    
    // Test with elementary school age child
    const assessmentDataElementary = createTestAssessData({
      children: [{ name: 'Child', age: '8', gender: 'M', ethnicity: 'W' }]
    });
    
    const filteredElementary = filterSchoolsByChildAge(schools, assessmentDataElementary);
    expect(filteredElementary.length).toBe(2);
    expect(filteredElementary[0].name).toBe('Elementary School');
    expect(filteredElementary[1].name).toBe('All Grades');
    
    // Test with high school age child
    const assessmentDataHigh = createTestAssessData({
      children: [{ name: 'Teen', age: '16', gender: 'F', ethnicity: 'B' }]
    });
    
    const filteredHigh = filterSchoolsByChildAge(schools, assessmentDataHigh);
    expect(filteredHigh.length).toBe(2);
    expect(filteredHigh[0].name).toBe('High School');
    expect(filteredHigh[1].name).toBe('All Grades');
    
    // Test with multiple children of different ages
    const assessmentDataMixed = createTestAssessData({
      children: [
        { name: 'Child1', age: '8', gender: 'M', ethnicity: 'W' },
        { name: 'Child2', age: '14', gender: 'F', ethnicity: 'B' }
      ]
    });
    
    const filteredMixed = filterSchoolsByChildAge(schools, assessmentDataMixed);
    expect(filteredMixed.length).toBe(3);
    expect(filteredMixed.map(s => s.name)).toContain('Elementary School');
    expect(filteredMixed.map(s => s.name)).toContain('High School');
    expect(filteredMixed.map(s => s.name)).toContain('All Grades');
  });

  test('filterCommunityPrograms correctly filters programs', () => {
    const programs = [
      { 
        name: 'Elementary Program', 
        description: 'For young kids', 
        website: 'test.com', 
        ageRanges: ['elementary' as AgeRange],
        genderFocus: 'all' as GenderFocus
      },
      { 
        name: 'Boys Program', 
        description: 'For boys', 
        website: 'test.com', 
        ageRanges: ['elementary' as AgeRange, 'middle' as AgeRange],
        genderFocus: 'boys' as GenderFocus
      },
      { 
        name: 'Girls Program', 
        description: 'For girls', 
        website: 'test.com', 
        ageRanges: ['middle' as AgeRange, 'high' as AgeRange],
        genderFocus: 'girls' as GenderFocus
      },
      { 
        name: 'All Ages Program', 
        description: 'For everyone', 
        website: 'test.com', 
        ageRanges: ['all' as AgeRange],
        genderFocus: 'all' as GenderFocus
      }
    ];
    
    // Test with elementary school age boy
    const assessmentDataBoy = createTestAssessData({
      children: [{ name: 'Boy', age: '8', gender: 'M', ethnicity: 'W' }]
    });
    
    const filteredBoy = filterCommunityPrograms(programs, assessmentDataBoy);
    expect(filteredBoy.length).toBe(3);
    expect(filteredBoy.map(p => p.name)).toContain('Elementary Program');
    expect(filteredBoy.map(p => p.name)).toContain('Boys Program');
    expect(filteredBoy.map(p => p.name)).toContain('All Ages Program');
    
    // Test with high school age girl
    const assessmentDataGirl = createTestAssessData({
      children: [{ name: 'Girl', age: '16', gender: 'F', ethnicity: 'B' }]
    });
    
    const filteredGirl = filterCommunityPrograms(programs, assessmentDataGirl);
    expect(filteredGirl.length).toBe(2);
    expect(filteredGirl.map(p => p.name)).toContain('Girls Program');
    expect(filteredGirl.map(p => p.name)).toContain('All Ages Program');
  });
});
