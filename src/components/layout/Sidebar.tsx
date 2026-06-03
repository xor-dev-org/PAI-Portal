import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  SwapHoriz as DelegationIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/models';

const drawerWidth = 240;
const miniDrawerWidth = 64;

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}



const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon color={location.pathname === '/dashboard'? 'primary': 'secondary'} />, path: '/dashboard', allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST, UserRole.SUPPLIER] },
    { text: 'PO Listing', icon: <ReceiptIcon color={location.pathname === '/purchase-orders'? 'primary': 'secondary'} />, path: '/purchase-orders', allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST, UserRole.SUPPLIER] },
    { text: 'Delegation', icon: <DelegationIcon color={location.pathname === '/delegation'? 'primary': 'secondary'} />, path: '/delegation', allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST] },
    { text: 'Chat', icon: <ChatIcon color={location.pathname === '/chat'? 'primary': 'secondary'}/>, path: '/chat', allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST, UserRole.SUPPLIER] },
    { text: 'Settings', icon: <SettingsIcon color={location.pathname === '/settings'? 'primary': 'secondary'} />, path: '/settings', allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST, UserRole.SUPPLIER] },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item =>
    !user?.role || item.allowedRoles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      onDrawerToggle();
    }
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }} bgcolor={'primary.main'} color={'white'}>
      <Toolbar />
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                justifyContent: collapsed ? 'center' : 'initial',
                px: 2.5,
                borderRadius: '12px',
                mx: 1,

                color: 'white',

                '&.Mui-selected': {
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.primary.contrastText,

                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                },

                '&.Mui-selected:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                },

                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              <ListItemIcon
                color='white'
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 3,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {!isMobile && (
        <>
          <Divider />
          <Box bgcolor={theme.palette.secondary.dark} sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <IconButton onClick={toggleCollapse}>
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: collapsed ? miniDrawerWidth : drawerWidth },
        flexShrink: { sm: 0 },
        transition: 'width 0.2s',
      }}
      aria-label="navigation menu"
      bgcolor={theme.palette.secondary.main}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}

      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? miniDrawerWidth : drawerWidth,
            transition: 'width 0.2s',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;