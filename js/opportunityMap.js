/**
 * OpportunityMap.js
 * 
 * This class handles the rendering and interaction of the opportunity map
 * using Mapbox GL JS. It displays neighborhood data and provides tooltips
 * for additional information.
 */

class OpportunityMap {
    /**
     * Create a new OpportunityMap
     * @param {string} containerId - The ID of the container element
     * @param {string} accessToken - Mapbox access token
     */
    constructor(containerId, accessToken) {
        this.containerId = containerId;
        this.accessToken = accessToken;
        this.map = null;
        this.markers = [];
        this.popup = null;
        this.neighborhoodData = [];
        this.initialized = false;
    }

    /**
     * Initialize the map
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('Starting map initialization with token:', this.accessToken);
            console.log('Container ID:', this.containerId);
            console.log('Container element:', document.getElementById(this.containerId));
            
            // Set access token
            mapboxgl.accessToken = this.accessToken;
            
            // Initialize map
            this.map = new mapboxgl.Map({
                container: this.containerId,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-95.7129, 37.0902], // Default center (US)
                zoom: 3
            });

            console.log('Map object created:', this.map);

            // Add navigation controls
            this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
            
            // Create popup but don't add it to the map yet
            this.popup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: true
            });

            // Add event listeners
            this.map.on('load', () => {
                console.log('Map loaded successfully');
            });

            this.map.on('error', (e) => {
                console.error('Mapbox error:', e);
            });

            this.initialized = true;
            console.log('Map initialization complete');
        } catch (error) {
            console.error('Error initializing map:', error);
            throw error;
        }
    }

    // We no longer need this method as Mapbox is loaded from HTML

    /**
     * Update the map with neighborhood data
     * @param {Array} neighborhoods - Array of neighborhood data
     */
    updateNeighborhoods(neighborhoods) {
        this.neighborhoodData = neighborhoods;
        this.clearMarkers();

        if (!neighborhoods || neighborhoods.length === 0) {
            return;
        }

        // Add markers for each neighborhood
        neighborhoods.forEach(neighborhood => {
            if (!neighborhood.coordinates) return;
            
            const { lat, lon } = neighborhood.coordinates;
            
            // Create marker element
            const el = document.createElement('div');
            el.className = 'neighborhood-marker';
            el.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
            
            // Create marker
            const marker = new mapboxgl.Marker(el)
                .setLngLat([lon, lat])
                .addTo(this.map);
            
            // Add click event to show popup
            marker.getElement().addEventListener('click', () => {
                this.showNeighborhoodPopup(neighborhood, marker);
            });
            
            this.markers.push(marker);
        });

        // Fit map to markers if we have any
        if (this.markers.length > 0) {
            this.fitMapToMarkers();
        }
    }

    /**
     * Show popup with neighborhood details
     * @param {Object} neighborhood - Neighborhood data
     * @param {Object} marker - Mapbox marker
     */
    showNeighborhoodPopup(neighborhood, marker) {
        const html = `
            <div class="neighborhood-popup">
                <h3>${neighborhood.name}</h3>
                <p><strong>Distance:</strong> ${neighborhood.distance}</p>
                <p>${neighborhood.description}</p>
            </div>
        `;
        
        this.popup
            .setLngLat(marker.getLngLat())
            .setHTML(html)
            .addTo(this.map);
    }

    /**
     * Clear all markers from the map
     */
    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
        
        if (this.popup) {
            this.popup.remove();
        }
    }

    /**
     * Fit map view to include all markers
     */
    fitMapToMarkers() {
        if (this.markers.length === 0) return;
        
        const bounds = new mapboxgl.LngLatBounds();
        
        this.markers.forEach(marker => {
            bounds.extend(marker.getLngLat());
        });
        
        this.map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
        });
    }

    /**
     * Center map on a specific location
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} zoom - Zoom level
     */
    centerMap(lat, lon, zoom = 12) {
        if (!this.map) return;
        
        this.map.flyTo({
            center: [lon, lat],
            zoom: zoom,
            essential: true
        });
    }

    /**
     * Update map based on address
     * @param {string} address - Address to geocode and center map on
     * @param {GeocodingService} geocoder - Geocoding service instance
     */
    async updateFromAddress(address, geocoder) {
        try {
            const result = await geocoder.geocodeAddress(address);
            
            if (!result) {
                console.error('Could not geocode address:', address);
                return;
            }
            
            // Check if address is in the US
            const isUS = result.address_details && 
                         (result.address_details.country_code === 'us' || 
                          result.address_details.country === 'United States');
            
            if (!isUS) {
                console.warn('Address is not in the US:', address);
                alert('Please enter a US address for the best experience.');
                return;
            }
            
            // Center map on the geocoded location
            this.centerMap(result.lat, result.lon);
            
            // Return the geocoded result for further processing
            return result;
        } catch (error) {
            console.error('Error updating map from address:', error);
        }
    }
}

export default OpportunityMap;
