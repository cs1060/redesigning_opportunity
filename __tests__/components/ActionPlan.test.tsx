/**
 * Test for the TakeAction component
 * 
 * This test focuses on verifying that switching between "Stay" and "Move" 
 * properly resets the savedChoices state, which was the source of a bug
 * where the NextSteps component wouldn't refresh properly.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the dependencies before importing the component
jest.mock('@/components/OpportunityMap', () => ({
  MapOnly: () => <div data-testid="mock-map">Mock Map</div>
}));

// Import the component after mocking its dependencies
import TakeAction from '@/components/action-plan/ActionPlan';
import { AssessProvider } from '@/components/AssessProvider';

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

// Mock the useAssessment hook but keep the actual AssessProvider
jest.mock('@/components/AssessProvider', () => {
  const originalModule = jest.requireActual('@/components/AssessProvider');
  return {
    ...originalModule,
    useAssessment: jest.fn().mockReturnValue({
      data: {
        address: '123 Test St',
        children: [{ name: 'Test Child', age: 10, gender: 'F', ethnicity: 'W' }]
      },
      updateData: jest.fn(),
      setFullData: jest.fn()
    })
  };
});

// Mock the child components
jest.mock('@/components/action-plan/Stay', () => {
  return function MockStay({ onSaveChoices }: { onSaveChoices: (choices: any) => void }) {
    return (
      <div data-testid="mock-stay">
        <button 
          data-testid="save-stay-choices"
          onClick={() => onSaveChoices({
            town: 'Oakridge',
            selectedSchool: 'Oakridge Elementary',
            selectedCommunityPrograms: ['Youth Leadership Academy']
          })}
        >
          Save Stay Choices
        </button>
      </div>
    );
  };
});

jest.mock('@/components/action-plan/Move', () => {
  return function MockMove({ onSaveChoices }: { onSaveChoices: (choices: any) => void }) {
    return (
      <div data-testid="mock-move">
        <button 
          data-testid="save-move-choices"
          onClick={() => onSaveChoices({
            town: 'Arlington Heights',
            selectedNeighborhood: 'Arlington Heights',
            selectedSchool: 'Arlington Elementary',
            selectedCommunityPrograms: ['Arlington Youth Leadership'],
            selectedHousingType: 'Single Family Home'
          })}
        >
          Save Move Choices
        </button>
      </div>
    );
  };
});

describe('TakeAction Component', () => {
  // Test that verifies the bug fix: switching between Stay and Move should reset savedChoices
  it('should reset savedChoices when switching between Stay and Move', async () => {
    // Arrange
    const mockSaveActionAndChoices = jest.fn();
    const user = userEvent.setup();
    
    // Render the component with the mock function
    render(<TakeAction onSaveActionAndChoices={mockSaveActionAndChoices} />);
    
    // Act - First select Stay
    await user.click(screen.getByText('stayOption').closest('div')!);
    
    // Verify Stay is selected (mock would be called with 'stay' and null)
    expect(mockSaveActionAndChoices).toHaveBeenCalledWith('stay', null);
    mockSaveActionAndChoices.mockClear();
    
    // Simulate saving choices in Stay mode by clicking the mock button
    await user.click(screen.getByTestId('save-stay-choices'));
    
    // Verify the mock was called with the stay choices
    expect(mockSaveActionAndChoices).toHaveBeenCalledTimes(1);
    expect(mockSaveActionAndChoices).toHaveBeenCalledWith('stay', {
      town: 'Oakridge',
      selectedSchool: 'Oakridge Elementary',
      selectedCommunityPrograms: ['Youth Leadership Academy']
    });
    mockSaveActionAndChoices.mockClear();
    
    // Now switch to Move
    await user.click(screen.getByText('moveOption').closest('div')!);
    
    // Verify that switching to Move resets the savedChoices (mock called with 'move' and null)
    expect(mockSaveActionAndChoices).toHaveBeenCalledWith('move', null);
    mockSaveActionAndChoices.mockClear();
    
    // Simulate saving choices in Move mode by clicking the mock button
    await user.click(screen.getByTestId('save-move-choices'));
    
    // Verify the mock was called with the move choices
    expect(mockSaveActionAndChoices).toHaveBeenCalledTimes(1);
    expect(mockSaveActionAndChoices).toHaveBeenCalledWith('move', {
      town: 'Arlington Heights',
      selectedNeighborhood: 'Arlington Heights',
      selectedSchool: 'Arlington Elementary',
      selectedCommunityPrograms: ['Arlington Youth Leadership'],
      selectedHousingType: 'Single Family Home'
    });
    mockSaveActionAndChoices.mockClear();
    
    // Switch back to Stay
    await user.click(screen.getByText('stayOption').closest('div')!);
    
    // Verify that switching back to Stay resets the savedChoices again
    expect(mockSaveActionAndChoices).toHaveBeenCalledWith('stay', null);
  });
  
  // Test that verifies the parent component receives the correct action and choices
  it('should call onSaveActionAndChoices with the correct action and choices', async () => {
    // Arrange
    const mockSaveActionAndChoices = jest.fn();
    const user = userEvent.setup();
    
    // Render the component with the mock function
    render(<TakeAction onSaveActionAndChoices={mockSaveActionAndChoices} />);
    
    // Act - Select Stay
    await user.click(screen.getByText('stayOption').closest('div')!);
    
    // Assert - Should be called with 'stay' and null initially
    expect(mockSaveActionAndChoices).toHaveBeenCalledWith('stay', null);
    
    // Clear the mock to track new calls
    mockSaveActionAndChoices.mockClear();
    
    // Act - Select Move
    await user.click(screen.getByText('moveOption').closest('div')!);
    
    // Assert - Should be called with 'move' and null
    expect(mockSaveActionAndChoices).toHaveBeenCalledWith('move', null);
  });
});
