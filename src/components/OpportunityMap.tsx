'use client'

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { geocodeAddress, geocodeZipCode, geocodeNeighborhood } from '../utils/geocodingUtils';
import { usePersonalization } from './AssessProvider';
import NeighborhoodAnalysis, { NeighborhoodData } from './NeighborhoodAnalysis';
import { useTranslations } from 'next-intl';

// Helper function to calculate opportunity score based on household income
const calculateOpportunityScore = (income: number): number => {
  // Convert income to a score from 1-10 based on the map colors
  // This matches the fill-color scale used in the map layer
  if (income <= 10000) return 0;
  if (income <= 25000) return 1;
  if (income <= 28000) return 2;
  if (income <= 30000) return 3;
  if (income <= 32000) return 4;
  if (income <= 34000) return 5;
  if (income <= 36000) return 6;
  if (income <= 38000) return 7;
  if (income <= 41000) return 8;
  if (income <= 45000) return 9;
  return 10;
};

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFoaWFyIiwiYSI6ImNtNDY1YnlwdDB2Z2IybHEwd2w3MHJvb3cifQ.wJqnzFFTwLFwYhiPG3SWJA';

// Define GeoJSON types for TypeScript
type Geometry = GeoJSON.Geometry;

// Define the interface for census tract data
interface TractData {
  GEOID?: string;
  GEO_ID?: string;
  Household_Income_at_Age_35_rP_gP_p25?: number;
  [key: string]: unknown; // Allow for other properties
}

// Using NeighborhoodData interface imported from NeighborhoodInsights component

interface OpportunityMapProps {
  address?: string;
  isVisible?: boolean; // Prop to control visibility
  showWrapper?: boolean; // New prop to control whether to show the surrounding UI elements
}

// Fetch neighborhood data from OpenAI API
const fetchNeighborhoodData = async (address: string): Promise<NeighborhoodData> => {
  console.log(`Fetching neighborhood data for: ${address}`);
  
  try {
    // Call the OpenAI API to get neighborhood insights
    const response = await fetch('/api/openai-neighborhood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      // For 500 errors, return a default data structure instead of throwing
      // This prevents the entire component from crashing
      if (response.status === 500) {
        console.error(`API request failed with status 500 for address: ${address}`);
        // Return default neighborhood data that matches the NeighborhoodData interface
        return {
          schoolQuality: {
            score: 0,
            description: 'Information unavailable',
            details: ['Unable to retrieve school information for this neighborhood']
          },
          safety: {
            score: 0,
            description: 'Information unavailable',
            details: ['Unable to retrieve safety information for this neighborhood']
          },
          healthcare: {
            score: 0,
            description: 'Information unavailable',
            details: ['Unable to retrieve healthcare information for this neighborhood']
          },
          amenities: {
            score: 0,
            description: 'Information unavailable',
            details: ['Unable to retrieve amenities information for this neighborhood']
          },
          housing: {
            score: 0,
            description: 'Information unavailable',
            details: ['Unable to retrieve housing information for this neighborhood']
          },
          transportation: {
            score: 0,
            description: 'Information unavailable',
            details: ['Unable to retrieve transportation information for this neighborhood']
          }
        };
      }
      
      // For other errors, still throw but with more information
      throw new Error(`API request failed with status ${response.status} for address: ${address}`);
    }

    const data = await response.json();
    
    // If we have neighborhood data in the response, use it
    if (data.neighborhoodData) {
      return data.neighborhoodData;
    }
    
    // If we don't have the expected format, construct a default response
    // with any data we can extract from the API response
    return {
      schoolQuality: {
        score: data.schoolQualityScore || 5.0,
        description: data.schoolQualityDescription || 'School quality information for this area',
        details: data.schoolQualityDetails || ['No detailed information available']
      },
      safety: {
        score: data.safetyScore || 5.0,
        description: data.safetyDescription || 'Safety information for this area',
        details: data.safetyDetails || ['No detailed information available']
      },
      healthcare: {
        score: data.healthcareScore || 5.0,
        description: data.healthcareDescription || 'Healthcare information for this area',
        details: data.healthcareDetails || ['No detailed information available']
      },
      amenities: {
        score: data.amenitiesScore || 5.0,
        description: data.amenitiesDescription || 'Amenities information for this area',
        details: data.amenitiesDetails || ['No detailed information available']
      },
      housing: {
        score: data.housingScore || 5.0,
        description: data.housingDescription || 'Housing information for this area',
        details: data.housingDetails || ['No detailed information available']
      },
      transportation: {
        score: data.transportationScore || 5.0,
        description: data.transportationDescription || 'Transportation information for this area',
        details: data.transportationDetails || ['No detailed information available']
      }
    };
  } catch (error) {
    console.error('Error fetching neighborhood data:', error);
    
    // Return default data in case of error
    return {
      schoolQuality: {
        score: 5.0,
        description: 'No data available',
        details: ['Could not retrieve school quality data for this location']
      },
      safety: {
        score: 5.0,
        description: 'No data available',
        details: ['Could not retrieve safety data for this location']
      },
      healthcare: {
        score: 5.0,
        description: 'No data available',
        details: ['Could not retrieve healthcare data for this location']
      },
      amenities: {
        score: 5.0,
        description: 'No data available',
        details: ['Could not retrieve amenities data for this location']
      },
      housing: {
        score: 5.0,
        description: 'No data available',
        details: ['Could not retrieve housing data for this location']
      },
      transportation: {
        score: 5.0,
        description: 'No data available',
        details: ['Could not retrieve transportation data for this location']
      }
    };
  }
};

