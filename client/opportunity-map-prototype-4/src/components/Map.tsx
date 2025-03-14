import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Box, Paper, Typography } from '@mui/material';
import { FeatureCollection, Feature, Geometry } from 'geojson';
import { NeighborhoodProperties } from '../data/neighborhoodData';
import { FilterSettings } from '../types';

// Set your Mapbox access token here
// Note: In a production app, this should be in an environment variable
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xnNXBtcXFsMDRtMDNkcGx2ZnlhYXltdCJ9.xmtzLPhiojLSUxfKYYgDTQ';

interface MapProps {
  data: FeatureCollection<Geometry, NeighborhoodProperties>;
  filterSettings: FilterSettings;
  filtersApplied: boolean;
}

const Map: React.FC<MapProps> = ({ data, filterSettings, filtersApplied }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<Feature<Geometry, NeighborhoodProperties> | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-71.0943, 42.3250], // Boston area
        zoom: 12
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add the data source when the map loads
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add the data source
        map.current.addSource('neighborhoods', {
          type: 'geojson',
          data: data
        });

        // Add the neighborhood layer
        map.current.addLayer({
          id: 'neighborhood-fills',
          type: 'fill',
          source: 'neighborhoods',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'opportunityScore'],
              1, '#f7fbff',
              3, '#c7dcef',
              5, '#81b5d4',
              7, '#4292c6',
              9, '#08519c',
              10, '#08306b'
            ],
            'fill-opacity': 0.7
          }
        });

        // Add outline layer
        map.current.addLayer({
          id: 'neighborhood-outlines',
          type: 'line',
          source: 'neighborhoods',
          paint: {
            'line-color': '#000',
            'line-width': 1
          }
        });

        // Add hover effect
        map.current.on('mousemove', 'neighborhood-fills', (e) => {
          if (e.features && e.features.length > 0) {
            setHoveredFeature(e.features[0] as Feature<Geometry, NeighborhoodProperties>);
          }
        });

        map.current.on('mouseleave', 'neighborhood-fills', () => {
          setHoveredFeature(null);
        });
      });
    }
  }, [data]);

  // Update the map when filters are applied
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !filtersApplied) return;

    // Create a filtered version of the data
    const filteredData = {
      type: 'FeatureCollection',
      features: data.features.map(feature => {
        const props = feature.properties;
        
        // Check if the feature meets all enabled filter criteria
        const meetsAllCriteria = Object.entries(filterSettings).every(([factorId, setting]) => {
          if (!setting.enabled) return true; // Skip disabled filters
          
          // Check if the property value meets or exceeds the filter value
          const factorKey = factorId as keyof NeighborhoodProperties;
          return props[factorKey] >= setting.value;
        });

        // Create a new feature with the same properties but with a flag indicating if it meets criteria
        return {
          ...feature,
          properties: {
            ...props,
            meetsAllCriteria
          }
        };
      })
    };

    // Update the data source
    if (map.current.getSource('neighborhoods')) {
      (map.current.getSource('neighborhoods') as mapboxgl.GeoJSONSource).setData(filteredData as any);
    }

    // Update the fill layer to gray out neighborhoods that don't meet criteria
    map.current.setPaintProperty('neighborhood-fills', 'fill-color', [
      'case',
      ['==', ['get', 'meetsAllCriteria'], true],
      [
        'interpolate',
        ['linear'],
        ['get', 'opportunityScore'],
        1, '#f7fbff',
        3, '#c7dcef',
        5, '#81b5d4',
        7, '#4292c6',
        9, '#08519c',
        10, '#08306b'
      ],
      '#cccccc' // Gray color for neighborhoods that don't meet criteria
    ]);

    console.log('Filters applied:', filterSettings);
    
  }, [data, filterSettings, filtersApplied]);

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      
      {/* Legend */}
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'absolute', 
          bottom: 16, 
          right: 16, 
          p: 2, 
          zIndex: 1,
          maxWidth: 200
        }}
      >
        <Typography variant="subtitle2" gutterBottom>Opportunity Score</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#08306b', mr: 1 }} />
          <Typography variant="body2">9-10: Very High</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#4292c6', mr: 1 }} />
          <Typography variant="body2">7-8: High</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#81b5d4', mr: 1 }} />
          <Typography variant="body2">5-6: Medium</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#c7dcef', mr: 1 }} />
          <Typography variant="body2">3-4: Low</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#f7fbff', mr: 1, border: '1px solid #ccc' }} />
          <Typography variant="body2">1-2: Very Low</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#cccccc', mr: 1 }} />
          <Typography variant="body2">Filtered Out</Typography>
        </Box>
      </Paper>
      
      {/* Hover tooltip */}
      {hoveredFeature && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            left: 16, 
            p: 2, 
            zIndex: 1,
            maxWidth: 300
          }}
        >
          <Typography variant="h6">{hoveredFeature.properties.name}</Typography>
          <Typography variant="body2" gutterBottom>
            Opportunity Score: {hoveredFeature.properties.opportunityScore.toFixed(1)}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              School Quality: {hoveredFeature.properties.schoolQuality}/10
            </Typography>
            <Typography variant="body2">
              Safety: {hoveredFeature.properties.safety}/10
            </Typography>
            <Typography variant="body2">
              Healthcare: {hoveredFeature.properties.healthcare}/10
            </Typography>
            <Typography variant="body2">
              Amenities: {hoveredFeature.properties.amenities}/10
            </Typography>
            <Typography variant="body2">
              Housing: {hoveredFeature.properties.housing}/10
            </Typography>
            <Typography variant="body2">
              Transportation: {hoveredFeature.properties.transportation}/10
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Map;
