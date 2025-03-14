import { FeatureCollection, Feature, Polygon } from 'geojson';

// Define the type for our neighborhood properties
export interface NeighborhoodProperties {
  id: string;
  name: string;
  opportunityScore: number;
  schoolQuality: number;
  population: number;
  medianIncome: number;
  description: string;
}

// Create a GeoJSON FeatureCollection with our neighborhood data
const neighborhoodData: FeatureCollection<Polygon, NeighborhoodProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: '1',
        name: 'Brookline',
        opportunityScore: 8.5,
        schoolQuality: 9,
        population: 59,180,
        medianIncome: 113250,
        description: 'Brookline is known for its excellent schools and proximity to Boston.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.13, 42.32],
          [-71.13, 42.35],
          [-71.11, 42.35],
          [-71.11, 42.32],
          [-71.13, 42.32]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '2',
        name: 'Jamaica Plain',
        opportunityScore: 7.2,
        schoolQuality: 6,
        population: 42,935,
        medianIncome: 92250,
        description: 'Jamaica Plain is a diverse neighborhood with good access to parks.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.12, 42.30],
          [-71.12, 42.32],
          [-71.10, 42.32],
          [-71.10, 42.30],
          [-71.12, 42.30]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '3',
        name: 'Roxbury',
        opportunityScore: 5.8,
        schoolQuality: 4,
        population: 57,884,
        medianIncome: 34,303,
        description: 'Roxbury is a historic neighborhood with a rich cultural heritage.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.09, 42.31],
          [-71.09, 42.33],
          [-71.07, 42.33],
          [-71.07, 42.31],
          [-71.09, 42.31]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '4',
        name: 'Cambridge',
        opportunityScore: 9.0,
        schoolQuality: 8,
        population: 118,403,
        medianIncome: 103154,
        description: 'Cambridge is home to prestigious universities and a thriving tech scene.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.14, 42.36],
          [-71.14, 42.39],
          [-71.10, 42.39],
          [-71.10, 42.36],
          [-71.14, 42.36]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '5',
        name: 'Somerville',
        opportunityScore: 7.8,
        schoolQuality: 7,
        population: 81,360,
        medianIncome: 91168,
        description: 'Somerville is a vibrant community with a mix of residential and commercial areas.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.13, 42.39],
          [-71.13, 42.41],
          [-71.08, 42.41],
          [-71.08, 42.39],
          [-71.13, 42.39]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '6',
        name: 'Dorchester',
        opportunityScore: 5.5,
        schoolQuality: 5,
        population: 126,283,
        medianIncome: 54012,
        description: 'Dorchester is Boston\'s largest neighborhood with diverse communities.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.08, 42.28],
          [-71.08, 42.31],
          [-71.04, 42.31],
          [-71.04, 42.28],
          [-71.08, 42.28]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '7',
        name: 'Newton',
        opportunityScore: 8.7,
        schoolQuality: 10,
        population: 88,994,
        medianIncome: 151068,
        description: 'Newton is known for its top-rated public schools and suburban feel.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.24, 42.32],
          [-71.24, 42.35],
          [-71.18, 42.35],
          [-71.18, 42.32],
          [-71.24, 42.32]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '8',
        name: 'Allston',
        opportunityScore: 6.5,
        schoolQuality: 6,
        population: 29,178,
        medianIncome: 53777,
        description: 'Allston is a vibrant neighborhood with a large student population.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.14, 42.35],
          [-71.14, 42.36],
          [-71.12, 42.36],
          [-71.12, 42.35],
          [-71.14, 42.35]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '9',
        name: 'South Boston',
        opportunityScore: 7.0,
        schoolQuality: 7,
        population: 38,206,
        medianIncome: 81838,
        description: 'South Boston is a rapidly developing neighborhood with waterfront access.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.05, 42.33],
          [-71.05, 42.34],
          [-71.02, 42.34],
          [-71.02, 42.33],
          [-71.05, 42.33]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '10',
        name: 'Charlestown',
        opportunityScore: 7.5,
        schoolQuality: 8,
        population: 19,913,
        medianIncome: 94607,
        description: 'Charlestown offers historic charm and waterfront views.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.07, 42.37],
          [-71.07, 42.39],
          [-71.05, 42.39],
          [-71.05, 42.37],
          [-71.07, 42.37]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '11',
        name: 'East Boston',
        opportunityScore: 6.0,
        schoolQuality: 5,
        population: 45,212,
        medianIncome: 56878,
        description: 'East Boston is a diverse neighborhood with access to Logan Airport.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.04, 42.36],
          [-71.04, 42.39],
          [-71.00, 42.39],
          [-71.00, 42.36],
          [-71.04, 42.36]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: '12',
        name: 'Medford',
        opportunityScore: 7.2,
        schoolQuality: 7,
        population: 59,659,
        medianIncome: 96053,
        description: 'Medford is a suburban community with good schools and parks.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-71.14, 42.41],
          [-71.14, 42.44],
          [-71.08, 42.44],
          [-71.08, 42.41],
          [-71.14, 42.41]
        ]]
      }
    }
  ]
};

export default neighborhoodData;
