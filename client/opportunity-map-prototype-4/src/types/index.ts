// Define the filter factor type
export interface FilterFactor {
  id: keyof FilterValues;
  name: string;
  description: string;
  icon: string;
}

// Define the filter values type
export interface FilterValues {
  schoolQuality: number;
  safety: number;
  healthcare: number;
  amenities: number;
  housing: number;
  transportation: number;
}

// Define the filter state type
export interface FilterState {
  enabled: boolean;
  value: number;
}

// Define the filter settings type
export type FilterSettings = {
  [key in keyof FilterValues]: FilterState;
};
