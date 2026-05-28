import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const Settings: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
      </Box>
      
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          Settings and preferences will be available soon. Here you will be able to configure your account and application preferences.
        </Alert>
      </Paper>
    </Box>
  );
};

export default Settings;