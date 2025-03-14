const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Load neighborhood data
const neighborhoodsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'neighborhoods.json'), 'utf8')
);

// API endpoint to get all neighborhoods
app.get('/api/neighborhoods', (req, res) => {
  console.log('GET /api/neighborhoods - Returning all neighborhoods data');
  res.json(neighborhoodsData);
});

// API endpoint to filter neighborhoods by school quality
app.get('/api/neighborhoods/filter', (req, res) => {
  const { schoolQuality } = req.query;
  
  if (!schoolQuality) {
    return res.status(400).json({ error: 'School quality parameter is required' });
  }
  
  const qualityThreshold = parseFloat(schoolQuality);
  
  if (isNaN(qualityThreshold) || qualityThreshold < 1 || qualityThreshold > 10) {
    return res.status(400).json({ error: 'School quality must be a number between 1 and 10' });
  }
  
  console.log(`GET /api/neighborhoods/filter - Filtering by school quality >= ${qualityThreshold}`);
  
  // Filter features based on school quality
  const filteredData = {
    type: 'FeatureCollection',
    features: neighborhoodsData.features.map(feature => {
      const schoolQuality = feature.properties.schoolQuality;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          filtered: schoolQuality >= qualityThreshold
        }
      };
    })
  };
  
  res.json(filteredData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- GET http://localhost:${PORT}/api/neighborhoods`);
  console.log(`- GET http://localhost:${PORT}/api/neighborhoods/filter?schoolQuality=<1-10>`);
});
