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
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST, UserRole.SUPPLIER],
    },
    {
      text: 'PO Listing',
      icon: <ReceiptIcon />,
      path: '/purchase-orders',
      allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST, UserRole.SUPPLIER],
    },
    {
      text: 'Delegation',
      icon: <DelegationIcon />,
      path: '/delegation',
      allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST],
    },
    {
      text: 'Chat',
      icon: <ChatIcon />,
      path: '/chat',
      allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST, UserRole.SUPPLIER],
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_SPECIALIST, UserRole.SUPPLIER],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => !user?.role || item.allowedRoles.includes(user.role)
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRight: '1px solid',
        borderColor: 'divider',
        marginTop: '5rem',
      }}
    >
      <Toolbar
        sx={{
          px: 0,
          py: 0,
          marginLeft: 0,
          minHeight: 88,
          bgcolor: 'background.default',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {!collapsed ? (
          <Box
            component="img"
            src="/fls_logo.png"
            alt="App logo"
            sx={{ width: '100%', height: 50, objectFit: 'contain' }}
          />
        ) : (
          <Box
            component="img"
            src="/vite.svg"
            alt="Logo"
            sx={{ width: 40, height: 40, objectFit: 'contain', p: 0.5 }}
          />
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, p: 0 }}>
        {filteredMenuItems.map((item) => {
          const isSelected =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                  borderRadius: '0px',
                  mx: 0,
                  color: 'text.primary',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.secondary.light,
                    color: theme.palette.text.primary,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.text.primary,
                    },
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.primary.contrastText,
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 'auto' : 3,
                    justifyContent: 'center',
                    color: isSelected ? theme.palette.primary.main : theme.palette.primary.main,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {!isMobile && (
        <>
          <Divider />
          <Box
            bgcolor={theme.palette.background.paper}
            sx={{ p: 1, display: 'flex', justifyContent: 'center' }}
          >
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
        bgcolor: 'background.paper',
      }}
      aria-label="navigation menu"
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
