# Redesigning Opportunity

A Next.js application that helps users explore and understand economic mobility opportunities in their communities. This interactive tool allows users to assess their current situation, visualize opportunity maps, and create personalized action plans for improving economic mobility.

## Features

- **Personalization Quiz**: Collect user information to provide tailored recommendations
- **Opportunity Mapping**: Interactive maps showing economic mobility data across neighborhoods
- **Neighborhood Analysis**: Detailed insights about schools, safety, healthcare, and more
- **Action Planning**: Tools to help users decide whether to stay in their current location or move
- **Next Steps Checklist**: Personalized action items based on user choices
- **Community Connections**: Resources to connect with local support networks
- **Multilingual Support**: Internationalization with next-intl

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 15.x with React 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Maps**: Mapbox GL JS and React Map GL
- **Data Visualization**: Chart.js and D3.js
- **PDF Generation**: jsPDF and html2canvas
- **Testing**: Jest and React Testing Library
- **API Integration**: OpenAI API for neighborhood insights

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

This project uses Jest and React Testing Library for testing. See [TESTING.md](./TESTING.md) for detailed testing guidelines.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
MAPBOX_ACCESS_TOKEN=your_mapbox_token
OPENAI_API_KEY=your_openai_key
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js)

## Deployment

The application can be deployed on [Vercel](https://vercel.com) or any other Next.js-compatible hosting platform.
