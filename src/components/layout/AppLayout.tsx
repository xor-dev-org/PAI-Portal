import React from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatWidget from '@/components/common/ChatWidget';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
          {children}
        </Container>
      </Box>
      <ChatWidget />
    </Box>
  );
};

export default AppLayout;
