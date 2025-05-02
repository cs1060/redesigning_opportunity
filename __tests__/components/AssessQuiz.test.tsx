import { render, screen } from '@testing-library/react';
import AssessYourCommunity from '../../src/components/AssessQuiz';
import { AssessProvider } from '../../src/components/AssessProvider';

// Mock the translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
}));

// Mock the geocoding util
jest.mock('../../src/utils/geocodingUtils', () => ({
  geocodeAddress: jest.fn().mockResolvedValue(true),
}));

describe('AssessYourCommunity Component', () => {
  test('should not allow adding multiple children', () => {
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Verify the "Add Another Child" button doesn't exist
    const addChildButton = screen.queryByText(/\+ addAnotherChild/i);
    expect(addChildButton).toBeNull();
  });
});