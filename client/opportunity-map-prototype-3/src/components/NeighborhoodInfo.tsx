import React from 'react';
import { Box, Card, CardContent, Typography, Rating } from '@mui/material';
import { NeighborhoodProperties } from '../data/neighborhoodData';

interface NeighborhoodInfoProps {
  neighborhood: NeighborhoodProperties | null;
}

const NeighborhoodInfo: React.FC<NeighborhoodInfoProps> = ({ neighborhood }) => {
  if (!neighborhood) {
    return (
      <Card sx={{ minWidth: 275, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Hover over a neighborhood to see details
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 275, height: '100%' }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {neighborhood.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {neighborhood.description}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <span style={{ minWidth: '160px' }}>Opportunity Score:</span>
            <Rating 
              value={neighborhood.opportunityScore / 2} 
              precision={0.5} 
              readOnly 
            />
            <span style={{ marginLeft: '8px' }}>{neighborhood.opportunityScore.toFixed(1)}/10</span>
          </Typography>
          
          <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <span style={{ minWidth: '160px' }}>School Quality:</span>
            <Rating 
              value={neighborhood.schoolQuality / 2} 
              precision={0.5} 
              readOnly 
            />
            <span style={{ marginLeft: '8px' }}>{neighborhood.schoolQuality}/10</span>
          </Typography>
          
          <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <span style={{ minWidth: '160px' }}>Safety Rating:</span>
            <Rating 
              value={neighborhood.safetyRating / 2} 
              precision={0.5} 
              readOnly 
            />
            <span style={{ marginLeft: '8px' }}>{neighborhood.safetyRating}/10</span>
          </Typography>
          
          <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ minWidth: '160px' }}>Economic Mobility:</span>
            <Rating 
              value={neighborhood.economicMobility / 2} 
              precision={0.5} 
              readOnly 
            />
            <span style={{ marginLeft: '8px' }}>{neighborhood.economicMobility}/10</span>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NeighborhoodInfo;
