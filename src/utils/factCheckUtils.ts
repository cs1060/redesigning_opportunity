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
        let hasZipCode = false;
        if (feature.context) {
          for (const ctx of feature.context as Array<Record<string, string>>) {
            if (ctx.id?.startsWith('postcode') && ctx.text?.includes(zipCode)) {
              hasZipCode = true;
              break;
            }
          }
        }
        
        // If this is a better match than what we've found so far, update our best match
        if ((hasZipCode || relevance > 0.8) && relevance > highestRelevance) {
          bestMatch = feature;
          highestRelevance = relevance;
        }
      }
    }
    
    if (bestMatch) {
      // Calculate confidence based on relevance and other factors
      const confidence = Math.min(1, bestMatch.relevance * 1.2); // Boost relevance a bit but cap at 1
      
      return {
        exists: true,
        confidence,
        message: `Verified '${placeName}' with ${Math.round(confidence * 100)}% confidence`
      };
    }
    
    // No good match found
    return {
      exists: false,
      confidence: 0.1, // Very low confidence
      message: `Could not confidently verify '${placeName}' in ZIP code ${zipCode}`
    };
    
  } catch (error) {
    console.error('Error verifying place:', error);
    return { 
      exists: false, 
      confidence: 0, 
      message: `Error verifying place '${placeName}': ${error instanceof Error ? error.message : String(error)}` 
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
      let hasZipCode = false;
      if (feature.context) {
        for (const ctx of feature.context as Array<Record<string, string>>) {
          if (ctx.id?.startsWith('postcode') && ctx.text?.includes(zipCode)) {
            hasZipCode = true;
            break;
          }
        }
      }
      
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
    } catch {
      return { 
        exists: false, 
        confidence: 0, 
        message: `Invalid URL format: ${url}` 
      };
    }
    
    // Check for suspicious patterns that might indicate fake websites
    const suspiciousPatterns = [
      /\.(tk|ml|ga|cf|gq|xyz)$/i, // Free domains often used for spam
      /^https?:\/\/\d+\.\d+\.\d+\.\d+/i, // IP addresses
      /^https?:\/\/localhost/i, // localhost
      /^https?:\/\/.*\.example\.(com|org|net)/i, // example domains
      /^https?:\/\/.*\.test\.(com|org|net)/i, // test domains
      /^https?:\/\/.*\.invalid/i, // .invalid TLD
      /^https?:\/\/.*\.local/i, // .local TLD
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return {
          exists: false,
          confidence: 0.2,
          message: `URL appears to be suspicious: ${url}`
        };
      }
    }

    // Actually try to connect to the website
    const response = await fetch(url, { 
      method: 'GET', 
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Set a timeout to avoid hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    // Check if the response is OK and is HTML
    const contentType = response.headers.get('content-type');
    if (!response.ok || !contentType || !contentType.includes('text/html')) {
      return { 
        exists: false, 
        confidence: 0.3, 
        message: `Website returned invalid response: ${response.status} ${response.statusText}` 
      };
    }

    // Check if the page has basic HTML structure
    const text = await response.text();
    const hasHtmlStructure = text.includes('<title>') || text.includes('<body>');
    
    if (!hasHtmlStructure) {
      return { 
        exists: false, 
        confidence: 0.4, 
        message: `Website doesn't appear to be a valid HTML page` 
      };
    }

    // For school websites specifically, check for educational patterns
    const isSchoolWebsite = 
      url.toLowerCase().includes('school') || 
      url.toLowerCase().includes('edu') ||
      text.toLowerCase().includes('school') ||
      text.toLowerCase().includes('education') ||
      text.toLowerCase().includes('student');
      
    const hasEduTLD = /\.edu$/i.test(url);
    const hasSchoolDistrictPattern = /\.(k12|sch)\.[a-z]{2}\.(us|ca|uk)$/i.test(url);
    
    if (isSchoolWebsite || hasEduTLD || hasSchoolDistrictPattern) {
      return {
        exists: true,
        confidence: 0.9, // Higher confidence for educational websites
        message: `Verified educational website: ${url}`
      };
    }
    
    // Check for common website patterns
    const hasCommonTLD = /\.(com|org|net|gov|edu|io)$/i.test(url);
    
    if (hasCommonTLD) {
      return { 
        exists: true, 
        confidence: 0.8, 
        message: `Verified website: ${url}` 
      };
    }
    
    // If we got here, the website exists but doesn't match our specific patterns
    return { 
      exists: true, 
      confidence: 0.7, 
      message: `Website verified with moderate confidence: ${url}` 
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
    context?: string;
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

/**
 * Batch verifies multiple websites for efficiency
 * @param urls - Array of URLs to verify
 * @returns Promise with verification results
 */
export const batchVerifyWebsites = async (
  urls: string[]
): Promise<Record<string, { exists: boolean; confidence: number; message?: string }>> => {
  const results: Record<string, { exists: boolean; confidence: number; message?: string }> = {};
  
  // Process in batches to avoid overwhelming the network
  const batchSize = 3;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(url => {
      return verifyWebsite(url).then(result => {
        results[url] = result;
      });
    });
    
    // Wait for each batch to complete before moving to the next
    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};