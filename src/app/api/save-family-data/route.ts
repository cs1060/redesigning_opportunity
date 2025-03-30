import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AssessData } from '@/components/AssessQuiz';

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const data: AssessData = await request.json();
    
    // Validate the data (you can add more validation as needed)
    if (!data.address || !data.income || !data.children || data.children.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Here you would typically save the data to a database
    // For now, we'll just return success with the data
    console.log('Family data received:', data);
    
    // Simulate processing time (optional)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return a success response
    return NextResponse.json({ 
      success: true, 
      message: 'Family data saved successfully',
      data
    });
  } catch (error) {
    console.error('Error processing family data:', error);
    return NextResponse.json(
      { error: 'Failed to process family data' },
      { status: 500 }
    );
  }
}
