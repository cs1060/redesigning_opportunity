import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssessYourCommunity from '../../src/components/AssessQuiz';
import { AssessProvider } from '../../src/components/AssessProvider';
import { geocodeAddress } from '../../src/utils/geocodingUtils';
import '@testing-library/jest-dom';

// Mock the translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
}));

// Mock the geocoding util
jest.mock('../../src/utils/geocodingUtils', () => ({
  geocodeAddress: jest.fn(),
}));

// Mock fetch for API testing
global.fetch = jest.fn();

describe('AssessYourCommunity Component', () => {
  // Setup default mock responses
  beforeEach(() => {
    jest.clearAllMocks();
    (geocodeAddress as jest.Mock).mockResolvedValue({ lng: -73.9857, lat: 40.7484 });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
    
    // Mock scrollIntoView to prevent errors
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    
    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true);
  });
  
  // Restore mocks after each test
  afterEach(() => {
    // Restore original methods if they were replaced in the test
    jest.restoreAllMocks();
  });

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

  test('should render form sections correctly', () => {
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Check section headings
    expect(screen.getByText('parentInfo')).toBeInTheDocument();
    expect(screen.getByText('childInfo')).toBeInTheDocument();
    
    // Check form exists
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('should validate address when all address fields are filled', async () => {
    const user = userEvent.setup();
    
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Get the input fields by their IDs
    const streetInput = screen.getByRole('textbox', { name: /streetAddress/ });
    const cityInput = screen.getByRole('textbox', { name: /city/ });
    const stateSelect = screen.getByRole('combobox', { name: /state/ });
    
    // Fill out address fields
    await user.type(streetInput, '123 Main St');
    await user.type(cityInput, 'Boston');
    await user.selectOptions(stateSelect, 'MA');
    
    // Wait for validation to occur (debounced)
    await waitFor(() => {
      expect(geocodeAddress).toHaveBeenCalledWith('123 Main St, Boston, MA');
    }, { timeout: 2000 });
    
    // Validation message should appear
    await waitFor(() => {
      expect(screen.getByText('addressValidated')).toBeInTheDocument();
    });
  });

  test('should show error when address validation fails', async () => {
    const user = userEvent.setup();
    (geocodeAddress as jest.Mock).mockResolvedValue(null);
    
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Get the input fields by their IDs
    const streetInput = screen.getByRole('textbox', { name: /streetAddress/ });
    const cityInput = screen.getByRole('textbox', { name: /city/ });
    const stateSelect = screen.getByRole('combobox', { name: /state/ });
    
    // Fill out address fields
    await user.type(streetInput, '123 Invalid St');
    await user.type(cityInput, 'Nowhere');
    await user.selectOptions(stateSelect, 'NY');
    
    // Wait for validation to occur
    await waitFor(() => {
      expect(geocodeAddress).toHaveBeenCalledWith('123 Invalid St, Nowhere, NY');
    }, { timeout: 2000 });
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText('addressNotFound')).toBeInTheDocument();
    });
  });

  test('should verify form data is correctly formatted for submission', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm for the address validation warning
    const originalConfirm = window.confirm;
    window.confirm = jest.fn().mockReturnValue(true);
    
    // Mock scrollIntoView
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Get the input fields
    const streetInput = screen.getByRole('textbox', { name: /streetAddress/ });
    const cityInput = screen.getByRole('textbox', { name: /city/ });
    const stateSelect = screen.getByRole('combobox', { name: /state/ });
    const incomeSelect = screen.getByRole('combobox', { name: /Annual Household Income/ });
    const childNameInput = screen.getByRole('textbox', { name: /childName/ });
    const genderSelect = screen.getByRole('combobox', { name: /gender/ });
    const ageInput = screen.getByRole('spinbutton', { name: /age/ });
    const ethnicitySelect = screen.getByRole('combobox', { name: /ethnicity/ });
    
    // Fill out required fields
    await user.type(streetInput, '123 Main St');
    await user.type(cityInput, 'Boston');
    await user.selectOptions(stateSelect, 'MA');
    await user.selectOptions(incomeSelect, '50-75k');
    
    // Click the Yes radio for employment
    const yesOption = screen.getByText('yes');
    await user.click(yesOption);
    
    // Fill child information
    await user.type(childNameInput, 'John Doe');
    await user.selectOptions(genderSelect, 'M');
    await user.type(ageInput, '10');
    await user.selectOptions(ethnicitySelect, 'W');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Wait for form submission
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/save-family-data', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.any(String)
      }));
    });
    
    // Verify the form data was submitted correctly
    const submittedData = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(submittedData).toEqual(expect.objectContaining({
      street: '123 Main St',
      city: 'Boston',
      state: 'MA',
      address: '123 Main St, Boston, MA',
      income: '50-75k',
      isEmployed: true,
      children: [
        expect.objectContaining({
          name: 'John Doe',
          gender: 'M',
          age: '10',
          ethnicity: 'W'
        })
      ]
    }));
    
    // Restore original methods
    window.confirm = originalConfirm;
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  test('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock a failed API response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Get the input fields
    const streetInput = screen.getByRole('textbox', { name: /streetAddress/ });
    const cityInput = screen.getByRole('textbox', { name: /city/ });
    const stateSelect = screen.getByRole('combobox', { name: /state/ });
    const incomeSelect = screen.getByRole('combobox', { name: /Annual Household Income/ });
    const childNameInput = screen.getByRole('textbox', { name: /childName/ });
    const genderSelect = screen.getByRole('combobox', { name: /gender/ });
    const ageInput = screen.getByRole('spinbutton', { name: /age/ });
    const ethnicitySelect = screen.getByRole('combobox', { name: /ethnicity/ });
    
    // Fill out required fields
    await user.type(streetInput, '123 Main St');
    await user.type(cityInput, 'Boston');
    await user.selectOptions(stateSelect, 'MA');
    await user.selectOptions(incomeSelect, '50-75k');
    
    // Click the Yes radio for employment
    const yesOption = screen.getByText('yes');
    await user.click(yesOption);
    
    // Fill child information
    await user.type(childNameInput, 'John Doe');
    await user.selectOptions(genderSelect, 'M');
    await user.type(ageInput, '10');
    await user.selectOptions(ethnicitySelect, 'W');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Wait for form submission and error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting form:', expect.any(Error));
    });
    
    // Clean up
    consoleSpy.mockRestore();
  });

  test('should combine address components correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Get the input fields
    const streetInput = screen.getByRole('textbox', { name: /streetAddress/ });
    const cityInput = screen.getByRole('textbox', { name: /city/ });
    const stateSelect = screen.getByRole('combobox', { name: /state/ });
    
    // Fill out address fields one by one
    await user.type(streetInput, '123 Main St');
    await user.type(cityInput, 'Boston');
    await user.selectOptions(stateSelect, 'MA');
    
    // Also fill required fields to make the form submission work
    const incomeSelect = screen.getByRole('combobox', { name: /Annual Household Income/ });
    const childNameInput = screen.getByRole('textbox', { name: /childName/ });
    const genderSelect = screen.getByRole('combobox', { name: /gender/ });
    const ageInput = screen.getByRole('spinbutton', { name: /age/ });
    const ethnicitySelect = screen.getByRole('combobox', { name: /ethnicity/ });
    
    await user.selectOptions(incomeSelect, '50-75k');
    await user.click(screen.getByText('yes'));
    await user.type(childNameInput, 'John Doe');
    await user.selectOptions(genderSelect, 'M');
    await user.type(ageInput, '10');
    await user.selectOptions(ethnicitySelect, 'W');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Wait for form submission
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // Verify the address was combined correctly
    const submittedData = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(submittedData.address).toBe('123 Main St, Boston, MA');
  });
  
  test('should toggle employment status correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Initially employment status should be false (default)
    const yesText = screen.getByText('yes');
    const noText = screen.getByText('no');
    
    // Click Yes option
    await user.click(yesText);
    
    // Fill out required fields and submit to check isEmployed value
    const streetInput = screen.getByRole('textbox', { name: /streetAddress/ });
    const cityInput = screen.getByRole('textbox', { name: /city/ });
    const stateSelect = screen.getByRole('combobox', { name: /state/ });
    const incomeSelect = screen.getByRole('combobox', { name: /Annual Household Income/ });
    const childNameInput = screen.getByRole('textbox', { name: /childName/ });
    const genderSelect = screen.getByRole('combobox', { name: /gender/ });
    const ageInput = screen.getByRole('spinbutton', { name: /age/ });
    const ethnicitySelect = screen.getByRole('combobox', { name: /ethnicity/ });
    
    await user.type(streetInput, '123 Main St');
    await user.type(cityInput, 'Boston');
    await user.selectOptions(stateSelect, 'MA');
    await user.selectOptions(incomeSelect, '50-75k');
    await user.type(childNameInput, 'John Doe');
    await user.selectOptions(genderSelect, 'M');
    await user.type(ageInput, '10');
    await user.selectOptions(ethnicitySelect, 'W');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Verify isEmployed is true
    await waitFor(() => {
      const submittedData = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(submittedData.isEmployed).toBe(true);
    });
    
    // Clear mocks to test the No option
    (global.fetch as jest.Mock).mockClear();
    
    // Click No option
    await user.click(noText);
    
    // Submit the form again
    await user.click(submitButton);
    
    // Verify isEmployed is false
    await waitFor(() => {
      const submittedData = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(submittedData.isEmployed).toBe(false);
    });
    
    // Test clicking the radio button divs directly
    // Clear mocks again
    (global.fetch as jest.Mock).mockClear();
    
    // Just click the Yes text again - this is simpler and more reliable
    await user.click(yesText);
    
    // Submit the form again
    await user.click(submitButton);
    
    // Verify isEmployed is true again
    await waitFor(() => {
      const submittedData = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(submittedData.isEmployed).toBe(true);
    });
  });
  
  test('should handle address validation with user confirmation', async () => {
    const user = userEvent.setup();
    
    // Mock geocodeAddress to return null (invalid address)
    (geocodeAddress as jest.Mock).mockResolvedValue(null);
    
    // Mock window.confirm to return true (user wants to continue)
    window.confirm = jest.fn().mockReturnValue(true);
    
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Fill out required fields
    const streetInput = screen.getByRole('textbox', { name: /streetAddress/ });
    const cityInput = screen.getByRole('textbox', { name: /city/ });
    const stateSelect = screen.getByRole('combobox', { name: /state/ });
    const incomeSelect = screen.getByRole('combobox', { name: /Annual Household Income/ });
    const childNameInput = screen.getByRole('textbox', { name: /childName/ });
    const genderSelect = screen.getByRole('combobox', { name: /gender/ });
    const ageInput = screen.getByRole('spinbutton', { name: /age/ });
    const ethnicitySelect = screen.getByRole('combobox', { name: /ethnicity/ });
    
    await user.type(streetInput, '123 Invalid St');
    await user.type(cityInput, 'Nowhere');
    await user.selectOptions(stateSelect, 'NY');
    await user.selectOptions(incomeSelect, '50-75k');
    await user.click(screen.getByText('yes'));
    await user.type(childNameInput, 'John Doe');
    await user.selectOptions(genderSelect, 'M');
    await user.type(ageInput, '10');
    await user.selectOptions(ethnicitySelect, 'W');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Verify window.confirm was called
    expect(window.confirm).toHaveBeenCalled();
    
    // Verify form was submitted despite invalid address
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
  
  test('should not submit if user cancels address validation warning', async () => {
    const user = userEvent.setup();
    
    // Mock geocodeAddress to return null (invalid address)
    (geocodeAddress as jest.Mock).mockResolvedValue(null);
    
    // Mock window.confirm to return false (user cancels)
    window.confirm = jest.fn().mockReturnValue(false);
    
    render(
      <AssessProvider>
        <AssessYourCommunity />
      </AssessProvider>
    );
    
    // Fill out required fields
    const streetInput = screen.getByRole('textbox', { name: /streetAddress/ });
    const cityInput = screen.getByRole('textbox', { name: /city/ });
    const stateSelect = screen.getByRole('combobox', { name: /state/ });
    const incomeSelect = screen.getByRole('combobox', { name: /Annual Household Income/ });
    const childNameInput = screen.getByRole('textbox', { name: /childName/ });
    const genderSelect = screen.getByRole('combobox', { name: /gender/ });
    const ageInput = screen.getByRole('spinbutton', { name: /age/ });
    const ethnicitySelect = screen.getByRole('combobox', { name: /ethnicity/ });
    
    await user.type(streetInput, '123 Invalid St');
    await user.type(cityInput, 'Nowhere');
    await user.selectOptions(stateSelect, 'NY');
    await user.selectOptions(incomeSelect, '50-75k');
    await user.click(screen.getByText('yes'));
    await user.type(childNameInput, 'John Doe');
    await user.selectOptions(genderSelect, 'M');
    await user.type(ageInput, '10');
    await user.selectOptions(ethnicitySelect, 'W');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Verify window.confirm was called
    expect(window.confirm).toHaveBeenCalled();
    
    // Verify form was NOT submitted
    expect(global.fetch).not.toHaveBeenCalled();
  });
});