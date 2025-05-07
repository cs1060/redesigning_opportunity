/**
 * Test script for the NCES API integration
 * Run with: npx ts-node src/scripts/test-nces-api.ts
 */

import { searchSchoolsByZipCode, convertNCESToSchoolData } from '../services/ncesService';

// Test ZIP code
const TEST_ZIP_CODE = '02138'; // Cambridge, MA

async function testNCESAPI() {
  console.log(`Testing NCES API with ZIP code: ${TEST_ZIP_CODE}`);
  
  try {
    // Test searching for schools
    console.log('Fetching schools from NCES API...');
    const schools = await searchSchoolsByZipCode(TEST_ZIP_CODE, 10);
    
    console.log(`Found ${schools.length} schools near ${TEST_ZIP_CODE}`);
    
    if (schools.length > 0) {
      // Log the first school
      console.log('Sample school data:');
      console.log(JSON.stringify(schools[0], null, 2));
      
      // Test converting to SchoolData format
      console.log('\nConverting to application format...');
      const convertedSchools = convertNCESToSchoolData(schools);
      
      console.log(`Converted ${convertedSchools.length} schools`);
      
      if (convertedSchools.length > 0) {
        console.log('Sample converted school:');
        console.log(JSON.stringify(convertedSchools[0], null, 2));
      }
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing NCES API:', error);
  }
}

// Run the test
testNCESAPI();
