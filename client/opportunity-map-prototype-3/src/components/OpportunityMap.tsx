import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { FeatureCollection, Feature, Geometry } from 'geojson';
import { Box, Typography } from '@mui/material';
import { NeighborhoodProperties } from '../data/neighborhoodData';

// You would need to get your own Mapbox token
// This is a placeholder - replace with your actual token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyYWhtYW45OTcxIiwiYSI6ImNscGVqN3VtYzAyYXEyanA4ZnVvYWVxdWsifQ.nYVEzf1oOQvxBWYxL8JVUQ';

interface OpportunityMapProps {
  data: FeatureCollection<Geometry, NeighborhoodProperties>;
  filteredNeighborhoods: string[];
  hoveredNeighborhood: NeighborhoodProperties | null;
  setHoveredNeighborhood: (neighborhood: NeighborhoodProperties | null) => void;
}

const OpportunityMap: React.FC<OpportunityMapProps> = ({ 
  data, 
  filteredNeighborhoods,
  hoveredNeighborhood,
  setHoveredNeighborhood
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-122.431297, 37.773972], // San Francisco coordinates
        zoom: 12
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('Map loaded successfully');
      });
    }
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add source and layers when map is loaded and data is available
  useEffect(() => {
    if (!mapLoaded || !map.current || !data) return;

    // Add source if it doesn't exist
    if (!map.current.getSource('neighborhoods')) {
      map.current.addSource('neighborhoods', {
        type: 'geojson',
        data: data
      });

      // Add fill layer
      map.current.addLayer({
        id: 'neighborhood-fills',
        type: 'fill',
        source: 'neighborhoods',
        layout: {},
        paint: {
          'fill-color': [
            'case',
            ['in', ['get', 'id'], ['literal', filteredNeighborhoods]],
            '#ccc', // Gray out filtered neighborhoods
            [
              'interpolate',
              ['linear'],
              ['get', 'opportunityScore'],
              0, '#d73027',
              5, '#fee08b',
              10, '#1a9850'
            ]
          ],
          'fill-opacity': 0.75
        }
      });

      // Add outline layer
      map.current.addLayer({
        id: 'neighborhood-outlines',
        type: 'line',
        source: 'neighborhoods',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 1
        }
      });

      // Add hover effects
      map.current.on('mousemove', 'neighborhood-fills', (e) => {
        if (e.features && e.features.length > 0) {
          // First cast to unknown, then to our specific type to avoid TypeScript error
          const feature = e.features[0] as unknown as { properties: NeighborhoodProperties };
          setHoveredNeighborhood(feature.properties);
          
          map.current!.getCanvas().style.cursor = 'pointer';
          
          // Highlight the hovered neighborhood
          map.current!.setFeatureState(
            { source: 'neighborhoods', id: feature.properties.id },
            { hover: true }
          );
        }
      });

      map.current.on('mouseleave', 'neighborhood-fills', () => {
        setHoveredNeighborhood(null);
        map.current!.getCanvas().style.cursor = '';
        
        // Remove highlight from all neighborhoods
        data.features.forEach(feature => {
          map.current!.setFeatureState(
            { source: 'neighborhoods', id: feature.properties.id },
            { hover: false }
          );
        });
      });
    } else {
      // Update the data if the source already exists
      (map.current.getSource('neighborhoods') as mapboxgl.GeoJSONSource).setData(data);
      
      // Update the fill color based on filtered neighborhoods
      map.current.setPaintProperty('neighborhood-fills', 'fill-color', [
        'case',
        ['in', ['get', 'id'], ['literal', filteredNeighborhoods]],
        '#ccc', // Gray out filtered neighborhoods
        [
          'interpolate',
          ['linear'],
          ['get', 'opportunityScore'],
          0, '#d73027',
          5, '#fee08b',
          10, '#1a9850'
        ]
      ]);
    }
  }, [mapLoaded, data, filteredNeighborhoods, setHoveredNeighborhood]);

  return (
    <Box sx={{ position: 'relative', height: '70vh', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />
      
      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 2,
          borderRadius: 1,
          boxShadow: 1,
          zIndex: 1
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Opportunity Score
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#d73027', mr: 1 }} />
          <Typography variant="body2">Low (0-3)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#fee08b', mr: 1 }} />
          <Typography variant="body2">Medium (4-7)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#1a9850', mr: 1 }} />
          <Typography variant="body2">High (8-10)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#ccc', mr: 1 }} />
          <Typography variant="body2">Filtered Out</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default OpportunityMap;
