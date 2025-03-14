import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  Button, 
  Paper, 
  Snackbar, 
  Alert,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

interface FilterControlsProps {
  onApplyFilter: (threshold: number) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onApplyFilter }) => {
  const [threshold, setThreshold] = useState<number>(5);
  const [pendingThreshold, setPendingThreshold] = useState<number>(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setPendingThreshold(newValue as number);
    console.log('Pending threshold updated:', newValue);
  };

  const handleApplyFilter = () => {
    setThreshold(pendingThreshold);
    onApplyFilter(pendingThreshold);
    setSnackbarMessage(`Filtering neighborhoods with school quality below ${pendingThreshold}`);
    setSnackbarOpen(true);
    console.log('Filter applied with threshold:', pendingThreshold);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Generate school icons based on the selected value
  const renderSchoolIcons = () => {
    const icons = [];
    for (let i = 1; i <= 10; i++) {
      icons.push(
        <Tooltip key={i} title={`Quality Level ${i}`}>
          <IconButton 
            onClick={() => setPendingThreshold(i)}
            sx={{ 
              color: i <= pendingThreshold ? 'primary.main' : 'text.disabled',
              transform: i === pendingThreshold ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.2s, color 0.2s'
            }}
          >
            <SchoolIcon />
          </IconButton>
        </Tooltip>
      );
    }
    return icons;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filter Neighborhoods by School Quality
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Set minimum school quality threshold and click "Apply Filter" to update the map.
        Neighborhoods below this threshold will be grayed out.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography id="school-quality-slider" gutterBottom>
          Minimum School Quality: {pendingThreshold}
        </Typography>
        <Slider
          value={pendingThreshold}
          onChange={handleSliderChange}
          aria-labelledby="school-quality-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={10}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Or select using icons:
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {renderSchoolIcons()}
        </Grid>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {threshold === pendingThreshold ? 
            'Current filter is applied' : 
            'Click "Apply Filter" to update the map'}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleApplyFilter}
          startIcon={<FilterAltIcon />}
          disabled={threshold === pendingThreshold}
        >
          Apply Filter
        </Button>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default FilterControls;
