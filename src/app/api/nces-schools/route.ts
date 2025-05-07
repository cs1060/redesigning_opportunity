// src/app/api/nces-schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchSchoolsByZipCode, convertNCESToSchoolData } from '../../../services/ncesService';

/**
 * API route to fetch school data from the NCES API
 * @param req - The request object
 * @returns Response with school data
 */
export async function GET(req: NextRequest) {
  try {
    // Get the ZIP code from the query parameters
    const url = new URL(req.url);
    const zipCode = url.searchParams.get('zipCode');
    const distance = url.searchParams.get('distance') || '10';

    // Validate the ZIP code
    if (!zipCode) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      );
    }

    // Validate distance
    const distanceNum = parseInt(distance, 10);
    if (isNaN(distanceNum) || distanceNum <= 0 || distanceNum > 100) {
      return NextResponse.json(
        { error: 'Distance must be a number between 1 and 100' },
        { status: 400 }
      );
    }

    // Fetch schools from the NCES API
    const schools = await searchSchoolsByZipCode(zipCode, distanceNum);
    
    // Convert NCES school data to the application's format
    const formattedSchools = convertNCESToSchoolData(schools);

    // Return the formatted schools
    return NextResponse.json({ schools: formattedSchools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: 'Failed to fetch schools', details: errorMessage },
      { status: 500 }
    );
  }
}
