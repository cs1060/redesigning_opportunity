/**
 * Unit tests for the Opportunity Map feature
 * 
 * Tests the functionality of the OpportunityMap class and related components
 */

import OpportunityMap from '../js/opportunityMap.js';
import { GeocodingService } from '../js/geocodingService.js';

// Mock mapboxgl
const mockMap = {
  addControl: jest.fn(),
  on: jest.fn((event, callback) => {
    if (event === 'load') callback();
  }),
  flyTo: jest.fn(),
  fitBounds: jest.fn()
};

const mockMarker = {
  setLngLat: jest.fn().mockReturnThis(),
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn(),
  getLngLat: jest.fn().mockReturnValue({ lat: 37.7749, lng: -122.4194 }),
  getElement: jest.fn().mockReturnValue({
    addEventListener: jest.fn()
  })
};

const mockPopup = {
  setLngLat: jest.fn().mockReturnThis(),
  setHTML: jest.fn().mockReturnThis(),
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn()
};

// Create a mock bounds object with extend method
const mockBounds = {
  extend: jest.fn().mockReturnThis()
};

// Mock mapboxgl constructor and related classes
global.mapboxgl = {
  Map: jest.fn().mockImplementation(() => mockMap),
  NavigationControl: jest.fn(),
  Marker: jest.fn().mockImplementation(() => mockMarker),
  Popup: jest.fn().mockImplementation(() => mockPopup),
  LngLatBounds: jest.fn().mockImplementation(() => mockBounds)
};

// Mock document methods
document.createElement = jest.fn().mockImplementation(() => ({
  className: '',
  innerHTML: '',
  appendChild: jest.fn(),
  addEventListener: jest.fn()
}));

// Instead of directly setting document.head, use Object.defineProperty
Object.defineProperty(document, 'head', {
  value: { appendChild: jest.fn() },
  configurable: true
});

// Mock GeocodingService
jest.mock('../js/geocodingService.js', () => ({
  GeocodingService: jest.fn().mockImplementation(() => ({
    geocodeAddress: jest.fn().mockResolvedValue({
      lat: 37.7749,
      lon: -122.4194,
      display_name: 'San Francisco, CA',
      address_details: {
        country_code: 'us',
        postcode: '94103'
      }
    })
  }))
}));

