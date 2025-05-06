import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Welcome from '../../src/components/Welcome';
import '@testing-library/jest-dom';

// Mock the translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    // Return key-specific mock translations
    if (key === 'title') return 'Welcome to Opportunity Compass';
    if (key === 'subtitle') return 'Your guide to economic mobility';
    if (key === 'discover') return 'Discover resources in your community';
    if (key === 'search') return 'Search for opportunities';
    if (key === 'find') return 'Find a path to economic mobility';
    if (key === 'journey1') return 'Begin your journey';
    if (key === 'journey2') return 'Take the first step today';
    return key;
  }
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('Welcome Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders welcome content correctly', () => {
    render(<Welcome />);
    
    // Check if main title and subtitle are rendered
    expect(screen.getByText('Welcome to Opportunity Compass')).toBeInTheDocument();
    expect(screen.getByText('Your guide to economic mobility')).toBeInTheDocument();
    
    // Check if the descriptive paragraphs are rendered
    expect(screen.getByText('Discover resources in your community')).toBeInTheDocument();
    expect(screen.getByText('Search for opportunities')).toBeInTheDocument();
    expect(screen.getByText('Find a path to economic mobility')).toBeInTheDocument();
    
    // Check if journey text is rendered
    expect(screen.getByText('Begin your journey')).toBeInTheDocument();
    expect(screen.getByText('Take the first step today')).toBeInTheDocument();
    
    // Check if the scroll down button is rendered
    const scrollButton = screen.getByRole('button', { name: 'Scroll to assessment quiz' });
    expect(scrollButton).toBeInTheDocument();
  });

  test('animations are triggered after component mount', async () => {
    render(<Welcome />);
    
    // Initially, content should be loaded (isLoaded state is set to true in useEffect)
    // Wait for the animations to be applied
    await waitFor(() => {
      const title = screen.getByText('Welcome to Opportunity Compass');
      // Check if the title has the loaded class (opacity-100)
      expect(title.className).toContain('opacity-100');
      expect(title.className).toContain('translate-y-0');
      expect(title.className).not.toContain('opacity-0');
      expect(title.className).not.toContain('translate-y-10');
    });
  });

  test('scroll button scrolls to quiz section when clicked', async () => {
    const user = userEvent.setup();
    
    // Create a mock element to be returned by getElementById
    const mockQuizSection = document.createElement('div');
    const getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(mockQuizSection);
    
    render(<Welcome />);
    
    // Find the scroll button
    const scrollButton = screen.getByRole('button', { name: 'Scroll to assessment quiz' });
    
    // Click the button
    await user.click(scrollButton);
    
    // Check if getElementById was called with the correct ID
    expect(getElementByIdSpy).toHaveBeenCalledWith('quiz-section');
    
    // Check if scrollIntoView was called on the element
    expect(mockQuizSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    
    // Restore the spy
    getElementByIdSpy.mockRestore();
  });

  test('scroll button works with keyboard navigation', async () => {
    const user = userEvent.setup();
    
    // Create a mock element to be returned by getElementById
    const mockQuizSection = document.createElement('div');
    const getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(mockQuizSection);
    
    render(<Welcome />);
    
    // Find the scroll button
    const scrollButton = screen.getByRole('button', { name: 'Scroll to assessment quiz' });
    
    // Focus on the button
    scrollButton.focus();
    
    // Press Enter key
    await user.keyboard('{Enter}');
    
    // Check if getElementById was called with the correct ID
    expect(getElementByIdSpy).toHaveBeenCalledWith('quiz-section');
    
    // Check if scrollIntoView was called on the element
    expect(mockQuizSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    
    // Press Space key
    await user.keyboard(' ');
    
    // Check if the functions were called again
    expect(getElementByIdSpy).toHaveBeenCalledTimes(2);
    expect(mockQuizSection.scrollIntoView).toHaveBeenCalledTimes(2);
    
    // Restore the spy
    getElementByIdSpy.mockRestore();
  });

  test('handles case when quiz section is not found', async () => {
    const user = userEvent.setup();
    
    // Mock getElementById to return null (element not found)
    const getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(null);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Welcome />);
    
    // Find the scroll button
    const scrollButton = screen.getByRole('button', { name: 'Scroll to assessment quiz' });
    
    // Click the button
    await user.click(scrollButton);
    
    // Check if getElementById was called with the correct ID
    expect(getElementByIdSpy).toHaveBeenCalledWith('quiz-section');
    
    // Since the element is null, scrollIntoView should not be called
    // and no errors should be thrown
    
    // Restore the spies
    getElementByIdSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
