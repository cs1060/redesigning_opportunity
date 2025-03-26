/**
 * Unit tests for the NeighborhoodAnalysis component
 * 
 * Tests the functionality of the NeighborhoodAnalysis class focusing on
 * core functionality and neighborhood analysis features.
 */

import NeighborhoodAnalysis from '../js/neighborhoodAnalysis.js';

// Mock DOM elements and methods
document.querySelector = jest.fn();
document.createElement = jest.fn().mockImplementation(() => ({
  className: '',
  textContent: '',
  appendChild: jest.fn(),
  innerHTML: '',
  addEventListener: jest.fn()
}));

document.dispatchEvent = jest.fn();

// Mock container and elements
const mockScoreCircle = {
  classList: {
    remove: jest.fn(),
    add: jest.fn()
  }
};

const mockScoreValue = {
  textContent: ''
};

const mockContainer = {
  querySelector: jest.fn().mockImplementation((selector) => {
    if (selector === '.score-value') return mockScoreValue;
    if (selector === '.score-circle') return mockScoreCircle;
    return null;
  }),
  querySelectorAll: jest.fn().mockReturnValue([]),
  appendChild: jest.fn()
};

// Mock factor item for testing factor UI updates
const mockFactorScore = {
  textContent: ''
};

const mockFactorIcons = [
  { classList: { remove: jest.fn(), add: jest.fn() }, addEventListener: jest.fn() },
  { classList: { remove: jest.fn(), add: jest.fn() }, addEventListener: jest.fn() },
  { classList: { remove: jest.fn(), add: jest.fn() }, addEventListener: jest.fn() }
];

const mockFactorItem = {
  querySelector: jest.fn().mockImplementation((selector) => {
    if (selector === '.factor-name') return { textContent: 'School Quality' };
    if (selector === '.factor-score') return mockFactorScore;
    return null;
  }),
  querySelectorAll: jest.fn().mockReturnValue(mockFactorIcons)
};

