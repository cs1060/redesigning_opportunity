import React, { useState } from 'react';
import { Container, Box, Typography, AppBar, Toolbar, Paper, Link } from '@mui/material';
import MapComponent from './components/MapComponent';
import IconFilterComponent from './components/IconFilterComponent';
import './App.css';

function App() {
  const [schoolQualityFilter, setSchoolQualityFilter] = useState<number>(0);

  return (
    <div className="App">
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Opportunity Map - Icon-Based Filtering
          </Typography>
          <Typography variant="body2" component="div">
            OPP-8 | Prototype 2
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Opportunity Map</Typography>
          <Typography variant="body1" paragraph>
            This interactive map helps parents explore neighborhoods based on opportunity scores and school quality.
            Use the school quality filter below to highlight neighborhoods that meet your criteria.
          </Typography>
          
          <IconFilterComponent 
            value={schoolQualityFilter} 
            onChange={setSchoolQualityFilter} 
          />
          
          <MapComponent schoolQualityFilter={schoolQualityFilter} />
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Prototype created by Mahia Rahman | 
            <Link href="https://github.com/MahiaRahman9971/redesigning_opportunity" target="_blank" rel="noopener">
              GitHub Repository
            </Link>
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default App;
