import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  SportsEsports,
  Restaurant,
  Event,
  Login,
  PersonAdd,
} from '@mui/icons-material';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { text: 'Inicio', path: '/', icon: <SportsEsports /> },
    { text: 'Videojuegos', path: '/public/games', icon: <SportsEsports /> },
    { text: 'Menú', path: '/public/menu', icon: <Restaurant /> },
    { text: 'Eventos', path: '/public/events', icon: <Event /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="fixed"
        sx={{
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            onClick={() => navigate('/')}
            className="neon-text"
            sx={{
              flexGrow: 0,
              mr: 4,
              cursor: 'pointer',
              fontWeight: 700,
              '&:hover': {
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
              },
            }}
          >
            🎮 SNACKSMASHER BAR
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderBottom: location.pathname === item.path ? '2px solid' : 'none',
                  borderRadius: 0,
                  '&:hover': {
                    background: 'rgba(0, 255, 255, 0.1)',
                    borderBottom: '2px solid',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{
                border: '1px solid rgba(0, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(0, 255, 255, 0.1)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                },
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Iniciar Sesión</Box>
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/register')}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Registrarse
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'rgba(26, 26, 46, 0.98)',
            borderRight: '2px solid rgba(0, 255, 255, 0.3)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" className="neon-text" sx={{ fontWeight: 700 }}>
            SNACKSMASHER BAR
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.2)' }} />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    background: 'rgba(0, 255, 255, 0.1)',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box sx={{ mr: 2, color: 'primary.main' }}>{item.icon}</Box>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, mt: 8 }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          background: 'rgba(26, 26, 46, 0.95)',
          borderTop: '2px solid rgba(0, 255, 255, 0.3)',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2026 SnackSmasher Bar. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}