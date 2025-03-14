import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Typography } from '@mui/material';

// Set the Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';

// For debugging
console.log('Mapbox token set:', mapboxgl.accessToken);

const OpportunityMap = ({ neighborhoods }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  
  // Initialize map when component mounts
  useEffect(() => {
    console.log('Initializing map');
    
    // Check if map is already initialized
    if (mapRef.current) return;
    
    try {
      console.log('Creating map with container:', mapContainerRef.current);
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-73.97, 40.75], // NYC coordinates
        zoom: 10,
        attributionControl: true
      });
      
      console.log('Map initialized successfully');
      mapRef.current = map;
      
      // Add navigation control
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add a simple marker for testing
      new mapboxgl.Marker()
        .setLngLat([-73.97, 40.75])
        .addTo(map);
      
      // Clean up on unmount
      return () => map.remove();
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(`Failed to initialize map: ${error.message}`);
    }
  }, []);
  
  // Add neighborhoods data when it's available
  useEffect(() => {
    if (!mapRef.current || !neighborhoods) return;
    
    const map = mapRef.current;
    
    try {
      // Wait for the map to be loaded
      if (!map.isStyleLoaded()) {
        map.once('style.load', () => {
          addNeighborhoodsToMap(map, neighborhoods);
        });
      } else {
        addNeighborhoodsToMap(map, neighborhoods);
      }
    } catch (error) {
      console.error('Error adding neighborhoods:', error);
      setMapError(`Failed to add neighborhoods: ${error.message}`);
    }
  }, [neighborhoods]);
  
  // Helper function to add neighborhoods to the map
  const addNeighborhoodsToMap = (map, data) => {
    console.log('Adding neighborhoods to map');
    
    // Remove existing source and layers if they exist
    if (map.getSource('neighborhoods')) {
      map.removeLayer('neighborhood-borders');
      map.removeLayer('neighborhood-fills');
      map.removeSource('neighborhoods');
    }
    
    // Add the neighborhoods data as a source
    map.addSource('neighborhoods', {
      type: 'geojson',
      data: data
    });
    
    // Add a layer for the neighborhood polygons
    map.addLayer({
      id: 'neighborhood-fills',
      type: 'fill',
      source: 'neighborhoods',
      layout: {},
      paint: {
        'fill-color': [
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
        'fill-opacity': 0.7
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
      const coordinates = e.lngLat;
      
      const html = `
        <strong>${properties.name}</strong><br/>
        Opportunity Score: ${properties.opportunityScore}<br/>
        School Quality: ${properties.schoolQuality}<br/>
        ${properties.description}
      `;
      
      popup.setLngLat(coordinates).setHTML(html).addTo(map);
    });
    
    map.on('mouseleave', 'neighborhood-fills', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {mapError ? (
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>Error loading map: {mapError}</Typography>
        </Box>
      ) : (
        <Box 
          ref={mapContainerRef} 
          className="map-container"
          sx={{ 
            width: '100%', 
            height: '100%',
            minHeight: '500px',
            border: '1px solid #ddd'
          }} 
        />
      )}
    </Box>
  );
};

export default OpportunityMap;
