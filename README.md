# Opportunity AI: Redesigning Opportunity

An AI-powered data visualization tool designed to help low-income minority parents understand socioeconomic mobility through interactive visual storytelling. This tool translates complex economic data into actionable insights to guide decision-making about location and educational opportunities for children.

## Project Overview

Opportunity AI bridges the information gap for families by providing accessible, personalized guidance on:
- Neighborhood mobility analysis based on census tract data
- Educational opportunity assessment and recommendations
- Community program connections
- Action planning tools for families (Stay vs Move decisions)
- Interactive data visualizations using Mapbox

## Key Features

- **Interactive Opportunity Map**: Visualize socioeconomic mobility by neighborhood
- **Personalized Assessment**: Enter family information to receive tailored recommendations
- **Community Connection Tools**: Find resources based on family composition and needs
- **Action Planning**: Compare options for improving opportunities (staying vs. moving)
- **Multilingual Support**: Available in English, Spanish, and Chinese
- **Mobile-Responsive Design**: Works across devices
- **Printable Action Plans**: Generate and save personalized guidance

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **Maps & Visualization**: Mapbox GL, D3.js, Chart.js
- **Internationalization**: next-intl
- **PDF Generation**: jsPDF, html2canvas
- **AI Integration**: OpenAI API
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MapBox API key
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-organization/redesigning_opportunity.git
cd redesigning_opportunity
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Create a `.env.local` file in the root directory with your API keys:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app`: Main application routes and API endpoints
- `/src/components`: React components organized by feature
- `/src/utils`: Utility functions for geocoding, data processing, etc.
- `/src/hooks`: Custom React hooks
- `/src/messages`: Internationalization message files
- `/public`: Static assets

## Testing

Run the test suite with:

```bash
npm run test
# or for coverage report
npm run test:coverage
```

## Deployment

The application is designed to be deployed on Vercel or any platform supporting Next.js:

```bash
npm run build
npm run start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project leverages data from the Opportunity Atlas, census data, and other public datasets on economic mobility
- Built with support from educational institutions and community partners
