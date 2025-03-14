import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Typography, Paper } from '@mui/material';
import neighborhoodData, { NeighborhoodProperties } from '../data/neighborhoodData';
import { Feature, Polygon } from 'geojson';

// You would normally store this in an environment variable
// For this prototype, we're hardcoding it
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';

interface MapComponentProps {
  schoolQualityFilter: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ schoolQualityFilter }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<NeighborhoodProperties | null>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // safety check

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-71.10, 42.36], // Boston area
      zoom: 11
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // When map loads, add the data
    map.current.on('load', () => {
      if (!map.current) return;

      // Add the source for neighborhoods
      map.current.addSource('neighborhoods', {
        type: 'geojson',
        data: neighborhoodData
      });

      // Add the layer for neighborhood boundaries
      map.current.addLayer({
        id: 'neighborhood-boundaries',
        type: 'line',
        source: 'neighborhoods',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 1
        }
      });

      // Add the layer for neighborhood fills
      map.current.addLayer({
        id: 'neighborhood-fills',
        type: 'fill',
        source: 'neighborhoods',
        layout: {},
        paint: {
          'fill-color': [
            'case',
            ['>=', ['get', 'schoolQuality'], schoolQualityFilter],
            [
              'interpolate',
              ['linear'],
              ['get', 'opportunityScore'],
              0, '#e5f5f9',
              5, '#99d8c9',
              10, '#2ca25f'
            ],
            '#cccccc' // Gray out neighborhoods below the filter
          ],
          'fill-opacity': 0.75
        }
      });

      // Add hover effect
      map.current.on('mousemove', 'neighborhood-fills', (e) => {
        if (e.features && e.features.length > 0) {
          // Cast to unknown first to avoid TypeScript error
          const feature = e.features[0] as unknown as Feature<Polygon, NeighborhoodProperties>;
          setHoveredNeighborhood(feature.properties);
        }
      });

      // Remove hover effect when mouse leaves
      map.current.on('mouseleave', 'neighborhood-fills', () => {
        setHoveredNeighborhood(null);
      });

      // Add debug logs
      console.log('Map initialized with school quality filter:', schoolQualityFilter);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [schoolQualityFilter]); // Add schoolQualityFilter as a dependency

  // Update the filter when schoolQualityFilter changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    map.current.setPaintProperty('neighborhood-fills', 'fill-color', [
      'case',
      ['>=', ['get', 'schoolQuality'], schoolQualityFilter],
      [
        'interpolate',
        ['linear'],
        ['get', 'opportunityScore'],
        0, '#e5f5f9',
        5, '#99d8c9',
        10, '#2ca25f'
      ],
      '#cccccc' // Gray out neighborhoods below the filter
    ]);

    console.log('Updated school quality filter to:', schoolQualityFilter);
  }, [schoolQualityFilter]);

  return (
    <Box sx={{ position: 'relative', height: '70vh', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />
      
      {/* Map Legend */}
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'absolute', 
          bottom: '20px', 
          right: '20px', 
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <Typography variant="subtitle2" gutterBottom>Opportunity Score</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#e5f5f9', mr: 1 }} />
          <Typography variant="body2">Low (0-3)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#99d8c9', mr: 1 }} />
          <Typography variant="body2">Medium (4-7)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#2ca25f', mr: 1 }} />
          <Typography variant="body2">High (8-10)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#cccccc', mr: 1 }} />
          <Typography variant="body2">Below Filter</Typography>
        </Box>
      </Paper>

      {/* Hover Info */}
      {hoveredNeighborhood && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'absolute', 
            top: '20px', 
            left: '20px', 
            padding: '10px',
            maxWidth: '300px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <Typography variant="h6">{hoveredNeighborhood.name}</Typography>
          <Typography variant="body2">Opportunity Score: {hoveredNeighborhood.opportunityScore}</Typography>
          <Typography variant="body2">School Quality: {hoveredNeighborhood.schoolQuality}/10</Typography>
          <Typography variant="body2">Population: {hoveredNeighborhood.population.toLocaleString()}</Typography>
          <Typography variant="body2">Median Income: ${hoveredNeighborhood.medianIncome.toLocaleString()}</Typography>
          <Typography variant="body2">{hoveredNeighborhood.description}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MapComponent;
