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

// Mock mapboxgl constructor and related classes
global.mapboxgl = {
  Map: jest.fn().mockImplementation(() => mockMap),
  NavigationControl: jest.fn(),
  Marker: jest.fn().mockImplementation(() => mockMarker),
  Popup: jest.fn().mockImplementation(() => mockPopup),
  LngLatBounds: jest.fn().mockImplementation(() => ({
    extend: jest.fn()
  }))
};

// Mock document methods
document.createElement = jest.fn().mockImplementation(() => ({
  className: '',
  innerHTML: '',
  appendChild: jest.fn()
}));

document.head = {
  appendChild: jest.fn()
};

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
});
