import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommunityConnections from '../../src/components/CommunityConnections';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

// Mock the next-intl translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key === 'testimonialSubmitMessage' ? 'Thank you for sharing your story!' : key,
}));

// Mock Firebase Firestore
jest.mock('../../src/utils/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

describe('CommunityConnections Component', () => {
  const mockTestimonials = [
    {
      id: '1',
      name: 'Sarah Johnson',
      location: 'Brookline, MA',
      rating: 5,
      text: 'Moving to a higher opportunity neighborhood completely changed our lives.',
      date: 'March 2, 2025',
    },
    {
      id: '2',
      name: 'Marcus Williams',
      location: 'Cambridge, MA',
      rating: 4,
      text: 'As a single father, I was overwhelmed by the prospect of moving.',
      date: 'February 15, 2025',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Firebase query response
    const mockQuerySnapshot = {
      forEach: (callback: (doc: { 
        id: string; 
        data: () => { 
          name: string; 
          location: string; 
          rating: number; 
          text: string; 
          date: string; 
        } 
      }) => void) => {
        mockTestimonials.forEach((testimonial) => {
          callback({
            id: testimonial.id,
            data: () => ({
              name: testimonial.name,
              location: testimonial.location,
              rating: testimonial.rating,
              text: testimonial.text,
              date: testimonial.date,
            }),
          });
        });
      },
    };
    
    (collection as jest.Mock).mockReturnValue('testimonials-collection');
    (query as jest.Mock).mockReturnValue('testimonials-query');
    (orderBy as jest.Mock).mockReturnValue('created-at-desc');
    (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);
    (addDoc as jest.Mock).mockResolvedValue({ id: 'new-testimonial-id' });
  });

  test('renders the component with correct title and tabs', async () => {
    render(<CommunityConnections />);
    
    // Wait for the component to load testimonials
    await waitFor(() => {
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('subtitle')).toBeInTheDocument();
      expect(screen.getByText('testimonials')).toBeInTheDocument();
      expect(screen.getByText('shareYourStory')).toBeInTheDocument();
    });
  });

  test('displays testimonials when loaded', async () => {
    render(<CommunityConnections />);
    
    // Wait for testimonials to load
    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Marcus Williams')).toBeInTheDocument();
      expect(screen.getByText('Brookline, MA')).toBeInTheDocument();
      expect(screen.getByText('Cambridge, MA')).toBeInTheDocument();
    });
  });

  test('switches between testimonials and share tabs', async () => {
    render(<CommunityConnections />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('testimonials')).toBeInTheDocument();
    });
    
    // Initially should show testimonials tab
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    
    // Click on share tab
    fireEvent.click(screen.getByText('shareYourStory'));
    
    // Should now show the share form
    expect(screen.getByText('Share Your Journey')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Location')).toBeInTheDocument();
    expect(screen.getByText('Rate Your Experience')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Story')).toBeInTheDocument();
    
    // Switch back to testimonials
    fireEvent.click(screen.getByText('testimonials'));
    
    // Should show testimonials again
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  test('handles form input changes correctly', async () => {
    render(<CommunityConnections />);
    
    // Switch to share tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('shareYourStory'));
    });
    
    // Fill out the form
    const nameInput = screen.getByLabelText('Your Name');
    const locationInput = screen.getByLabelText('Your Location');
    const storyInput = screen.getByLabelText('Your Story');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(locationInput, { target: { value: 'Boston, MA' } });
    fireEvent.change(storyInput, { target: { value: 'This is my story.' } });
    
    // Check if inputs have the correct values
    expect(nameInput).toHaveValue('John Doe');
    expect(locationInput).toHaveValue('Boston, MA');
    expect(storyInput).toHaveValue('This is my story.');
  });

  test('handles rating selection correctly', async () => {
    render(<CommunityConnections />);
    
    // Switch to share tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('shareYourStory'));
    });
    
    // Get all star icons (should be 5)
    const starElements = screen.getAllByTestId('rating-star');
    
    expect(starElements.length).toBe(5);
    
    // Click the third star (rating of 3)
    fireEvent.click(starElements[2]);
    
    // Fill out the rest of the form
    fireEvent.change(screen.getByLabelText('Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Your Location'), { target: { value: 'Boston, MA' } });
    fireEvent.change(screen.getByLabelText('Your Story'), { target: { value: 'This is my story.' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Your Story'));
    
    // Verify addDoc was called with the correct rating
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        'testimonials-collection',
        expect.objectContaining({
          rating: 3,
        })
      );
    });
  });

  test('submits testimonial form successfully', async () => {
    render(<CommunityConnections />);
    
    // Switch to share tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('shareYourStory'));
    });
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Your Location'), { target: { value: 'Boston, MA' } });
    fireEvent.change(screen.getByLabelText('Your Story'), { target: { value: 'This is my story.' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Your Story'));
    
    // Check if submission is in progress
    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
    
    // Check if addDoc was called with correct data
    expect(addDoc).toHaveBeenCalledWith(
      'testimonials-collection',
      expect.objectContaining({
        name: 'John Doe',
        location: 'Boston, MA',
        text: 'This is my story.',
        rating: 5, // Default rating
      })
    );
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Thank you for sharing your story!')).toBeInTheDocument();
    });
    
    // Form should be reset
    await waitFor(() => {
      expect(screen.getByLabelText('Your Name')).toHaveValue('');
      expect(screen.getByLabelText('Your Location')).toHaveValue('');
      expect(screen.getByLabelText('Your Story')).toHaveValue('');
    });
  });

  test('handles submission error correctly', async () => {
    // Mock addDoc to reject with an error
    (addDoc as jest.Mock).mockRejectedValueOnce(new Error('Submission failed'));
    
    render(<CommunityConnections />);
    
    // Switch to share tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('shareYourStory'));
    });
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Your Location'), { target: { value: 'Boston, MA' } });
    fireEvent.change(screen.getByLabelText('Your Story'), { target: { value: 'This is my story.' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Your Story'));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('An error occurred while submitting your story. Please try again.')).toBeInTheDocument();
    });
  });

  test('renders avatar with initials when no avatar image is provided', async () => {
    render(<CommunityConnections />);
    
    // Wait for testimonials to load
    await waitFor(() => {
      // Check if the initials are rendered
      // Sarah Johnson should have initials "SJ"
      const avatarElements = screen.getAllByText('SJ');
      expect(avatarElements.length).toBeGreaterThan(0);
    });
  });

  test('handles empty testimonials state correctly', async () => {
    // Mock empty testimonials response
    const emptyQuerySnapshot = {
      forEach: jest.fn(), // This will not call the callback, simulating empty results
    };
    (getDocs as jest.Mock).mockResolvedValueOnce(emptyQuerySnapshot);
    
    render(<CommunityConnections />);
    
    // Should show fallback sample testimonials
    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });
  });

  test('handles Firebase error correctly', async () => {
    // Mock Firebase error
    (getDocs as jest.Mock).mockRejectedValueOnce(new Error('Firebase error'));
    console.error = jest.fn(); // Mock console.error to prevent test output noise
    
    render(<CommunityConnections />);
    
    // Should show fallback sample testimonials
    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
