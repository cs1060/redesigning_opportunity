/**
 * Utility functions for calculating opportunity scores
 */

/**
 * Calculates an opportunity score (0-10) based on the median household income
 * This function provides a consistent mapping from income to opportunity score
 * across the entire application, ensuring that colors on maps match scores shown.
 * 
 * @param income - The median household income value
 * @returns A number from 0-10 representing the opportunity score
 */
export const calculateOpportunityScore = (income: number): number => {
  // Convert income to a score from 0-10 based on the map colors
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

/**
 * Gets a color corresponding to an opportunity score (0-10)
 * This provides consistent color coding across the application
 * 
 * @param score - The opportunity score (0-10)
 * @returns A hex color string
 */
export const getOpportunityScoreColor = (score: number): string => {
  // Ensure score is within valid range
  const validScore = Math.max(0, Math.min(10, Math.round(score)));
  
  // Return color corresponding to score
  const colorMap: Record<number, string> = {
    0: '#9b252f', // Dark red
    1: '#b65441', // Red
    2: '#d07e59', // Orange
    3: '#e5a979', // Light orange
    4: '#f4d79e', // Yellow
    5: '#fcfdc1', // Light yellow
    6: '#cdddb5', // Light green
    7: '#9dbda9', // Green
    8: '#729d9d', // Teal
    9: '#4f7f8b', // Blue
    10: '#34687e' // Dark blue
  };
  
  return colorMap[validScore] || '#9dbda9'; // Default to green if not found
};