const OpportunityMap: React.FC<OpportunityMapProps> = ({ 
  address, 
  showWrapper = true 
}) => {
  const t = useTranslations('opportunityMap');
  // Get the personalization context to share opportunity score
  const { updateData } = usePersonalization();
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapView] = useState<'commuting' | 'census'>('census'); // Always using census view now
  const [selectedTract, setSelectedTract] = useState<TractData | null>(null);
  const [mapStyleLoaded, setMapStyleLoaded] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [, setUserTractId] = useState<string | null>(null);
  const [, setUserTractGeometry] = useState<Geometry | null>(null);
  const [insightsData, setInsightsData] = useState<NeighborhoodData | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Keep the light style
      center: [-98.5795, 39.8283], // Centered on USA
      zoom: 3,
      projection: 'mercator',
      renderWorldCopies: false,
      preserveDrawingBuffer: true,
      // Add maxBounds to restrict the map to the United States (including Alaska and Hawaii)
      maxBounds: [
        [-179.9, 18.8], // Southwest coordinates (includes Hawaii)
        [-66.9, 71.4]   // Northeast coordinates (includes Alaska)
      ],
      minZoom: 2 // Prevent zooming out too far
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Set up event listener for map loading
    map.current.on('load', () => {
      console.log('Map fully loaded');
      setMapStyleLoaded(true);
      
      // Add sources immediately on load
      if (map.current) {
        try {
          // Add streets source
          map.current.addSource('mapbox-streets', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-streets-v8'
          });
          
          // Add data source
          map.current.addSource('ct-opportunity-data', {
            type: 'vector',
            url: 'mapbox://mahiar.bdsxlspn'
          });
          
          // Handle text labels - hide small street labels and style others
          try {
            // Get the map style
            const style = map.current.getStyle();
            if (style && style.layers) {
              // Loop through all layers and modify text layers
              for (let i = 0; i <style.layers.length; i++) {
                const layer = style.layers[i];
                
                // Check if this is a symbol layer (text labels)
                if (layer && layer.type === 'symbol' && layer.id) {
                  // Hide street name labels
                  if (layer.id.includes('road-label') || layer.id.includes('street-label')) {
                    map.current.setLayoutProperty(layer.id, 'visibility', 'none');
                  } else {
                    // For other labels (cities, neighborhoods, etc.) - make them black with good contrast
                    map.current.setPaintProperty(layer.id, 'text-color', '#000000');
                    map.current.setPaintProperty(layer.id, 'text-opacity', 1);
                    map.current.setPaintProperty(layer.id, 'text-halo-color', '#ffffff');
                    map.current.setPaintProperty(layer.id, 'text-halo-width', 1.5);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error updating text styles:', error);
          }
          
          // Add layers
          addMapLayers('ct_tract_kfr_rP_gP_p25-8tx22d');
        } catch (error) {
          console.error('Error setting up map on load:', error);
        }
      }
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // We intentionally exclude addMapLayers to avoid re-initializing the map

  // Function to add map layers with the correct source layer
  const addMapLayers = (sourceLayer: string) => {
    if (!map.current) return;
    
    try {
      console.log('Adding census tract fill layer with source layer:', sourceLayer);
      
      // Add the main fill layer for census tracts first (so it appears below the streets)
      map.current.addLayer({
        id: 'census-tracts-layer',
        type: 'fill',
        source: 'ct-opportunity-data',
        'source-layer': sourceLayer,
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['coalesce', 
              ['get', 'Household_Income_at_Age_35_rP_gP_p25'], 
              ['get', 'household_income_at_age_35_rp_gp_p25'],
              ['get', 'Household_Income_at_Age_35-rP_gP_p25'],
              0
            ],
            10000, '#9b252f',  // <$10k - accent1 (dark red)
            25000, '#b65441',  // 25k - accent2 (red)
            28000, '#d07e59',  // 28k - accent3 (orange)
            30000, '#e5a979',  // 30k - accent4 (light orange)
            32000, '#f4d79e',  // 32k - accent5 (yellow)
            34000, '#fcfdc1',  // 34k - accent6 (light yellow)
            36000, '#cdddb5',  // 36k - accent7 (light green)
            38000, '#9dbda9',  // 38k - accent8 (green)
            41000, '#729d9d',  // 41k - accent9 (teal)
            45000, '#4f7f8b',  // 45k - accent10 (blue)
            60000, '#34687e'   // >$60k - accent11 (dark blue)
          ],
          'fill-opacity': 0.8,
          'fill-outline-color': '#000000'
        }
      }, 'poi-label');
      
      // Detailed street layers have been removed
      
      // Add water bodies layer (white overlay)
      map.current.addLayer({
        id: 'water-bodies-layer',
        type: 'fill',
        source: 'mapbox-streets',
        'source-layer': 'water',
        layout: {
          'visibility': 'visible'
        },
        paint: {
          'fill-color': '#ffffff',  // White color for water bodies
          'fill-opacity': 1
        }
      });
      
      // Add only major highways for orientation
      map.current.addLayer({
        id: 'major-highways-layer',
        type: 'line',
        source: 'mapbox-streets',
        'source-layer': 'road',
        filter: ['in', 'class', 'motorway', 'trunk'],  // Only show major highways
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.5,
            10, 0.75,
            12, 1,
            15, 1.5,
            20, 2
          ],
          'line-opacity': 0.4  // Reduced opacity
        }
      });
      
      // Census tract outline - enhanced for better visibility
      map.current.addLayer({
        id: 'census-tracts-outline',
        type: 'line',
        source: 'ct-opportunity-data',
        'source-layer': sourceLayer,
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#000000',
          'line-width': 0.75,  // Slightly thicker lines
          'line-opacity': 0.7   // Slightly transparent
        }
      });

      // Hover layer
      map.current.addLayer({
        id: 'census-tracts-hover',
        type: 'line',
        source: 'ct-opportunity-data',
        'source-layer': sourceLayer,
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#000',
          'line-width': 3,
          'line-opacity': 0.9
        },
        filter: ['==', 'GEOID', '']
      });
      
      // User location source
      map.current.addSource('user-location-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        }
      });
      
      // User location symbol
      map.current.addLayer({
        id: 'user-location-symbol',
        type: 'circle',
        source: 'user-location-source',
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#000000',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });
      
      // User tract source
      map.current.addSource('user-tract-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[]]
          },
          properties: {}
        }
      });
      
      // User tract outline
      map.current.addLayer({
        id: 'user-tract-outline',
        type: 'line',
        source: 'user-tract-source',
        layout: {
          'visibility': mapView === 'census' ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#000000',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 3,
            10, 5,
            12, 8,
            14, 12
          ]
        }
      });
      
      // Log feature properties if available
      try {
        const features = map.current.querySourceFeatures('ct-opportunity-data', {
          sourceLayer: sourceLayer,
          validate: false
        });
        
        if (features && features.length > 0) {
          console.log('Example feature properties:', features[0].properties);
          // Add null check before calling Object.keys
          if (features[0].properties) {
            console.log('Available property keys:', Object.keys(features[0].properties));
          } else {
            console.log('Feature properties is null');
          }
        } else {
          console.log('No features found in source');
        }
      } catch (err) {
        console.log('Could not query source features:', err);
      }
      
      // Add event handlers
      addEventHandlers();
      
      console.log('Successfully added layers with source layer:', sourceLayer);
    } catch (error) {
      console.error('Error adding map layers:', error);
    }
  };
  
  // Function to add event handlers to the map layers
  const addEventHandlers = () => {
    if (!map.current) return;
    
    // Function to handle feature click
    const handleFeatureClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const properties = feature.properties || {};
        console.log('Clicked feature properties:', properties);
        setSelectedTract(properties);
        
        // Update the hover layer to highlight the selected tract
        if (map.current?.getLayer('census-tracts-hover')) {
          // Check if GEOID exists and is a valid value before using it
          const geoid = properties.GEOID || properties.GEO_ID || '';
          if (geoid) {
            map.current.setFilter('census-tracts-hover', ['==', 'GEOID', geoid]);
            
            // Update the user's tract geometry to the newly clicked tract
            if (map.current.getSource('user-tract-source') && feature.geometry) {
              // Update the userTractGeometry state with the new geometry
              setUserTractGeometry(feature.geometry);
              setUserTractId(geoid);
              
              // Update the user tract source with the new geometry
              (map.current.getSource('user-tract-source') as mapboxgl.GeoJSONSource).setData({
                type: 'Feature',
                geometry: feature.geometry,
                properties: {}
              });
            }
          } else {
            // Reset filter if no valid GEOID is found
            map.current.setFilter('census-tracts-hover', ['==', 'GEOID', '']);
          }
        }
        
        // Log properties to help debug
        console.log('Feature properties for popup:', properties);
        
        // Calculate opportunity score and update context
        if (properties.Household_Income_at_Age_35_rP_gP_p25) {
          const income = properties.Household_Income_at_Age_35_rP_gP_p25;
          const opportunityScore = calculateOpportunityScore(income).toString();
          
          // Share the opportunity score with other components through context
          // This ensures the Learn component gets updated when a new tract is clicked
          updateData({
            opportunityScore: parseInt(opportunityScore),
            income: income.toString()
          });
        }
        
        // Remove any existing popup
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      }
    };
    
    // Add click events for the layers
    map.current.on('click', 'census-tracts-layer', handleFeatureClick);
    
    // Setup cursor behavior for the layer
    map.current.on('mouseenter', 'census-tracts-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    
    map.current.on('mouseleave', 'census-tracts-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };
  
  // Update layer visibility when mapView changes
  useEffect(() => {
    if (!map.current || !mapStyleLoaded) return;
    
    // Check if layers exist
    const hasLayers = map.current.getLayer('census-tracts-layer') && 
                     map.current.getLayer('census-tracts-outline') && 
                     map.current.getLayer('census-tracts-hover');
    
    if (hasLayers) {
      // Update layer visibility based on the current view
      map.current.setLayoutProperty(
        'census-tracts-layer', 
        'visibility', 
        mapView === 'census' ? 'visible' : 'none'
      );
      map.current.setLayoutProperty(
        'census-tracts-outline', 
        'visibility', 
        mapView === 'census' ? 'visible' : 'none'
      );
      map.current.setLayoutProperty(
        'census-tracts-hover', 
        'visibility', 
        mapView === 'census' ? 'visible' : 'none'
      );
      
      // Also update user tract outline visibility
      if (map.current.getLayer('user-tract-outline')) {
        map.current.setLayoutProperty(
          'user-tract-outline',
          'visibility',
          mapView === 'census' ? 'visible' : 'none'
        );
      }
      
      if (map.current.getLayer('user-location-symbol')) {
        map.current.setLayoutProperty(
          'user-location-symbol',
          'visibility',
          mapView === 'census' ? 'visible' : 'none'
        );
      }
      
      // Make streets more visible when in census view
      if (map.current.getLayer('streets-layer')) {
        map.current.setPaintProperty(
          'streets-layer',
          'line-opacity',
          mapView === 'census' ? 0.9 : 0.5
        );
      }
      
      if (map.current.getLayer('major-streets-layer')) {
        map.current.setPaintProperty(
          'major-streets-layer',
          'line-opacity',
          mapView === 'census' ? 0.9 : 0.5
        );
      }
    } else if (mapStyleLoaded && map.current) {
      // If layers don't exist yet but map is loaded, try adding them directly
      try {
        // Add streets source
        if (!map.current.getSource('mapbox-streets')) {
          map.current.addSource('mapbox-streets', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-streets-v8'
          });
        }
        
        // Add data source
        if (!map.current.getSource('ct-opportunity-data')) {
          map.current.addSource('ct-opportunity-data', {
            type: 'vector',
            url: 'mapbox://mahiar.bdsxlspn'
          });
        }
        
        // Add layers
        addMapLayers('ct_tract_kfr_rP_gP_p25-8tx22d');
      } catch (error) {
        console.error('Error setting up map sources and layers:', error);
      }
    }
    
    // Clear any selected tract when switching views
    if (mapView !== 'census') {
      setSelectedTract(null);
      if (popupRef.current) popupRef.current.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapView, mapStyleLoaded]);  // We intentionally exclude addMapLayers to avoid re-rendering issues

  // Effect to load neighborhood insights data when address changes
  useEffect(() => {
    const getNeighborhoodData = async () => {
      if (address) {
        setLoadingInsights(true);
        try {
          const neighborhoodData = await fetchNeighborhoodData(address);
          setInsightsData(neighborhoodData);
        } catch (error) {
          console.error('Error fetching neighborhood data:', error);
        } finally {
          setLoadingInsights(false);
        }
      }
    };

    getNeighborhoodData();
  }, [address]);

  // Effect to handle address changes and zoom to the corresponding census tract
  useEffect(() => {
    const zoomToAddress = async () => {
      if (!address || !map.current || !mapStyleLoaded) return;
      
      try {
        console.log('Geocoding address:', address);
        setLoadingAddress(true);
        
        // Parse the address to check if it contains a neighborhood and ZIP code
        // Format expected from Move component: "Neighborhood, Town, ZIP"
        const addressParts = address.split(',').map(part => part.trim());
        let coordinates = null;
        
        // Check if we have a neighborhood address format (at least 2 parts with the last being a ZIP code)
        if (addressParts.length >= 2 && /^\d{5}(-\d{4})?$/.test(addressParts[addressParts.length - 1])) {
          console.log('Detected neighborhood address format');
          const zipCode = addressParts[addressParts.length - 1];
          const neighborhood = addressParts[0];
          
          // First, get the state information from the ZIP code
          const zipInfo = await geocodeZipCode(zipCode);
          
          if (zipInfo && zipInfo.stateCode) {
            console.log(`ZIP code ${zipCode} is in state ${zipInfo.state} (${zipInfo.stateCode})`);
            
            // Try geocoding the neighborhood within the state context
            // If we have a town name (middle part), include it for better context
            if (addressParts.length >= 3) {
              const town = addressParts[1];
              console.log(`Trying to geocode neighborhood with town context: ${neighborhood}, ${town}, ${zipInfo.stateCode}`);
              // Try with town name for better context
              coordinates = await geocodeNeighborhood(`${neighborhood}, ${town}`, zipInfo.stateCode);
            } else {
              // Just try with neighborhood and state if no town is provided
              coordinates = await geocodeNeighborhood(neighborhood, zipInfo.stateCode);
            }
            
            if (coordinates) {
              console.log(`Successfully geocoded ${neighborhood} in ${zipInfo.stateCode}`);
            } else {
              // If neighborhood geocoding fails, try with the town and state as a fallback
              if (addressParts.length >= 3) {
                const town = addressParts[1];
                console.log(`Falling back to geocoding town: ${town}, ${zipInfo.stateCode}`);
                coordinates = await geocodeNeighborhood(town, zipInfo.stateCode);
              }
            }
          }
          
          // If all state-specific geocoding attempts fail, fall back to regular geocoding
          if (!coordinates) {
            console.log('State-specific geocoding failed, falling back to regular geocoding');
            coordinates = await geocodeAddress(address);
          }
        } else {
          // Regular geocoding for other address formats
          coordinates = await geocodeAddress(address);
        }
        
        if (!coordinates) {
          console.error('Failed to geocode address:', address);
          setGeocodingError(`Could not find location: ${address}. Please try a different neighborhood.`);
          setLoadingAddress(false);
          return;
        }
        
        // Clear any previous geocoding errors
        setGeocodingError(null);
        
        console.log('Coordinates:', coordinates);
        
        // Fly to the coordinates
        map.current.flyTo({
          center: [coordinates.lng, coordinates.lat],
          zoom: 12,
          essential: true
        });
        
        // Wait for the map to finish moving before querying for features
        map.current.once('moveend', () => {
          if (!map.current) return;
          
          // Find the census tract at these coordinates
          const point = map.current.project([coordinates.lng, coordinates.lat]);
          const features = map.current.queryRenderedFeatures(point, {
            layers: ['census-tracts-layer']
          });
          
          if (features && features.length > 0) {
            const feature = features[0];
            const properties = feature.properties || {};
            console.log('Found census tract:', properties);
            
            // Get the tract ID
            const tractId = properties.GEOID || properties.GEO_ID || '';
            if (tractId) {
              setUserTractId(tractId);
              
              // Highlight the tract
              if (map.current.getLayer('census-tracts-hover')) {
                map.current.setFilter('census-tracts-hover', ['==', 'GEOID', tractId]);
              }
              
              // Store the geometry for the user's tract
              if (feature.geometry) {
                setUserTractGeometry(feature.geometry);
                
                // Update the user tract source with the new geometry
                if (map.current.getSource('user-tract-source')) {
                  (map.current.getSource('user-tract-source') as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: feature.geometry,
                    properties: {}
                  });
                }
                
                // Also update the user location point
                if (map.current.getSource('user-location-source')) {
                  (map.current.getSource('user-location-source') as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [coordinates.lng, coordinates.lat]
                    },
                    properties: {}
                  });
                }
              }
              
              // Set the selected tract to show its details
              setSelectedTract(properties);
              
              // Format household income and calculate opportunity score
              let opportunityScore = 'N/A';
              if (properties.Household_Income_at_Age_35_rP_gP_p25) {
                const income = properties.Household_Income_at_Age_35_rP_gP_p25;
                opportunityScore = calculateOpportunityScore(income).toString();
                
                // Debug log to see the income and calculated score
                console.log('Income:', income, 'Calculated Score:', opportunityScore);
                console.log('Tract color info:', properties.kfr_rP_gP_p25);
                
                // Share the opportunity score with other components through context
                updateData({
                  opportunityScore: parseInt(opportunityScore),
                  // Also store the income for reference
                  income: income.toString()
                });
              }
              
              // Remove any existing popup
              if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
              }
            }
          } else {
            console.log('No census tract found at coordinates');
          }
        });
      } catch (error) {
        console.error('Error processing address:', error);
      } finally {
        setLoadingAddress(false);
      }
    };
    
    zoomToAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, mapStyleLoaded]);  // We intentionally exclude updateData to avoid unnecessary re-renders

  // Render only the map container if showWrapper is false
  if (!showWrapper) {
    return (
      <div 
        ref={mapContainer} 
        className="h-full w-full"
      />
    );
  }

  // Neighborhood insights are now handled by the NeighborhoodInsights component

  // Otherwise, render the full component with surrounding UI
  return (
    <div id="opportunity-map" className="min-h-screen px-4 py-16 max-w-6xl mx-auto scroll-mt-28">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in">{t('title')}</h2>
        <p className="text-lg text-gray-600 animate-fade-in animation-delay-300">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-8 md:grid-flow-col auto-rows-fr">
        {/* Left side - Map Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full animate-fade-in animation-delay-500">
          <div className="relative">
            <div 
              ref={mapContainer} 
              className="map-container h-[600px] flex-grow relative"
            />
            
            {/* Error message overlay */}
            {geocodingError && (
              <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-10">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{geocodingError}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Map Legend below the map */}
          <div className="border-t border-gray-100 py-2">
            <div className="mx-auto w-[350px]">
              <div className="flex flex-col">
                <div className="text-center text-xs font-medium mb-1">{t('opportunityScoreScale')}</div>
                <div className="flex h-4 w-full">
                  <div className="h-full" style={{ backgroundColor: '#9b252f', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#b65441', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#d07e59', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#e5a979', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#f4d79e', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#fcfdc1', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#cdddb5', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#9dbda9', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#729d9d', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#4f7f8b', width: '9.1%' }}></div>
                  <div className="h-full" style={{ backgroundColor: '#34687e', width: '9.1%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] w-full mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                  <span>10+</span>
                </div>
                <div className="flex justify-between text-[10px] font-medium w-full mt-0.5">
                  <span className="text-[#9b252f]">{t('lowOpportunity')}</span>
                  <span className="flex-grow"></span>
                  <span className="text-[#34687e]">{t('highOpportunity')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Combined Opportunity Score and Neighborhood Insights */}
        <div className="flex flex-col">
          {/* Combined Neighborhood Insights with Opportunity Score */}
          <NeighborhoodAnalysis 
            insightsData={insightsData} 
            loadingInsights={loadingInsights}
            opportunityScore={selectedTract && selectedTract.Household_Income_at_Age_35_rP_gP_p25 ? 
              calculateOpportunityScore(selectedTract.Household_Income_at_Age_35_rP_gP_p25) : null}
            loadingOpportunityScore={loadingAddress}
          />
        </div>
      </div>

      {/* How can we do better section */}
      <div className="mt-24 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold">{t('howCanWeDoBetter')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {/* Live in Good Areas - House icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              1
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">{t('liveInGoodAreas')}</h3>
            <p className="text-sm text-center text-gray-700">{t('liveInGoodAreasDesc')}</p>
          </div>

          {/* Good Education - School building icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12,3L1,9L12,15L23,9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              2
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">{t('goodEducation')}</h3>
            <p className="text-sm text-center text-gray-700">{t('goodEducationDesc')}</p>
          </div>

          {/* Take Advantage - Lightbulb/opportunity icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              3
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">{t('takeAdvantage')}</h3>
            <p className="text-sm text-center text-gray-700">{t('takeAdvantageDesc')}</p>
          </div>

          {/* Graduate College - Graduation cap icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12,3L1,9L12,15L23,9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              4
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">{t('graduateCollege')}</h3>
            <p className="text-sm text-center text-gray-700">{t('graduateCollegeDesc')}</p>
          </div>

          {/* Career Success - Briefcase/professional icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M20,6C20.58,6 21.05,6.2 21.42,6.59C21.8,7 22,7.45 22,8V19C22,19.55 21.8,20 21.42,20.41C21.05,20.8 20.58,21 20,21H4C3.42,21 2.95,20.8 2.58,20.41C2.2,20 2,19.55 2,19V8C2,7.45 2.2,7 2.58,6.59C2.95,6.2 3.42,6 4,6H8V4C8,3.42 8.2,2.95 8.58,2.58C8.95,2.2 9.42,2 10,2H14C14.58,2 15.05,2.2 15.42,2.58C15.8,2.95 16,3.42 16,4V6H20M4,8V19H20V8H4M14,6V4H10V6H14Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              5
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">{t('careerSuccess')}</h3>
            <p className="text-sm text-center text-gray-700">{t('careerSuccessDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export a separate MapOnly component that just renders the map part
export const MapOnly = (props: OpportunityMapProps) => {
  return <OpportunityMap {...props} showWrapper={false} />;
};

export default OpportunityMap;