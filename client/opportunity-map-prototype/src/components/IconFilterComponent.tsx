import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

interface IconFilterComponentProps {
  value: number;
  onChange: (value: number) => void;
}

const IconFilterComponent: React.FC<IconFilterComponentProps> = ({ value, onChange }) => {
  // Create an array of 10 items for our icons
  const icons = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleIconClick = (clickedValue: number) => {
    // Toggle between the clicked value and 0 if clicking the same value
    onChange(value === clickedValue ? 0 : clickedValue);
    console.log('Filter changed to:', value === clickedValue ? 0 : clickedValue);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filter by School Quality
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Click on a school icon to show neighborhoods with school quality at or above that level.
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Lower Quality</Typography>
        <Typography variant="body2">Higher Quality</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {icons.map((iconValue) => (
          <Box 
            key={iconValue}
            onClick={() => handleIconClick(iconValue)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              opacity: iconValue <= value ? 1 : 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            <SchoolIcon 
              sx={{ 
                color: iconValue <= value ? '#1976d2' : '#bdbdbd',
                fontSize: iconValue <= value ? 28 : 24,
              }} 
            />
            <Typography variant="caption">{iconValue}</Typography>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2">
          Current Filter: {value === 0 ? 'None' : `${value} or higher`}
        </Typography>
        {value > 0 && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'primary.main', 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => onChange(0)}
          >
            Clear Filter
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default IconFilterComponent;
