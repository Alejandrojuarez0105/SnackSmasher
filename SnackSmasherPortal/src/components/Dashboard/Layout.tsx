import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SportsEsports as GamesIcon,
  EventSeat as ReservationsIcon,
  Restaurant as MenuRestaurantIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

const drawerWidth = 280

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
    navigate('/login')
  }

  //Menú base
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Videojuegos', icon: <GamesIcon />, path: '/videogames' },
    { text: 'Reservas', icon: <ReservationsIcon />, path: '/reservations' },
    { text: 'Menú', icon: <MenuRestaurantIcon />, path: '/menu' },
    { text: 'Eventos', icon: <EventIcon />, path: '/events' }
  ]

  //Menú admin
  const adminMenuItems = isAdmin
    ? [
        { text: 'Admin: Videojuegos', icon: <GamesIcon />, path: '/admin/videogames' },
        { text: 'Admin: Eventos', icon: <EventIcon />, path: '/admin/events' },
        { text: 'Admin: Mesas', icon: <ReservationsIcon />, path: '/admin/tables' },
        { text: 'Admin: Menú', icon: <MenuRestaurantIcon />, path: '/admin/menu' }
      ]
    : []

  const allMenuItems = [...menuItems, ...adminMenuItems]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          background:
            'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 204, 204, 0.1) 100%)',
          borderBottom: '2px solid rgba(0, 255, 255, 0.3)'
        }}
      >
        <Typography
          variant='h6'
          noWrap
          component='div'
          className='neon-text'
          sx={{ fontWeight: 700 }}
        >
          🎮 SNACKSMASHER
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.2)' }} />

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {allMenuItems.map(item => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1, px: 2 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path)
                setMobileOpen(false)
              }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  background:
                    'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                  border: '1px solid rgba(0, 255, 255, 0.4)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 204, 204, 0.3) 100%)'
                  }
                },
                '&:hover': {
                  background: 'rgba(0, 255, 255, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.2)' }} />

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'rgba(0, 255, 255, 0.05)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              color: 'background.default',
              fontWeight: 700
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }} noWrap>
              {user?.username}
            </Typography>
            {isAdmin && (
              <Chip
                label='ADMIN'
                size='small'
                icon={<AdminIcon />}
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.7rem',
                  background:
                    'linear-gradient(135deg, rgba(255, 0, 255, 0.2) 0%, rgba(204, 0, 204, 0.2) 100%)',
                  border: '1px solid rgba(255, 0, 255, 0.4)',
                  color: 'secondary.main'
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position='fixed'
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text ||
              'SnackSmasher Bar'}
          </Typography>

          <IconButton onClick={handleMenuOpen} color='inherit'>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                color: 'background.default'
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                navigate('/profile')
                handleMenuClose()
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize='small' />
              </ListItemIcon>
              Perfil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize='small' />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component='nav' sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'rgba(26, 26, 46, 0.98)',
              borderRight: '2px solid rgba(0, 255, 255, 0.3)'
            }
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'rgba(26, 26, 46, 0.98)',
              borderRight: '2px solid rgba(0, 255, 255, 0.3)'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
