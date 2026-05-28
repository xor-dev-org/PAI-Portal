import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Active POs', value: '-', icon: <ReceiptIcon fontSize="large" color="primary" /> },
    { title: 'Pending Approvals', value: '-', icon: <AssignmentIcon fontSize="large" color="warning" /> },
    { title: 'Delivered This Month', value: '-', icon: <TrendingUpIcon fontSize="large" color="success" /> },
    { title: 'Total Value', value: '-', icon: <DashboardIcon fontSize="large" color="info" /> },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {user?.name || 'User'}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dashboard content and analytics will be available here once the system is fully configured.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
