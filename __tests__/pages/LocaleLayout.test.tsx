/**
 * Test for LocaleLayout component
 * 
 * This test verifies that the LocaleLayout includes the MobileLanguageSwitcher
 * component, which is necessary for language switching on mobile devices.
 */

import { render, screen } from '@testing-library/react';
import LocaleLayout from '@/app/[locale]/layout';
import '@testing-library/jest-dom';

// Mock the necessary components
jest.mock('@/components/MobileLanguageSwitcher', () => {
  return function MockMobileLanguageSwitcher() {
    return <div data-testid="mobile-language-switcher">Mobile Language Switcher</div>;
  };
});

jest.mock('@/components/IntlProvider', () => {
  return function MockIntlProvider({ children }: { children: React.ReactNode }) {
    return <div data-testid="intl-provider">{children}</div>;
  };
});

// Mock dynamic imports for messages
jest.mock('../../messages/en.json', () => ({
  default: {}
}), { virtual: true });

describe('LocaleLayout', () => {
  it('should include MobileLanguageSwitcher for mobile language switching', async () => {
    // Render the LocaleLayout
    render(
      await LocaleLayout({
        children: <div>Test content</div>,
        params: { locale: 'en' }
      })
    );
    
    // Check if the MobileLanguageSwitcher is included in the layout
    const languageSwitcher = screen.queryByTestId('mobile-language-switcher');
    
    // This test will fail if MobileLanguageSwitcher is not included in the layout
    expect(languageSwitcher).toBeInTheDocument();
  });
});