describe('OpportunityMap', () => {
  let opportunityMap;
  const accessToken = 'test-token';
  const containerId = 'test-map';
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    opportunityMap = new OpportunityMap(containerId, accessToken);
  });
  
  test('should initialize the map correctly', async () => {
    await opportunityMap.initialize();
    
    expect(mapboxgl.Map).toHaveBeenCalledWith({
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-95.7129, 37.0902],
      zoom: 3
    });
    
    expect(mapboxgl.accessToken).toBe(accessToken);
    expect(mapboxgl.NavigationControl).toHaveBeenCalled();
    expect(mockMap.addControl).toHaveBeenCalled();
    expect(opportunityMap.initialized).toBe(true);
  });
  
  test('should update neighborhoods with markers', async () => {
    await opportunityMap.initialize();
    
    const neighborhoods = [
      {
        name: 'Test Neighborhood 1',
        distance: '5 miles',
        description: 'A test neighborhood',
        coordinates: { lat: 37.7749, lon: -122.4194 }
      },
      {
        name: 'Test Neighborhood 2',
        distance: '10 miles',
        description: 'Another test neighborhood',
        coordinates: { lat: 37.7750, lon: -122.4195 }
      }
    ];
    
    opportunityMap.updateNeighborhoods(neighborhoods);
    
    expect(mapboxgl.Marker).toHaveBeenCalledTimes(2);
    expect(mockMarker.setLngLat).toHaveBeenCalledTimes(2);
    expect(mockMarker.addTo).toHaveBeenCalledTimes(2);
    expect(opportunityMap.markers.length).toBe(2);
  });
  
  test('should clear markers when updating neighborhoods', async () => {
    await opportunityMap.initialize();
    
    // Add initial markers
    const initialNeighborhoods = [
      {
        name: 'Test Neighborhood',
        distance: '5 miles',
        description: 'A test neighborhood',
        coordinates: { lat: 37.7749, lon: -122.4194 }
      }
    ];
    
    opportunityMap.updateNeighborhoods(initialNeighborhoods);
    expect(opportunityMap.markers.length).toBe(1);
    
    // Update with new neighborhoods
    const newNeighborhoods = [
      {
        name: 'New Neighborhood',
        distance: '10 miles',
        description: 'A new neighborhood',
        coordinates: { lat: 37.7750, lon: -122.4195 }
      }
    ];
    
    opportunityMap.updateNeighborhoods(newNeighborhoods);
    
    // Should have cleared previous markers
    expect(mockMarker.remove).toHaveBeenCalled();
    expect(opportunityMap.markers.length).toBe(1);
  });
  
  test('should center map on a specific location', async () => {
    await opportunityMap.initialize();
    
    const lat = 37.7749;
    const lon = -122.4194;
    const zoom = 15;
    
    opportunityMap.centerMap(lat, lon, zoom);
    
    expect(mockMap.flyTo).toHaveBeenCalledWith({
      center: [lon, lat],
      zoom: zoom,
      essential: true
    });
  });
  
  test('should update map from address', async () => {
    await opportunityMap.initialize();
    
    const address = '123 Main St, San Francisco, CA';
    const geocoder = new GeocodingService();
    
    const result = await opportunityMap.updateFromAddress(address, geocoder);
    
    expect(geocoder.geocodeAddress).toHaveBeenCalledWith(address);
    expect(mockMap.flyTo).toHaveBeenCalled();
    expect(result).toEqual({
      lat: 37.7749,
      lon: -122.4194,
      display_name: 'San Francisco, CA',
      address_details: {
        country_code: 'us',
        postcode: '94103'
      }
    });
  });
  
  test('should handle errors during address search gracefully', async () => {
    await opportunityMap.initialize();
    
    // Mock the geocoder to throw an error
    const geocoder = new GeocodingService();
    geocoder.geocodeAddress.mockRejectedValueOnce(new Error('Geocoding failed'));
    
    // Should not throw an error but return null
    const address = 'Invalid Address';
    const result = await opportunityMap.updateFromAddress(address, geocoder);
    
    expect(geocoder.geocodeAddress).toHaveBeenCalledWith(address);
    expect(result).toBeNull();
  });
  
  test('should show neighborhood popup with correct content', async () => {
    await opportunityMap.initialize();
    
    // Create test neighborhood data
    const neighborhood = {
      name: 'Test Neighborhood',
      distance: '3.5 miles',
      description: 'A great neighborhood with amenities',
      coordinates: { lat: 37.7749, lon: -122.4194 }
    };
    
    // Create a mock marker
    const marker = new mapboxgl.Marker();
    
    // Call the method
    opportunityMap.showNeighborhoodPopup(neighborhood, marker);
    
    // Verify popup was configured correctly
    expect(mockPopup.setLngLat).toHaveBeenCalled();
    expect(mockPopup.setHTML).toHaveBeenCalled();
    expect(mockPopup.addTo).toHaveBeenCalledWith(mockMap);
    
    // Verify HTML content includes neighborhood data
    const htmlContent = mockPopup.setHTML.mock.calls[0][0];
    expect(htmlContent).toContain('Test Neighborhood');
    expect(htmlContent).toContain('3.5 miles');
    expect(htmlContent).toContain('A great neighborhood with amenities');
  });
  
  test('should fit map to markers', async () => {
    await opportunityMap.initialize();
    
    // Create test markers
    const marker1 = new mapboxgl.Marker()
      .setLngLat([-122.4194, 37.7749])
      .addTo(mockMap);
    
    const marker2 = new mapboxgl.Marker()
      .setLngLat([-122.4294, 37.7849])
      .addTo(mockMap);
    
    // Add markers to the opportunity map
    opportunityMap.markers = [marker1, marker2];
    
    // Reset the mock counts
    mockBounds.extend.mockClear();
    mockMap.fitBounds.mockClear();
    
    // Call the method
    opportunityMap.fitMapToMarkers();
    
    // Verify map was fit to bounds with correct parameters
    expect(mockMap.fitBounds).toHaveBeenCalledWith(expect.anything(), {
      padding: 50,
      maxZoom: 15
    });
  });
  
  test('should handle empty markers array in fitMapToMarkers', async () => {
    await opportunityMap.initialize();
    
    // Set empty markers array
    opportunityMap.markers = [];
    
    // Call the method
    opportunityMap.fitMapToMarkers();
    
    // Verify fitBounds was not called
    expect(mockMap.fitBounds).not.toHaveBeenCalled();
  });
  
  test('should handle non-US addresses appropriately', async () => {
    await opportunityMap.initialize();
    
    // Mock geocoder to return non-US address
    const geocoder = new GeocodingService();
    geocoder.geocodeAddress.mockResolvedValueOnce({
      lat: 51.5074,
      lon: -0.1278,
      display_name: 'London, UK',
      address_details: {
        country_code: 'gb',
        country: 'United Kingdom'
      }
    });
    
    // Call the method
    const address = 'London, UK';
    const result = await opportunityMap.updateFromAddress(address, geocoder);
    
    // Should still center map on the location
    expect(mockMap.flyTo).toHaveBeenCalled();
    expect(result).not.toBeNull();
    expect(result.address_details.country_code).toBe('gb');
  });
  
  test('should update neighborhood markers with click events', async () => {
    await opportunityMap.initialize();
    
    // Create test neighborhoods with job opportunities data
    const neighborhoods = [
      {
        name: 'Tech District',
        distance: '2.1 miles',
        description: 'Technology hub with many startups',
        coordinates: { lat: 37.7749, lon: -122.4194 },
        jobOpportunities: [
          {
            sector: 'Technology',
            growthRate: 14.5,
            medianSalary: 95000
          }
        ]
      }
    ];
    
    // Mock addEventListener for marker elements
    const mockAddEventListener = jest.fn();
    mockMarker.getElement.mockReturnValue({
      addEventListener: mockAddEventListener
    });
    
    // Call the method
    opportunityMap.updateNeighborhoods(neighborhoods);
    
    // Verify marker was created with correct position
    expect(mapboxgl.Marker).toHaveBeenCalled();
    expect(mockMarker.setLngLat).toHaveBeenCalledWith([-122.4194, 37.7749]);
    expect(mockMarker.addTo).toHaveBeenCalledWith(mockMap);
    
    // Verify click event was added to marker
    expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });
});
