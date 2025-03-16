import GeocodingService from '../js/geocodingService.js';

describe('GeocodingService', () => {
    let geocodingService;
    let originalFetch;

    beforeEach(() => {
        geocodingService = new GeocodingService();
        originalFetch = global.fetch;
        // Mock the rate limit delay to speed up tests
        geocodingService.rateLimitDelay = jest.fn().mockResolvedValue();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    describe('geocodeAddress', () => {
        it('should successfully geocode an address', async () => {
            const mockResponse = [{
                lat: '40.7128',
                lon: '-74.0060',
                display_name: 'New York, United States',
                address: {
                    city: 'New York',
                    country: 'United States'
                }
            }];

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await geocodingService.geocodeAddress('New York');

            expect(result).toEqual({
                lat: 40.7128,
                lon: -74.0060,
                display_name: 'New York, United States',
                address_details: {
                    city: 'New York',
                    country: 'United States'
                }
            });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('nominatim.openstreetmap.org/search'),
                expect.any(Object)
            );
        });

        it('should return null for no results', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([])
            });

            const result = await geocodingService.geocodeAddress('NonexistentPlace');
            expect(result).toBeNull();
        });

        it('should use cached results for repeated queries', async () => {
            const mockResponse = [{
                lat: '40.7128',
                lon: '-74.0060',
                display_name: 'New York, United States',
                address: {}
            }];

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            // First call
            await geocodingService.geocodeAddress('New York');
            // Second call with same address
            await geocodingService.geocodeAddress('New York');

            // Fetch should only be called once
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw error for failed requests', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                statusText: 'Not Found'
            });

            await expect(geocodingService.geocodeAddress('New York'))
                .rejects
                .toThrow('Geocoding failed: Not Found');
        });
    });

    describe('reverseGeocode', () => {
        it('should successfully reverse geocode coordinates', async () => {
            const mockResponse = {
                display_name: 'New York, United States',
                address: {
                    city: 'New York',
                    country: 'United States'
                }
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await geocodingService.reverseGeocode(40.7128, -74.0060);

            expect(result).toEqual({
                display_name: 'New York, United States',
                address: {
                    city: 'New York',
                    country: 'United States'
                }
            });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('nominatim.openstreetmap.org/reverse'),
                expect.any(Object)
            );
        });

        it('should use cached results for repeated coordinate lookups', async () => {
            const mockResponse = {
                display_name: 'New York, United States',
                address: {}
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            // First call
            await geocodingService.reverseGeocode(40.7128, -74.0060);
            // Second call with same coordinates
            await geocodingService.reverseGeocode(40.7128, -74.0060);

            // Fetch should only be called once
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw error for failed reverse geocoding requests', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                statusText: 'Not Found'
            });

            await expect(geocodingService.reverseGeocode(40.7128, -74.0060))
                .rejects
                .toThrow('Reverse geocoding failed: Not Found');
        });
    });
});
