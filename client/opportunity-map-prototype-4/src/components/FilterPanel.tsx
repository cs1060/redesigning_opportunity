import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  Button,
  Tooltip,
  Alert,
  IconButton,
  Grid
} from '@mui/material';
import {
  School as SchoolIcon,
  Security as SecurityIcon,
  LocalHospital as HealthcareIcon,
  Restaurant as AmenitiesIcon,
  Home as HousingIcon,
  DirectionsTransit as TransportationIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { FilterFactor, FilterSettings } from '../types';

// Define the filter factors
const filterFactors: FilterFactor[] = [
  {
    id: 'schoolQuality',
    name: 'School Quality',
    description: 'Rating of local schools based on test scores, graduation rates, and teacher quality',
    icon: 'school'
  },
  {
    id: 'safety',
    name: 'Safety',
    description: 'Crime rates and overall safety of the neighborhood',
    icon: 'security'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Access to quality healthcare facilities and services',
    icon: 'healthcare'
  },
  {
    id: 'amenities',
    name: 'Amenities',
    description: 'Access to parks, restaurants, shopping, and cultural attractions',
    icon: 'amenities'
  },
  {
    id: 'housing',
    name: 'Housing',
    description: 'Housing affordability and quality',
    icon: 'housing'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    description: 'Access to public transportation and walkability',
    icon: 'transportation'
  }
];

// Get the icon component based on the icon name
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'school':
      return <SchoolIcon />;
    case 'security':
      return <SecurityIcon />;
    case 'healthcare':
      return <HealthcareIcon />;
    case 'amenities':
      return <AmenitiesIcon />;
    case 'housing':
      return <HousingIcon />;
    case 'transportation':
      return <TransportationIcon />;
    default:
      return null;
  }
};

interface FilterPanelProps {
  filterSettings: FilterSettings;
  onFilterChange: (factorId: keyof FilterSettings, enabled: boolean, value: number) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  matchingNeighborhoods: number;
  totalNeighborhoods: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterSettings,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  matchingNeighborhoods,
  totalNeighborhoods
}) => {
  // Calculate how many filters are currently enabled
  const enabledFiltersCount = Object.values(filterSettings).filter(setting => setting.enabled).length;

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, maxHeight: '80vh', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Multi-Factor Filters
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={onResetFilters}
          size="small"
        >
          Reset
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Select multiple factors to filter neighborhoods. Only areas that meet ALL selected criteria will be highlighted.
      </Typography>

      {matchingNeighborhoods === 0 && enabledFiltersCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No neighborhoods match all selected criteria. Try adjusting your filters.
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          Matching: {matchingNeighborhoods} of {totalNeighborhoods} neighborhoods
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {filterFactors.map((factor) => (
        <Box key={factor.id} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ mr: 1 }}>
              {getIconComponent(factor.icon)}
            </Box>
            <Typography variant="subtitle1">{factor.name}</Typography>
            <Tooltip title={factor.description}>
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={filterSettings[factor.id].enabled}
                    onChange={(e) => onFilterChange(
                      factor.id, 
                      e.target.checked, 
                      filterSettings[factor.id].value
                    )}
                    color="primary"
                  />
                }
                label=""
              />
            </Grid>
            <Grid item xs>
              <Slider
                value={filterSettings[factor.id].value}
                onChange={(_, newValue) => onFilterChange(
                  factor.id, 
                  filterSettings[factor.id].enabled, 
                  newValue as number
                )}
                disabled={!filterSettings[factor.id].enabled}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item>
              <Typography variant="body2" color={filterSettings[factor.id].enabled ? 'primary' : 'text.disabled'}>
                {filterSettings[factor.id].value}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      ))}

      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={onApplyFilters}
          disabled={enabledFiltersCount === 0}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterPanel;
