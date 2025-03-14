import { FeatureCollection, Feature, Geometry } from 'geojson';

export interface NeighborhoodProperties {
  id: string;
  name: string;
  opportunityScore: number;
  schoolQuality: number;
  safetyRating: number;
  economicMobility: number;
  description: string;
}

// Mock GeoJSON data for neighborhoods
export const neighborhoodData: FeatureCollection<Geometry, NeighborhoodProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.48, 37.78],
          [-122.48, 37.80],
          [-122.46, 37.80],
          [-122.46, 37.78],
          [-122.48, 37.78]
        ]]
      },
      properties: {
        id: 'n1',
        name: 'Richmond District',
        opportunityScore: 8.5,
        schoolQuality: 9,
        safetyRating: 8,
        economicMobility: 8.5,
        description: 'A residential neighborhood with excellent schools and good safety ratings.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.46, 37.78],
          [-122.46, 37.80],
          [-122.44, 37.80],
          [-122.44, 37.78],
          [-122.46, 37.78]
        ]]
      },
      properties: {
        id: 'n2',
        name: 'Presidio Heights',
        opportunityScore: 9.2,
        schoolQuality: 10,
        safetyRating: 9,
        economicMobility: 8.5,
        description: 'An upscale neighborhood with top-rated schools and very safe streets.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.44, 37.78],
          [-122.44, 37.80],
          [-122.42, 37.80],
          [-122.42, 37.78],
          [-122.44, 37.78]
        ]]
      },
      properties: {
        id: 'n3',
        name: 'Pacific Heights',
        opportunityScore: 9.0,
        schoolQuality: 9,
        safetyRating: 9,
        economicMobility: 9,
        description: 'A high-end residential area with excellent schools and very low crime.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.42, 37.78],
          [-122.42, 37.80],
          [-122.40, 37.80],
          [-122.40, 37.78],
          [-122.42, 37.78]
        ]]
      },
      properties: {
        id: 'n4',
        name: 'Nob Hill',
        opportunityScore: 8.2,
        schoolQuality: 7,
        safetyRating: 8,
        economicMobility: 9,
        description: 'A historic neighborhood with good schools and strong economic opportunities.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.40, 37.78],
          [-122.40, 37.80],
          [-122.38, 37.80],
          [-122.38, 37.78],
          [-122.40, 37.78]
        ]]
      },
      properties: {
        id: 'n5',
        name: 'Financial District',
        opportunityScore: 7.8,
        schoolQuality: 6,
        safetyRating: 7,
        economicMobility: 10,
        description: 'The business center with moderate schools but excellent economic mobility.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.48, 37.76],
          [-122.48, 37.78],
          [-122.46, 37.78],
          [-122.46, 37.76],
          [-122.48, 37.76]
        ]]
      },
      properties: {
        id: 'n6',
        name: 'Sunset District',
        opportunityScore: 7.5,
        schoolQuality: 8,
        safetyRating: 8,
        economicMobility: 7,
        description: 'A family-friendly neighborhood with good schools and safe streets.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.46, 37.76],
          [-122.46, 37.78],
          [-122.44, 37.78],
          [-122.44, 37.76],
          [-122.46, 37.76]
        ]]
      },
      properties: {
        id: 'n7',
        name: 'Haight-Ashbury',
        opportunityScore: 7.0,
        schoolQuality: 6,
        safetyRating: 6,
        economicMobility: 8,
        description: 'A historic district with moderate schools and good economic opportunities.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.44, 37.76],
          [-122.44, 37.78],
          [-122.42, 37.78],
          [-122.42, 37.76],
          [-122.44, 37.76]
        ]]
      },
      properties: {
        id: 'n8',
        name: 'Mission District',
        opportunityScore: 6.5,
        schoolQuality: 5,
        safetyRating: 5,
        economicMobility: 8,
        description: 'A diverse neighborhood with improving schools and growing economic opportunities.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.42, 37.76],
          [-122.42, 37.78],
          [-122.40, 37.78],
          [-122.40, 37.76],
          [-122.42, 37.76]
        ]]
      },
      properties: {
        id: 'n9',
        name: 'SoMa',
        opportunityScore: 6.0,
        schoolQuality: 4,
        safetyRating: 5,
        economicMobility: 9,
        description: 'A rapidly developing area with below-average schools but excellent job prospects.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.40, 37.76],
          [-122.40, 37.78],
          [-122.38, 37.78],
          [-122.38, 37.76],
          [-122.40, 37.76]
        ]]
      },
      properties: {
        id: 'n10',
        name: 'Bayview',
        opportunityScore: 5.0,
        schoolQuality: 3,
        safetyRating: 4,
        economicMobility: 6,
        description: 'A neighborhood with improving infrastructure, but schools need enhancement.'
      }
    }
  ]
};
