/**
 * Test for Mobile Language Switcher Rendering
 * 
 * This test checks if the MobileLanguageSwitcher component is properly
 * rendered and visible in the DOM when viewing the application on a mobile device.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileLanguageSwitcher from '@/components/MobileLanguageSwitcher';
import Navbar from '@/components/Navbar';

// Mock the necessary hooks and router
jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'english': 'English',
      'spanish': 'Spanish',
      'chinese': 'Chinese',
      'language': 'Language',
      'title': 'Opportunity AI',
      'welcome': 'Welcome',
      'assess': 'Assess',
      'opportunityMap': 'Opportunity Map',
      'takeAction': 'Take Action',
      'nextSteps': 'Next Steps',
      'resources': 'Resources',
      'community': 'Community'
    };
    return translations[key] || key;
  }
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock window.matchMedia for testing responsive behavior
function setupMobileViewport() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query.includes('(max-width: 768px)'), // Mobile viewport
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

describe('Mobile Language Switcher Rendering', () => {
  beforeEach(() => {
    // Setup mobile viewport
    setupMobileViewport();
  });

  /**
   * Test that the MobileLanguageSwitcher component renders correctly
   * when used directly.
   */
  it('should render correctly when used directly', () => {
    // Render the component directly
    render(<MobileLanguageSwitcher />);
    
    // Verify it renders a button with the correct label
    const languageButton = screen.getByLabelText('Language');
    expect(languageButton).toBeInTheDocument();
    expect(languageButton).toBeVisible();
  });

  /**
   * Test that simulates the application layout with the MobileLanguageSwitcher
   * in the Navbar component
   */
  it('should be present in the Navbar on mobile devices', () => {
    // Mock a ref for the progress bar
    const mockRef = { current: document.createElement('div') };
    
    // Render the Navbar component which should include MobileLanguageSwitcher on mobile
    const { container } = render(<Navbar progressBarRef={mockRef} />);

    // Verify we're in a mobile viewport
    expect(window.matchMedia('(max-width: 768px)').matches).toBe(true);
    
    // Find the mobile menu container (the div with md:hidden class)
    const mobileMenuContainer = container.querySelector('.md\\:hidden');
    expect(mobileMenuContainer).not.toBeNull();
    
    // Check if the mobile menu container has a button (the language switcher)
    if (mobileMenuContainer) {
      const button = mobileMenuContainer.querySelector('button');
      expect(button).not.toBeNull();
      expect(button).toBeVisible();
    }
  });
});
