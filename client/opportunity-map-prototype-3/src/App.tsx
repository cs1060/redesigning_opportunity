import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CssBaseline, AppBar, Toolbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

// Import components
import OpportunityMap from './components/OpportunityMap';
import NeighborhoodInfo from './components/NeighborhoodInfo';
import FilterControls from './components/FilterControls';

// Import data
import { neighborhoodData, NeighborhoodProperties } from './data/neighborhoodData';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  // State for the hovered neighborhood
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<NeighborhoodProperties | null>(null);
  
  // State for the filtered neighborhoods (IDs of neighborhoods that don't meet the criteria)
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<string[]>([]);
  
  // State for the current filter threshold
  const [filterThreshold, setFilterThreshold] = useState<number>(5);

  // Apply filter when the threshold changes
  const handleApplyFilter = (threshold: number) => {
    console.log('Applying filter with threshold:', threshold);
    setFilterThreshold(threshold);
    
    // Filter neighborhoods with school quality below the threshold
    const filtered = neighborhoodData.features
      .filter(feature => feature.properties.schoolQuality < threshold)
      .map(feature => feature.properties.id);
    
    setFilteredNeighborhoods(filtered);
    console.log('Filtered neighborhoods:', filtered);
  };

  // Initialize with default filter
  useEffect(() => {
    handleApplyFilter(filterThreshold);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Opportunity Map - Button-Based Filtering
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Explore Neighborhood Opportunities
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            This interactive map helps parents find neighborhoods with good schools and opportunities for their children.
            Use the filter controls below to set a minimum school quality threshold, then click the "Apply Filter" button to update the map.
          </Typography>
          
          <Grid container spacing={3}>
            {/* Filter Controls */}
            <Grid item xs={12}>
              <FilterControls onApplyFilter={handleApplyFilter} />
            </Grid>
            
            {/* Map */}
            <Grid item xs={12} md={8}>
              <OpportunityMap 
                data={neighborhoodData} 
                filteredNeighborhoods={filteredNeighborhoods}
                hoveredNeighborhood={hoveredNeighborhood}
                setHoveredNeighborhood={setHoveredNeighborhood}
              />
            </Grid>
            
            {/* Neighborhood Info */}
            <Grid item xs={12} md={4}>
              <NeighborhoodInfo neighborhood={hoveredNeighborhood} />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              OPP-8: Opportunity Map Prototype - Map Interactivity Variation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © 2025 MahiaRahman9971
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
