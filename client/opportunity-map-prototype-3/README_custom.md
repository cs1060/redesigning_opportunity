# Opportunity Map Prototype - Map Interactivity Variation (OPP-8)

## Project Overview

This is the third rapid prototype for the Opportunity Map feature (OPP-8), focusing on **Map Interactivity Variation**. The prototype demonstrates a button-based filtering system instead of real-time updates, allowing users to select filter criteria and then explicitly apply them by clicking a "Filter" button.

## Key Features

1. **Interactive Choropleth Map**
   - Neighborhoods are color-coded by Opportunity Score
   - Hover functionality to display neighborhood details
   - Neighborhoods below the selected school quality threshold are grayed out

2. **Button-Based Filtering System**
   - Users select a school quality threshold (1-10) using a slider or icon-based input
   - Changes are only applied when the "Filter" button is clicked
   - Clear feedback is provided when filters are applied

3. **User Interface**
   - Clean, Material Design-based UI
   - Comprehensive neighborhood information panel
   - Visual legend explaining map colors
   - Intuitive filter controls with both slider and icon options

## Tech Stack

- **Frontend Only:** React with TypeScript
- **UI Components:** Material UI
- **Mapping:** Mapbox GL
- **Data:** Hardcoded GeoJSON format (no backend or API calls)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd opportunity-map-prototype-3
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Running the Application

Start the development server:
```
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Implementation Details

- **State Management:** Uses React state to track user input before applying filters
- **Performance Optimization:** Map rendering is optimized to remain smooth during filter operations
- **Debugging:** Console logs track state updates before and after filtering
- **User Feedback:** Clear visual feedback when filters are applied

## Project Information

- **GitHub Username:** MahiaRahman9971
- **Repository:** redesigning_opportunity
- **Branch:** MahiaRahman9971-hw6-3
- **Linear Issue ID:** OPP-8
