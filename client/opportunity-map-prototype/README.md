# Opportunity Map - Icon-Based Filtering Prototype

## Project Information
- **GitHub Username**: MahiaRahman9971
- **Repository**: redesigning_opportunity
- **Linear Issue ID**: OPP-8
- **Branch**: MahiaRahman9971-hw6-2

## Project Description
This is the second rapid prototype for the Opportunity Map feature, focusing on **Filtering Logic Variation using an Icon-Based Selection System**. The prototype allows parents to filter neighborhoods based on school quality by selecting icons instead of entering a numerical value.

### Key Features
- Interactive choropleth map of neighborhoods, color-coded by Opportunity Score
- Icon-based filtering system (🏫) for school quality
- Neighborhoods with school quality below the selected level are grayed out
- Real-time map updates as filters are adjusted
- Hover functionality to display neighborhood details

## Tech Stack
- **Frontend**: React with TypeScript
- **UI Components**: Material UI
- **Mapping**: Mapbox GL JS
- **Data**: Hardcoded neighborhood data (no backend or API calls)

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/MahiaRahman9971/redesigning_opportunity.git
   ```

2. Checkout the prototype branch:
   ```
   git checkout MahiaRahman9971-hw6-2
   ```

3. Navigate to the prototype directory:
   ```
   cd client/opportunity-map-prototype
   ```

4. Install dependencies:
   ```
   npm install
   ```

5. Start the development server:
   ```
   npm start
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage
- The map displays neighborhoods color-coded by their opportunity score
- Click on the school icons (🏫) to filter neighborhoods by school quality
- Neighborhoods with school quality below your selected threshold will be grayed out
- Hover over neighborhoods to see detailed information

## Development Notes
- This prototype uses hardcoded data (no backend or API calls)
- The map is centered on the Boston area
- Console logs are included for debugging filter behavior
