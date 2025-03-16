import GeocodingService from './js/geocodingService.js';

const geocoder = new GeocodingService();

async function testAddress() {
    try {
        const result = await geocoder.geocodeAddress('32 mill street cambridge ma 02138');
        console.log('Geocoding Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testAddress();
