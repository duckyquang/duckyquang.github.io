import React, { ReactNode, useState } from 'react';
import { 
  AppBar, 
  Box, 
  Drawer, 
  IconButton, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText, 
  Container, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Assignment as TasksIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
  ];
  
  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };
  
  const drawer = (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          FlowZone
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'FlowZone'}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, pt: 8 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: 8,
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
