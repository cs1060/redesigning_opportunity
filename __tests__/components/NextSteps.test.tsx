/**
 * Test for the NextSteps component
 * 
 * This test focuses on verifying that the NextSteps component doesn't 
 * take up excessive vertical space when no action or choices are selected.
 */

import { render, screen } from '@testing-library/react';
import NextSteps from '@/components/NextSteps';

// Mock the next-intl useTranslations hook
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, any>) => {
    // Simple translation function that returns the key
    if (params) {
      let result = key;
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, value);
      });
      return result;
    }
    return key;
  }
}));

// Mock the jspdf and html2canvas dependencies
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn()
  }));
});

jest.mock('html2canvas', () => {
  return jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockImageData'),
    width: 800,
    height: 600
  });
});

describe('NextSteps Component', () => {
  // Test that verifies the component doesn't have min-h-screen class when no action/choices are selected
  it('should not have min-h-screen class when no action or choices are selected', () => {
    // Arrange & Act
    const { container } = render(
      <NextSteps selectedAction={null} savedChoices={null} />
    );
    
    // Assert
    const nextStepsDiv = container.querySelector('#next-steps');
    expect(nextStepsDiv).not.toHaveClass('min-h-screen');
    
    // Also verify the padding is reduced
    expect(nextStepsDiv).toHaveClass('py-6');
    expect(nextStepsDiv).not.toHaveClass('py-10');
  });
  
  // Test that verifies the component has min-h-screen class when action and choices are selected
  it('should have min-h-screen class when action and choices are selected', () => {
    // Arrange
    const mockSavedChoices = {
      town: 'Oakridge',
      selectedSchool: 'Oakridge Elementary',
      selectedCommunityPrograms: ['Youth Leadership Academy']
    };
    
    // Act
    const { container } = render(
      <NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />
    );
    
    // Assert
    const nextStepsDiv = container.querySelector('#next-steps');
    expect(nextStepsDiv).toHaveClass('min-h-screen');
    expect(nextStepsDiv).toHaveClass('py-10');
  });
  
  // Test that verifies the component displays the correct heading when no action/choices are selected
  it('should display the correct heading and message when no action or choices are selected', () => {
    // Arrange & Act
    render(<NextSteps selectedAction={null} savedChoices={null} />);
    
    // Assert
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('completeMessage')).toBeInTheDocument();
    
    // Check that the font sizes are reduced
    const heading = screen.getByText('title');
    const message = screen.getByText('completeMessage');
    
    expect(heading).toHaveClass('text-2xl');
    expect(message).toHaveClass('text-lg');
  });
  
  // Test that verifies the component displays the checklist when action and choices are selected
  it('should display the checklist when action and choices are selected', () => {
    // Arrange
    const mockSavedChoices = {
      town: 'Oakridge',
      selectedSchool: 'Oakridge Elementary',
      selectedCommunityPrograms: ['Youth Leadership Academy']
    };
    
    // Act
    render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
    
    // Assert
    expect(screen.getByText('yourNextSteps')).toBeInTheDocument();
    expect(screen.getByText('Your Saved Choices')).toBeInTheDocument();
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Your To-Do List')).toBeInTheDocument();
  });
});
