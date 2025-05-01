/**
 * Test for Mobile Language Switcher Bug
 * 
 * This test specifically checks if the MobileLanguageSwitcher component
 * is properly included in the application for mobile devices.
 */

import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

describe('Mobile Language Switcher Bug', () => {
  /**
   * This test checks if the MobileLanguageSwitcher component is imported
   * and used in the Navbar component for mobile screens.
   */
  it('should have MobileLanguageSwitcher imported and used in Navbar', () => {
    // Read the Navbar component file content
    const navbarPath = path.join(process.cwd(), 'src/components/Navbar.tsx');
    const navbarContent = fs.readFileSync(navbarPath, 'utf8');
    
    // Check if MobileLanguageSwitcher is imported
    const hasImport = navbarContent.includes('import MobileLanguageSwitcher');
    
    // Check if MobileLanguageSwitcher component is used
    const hasComponent = navbarContent.includes('<MobileLanguageSwitcher');
    
    // These assertions should now pass since we've added the component to the Navbar
    expect(hasImport).toBe(true);
    expect(hasComponent).toBe(true);
  });

  /**
   * This test verifies that the MobileLanguageSwitcher component exists
   * and is properly implemented.
   */
  it('should have a properly implemented MobileLanguageSwitcher component', () => {
    // Check if the component file exists
    const componentPath = path.join(process.cwd(), 'src/components/MobileLanguageSwitcher.tsx');
    const componentExists = fs.existsSync(componentPath);
    
    expect(componentExists).toBe(true);
    
    if (componentExists) {
      // Read the component file content
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      // Check if it has the expected functionality
      const hasLanguageButton = componentContent.includes('button') && 
                               componentContent.includes('Language');
      const hasLanguageOptions = componentContent.includes('english') || 
                               componentContent.includes('spanish') || 
                               componentContent.includes('chinese');
      
      expect(hasLanguageButton).toBe(true);
      expect(hasLanguageOptions).toBe(true);
    }
  });
});
