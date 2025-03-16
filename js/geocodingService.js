class GeocodingService {
    constructor() {
        this.baseUrl = 'https://nominatim.openstreetmap.org/search';
        this.cache = new Map();
    }

    /**
     * Geocode an address to coordinates
     * @param {string} address - The address to geocode
     * @returns {Promise<{lat: number, lon: number, display_name: string} | null>}
     */
    async geocodeAddress(address) {
        try {
            // Check cache first
            const cacheKey = address.toLowerCase().trim();
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // Add delay to respect rate limiting
            await this.rateLimitDelay();

            const params = new URLSearchParams({
                q: address,
                format: 'json',
                limit: 1,
                addressdetails: 1
            });

            const response = await fetch(`${this.baseUrl}?${params}`, {
                headers: {
                    'User-Agent': 'RedesigningOpportunity/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Geocoding failed: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.length === 0) {
                return null;
            }

            const result = {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                display_name: data[0].display_name,
                address_details: data[0].address
            };

            // Cache the result
            this.cache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    /**
     * Reverse geocode coordinates to address
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<{display_name: string, address: object} | null>}
     */
    async reverseGeocode(lat, lon) {
        try {
            const cacheKey = `${lat},${lon}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            await this.rateLimitDelay();

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        'User-Agent': 'RedesigningOpportunity/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Reverse geocoding failed: ${response.statusText}`);
            }

            const data = await response.json();
            
            const result = {
                display_name: data.display_name,
                address: data.address
            };

            this.cache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw error;
        }
    }

    /**
     * Implement rate limiting delay
     * Nominatim has a usage policy of max 1 request per second
     * @returns {Promise<void>}
     */
    async rateLimitDelay() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
}

export default GeocodingService;
