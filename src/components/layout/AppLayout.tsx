import React, { useState, useEffect } from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatWidget from '@/components/common/ChatWidget';
import teamChatData from '../../data/initialConversations.json';
import { Conversation } from '../common/ChatWidget';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  // State to track if a sub-page wants to hide the global chat
  const [hideGlobalChat, setHideGlobalChat] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Listen for override events from child pages
  useEffect(() => {
    const handleHide = () => setHideGlobalChat(true);
    const handleShow = () => setHideGlobalChat(false);

    window.addEventListener('hide-global-chat', handleHide);
    window.addEventListener('show-global-chat', handleShow);

    // Clean up listeners on unmount
    return () => {
      window.removeEventListener('hide-global-chat', handleHide);
      window.removeEventListener('show-global-chat', handleShow);
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 1, p:0 }}>
          {children}
        </Container>
      </Box>
      
      {/* Conditionally render global chat only if it is not overridden */}
      {!hideGlobalChat && (
        <ChatWidget 
          initialConversations={teamChatData as Conversation[]} 
          title="Team Messages"
          subtitle="Internal corporate communications"
        />
      )}
    </Box>
  );
};

export default AppLayout;