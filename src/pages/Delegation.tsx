import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const Delegation: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SwapHorizIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Delegation Management
        </Typography>
      </Box>
      
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          Delegation management functionality will be available soon. Here you will be able to delegate purchase orders to other team members.
        </Alert>
      </Paper>
    </Box>
  );
};

export default Delegation;