import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const Chat: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ChatIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Chat & Collaboration
        </Typography>
      </Box>
      
      <Paper sx={{ p: 4 }}>
        <Alert severity="info">
          Chat and collaboration functionality will be available soon. This will allow real-time communication with suppliers and team members.
        </Alert>
      </Paper>
    </Box>
  );
};

export default Chat;