import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Slider, Paper, Grid } from '@mui/material';
import './App.css';
import OpportunityMap from './components/OpportunityMap';
import Legend from './components/Legend';

function App() {
  const [neighborhoods, setNeighborhoods] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolQualityFilter, setSchoolQualityFilter] = useState(1);
  
  // Fetch neighborhood data when component mounts
  useEffect(() => {
    fetchNeighborhoods();
  }, []);
  
  // Fetch filtered data when filter changes
  useEffect(() => {
    if (schoolQualityFilter) {
      fetchFilteredNeighborhoods(schoolQualityFilter);
    }
  }, [schoolQualityFilter]);
  
  const fetchNeighborhoods = async () => {
    try {
      console.log('Fetching all neighborhoods data...');
      const response = await fetch('http://localhost:5001/api/neighborhoods');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Neighborhoods data loaded:', data);
      setNeighborhoods(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching neighborhoods data:', err);
      setError('Failed to load neighborhood data. Please try again later.');
      setLoading(false);
    }
  };
  
  const fetchFilteredNeighborhoods = async (qualityValue) => {
    try {
      console.log(`Filtering neighborhoods by school quality >= ${qualityValue}...`);
      const response = await fetch(`http://localhost:5001/api/neighborhoods/filter?schoolQuality=${qualityValue}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Filtered neighborhoods data:', data);
      setNeighborhoods(data);
    } catch (err) {
      console.error('Error filtering neighborhoods data:', err);
      setError('Failed to filter neighborhood data. Please try again later.');
    }
  };
  
  const handleSchoolQualityChange = (event) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= 10) {
      console.log(`School quality filter changed to: ${value}`);
      setSchoolQualityFilter(value);
    }
  };
  
  return (
    <Container maxWidth="lg" className="App">
      <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
        Opportunity Map
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
        Explore neighborhoods based on school quality and opportunity scores
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Filter Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>School Quality (1-10)</Typography>
              <TextField
                type="number"
                label="Minimum School Quality"
                variant="outlined"
                fullWidth
                value={schoolQualityFilter}
                onChange={handleSchoolQualityChange}
                inputProps={{ min: 1, max: 10, step: 1 }}
                sx={{ mb: 2 }}
              />
              <Slider
                value={schoolQualityFilter}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setSchoolQualityFilter(value)}
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Adjust the filter to show neighborhoods with school quality ratings at or above the selected value.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading map data...</Typography>
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                <Typography>{error}</Typography>
              </Box>
            ) : (
              <Box sx={{ position: 'relative', height: '70vh' }}>
                <OpportunityMap neighborhoods={neighborhoods} />
                <Legend />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
