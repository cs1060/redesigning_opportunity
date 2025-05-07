import { NextRequest, NextResponse } from 'next/server';
import mapboxgl from 'mapbox-gl';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get('lat') || '0');
  const lng = parseFloat(url.searchParams.get('lng') || '0');
  
  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat/lng parameters' }, { status: 400 });
  }
  
  try {
    // Query Mapbox for the census tract data at this location
    // This should match exactly what the main map is displaying
    const response = await fetch(
      `https://api.mapbox.com/v4/mahiar.bdsxlspn/tilequery/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
    );
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch census tract data' }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // Return the properties of the first matching feature
      return NextResponse.json(data.features[0].properties);
    }
    
    return NextResponse.json({ error: 'No data found for this location' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
} 