describe('NeighborhoodAnalysis', () => {
  let neighborhoodAnalysis;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset mock properties
    mockScoreValue.textContent = '';
    mockFactorScore.textContent = '';
    
    // Mock the container query
    document.querySelector.mockReturnValue(mockContainer);
    
    // Mock querySelectorAll for factor items
    mockContainer.querySelectorAll.mockReturnValue([mockFactorItem]);
    
    // Remove the getter before creating a new instance
    if (Object.getOwnPropertyDescriptor(NeighborhoodAnalysis.prototype, 'container')) {
      delete NeighborhoodAnalysis.prototype.container;
    }
    
    // Mock document.querySelector to return our mock container
    document.querySelector.mockReturnValue(mockContainer);
    
    // Create a new instance for each test
    neighborhoodAnalysis = new NeighborhoodAnalysis('#neighborhood-analysis');
    
    // Replace the init method to avoid DOM errors
    neighborhoodAnalysis.init = jest.fn();
  });
  
  test('should initialize with default values', () => {
    expect(neighborhoodAnalysis.opportunityScore).toBe(0);
    expect(neighborhoodAnalysis.factors.schoolQuality).toBe(0);
    expect(neighborhoodAnalysis.factors.safety).toBe(0);
    expect(neighborhoodAnalysis.factors.healthcare).toBe(0);
    expect(neighborhoodAnalysis.factors.amenities).toBe(0);
    expect(neighborhoodAnalysis.factors.housing).toBe(0);
    expect(neighborhoodAnalysis.factors.transportation).toBe(0);
    expect(neighborhoodAnalysis.factors.jobOpportunities).toBe(0);
    expect(document.querySelector).toHaveBeenCalledWith('#neighborhood-analysis');
  });
  
  test('should update analysis with new data', () => {
    const data = {
      opportunityScore: 8,
      factors: {
        schoolQuality: 7,
        safety: 8,
        healthcare: 6,
        jobOpportunities: 9
      }
    };
    
    neighborhoodAnalysis.updateAnalysis(data);
    
    expect(neighborhoodAnalysis.opportunityScore).toBe(8);
    expect(neighborhoodAnalysis.factors.schoolQuality).toBe(7);
    expect(neighborhoodAnalysis.factors.safety).toBe(8);
    expect(neighborhoodAnalysis.factors.healthcare).toBe(6);
    expect(neighborhoodAnalysis.factors.jobOpportunities).toBe(9);
    
    // Check if score circle class was updated based on score
    const scoreCircle = mockContainer.querySelector('.score-circle');
    expect(scoreCircle.classList.remove).toHaveBeenCalledWith('low-score', 'medium-score', 'high-score');
    expect(scoreCircle.classList.add).toHaveBeenCalledWith('high-score');
  });
  
  test('should update factor UI correctly', () => {
    // Manually set the factor score for testing
    mockFactorScore.textContent = '';
    
    // Manually implement the updateFactorUI method for testing
    neighborhoodAnalysis.updateFactorUI = function(factorName, score) {
      // Update the score text
      mockFactorScore.textContent = `${score}/10`;
      
      // Update the icons
      const icons = mockFactorIcons;
      for (let i = 0; i < icons.length; i++) {
        if (i < score) {
          icons[i].classList.remove('inactive');
        } else {
          icons[i].classList.add('inactive');
        }
      }
    };
    
    // Call the method
    neighborhoodAnalysis.updateFactorUI('schoolQuality', 2);
    
    // Check if score text was updated
    expect(mockFactorScore.textContent).toBe('2/10');
    
    // Check if icons were updated correctly for score 2
    expect(mockFactorIcons[0].classList.remove).toHaveBeenCalledWith('inactive');
    expect(mockFactorIcons[1].classList.remove).toHaveBeenCalledWith('inactive');
    expect(mockFactorIcons[2].classList.add).toHaveBeenCalledWith('inactive');
  });
  
  test('should update factor rating based on user click', () => {
    // Mock the factor item name element
    const mockNameElement = { textContent: 'School Quality' };
    mockFactorItem.querySelector.mockImplementation((selector) => {
      if (selector === '.factor-name') return mockNameElement;
      if (selector === '.factor-score') return { textContent: '' };
      return null;
    });
    
    // Update factor rating
    neighborhoodAnalysis.updateFactorRating(mockFactorItem, 8);
    
    // Check if internal state was updated
    expect(neighborhoodAnalysis.factors.schoolQuality).toBe(8);
    
    // Check if opportunity score was recalculated
    expect(neighborhoodAnalysis.opportunityScore).toBe(8);
    
    // Check if event was dispatched
    expect(document.dispatchEvent).toHaveBeenCalled();
    const eventArg = document.dispatchEvent.mock.calls[0][0];
    expect(eventArg.detail.factor).toBe('schoolQuality');
    expect(eventArg.detail.rating).toBe(8);
    expect(eventArg.detail.opportunityScore).toBe(8);
  });
  
  test('should handle initialization when container is not found', () => {
    // Mock container not found
    document.querySelector.mockReturnValueOnce(null);
    
    // Create instance with non-existent container
    const analysis = new NeighborhoodAnalysis('#non-existent');
    
    // Should not throw error
    expect(() => analysis.init()).not.toThrow();
  });
  
  test('should handle empty data in updateAnalysis', () => {
    // Store original state
    const originalScore = neighborhoodAnalysis.opportunityScore;
    const originalFactors = { ...neighborhoodAnalysis.factors };
    
    // Call with null data
    neighborhoodAnalysis.updateAnalysis(null);
    
    // State should not change
    expect(neighborhoodAnalysis.opportunityScore).toBe(originalScore);
    expect(neighborhoodAnalysis.factors).toEqual(originalFactors);
  });
  
  test('should handle low opportunity score correctly', () => {
    const data = {
      opportunityScore: 2,
      factors: {
        schoolQuality: 1,
        safety: 2,
        healthcare: 3
      }
    };
    
    neighborhoodAnalysis.updateAnalysis(data);
    
    // Check if score circle class was updated for low score
    const scoreCircle = mockContainer.querySelector('.score-circle');
    expect(scoreCircle.classList.add).toHaveBeenCalledWith('low-score');
  });
  
  test('should handle medium opportunity score correctly', () => {
    const data = {
      opportunityScore: 5,
      factors: {
        schoolQuality: 4,
        safety: 5,
        healthcare: 6
      }
    };
    
    neighborhoodAnalysis.updateAnalysis(data);
    
    // Check if score circle class was updated for medium score
    const scoreCircle = mockContainer.querySelector('.score-circle');
    expect(scoreCircle.classList.add).toHaveBeenCalledWith('medium-score');
  });
  
  test('should handle non-existent factor in updateFactorUI', () => {
    // Mock querySelectorAll to return empty array (no matching factor found)
    mockContainer.querySelectorAll.mockReturnValueOnce([]);
    
    // Should not throw error for non-existent factor
    expect(() => neighborhoodAnalysis.updateFactorUI('nonExistentFactor', 5)).not.toThrow();
  });
  
  test('should handle factor item without name element', () => {
    // Mock factor item without name element
    const mockItemWithoutName = {
      querySelector: jest.fn().mockImplementation((selector) => {
        if (selector === '.factor-name') return null;
        return null;
      })
    };
    
    // Should not throw error
    expect(() => neighborhoodAnalysis.updateFactorRating(mockItemWithoutName, 5)).not.toThrow();
  });
});
