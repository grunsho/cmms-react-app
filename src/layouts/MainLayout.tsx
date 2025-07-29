import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Divider,
//   Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build'; // Para Activos
import AssignmentIcon from '@mui/icons-material/Assignment'; // Para Órdenes de Trabajo
import InventoryIcon from '@mui/icons-material/Inventory'; // Para Inventario
import PeopleIcon from '@mui/icons-material/People'; // Para Usuarios
import SettingsIcon from '@mui/icons-material/Settings'; // Para Configuración
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppSelector } from '../hooks/reduxHooks';
import { useLogoutMutation } from '../services/authApi';
import { useNavigate, Outlet } from 'react-router-dom';

const drawerWidth = 240; // Ancho del Sidebar

interface MainLayoutProps {
  children?: React.ReactNode; // Para renderizar el contenido dentro del layout
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Activos', icon: <BuildIcon />, path: '/assets' },
    { text: 'Órdenes de Trabajo', icon: <AssignmentIcon />, path: '/work-orders' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
    // Opciones adicionales que podrían depender del rol
    ...(user?.role === 'admin' || user?.role === 'manager' ? [{ text: 'Usuarios', icon: <PeopleIcon />, path: '/users' }] : []),
    { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar /> {/* Espacio para que el contenido no se oculte detrás del AppBar */}
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline /> {/* Resetea los estilos CSS básicos de MUI */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CMMS - {user?.role ? user.role.toUpperCase() : 'Usuario'}
          </Typography>
          {user && (
            <Typography variant="body1" color="inherit">
              {user.first_name || user.username}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Drawer para móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en móvil
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer para escritorio */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar /> {/* Esto es para compensar la altura del AppBar */}
        {/* Aquí es donde se renderizará el contenido de las rutas hijas */}
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default MainLayout;