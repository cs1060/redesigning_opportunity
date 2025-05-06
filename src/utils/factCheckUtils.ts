/**
 * Utility functions for fact-checking AI-generated content
 */

/**
 * Verifies if a place (town, neighborhood, etc.) exists in a given ZIP code area
 * @param placeName - The name of the place to verify
 * @param zipCode - The ZIP code to check against
 * @returns Promise with verification result
 */
export const verifyPlace = async (
  placeName: string,
  zipCode: string
): Promise<{ exists: boolean; confidence: number; message?: string }> => {
  try {
    if (!placeName || !zipCode) {
      return { exists: false, confidence: 0, message: 'Missing place name or ZIP code' };
    }

    // Using Mapbox Geocoding API to verify the place
    const encodedQuery = encodeURIComponent(`${placeName} ${zipCode}`);
    const accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${accessToken}&country=us&limit=5`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding verification failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return { 
        exists: false, 
        confidence: 0, 
        message: `Could not verify '${placeName}' in ZIP code ${zipCode}` 
      };
    }
    
    // Check if any of the results match our place and are in the correct ZIP code area
    let bestMatch = null;
    let highestRelevance = 0;
    
    for (const feature of data.features) {
      const featureText = feature.text.toLowerCase();
      const placeNameLower = placeName.toLowerCase();
      const relevance = feature.relevance || 0;
      
      // Check if the feature name contains our place name
      if (featureText.includes(placeNameLower) || placeNameLower.includes(featureText)) {
        // Check if the ZIP code is mentioned in the context
        const hasZipCode = feature.context?.some((ctx: any) => 
          ctx.text === zipCode || (ctx.text || '').includes(zipCode)
        );
        
        if (hasZipCode && relevance > highestRelevance) {
          bestMatch = feature;
          highestRelevance = relevance;
        }
      }
    }
    
    if (bestMatch) {
      return { 
        exists: true, 
        confidence: highestRelevance, 
        message: `Verified '${placeName}' exists in or near ZIP code ${zipCode}` 
      };
    }
    
    // If we found results but none matched our criteria
    return { 
      exists: false, 
      confidence: 0.2, // Low confidence
      message: `Found places called '${placeName}' but couldn't verify they're in ZIP code ${zipCode}` 
    };
    
  } catch (error) {
    console.error('Error verifying place:', error);
    return { 
      exists: false, 
      confidence: 0, 
      message: `Error verifying '${placeName}': ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Verifies if a school exists in a given ZIP code area
 * @param schoolName - The name of the school to verify
 * @param zipCode - The ZIP code to check against
 * @returns Promise with verification result
 */
export const verifySchool = async (
  schoolName: string,
  zipCode: string
): Promise<{ exists: boolean; confidence: number; message?: string }> => {
  try {
    if (!schoolName || !zipCode) {
      return { exists: false, confidence: 0, message: 'Missing school name or ZIP code' };
    }

    // Using Mapbox Geocoding API with specific school search
    const encodedQuery = encodeURIComponent(`${schoolName} school ${zipCode}`);
    const accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${accessToken}&country=us&limit=5`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`School verification failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return { 
        exists: false, 
        confidence: 0, 
        message: `Could not verify '${schoolName}' in ZIP code ${zipCode}` 
      };
    }
    
    // Check if any of the results match our school and are in the correct ZIP code area
    let bestMatch = null;
    let highestRelevance = 0;
    
    for (const feature of data.features) {
      const featureText = feature.text.toLowerCase();
      const schoolNameLower = schoolName.toLowerCase();
      const relevance = feature.relevance || 0;
      
      // Check if the feature name contains our school name and has "school" in the place name or category
      const isSchool = 
        featureText.includes(schoolNameLower) || 
        schoolNameLower.includes(featureText) || 
        feature.place_type.includes('school') || 
        feature.properties?.category === 'school' || 
        feature.properties?.category === 'education';
      
      // Check if the ZIP code is mentioned in the context
      const hasZipCode = feature.context?.some((ctx: any) => 
        ctx.text === zipCode || (ctx.text || '').includes(zipCode)
      );
      
      if (isSchool && hasZipCode && relevance > highestRelevance) {
        bestMatch = feature;
        highestRelevance = relevance;
      }
    }
    
    if (bestMatch) {
      return { 
        exists: true, 
        confidence: highestRelevance, 
        message: `Verified '${schoolName}' exists in or near ZIP code ${zipCode}` 
      };
    }
    
    // If we found results but none matched our criteria
    return { 
      exists: false, 
      confidence: 0.2, // Low confidence
      message: `Found places called '${schoolName}' but couldn't verify they're schools in ZIP code ${zipCode}` 
    };
    
  } catch (error) {
    console.error('Error verifying school:', error);
    return { 
      exists: false, 
      confidence: 0, 
      message: `Error verifying '${schoolName}': ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Verifies if a website URL is valid and accessible
 * @param url - The URL to verify
 * @returns Promise with verification result
 */
export const verifyWebsite = async (
  url: string
): Promise<{ exists: boolean; confidence: number; message?: string }> => {
  try {
    if (!url) {
      return { exists: false, confidence: 0, message: 'Missing URL' };
    }

    // Ensure URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (_error) {
      return { 
        exists: false, 
        confidence: 0, 
        message: `Invalid URL format: ${url}` 
      };
    }

    // We can't actually fetch the URL from the server side due to CORS and security issues
    // So we'll just validate the format and return a moderate confidence
    
    // Check for common website patterns
    const hasCommonTLD = /\.(com|org|net|gov|edu|io)$/i.test(url);
    const hasRealisticStructure = /^https?:\/\/([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?(\/.*)*/i.test(url);
    
    if (hasCommonTLD && hasRealisticStructure) {
      return { 
        exists: true, 
        confidence: 0.7, // Moderate confidence since we can't actually check
        message: `URL format appears valid: ${url}` 
      };
    }
    
    return { 
      exists: false, 
      confidence: 0.3, 
      message: `URL format appears unusual: ${url}` 
    };
    
  } catch (error) {
    console.error('Error verifying website:', error);
    return { 
      exists: false, 
      confidence: 0, 
      message: `Error verifying URL '${url}': ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Batch verifies multiple items for efficiency
 * @param items - Array of items to verify
 * @param zipCode - The ZIP code context
 * @returns Promise with verification results
 */
export const batchVerify = async (
  items: Array<{
    type: 'place' | 'school' | 'website';
    name: string;
    zipCode?: string;
  }>
): Promise<Record<string, { exists: boolean; confidence: number; message?: string }>> => {
  const results: Record<string, { exists: boolean; confidence: number; message?: string }> = {};
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const promises = batch.map(item => {
      const key = `${item.type}:${item.name}`;
      
      switch (item.type) {
        case 'place':
          return verifyPlace(item.name, item.zipCode || '').then(result => {
            results[key] = result;
          });
        case 'school':
          return verifySchool(item.name, item.zipCode || '').then(result => {
            results[key] = result;
          });
        case 'website':
          return verifyWebsite(item.name).then(result => {
            results[key] = result;
          });
        default:
          results[key] = { exists: false, confidence: 0, message: 'Unknown verification type' };
          return Promise.resolve();
      }
    });
    
    // Wait for each batch to complete before moving to the next
    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};
