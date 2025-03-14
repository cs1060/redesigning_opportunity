# Opportunity Map Prototype 4: Multi-Factor Filtering

## Project Information
- **GitHub Username**: MahiaRahman9971
- **Repository**: redesigning_opportunity
- **Linear Issue ID**: OPP-8
- **Branch**: MahiaRahman9971-hw6-4

## Overview
This is the fourth rapid prototype for the Opportunity Map feature (OPP-8), focusing on **Multi-Factor Filtering**. The prototype allows parents to filter neighborhoods based on multiple factors at once (e.g., School Quality, Safety, Healthcare), with neighborhoods only remaining highlighted if they meet **all selected criteria**.

## Features
1. **Multi-Factor Filtering System:**
   - Interactive choropleth map of neighborhoods, color-coded by Opportunity Score
   - Multiple filter selection (School Quality, Safety, Healthcare, Amenities, Housing, Transportation)
   - Only neighborhoods that meet ALL chosen filters remain highlighted
   - Neighborhoods that fail to meet at least one selected factor are grayed out

2. **UI/UX Considerations:**
   - Multiple sliders with toggle switches for each factor
   - Visual feedback when no neighborhoods match the selected criteria
   - Color legend explaining the opportunity score meanings
   - Hover functionality to display neighborhood details

## Tech Stack
- **Frontend Only**: React with TypeScript
- **UI Components**: Material UI
- **Map Visualization**: Mapbox GL
- **Data**: Hardcoded GeoJSON with neighborhood data (no backend or API calls)
- **State Management**: React state for tracking and applying filters

## Setup and Running Locally

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/MahiaRahman9971/redesigning_opportunity.git
   ```

2. Checkout the branch:
   ```
   git checkout MahiaRahman9971-hw6-4
   ```

3. Navigate to the prototype directory:
   ```
   cd client/opportunity-map-prototype-4
   ```

4. Install dependencies:
   ```
   npm install
   ```

### Running the Application
Start the development server:
```
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage Instructions
1. Use the toggle switches to enable/disable specific factors
2. Adjust the sliders to set the minimum threshold for each factor
3. Click the "Apply Filters" button to update the map
4. Neighborhoods that meet all enabled criteria will remain colored, while others will be grayed out
5. Hover over neighborhoods to see detailed information
6. Use the "Reset" button to clear all filters

## Testing & Debugging
- Console logs track state updates before and after filtering
- Visual feedback is provided when no neighborhoods match the selected criteria
- The filter system has been tested for conflicts when multiple filters create overly restrictive results
