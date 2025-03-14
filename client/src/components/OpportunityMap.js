import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box } from '@mui/material';

// Replace with your Mapbox access token
// For a real application, you would store this in an environment variable
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyYWhtYW45OTcxIiwiYSI6ImNsczVwcnI2YzBmNmYyaXA4ZnlnZnlvNDkifQ.4Ql9QDRHhGKLCxTvpQrJZQ';

const OpportunityMap = ({ neighborhoods }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (!neighborhoods) return;

    console.log('Initializing map with neighborhoods data');
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.97, 40.75], // NYC coordinates (example)
      zoom: 12
    });
    
    mapRef.current = map;
    
    // Add navigation control (zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.on('load', () => {
      console.log('Map loaded, adding neighborhood data');
      
      // Add the neighborhoods data as a source
      map.addSource('neighborhoods', {
        type: 'geojson',
        data: neighborhoods
      });
      
      // Add a layer for the neighborhood polygons
      map.addLayer({
        id: 'neighborhood-fills',
        type: 'fill',
        source: 'neighborhoods',
        layout: {},
        paint: {
          'fill-color': [
            'case',
            ['has', 'filtered'], // Check if the 'filtered' property exists
            [
              'case',
              ['==', ['get', 'filtered'], true], // If filtered is true
              [
                'interpolate',
                ['linear'],
                ['get', 'opportunityScore'],
                0, '#f7fbff',
                2, '#d0e1f2',
                4, '#94c4df',
                6, '#4a98c9',
                8, '#1764ab',
                10, '#08306b'
              ],
              '#cccccc' // If filtered is false, use gray
            ],
            // If 'filtered' property doesn't exist, use the regular color scale
            [
              'interpolate',
              ['linear'],
              ['get', 'opportunityScore'],
              0, '#f7fbff',
              2, '#d0e1f2',
              4, '#94c4df',
              6, '#4a98c9',
              8, '#1764ab',
              10, '#08306b'
            ]
          ],
          'fill-opacity': 0.75
        }
      });
      
      // Add a layer for the neighborhood borders
      map.addLayer({
        id: 'neighborhood-borders',
        type: 'line',
        source: 'neighborhoods',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 1
        }
      });
      
      // Add a popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });
      
      map.on('mouseenter', 'neighborhood-fills', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        
        const properties = e.features[0].properties;
        const filtered = properties.filtered !== undefined ? properties.filtered : true;
        
        if (filtered) {
          const coordinates = e.lngLat;
          
          const html = `
            <strong>${properties.name}</strong><br/>
            Opportunity Score: ${properties.opportunityScore}<br/>
            School Quality: ${properties.schoolQuality}<br/>
            ${properties.description}
          `;
          
          popup.setLngLat(coordinates).setHTML(html).addTo(map);
        }
      });
      
      map.on('mouseleave', 'neighborhood-fills', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });
    });
    
    // Clean up on unmount
    return () => map.remove();
  }, [neighborhoods]);
  
  // Update the map when neighborhoods data changes
  useEffect(() => {
    if (!mapRef.current || !neighborhoods) return;
    
    const map = mapRef.current;
    
    if (map.getSource('neighborhoods')) {
      console.log('Updating neighborhoods data source');
      map.getSource('neighborhoods').setData(neighborhoods);
    }
  }, [neighborhoods]);
  
  return <Box ref={mapContainerRef} sx={{ width: '100%', height: '100%' }} />;
};

export default OpportunityMap;
