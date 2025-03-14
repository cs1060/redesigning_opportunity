import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Legend = () => {
  const colorScale = [
    { color: '#f7fbff', label: '0-2', value: 1 },
    { color: '#d0e1f2', label: '2-4', value: 3 },
    { color: '#94c4df', label: '4-6', value: 5 },
    { color: '#4a98c9', label: '6-8', value: 7 },
    { color: '#1764ab', label: '8-10', value: 9 },
    { color: '#cccccc', label: 'Filtered Out', value: 'filtered' }
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        padding: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        maxWidth: 200,
        zIndex: 1
      }}
    >
      <Typography variant="subtitle2" gutterBottom fontWeight="bold">
        Opportunity Score
      </Typography>
      
      {colorScale.map((item) => (
        <Box
          key={item.value}
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 0.5
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: item.color,
              border: '1px solid #000',
              mr: 1
            }}
          />
          <Typography variant="body2">
            {item.label}
          </Typography>
        </Box>
      ))}
      
      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
        Hover over a neighborhood to see details
      </Typography>
    </Paper>
  );
};

export default Legend;
