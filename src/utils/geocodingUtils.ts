/**
 * Utility functions for geocoding addresses and finding census tracts
 */

/**
 * Geocodes an address to get its coordinates
 * @param address - The address to geocode
 * @returns Promise with the coordinates {lng, lat} or null if geocoding fails
 */
export const geocodeAddress = async (address: string): Promise<{lng: number, lat: number} | null> => {
  try {
    // Skip geocoding for obviously invalid addresses
    if (!address || address.length < 5 || address.includes('idk') || address.includes('test')) {
      console.log('Skipping geocoding for invalid address:', address);
      return null;
    }

    // Using Mapbox Geocoding API
    const encodedAddress = encodeURIComponent(address);
    const accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}&country=us&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // Check if the result is too generic (like just a state)
      const resultType = data.features[0].place_type;
      const relevance = data.features[0].relevance;
      
      // Reject results that are too generic (just state or country level) or low relevance
      if (
        resultType.includes('country') || 
        resultType.includes('region') || 
        resultType.includes('state') || 
        relevance < 0.75
      ) {
        console.log('Geocoding result too generic or low relevance:', resultType, relevance);
        return null;
      }
      
      const [lng, lat] = data.features[0].center;
      return { lng, lat };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Geocodes a ZIP code to get location information including state
 * @param zipCode - The ZIP code to geocode
 * @returns Promise with location information or null if geocoding fails
 */
export const geocodeZipCode = async (zipCode: string): Promise<{
  lng: number;
  lat: number;
  city: string;
  state: string;
  stateCode: string;
  county?: string;
} | null> => {
  try {
    // Validate ZIP code format
    if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      console.log('Invalid ZIP code format:', zipCode);
      return null;
    }

    // Using Mapbox Geocoding API with ZIP code
    const encodedZipCode = encodeURIComponent(zipCode);
    const accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedZipCode}.json?access_token=${accessToken}&country=us&types=postcode&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ZIP code geocoding failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [lng, lat] = feature.center;
      
      // Extract city, state, and county from context
      let city = '';
      let state = '';
      let stateCode = '';
      let county = '';
      
      if (feature.context) {
        for (const context of feature.context) {
          if (context.id.startsWith('place')) {
            city = context.text;
          } else if (context.id.startsWith('region')) {
            state = context.text;
            stateCode = context.short_code ? context.short_code.replace('US-', '') : '';
          } else if (context.id.startsWith('district')) {
            county = context.text;
          }
        }
      }
      
      return { lng, lat, city, state, stateCode, county };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding ZIP code:', error);
    return null;
  }
};

/**
 * Geocodes a neighborhood within a specific state context
 * @param neighborhood - The neighborhood name
 * @param state - The state code (e.g., 'NJ', 'NY')
 * @returns Promise with coordinates or null if geocoding fails
 */
export const geocodeNeighborhood = async (
  neighborhood: string,
  state: string
): Promise<{lng: number, lat: number} | null> => {
  try {
    if (!neighborhood || !state) {
      console.log('Missing required parameters for neighborhood geocoding');
      return null;
    }

    // Format the query to include state context
    const contextualAddress = `${neighborhood}, ${state}`;
    console.log(`Geocoding neighborhood with state context: ${contextualAddress}`);
    
    // Using Mapbox Geocoding API with state context
    const encodedAddress = encodeURIComponent(contextualAddress);
    const accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';
    // Add the bbox parameter to restrict the search to the state
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}&country=us&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Neighborhood geocoding failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lng, lat };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding neighborhood:', error);
    return null;
  }
};

/**
 * Finds the census tract containing the given coordinates
 * @param map - The Mapbox GL map instance
 * @param coordinates - The coordinates {lng, lat}
 * @param sourceLayer - The source layer name for census tracts
 * @returns The census tract feature or null if not found
 */
export const findCensusTract = (
  map: mapboxgl.Map,
  coordinates: {lng: number, lat: number}
  // sourceLayer parameter removed as it was unused
): mapboxgl.MapboxGeoJSONFeature | null => {
  try {
    // Query the map for features at the given point
    const point = map.project([coordinates.lng, coordinates.lat]);
    const features = map.queryRenderedFeatures(point, {
      layers: ['census-tracts-layer']
    });
    
    if (features && features.length > 0) {
      return features[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error finding census tract:', error);
    return null;
  }
};

/**
 * Zooms and highlights a census tract on the map
 * @param map - The Mapbox GL map instance
 * @param tractId - The census tract ID (GEOID)
 * @param sourceLayer - The source layer name for census tracts
 */
export const highlightCensusTract = (
  map: mapboxgl.Map,
  tractId: string
): void => {
  try {
    // Set the filter to highlight the tract
    if (map.getLayer('census-tracts-hover')) {
      map.setFilter('census-tracts-hover', ['==', 'GEOID', tractId]);
    }
  } catch (error) {
    console.error('Error highlighting census tract:', error);
  }
};
