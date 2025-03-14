import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Container, Grid } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

import Map from './components/Map';
import FilterPanel from './components/FilterPanel';
import neighborhoodData from './data/neighborhoodData';
import { FilterSettings } from './types';

// Create a theme instance
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
});

function App() {
  // Initialize filter settings
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    schoolQuality: { enabled: false, value: 5 },
    safety: { enabled: false, value: 5 },
    healthcare: { enabled: false, value: 5 },
    amenities: { enabled: false, value: 5 },
    housing: { enabled: false, value: 5 },
    transportation: { enabled: false, value: 5 }
  });

  // Track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Track matching neighborhoods count
  const [matchingNeighborhoods, setMatchingNeighborhoods] = useState(neighborhoodData.features.length);

  // Handle filter changes
  const handleFilterChange = (factorId: keyof FilterSettings, enabled: boolean, value: number) => {
    console.log(`Filter changed: ${factorId}, enabled: ${enabled}, value: ${value}`);
    setFilterSettings(prev => ({
      ...prev,
      [factorId]: { enabled, value }
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    console.log('Applying filters:', filterSettings);
    setFiltersApplied(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    console.log('Resetting filters');
    setFilterSettings({
      schoolQuality: { enabled: false, value: 5 },
      safety: { enabled: false, value: 5 },
      healthcare: { enabled: false, value: 5 },
      amenities: { enabled: false, value: 5 },
      housing: { enabled: false, value: 5 },
      transportation: { enabled: false, value: 5 }
    });
    setFiltersApplied(false);
    setMatchingNeighborhoods(neighborhoodData.features.length);
  };

  // Calculate matching neighborhoods when filters are applied
  useEffect(() => {
    if (filtersApplied) {
      const count = neighborhoodData.features.filter(feature => {
        const props = feature.properties;
        
        // Check if the feature meets all enabled filter criteria
        return Object.entries(filterSettings).every(([factorId, setting]) => {
          if (!setting.enabled) return true; // Skip disabled filters
          
          // Check if the property value meets or exceeds the filter value
          const factorKey = factorId as keyof typeof props;
          return props[factorKey] >= setting.value;
        });
      }).length;
      
      setMatchingNeighborhoods(count);
      console.log(`Matching neighborhoods: ${count} of ${neighborhoodData.features.length}`);
    }
  }, [filterSettings, filtersApplied]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div">
              Opportunity Map - Multi-Factor Filtering (OPP-8)
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth={false} sx={{ flexGrow: 1, py: 2 }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} md={3} sx={{ height: { xs: 'auto', md: '100%' } }}>
              <FilterPanel 
                filterSettings={filterSettings}
                onFilterChange={handleFilterChange}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                matchingNeighborhoods={matchingNeighborhoods}
                totalNeighborhoods={neighborhoodData.features.length}
              />
            </Grid>
            <Grid item xs={12} md={9} sx={{ height: { xs: '500px', md: '100%' } }}>
              <Map 
                data={neighborhoodData} 
                filterSettings={filterSettings}
                filtersApplied={filtersApplied}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
