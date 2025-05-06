/**
 * Test for the NextSteps component
 * 
 * This test suite verifies all functionality of the NextSteps component including:
 * - UI rendering with and without selections
 * - Task generation for both "stay" and "move" actions
 * - Task completion toggling
 * - Explanation toggling
 * - Print, email, and download functionality
 * - Progress bar calculation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NextSteps from '../../src/components/NextSteps';
import '@testing-library/jest-dom';

// Mock the next-intl useTranslations hook
jest.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string, params?: Record<string, string | number | boolean>) => {
      // Simple translation function that returns the key
      if (params) {
        let result = key;
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{${param}}`, String(value));
        });
        return result;
      }
      return key;
    };
  }
}));

// Mock the jspdf and html2canvas dependencies
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    setFillColor: jest.fn(),
    rect: jest.fn(),
    line: jest.fn()
  }));
});

jest.mock('html2canvas', () => {
  return jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockImageData'),
    width: 800,
    height: 600
  });
});

// Mock window.open
const mockOpen = jest.fn().mockReturnValue({
  document: {
    write: jest.fn(),
    close: jest.fn(),
  },
  onload: jest.fn(),
  print: jest.fn(),
  close: jest.fn()
});

Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen
});

// Mock window.alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert
});

// Mock window.location.href for email testing
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: '' }
});

describe('NextSteps Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Basic UI rendering tests
  describe('UI Rendering', () => {
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

  // Task generation tests
  describe('Task Generation', () => {
    it('should generate tasks for "stay" action', () => {
      // Arrange
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      // Act
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Assert - Check for stay-specific tasks
      const taskElements = screen.getAllByRole('generic', { hidden: true })
        .filter(el => el.className.includes('cursor-pointer'));
      
      // Verify we have the expected number of tasks
      expect(taskElements.length).toBeGreaterThan(5); // At least 5 tasks for 'stay' action
      
      // Verify specific task types are present
      const taskTexts = screen.getAllByText(/township|school|program|parent|review|calendar/i);
      expect(taskTexts.length).toBeGreaterThan(0);
    });

    it('should generate tasks for "move" action', () => {
      // Arrange
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy'],
        selectedNeighborhood: 'Downtown',
        selectedHousingType: 'Apartment'
      };
      
      // Act
      render(<NextSteps selectedAction="move" savedChoices={mockSavedChoices} />);
      
      // Assert - Check for move-specific tasks
      const taskElements = screen.getAllByRole('generic', { hidden: true })
        .filter(el => el.className.includes('cursor-pointer'));
      
      // Verify we have the expected number of tasks
      expect(taskElements.length).toBeGreaterThan(7); // At least 7 tasks for 'move' action
      
      // Verify specific task types are present
      const taskTexts = screen.getAllByText(/housing|neighborhood|school|moving|budget|review|calendar/i);
      expect(taskTexts.length).toBeGreaterThan(0);
    });

    it('should handle missing selections in saved choices', () => {
      // Arrange - Missing school and neighborhood
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: null,
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      // Act
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Assert - Check that tasks are generated even with missing selections
      const taskElements = screen.getAllByRole('generic', { hidden: true })
        .filter(el => el.className.includes('cursor-pointer'));
      expect(taskElements.length).toBeGreaterThan(0);
    });
  });

  // Task interaction tests
  describe('Task Interactions', () => {
    it('should toggle task completion status when clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Find the first task checkbox
      const firstTaskCheckbox = screen.getAllByRole('generic', { hidden: true })
        .filter(el => el.className.includes('cursor-pointer'))[0];
      
      // Get initial task count
      const initialProgressText = screen.getByText(/0 of .* tasks completed/i);
      expect(initialProgressText).toBeInTheDocument();
      
      // Act - Click to complete
      await user.click(firstTaskCheckbox);
      
      // Assert - Task should be marked as completed
      const updatedProgressText = screen.getByText(/1 of .* tasks completed/i);
      expect(updatedProgressText).toBeInTheDocument();
      
      // Act - Click again to uncomplete
      await user.click(firstTaskCheckbox);
      
      // Assert - Task should be unmarked
      const finalProgressText = screen.getByText(/0 of .* tasks completed/i);
      expect(finalProgressText).toBeInTheDocument();
    });

    it('should toggle explanation visibility when info button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Find the first task info button
      const infoButton = screen.getAllByRole('button', { name: /explanation/i })[0];
      
      // Act - Click to show explanation
      await user.click(infoButton);
      
      // Assert - Explanation should be visible
      expect(screen.getByText('Why this matters:')).toBeInTheDocument();
      
      // Act - Click again to hide explanation
      await user.click(infoButton);
      
      // Assert - Explanation should be hidden
      expect(screen.queryByText('Why this matters:')).not.toBeInTheDocument();
    });
  });

  // Export functionality tests
  describe('Export Functionality', () => {
    it('should handle printing the checklist', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      // Reset mocks before test
      mockOpen.mockClear();
      mockAlert.mockClear();
      
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Find the print button
      const printButton = screen.getByRole('button', { name: /print/i });
      
      // Act - Click the print button
      await user.click(printButton);
      
      // Assert - window.open should be called
      expect(mockOpen).toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });
    
    it('should show alert when popup is blocked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      // Reset mocks before test
      mockOpen.mockClear();
      mockAlert.mockClear();
      mockOpen.mockReturnValueOnce(null); // Simulate blocked popup
      
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Find the print button
      const printButton = screen.getByRole('button', { name: /print/i });
      
      // Act - Click the print button
      await user.click(printButton);
      
      // Assert - alert should be called
      expect(mockAlert).toHaveBeenCalledWith('Please allow pop-ups to print the checklist.');
    });

    it('should handle emailing the checklist', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Find the email button
      const emailButton = screen.getByRole('button', { name: /email/i });
      
      // Act - Click the email button
      await user.click(emailButton);
      
      // Assert - window.location.href should be set to a mailto link
      expect(window.location.href).toContain('mailto:');
      expect(window.location.href).toContain('subject=My%20Next%20Steps');
    });

    it('should handle downloading the checklist as PDF', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      // Access the mocked modules
      const jsPDFMock = jest.requireMock('jspdf');
      const html2canvasMock = jest.requireMock('html2canvas');
      
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Find the download button
      const downloadButton = screen.getByRole('button', { name: /download/i });
      
      // Act - Click the download button
      await user.click(downloadButton);
      
      // Assert - PDF generation functions should be called
      await waitFor(() => {
        expect(html2canvasMock).toHaveBeenCalled();
        expect(jsPDFMock).toHaveBeenCalled();
        // Check that save was called, but don't check the exact filename
        // as it may vary based on implementation
        expect(jsPDFMock.mock.results[0].value.save).toHaveBeenCalled();
      });
    });
  });

  // Progress calculation tests
  describe('Progress Calculation', () => {
    // ... (rest of the code remains the same)
    it('should calculate progress percentage correctly', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Initial state - 0%
      const initialProgressText = screen.getByText(/0 of .* tasks completed/i);
      expect(initialProgressText).toBeInTheDocument();
      expect(initialProgressText.textContent).toContain('0%');
      
      // Find the first two task checkboxes
      const taskCheckboxes = screen.getAllByRole('generic', { hidden: true })
        .filter(el => el.className.includes('cursor-pointer'));
      
      // Act - Complete first task
      await user.click(taskCheckboxes[0]);
      
      // Assert - Progress should update
      const updatedProgressText = screen.getByText(/1 of .* tasks completed/i);
      expect(updatedProgressText).toBeInTheDocument();
      
      // Act - Complete second task
      await user.click(taskCheckboxes[1]);
      
      // Assert - Progress should update again
      const finalProgressText = screen.getByText(/2 of .* tasks completed/i);
      expect(finalProgressText).toBeInTheDocument();
    });
  });

  // Reset state test
  describe('State Reset', () => {
    it('should reset completed tasks when selectedAction changes', () => {
      // Arrange
      const mockSavedChoices = {
        town: 'Oakridge',
        selectedSchool: 'Oakridge Elementary',
        selectedCommunityPrograms: ['Youth Leadership Academy']
      };
      
      const { rerender } = render(<NextSteps selectedAction="stay" savedChoices={mockSavedChoices} />);
      
      // Find a task checkbox and complete it
      const taskCheckbox = screen.getAllByRole('generic', { hidden: true })
        .filter(el => el.className.includes('cursor-pointer'))[0];
      fireEvent.click(taskCheckbox);
      
      // Verify task is completed
      expect(screen.getByText(/1 of .* tasks completed/i)).toBeInTheDocument();
      
      // Act - Change the selectedAction
      rerender(<NextSteps selectedAction="move" savedChoices={mockSavedChoices} />);
      
      // Assert - Completed tasks should be reset
      expect(screen.getByText(/0 of .* tasks completed/i)).toBeInTheDocument();
    });
  });
});
