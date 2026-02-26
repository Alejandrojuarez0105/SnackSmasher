import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Event,
  CalendarToday,
  Schedule,
  Stadium,
  Login,
} from '@mui/icons-material';
import PublicLayout from '../components/Public/PublicLayout';
import { eventsAPI, EventDto } from '../api/events';

export default function PublicEventsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState<EventDto[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getUpcoming();
      setEvents(data);
    } catch (err: any) {
      setError('Error al cargar los eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEventSoon = (eventDate: string) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffDays = Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  if (loading) {
    return (
      <PublicLayout>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            gutterBottom
            className="neon-text"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Próximos Eventos 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No te pierdas nuestros eventos especiales, torneos y transmisiones
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {events.length === 0 ? (
          <Card
            sx={{
              border: '2px solid rgba(0, 255, 255, 0.3)',
              background: 'rgba(0, 255, 255, 0.05)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Event sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay eventos próximos por el momento
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ¡Mantente atento! Pronto anunciaremos nuevos eventos
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Card
                  sx={{
                    border: isEventSoon(event.eventDate)
                      ? '2px solid rgba(255, 0, 255, 0.5)'
                      : '2px solid rgba(0, 255, 255, 0.3)',
                    boxShadow: isEventSoon(event.eventDate)
                      ? '0 0 30px rgba(255, 0, 255, 0.3)'
                      : '0 0 20px rgba(0, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: isEventSoon(event.eventDate)
                        ? '0 8px 40px rgba(255, 0, 255, 0.4)'
                        : '0 8px 30px rgba(0, 255, 255, 0.3)',
                    },
                  }}
                >
                  {isEventSoon(event.eventDate) && (
                    <Chip
                      label="¡PRÓXIMAMENTE!"
                      color="secondary"
                      size="small"
                      className="neon-pulse"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 16,
                        zIndex: 1,
                        fontWeight: 700,
                        boxShadow: '0 0 15px rgba(255, 0, 255, 0.6)',
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      height: 180,
                      background: event.imageUrl
                        ? `url(${event.imageUrl}) center/cover`
                        : 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
                    }}
                  >
                    {!event.imageUrl && (
                      <Stadium sx={{ fontSize: 100, color: 'primary.main' }} />
                    )}
                  </Box>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {event.title}
                    </Typography>

                    {event.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {event.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          background: 'rgba(0, 255, 255, 0.05)',
                          border: '1px solid rgba(0, 255, 255, 0.2)',
                        }}
                      >
                        <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Fecha
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {new Date(event.eventDate).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          background: 'rgba(0, 255, 255, 0.05)',
                          border: '1px solid rgba(0, 255, 255, 0.2)',
                        }}
                      >
                        <Schedule sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Horario
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {event.startTime} {event.endTime && `- ${event.endTime}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* CTA para registrarse */}
        <Box
          sx={{
            mt: 6,
            p: 4,
            textAlign: 'center',
            border: '2px solid rgba(0, 255, 255, 0.3)',
            borderRadius: 2,
            background: 'rgba(0, 255, 255, 0.05)',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            ¿Quieres participar en nuestros eventos?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Únete a nuestra comunidad y recibe notificaciones de próximos eventos
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
            >
              Registrarse
            </Button>
          </Box>
        </Box>
      </Container>
    </PublicLayout>
  );
}