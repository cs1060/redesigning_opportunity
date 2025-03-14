# Redesigning Opportunity

## Project Description
Opportunity AI is an AI-powered data visualization tool designed to help
low-income minority parents understand socioeconomic mobility through interactive visual
storytelling. The tool aims to translate complex economic data into actionable insights to guide
decision-making about location and educational opportunities for children.

**Google Drive: [Link](https://drive.google.com/drive/folders/1er_zDn3XU18Uwfln2ZDCfXBvxHlDKlL1?usp=drive_link)**

## Opportunity Map Feature - Prototype 1 (OPP-8)

This prototype focuses on **Filtering Logic Variation** for the Opportunity Map feature. It allows parents to filter neighborhoods based on school quality using direct numerical input on a 1-10 scale.

### Features

- Interactive choropleth map showing neighborhoods color-coded by Opportunity Score
- Filter neighborhoods by entering a school quality threshold (1-10)
- Neighborhoods below the threshold are grayed out while others remain colored
- Hover over neighborhoods to see detailed information

### Tech Stack

- **Frontend**: React + Mapbox for visualization, Material UI for components
- **Backend**: Express.js serving mock API with neighborhood data
- **Data**: Mock JSON data representing neighborhoods with opportunity scores and school quality ratings

### Setup and Running Instructions

#### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

#### Installation

1. Clone the repository and navigate to the project directory

```bash
git clone https://github.com/MahiaRahman9971/redesigning_opportunity.git
cd redesigning_opportunity
```

2. Install dependencies for both client and server

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

#### Running the Application

1. Start the backend server

```bash
# From the server directory
npm start
```

2. In a new terminal, start the React frontend

```bash
# From the client directory
npm start
```

3. Open your browser and navigate to http://localhost:3000

### Usage

- Use the number input or slider to set a school quality threshold (1-10)
- Neighborhoods with school quality ratings below the threshold will be grayed out
- Hover over neighborhoods to see detailed information including name, opportunity score, school quality, and description

### Development Notes

- This is the first prototype focusing on filtering logic variation
- The map uses mock data for demonstration purposes
- Console logs are included for debugging filter behavior

### GitHub Branch

- Branch: `MahiaRahman9971-hw6-1`
- Linear Issue ID: OPP-8
