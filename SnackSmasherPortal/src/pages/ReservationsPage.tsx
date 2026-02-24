import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  EventSeat,
  SportsEsports,
  Cancel,
  CheckCircle,
} from '@mui/icons-material';
import Layout from '../components/Dashboard/Layout';
import { gameReservationsAPI, GameReservationDto } from '../api/gameReservations';
import { useAuth } from '../context/AuthContext';

export default function ReservationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [gameReservations, setGameReservations] = useState<GameReservationDto[]>([]);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await gameReservationsAPI.getByUser(user.id);
      setGameReservations(data);
    } catch (err: any) {
      setError('Error al cargar las reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id: number) => {
    try {
      await gameReservationsAPI.cancel(id);
      setSuccess('Reserva cancelada exitosamente');
      loadReservations();
    } catch (err: any) {
      setError('Error al cancelar la reserva');
    }
  };

  const activeReservations = gameReservations.filter(r => r.status === 'Active');
  const pastReservations = gameReservations.filter(r => r.status !== 'Active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Activa';
      case 'Completed':
        return 'Completada';
      case 'Cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Typography
          variant="h4"
          gutterBottom
          className="neon-text"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Mis Reservas 📅
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gestiona tus reservas de juegos y mesas
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Tab 
              icon={<SportsEsports />} 
              label={`Reservas Activas (${activeReservations.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<EventSeat />} 
              label={`Historial (${pastReservations.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Reservas Activas */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {activeReservations.length === 0 ? (
              <Grid item xs={12}>
                <Card
                  sx={{
                    border: '2px solid rgba(0, 255, 255, 0.3)',
                    background: 'rgba(0, 255, 255, 0.05)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <SportsEsports sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No tienes reservas activas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ve a la sección de Videojuegos para crear una reserva
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              activeReservations.map((reservation) => (
                <Grid item xs={12} md={6} key={reservation.id}>
                  <Card
                    sx={{
                      border: '2px solid rgba(0, 255, 255, 0.3)',
                      boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0, 255, 255, 0.3)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SportsEsports sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {reservation.videogameTitle}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(reservation.status)}
                          color={getStatusColor(reservation.status) as any}
                          size="small"
                          icon={<CheckCircle />}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📅 Fecha: {reservation.reservationDate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          ⏰ Horario: {reservation.startTime} - {reservation.endTime}
                        </Typography>
                        {reservation.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            📝 {reservation.notes}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        Cancelar Reserva
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* Historial */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {pastReservations.length === 0 ? (
              <Grid item xs={12}>
                <Card
                  sx={{
                    border: '2px solid rgba(0, 255, 255, 0.3)',
                    background: 'rgba(0, 255, 255, 0.05)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <EventSeat sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No tienes reservas pasadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              pastReservations.map((reservation) => (
                <Grid item xs={12} md={6} key={reservation.id}>
                  <Card
                    sx={{
                      border: '1px solid rgba(0, 255, 255, 0.2)',
                      opacity: 0.8,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SportsEsports sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {reservation.videogameTitle}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(reservation.status)}
                          color={getStatusColor(reservation.status) as any}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        📅 {reservation.reservationDate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ⏰ {reservation.startTime} - {reservation.endTime}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </Layout>
  );
}