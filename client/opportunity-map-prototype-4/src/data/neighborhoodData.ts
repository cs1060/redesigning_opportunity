import { FeatureCollection, Geometry } from 'geojson';

// Define the properties for each neighborhood
export interface NeighborhoodProperties {
  id: string;
  name: string;
  opportunityScore: number;
  schoolQuality: number;
  safety: number;
  healthcare: number;
  amenities: number;
  housing: number;
  transportation: number;
}

// Create a GeoJSON FeatureCollection with our neighborhood data
const neighborhoodData: FeatureCollection<Geometry, NeighborhoodProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.1043, 42.3150],
          [-71.0943, 42.3150],
          [-71.0943, 42.3250],
          [-71.1043, 42.3250],
          [-71.1043, 42.3150]
        ]]
      },
      properties: {
        id: '1',
        name: 'Roxbury',
        opportunityScore: 6.5,
        schoolQuality: 6,
        safety: 5,
        healthcare: 7,
        amenities: 6,
        housing: 5,
        transportation: 8
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.0943, 42.3150],
          [-71.0843, 42.3150],
          [-71.0843, 42.3250],
          [-71.0943, 42.3250],
          [-71.0943, 42.3150]
        ]]
      },
      properties: {
        id: '2',
        name: 'South End',
        opportunityScore: 8.2,
        schoolQuality: 8,
        safety: 7,
        healthcare: 9,
        amenities: 9,
        housing: 7,
        transportation: 9
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.0843, 42.3150],
          [-71.0743, 42.3150],
          [-71.0743, 42.3250],
          [-71.0843, 42.3250],
          [-71.0843, 42.3150]
        ]]
      },
      properties: {
        id: '3',
        name: 'Back Bay',
        opportunityScore: 9.1,
        schoolQuality: 9,
        safety: 8,
        healthcare: 9,
        amenities: 10,
        housing: 8,
        transportation: 10
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.1043, 42.3250],
          [-71.0943, 42.3250],
          [-71.0943, 42.3350],
          [-71.1043, 42.3350],
          [-71.1043, 42.3250]
        ]]
      },
      properties: {
        id: '4',
        name: 'Fenway',
        opportunityScore: 7.8,
        schoolQuality: 8,
        safety: 7,
        healthcare: 8,
        amenities: 8,
        housing: 6,
        transportation: 9
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.0943, 42.3250],
          [-71.0843, 42.3250],
          [-71.0843, 42.3350],
          [-71.0943, 42.3350],
          [-71.0943, 42.3250]
        ]]
      },
      properties: {
        id: '5',
        name: 'Beacon Hill',
        opportunityScore: 9.3,
        schoolQuality: 9,
        safety: 9,
        healthcare: 9,
        amenities: 9,
        housing: 9,
        transportation: 10
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.0843, 42.3250],
          [-71.0743, 42.3250],
          [-71.0743, 42.3350],
          [-71.0843, 42.3350],
          [-71.0843, 42.3250]
        ]]
      },
      properties: {
        id: '6',
        name: 'North End',
        opportunityScore: 8.0,
        schoolQuality: 7,
        safety: 8,
        healthcare: 8,
        amenities: 9,
        housing: 7,
        transportation: 9
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.1043, 42.3350],
          [-71.0943, 42.3350],
          [-71.0943, 42.3450],
          [-71.1043, 42.3450],
          [-71.1043, 42.3350]
        ]]
      },
      properties: {
        id: '7',
        name: 'Allston',
        opportunityScore: 6.8,
        schoolQuality: 6,
        safety: 6,
        healthcare: 7,
        amenities: 7,
        housing: 5,
        transportation: 8
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.0943, 42.3350],
          [-71.0843, 42.3350],
          [-71.0843, 42.3450],
          [-71.0943, 42.3450],
          [-71.0943, 42.3350]
        ]]
      },
      properties: {
        id: '8',
        name: 'Cambridge',
        opportunityScore: 8.5,
        schoolQuality: 9,
        safety: 8,
        healthcare: 9,
        amenities: 8,
        housing: 7,
        transportation: 9
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.0843, 42.3350],
          [-71.0743, 42.3350],
          [-71.0743, 42.3450],
          [-71.0843, 42.3450],
          [-71.0843, 42.3350]
        ]]
      },
      properties: {
        id: '9',
        name: 'Somerville',
        opportunityScore: 7.5,
        schoolQuality: 7,
        safety: 7,
        healthcare: 7,
        amenities: 8,
        housing: 6,
        transportation: 8
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.1143, 42.3150],
          [-71.1043, 42.3150],
          [-71.1043, 42.3250],
          [-71.1143, 42.3250],
          [-71.1143, 42.3150]
        ]]
      },
      properties: {
        id: '10',
        name: 'Jamaica Plain',
        opportunityScore: 7.2,
        schoolQuality: 7,
        safety: 6,
        healthcare: 8,
        amenities: 7,
        housing: 6,
        transportation: 7
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.1143, 42.3250],
          [-71.1043, 42.3250],
          [-71.1043, 42.3350],
          [-71.1143, 42.3350],
          [-71.1143, 42.3250]
        ]]
      },
      properties: {
        id: '11',
        name: 'Brookline',
        opportunityScore: 8.8,
        schoolQuality: 9,
        safety: 9,
        healthcare: 9,
        amenities: 8,
        housing: 7,
        transportation: 8
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.1143, 42.3350],
          [-71.1043, 42.3350],
          [-71.1043, 42.3450],
          [-71.1143, 42.3450],
          [-71.1143, 42.3350]
        ]]
      },
      properties: {
        id: '12',
        name: 'Brighton',
        opportunityScore: 7.0,
        schoolQuality: 7,
        safety: 7,
        healthcare: 7,
        amenities: 7,
        housing: 6,
        transportation: 7
      }
    }
  ]
};

export default neighborhoodData;
