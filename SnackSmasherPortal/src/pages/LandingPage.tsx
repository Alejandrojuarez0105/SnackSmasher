import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  SportsEsports,
  Restaurant,
  Event,
  Star,
  People,
  Schedule,
} from '@mui/icons-material';
import PublicLayout from '../components/Public/PublicLayout';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SportsEsports sx={{ fontSize: 60 }} />,
      title: 'Videojuegos',
      description:
        'Amplio catálogo de juegos para todas las plataformas. PS5, Xbox, Nintendo Switch y PC.',
      action: () => navigate('/public/games'),
    },
    {
      icon: <Restaurant sx={{ fontSize: 60 }} />,
      title: 'Menú',
      description:
        'Deliciosa comida y bebidas mientras disfrutas de tus juegos favoritos.',
      action: () => navigate('/public/menu'),
    },
    {
      icon: <Event sx={{ fontSize: 60 }} />,
      title: 'Eventos',
      description:
        'Torneos, partidos de fútbol en pantalla gigante y eventos especiales.',
      action: () => navigate('/public/events'),
    },
  ];

  const stats = [
    { icon: <SportsEsports />, value: '50+', label: 'Videojuegos' },
    { icon: <People />, value: '100+', label: 'Jugadores' },
    { icon: <Star />, value: '4.8', label: 'Valoración' },
    { icon: <Schedule />, value: '12hrs', label: 'Abierto' },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <Box
        sx={{
          background:
            'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%)',
            animation: 'pulse 4s ease-in-out infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 1 },
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              className="neon-text neon-pulse"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 3,
              }}
            >
              SNACKSMASHER BAR
            </Typography>

            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              El lugar perfecto donde los videojuegos, la comida gourmet y los
              eventos se encuentran
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                }}
              >
                Únete Ahora
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/public/games')}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                  },
                }}
              >
                Ver Catálogo
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          className="neon-text"
          sx={{ fontWeight: 700, mb: 6 }}
        >
          ¿Qué Ofrecemos?
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} key={index}>
              <Card
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '2px solid rgba(0, 255, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow:
                      '0 10px 40px rgba(0, 255, 255, 0.4)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    textAlign: 'center',
                    minHeight: 180,
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                  >
                    {feature.description}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={feature.action}
                  >
                    Explorar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          background: 'rgba(0, 255, 255, 0.05)',
          py: 6,
          borderTop: '2px solid rgba(0, 255, 255, 0.2)',
          borderBottom: '2px solid rgba(0, 255, 255, 0.2)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>
                    {stat.icon}
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container
        maxWidth="md"
        sx={{ py: 8, textAlign: 'center' }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          ¿Listo para la Experiencia?
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Únete a nuestra comunidad y disfruta de lo mejor en
          gaming y gastronomía
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.2rem',
              boxShadow:
                '0 0 30px rgba(0, 255, 255, 0.5)',
            }}
          >
            Crear Cuenta Gratis
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.2rem',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              },
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Container>
    </PublicLayout>
  );
}