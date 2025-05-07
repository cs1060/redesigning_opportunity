import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '../../../utils/geocodingUtils';

export async function GET(req: NextRequest) {
  // Get the address from the query parameters
  const url = new URL(req.url);
  const address = url.searchParams.get('address');
  
  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Geocode the address to get coordinates
    const coordinates = await geocodeAddress(address);
    
    if (!coordinates) {
      return NextResponse.json(
        { error: 'Could not geocode the provided address' },
        { status: 404 }
      );
    }
    
    // Query the Mapbox tileset to get census data for these coordinates
    // This is a simplified example - in practice, you'd need to query the actual Mapbox source
    // used in your application for consistency
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const tilesetId = 'mahiar.bdsxlspn'; // This should match the tileset used in OpportunityMap.tsx
    
    // Request data from Mapbox's tilequery API
    const tileQueryUrl = `https://api.mapbox.com/v4/${tilesetId}/tilequery/${coordinates.lng},${coordinates.lat}.json?access_token=${mapboxToken}`;
    const response = await fetch(tileQueryUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to query map data' },
        { status: response.status }
      );
    }
    
    const tileData = await response.json();
    
    // Extract the household income from the features
    let income = null;
    if (tileData.features && tileData.features.length > 0) {
      // Find the feature with household income data
      for (const feature of tileData.features) {
        if (feature.properties && 
            (feature.properties.Household_Income_at_Age_35_rP_gP_p25 !== undefined ||
             feature.properties.household_income_at_age_35_rp_gp_p25 !== undefined ||
             feature.properties['Household_Income_at_Age_35-rP_gP_p25'] !== undefined)) {
          
          income = feature.properties.Household_Income_at_Age_35_rP_gP_p25 || 
                  feature.properties.household_income_at_age_35_rp_gp_p25 ||
                  feature.properties['Household_Income_at_Age_35-rP_gP_p25'];
          break;
        }
      }
    }
    
    if (income === null) {
      // If we can't find income data, return an estimated middle value
      return NextResponse.json({
        income: 35000, // Middle-range estimate
        source: 'estimate'
      });
    }
    
    return NextResponse.json({
      income,
      source: 'mapbox_tilequery'
    });
    
  } catch (error) {
    console.error('Error querying map data:', error);
    return NextResponse.json(
      { error: 'Failed to process map data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 