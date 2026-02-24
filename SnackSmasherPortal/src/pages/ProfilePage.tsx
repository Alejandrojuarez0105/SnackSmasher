import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Chip,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Person,
  Email,
  AdminPanelSettings,
  Edit,
  CalendarToday,
} from '@mui/icons-material';
import Layout from '../components/Dashboard/Layout';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    setSuccess('Perfil actualizado exitosamente');
    setEditDialogOpen(false);
  };

  return (
    <Layout>
      <Box>
        <Typography
          variant="h4"
          gutterBottom
          className="neon-text"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Mi Perfil 👤
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Información de tu cuenta
        </Typography>

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                border: '2px solid rgba(0, 255, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                textAlign: 'center',
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto',
                    bgcolor: 'primary.main',
                    color: 'background.default',
                    fontSize: 48,
                    fontWeight: 700,
                    mb: 2,
                    boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {user?.username}
                </Typography>

                {isAdmin && (
                  <Chip
                    label="ADMINISTRADOR"
                    icon={<AdminPanelSettings />}
                    color="secondary"
                    sx={{
                      fontWeight: 700,
                      boxShadow: '0 0 15px rgba(255, 0, 255, 0.4)',
                    }}
                  />
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Edit />}
                  sx={{ mt: 3 }}
                  onClick={handleEditProfile}
                >
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card
              sx={{
                border: '2px solid rgba(0, 255, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                  Información Personal
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Usuario
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {user?.username}
                      </Typography>
                    </Box>
                  </Box>

                  {user?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {(user?.firstName || user?.lastName) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Nombre Completo
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Rol
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {isAdmin ? 'Administrador' : 'Usuario'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  Estadísticas
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(0, 255, 255, 0.05)',
                        border: '1px solid rgba(0, 255, 255, 0.2)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        0
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reservas Totales
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255, 0, 255, 0.05)',
                        border: '1px solid rgba(255, 0, 255, 0.2)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        0
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reseñas Escritas
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dialog de edición */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre"
                defaultValue={user?.firstName}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Apellido"
                defaultValue={user?.lastName}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                defaultValue={user?.email}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveProfile}>
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}