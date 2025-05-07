// src/app/api/city-to-zip/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to convert a city name to a ZIP code
 * @param req - The request object
 * @returns Response with ZIP code data
 */
export async function GET(req: NextRequest) {
  try {
    // Get the city name from the query parameters
    const url = new URL(req.url);
    const city = url.searchParams.get('city');
    const state = url.searchParams.get('state') || '';

    // Validate the city
    if (!city) {
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      );
    }

    // Use the Google Maps Geocoding API to get the ZIP code
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}${state ? '+' + encodeURIComponent(state) : ''}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'Could not find location', details: data.status },
        { status: 404 }
      );
    }
    
    // Extract the ZIP code from the address components
    let zipCode = '';
    const addressComponents = data.results[0].address_components;
    
    for (const component of addressComponents) {
      if (component.types.includes('postal_code')) {
        zipCode = component.short_name;
        break;
      }
    }
    
    if (!zipCode) {
      // If no ZIP code found, try to use the place_id to get more detailed information
      return NextResponse.json(
        { error: 'Could not find ZIP code for this city' },
        { status: 404 }
      );
    }
    
    // Return the ZIP code and location information
    return NextResponse.json({
      zipCode,
      formattedAddress: data.results[0].formatted_address,
      location: data.results[0].geometry.location
    });
  } catch (error) {
    console.error('Error finding ZIP code:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: 'Failed to find ZIP code', details: errorMessage },
      { status: 500 }
    );
  }
}
