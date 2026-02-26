import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Rating,
} from '@mui/material';
import {
  SportsEsports,
  People,
  Schedule,
  Login,
} from '@mui/icons-material';
import PublicLayout from '../components/Public/PublicLayout';
import { videogamesAPI, VideogameDto } from '../api/videogames';

export default function PublicGamesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videogames, setVideogames] = useState<VideogameDto[]>([]);
  const [filteredGames, setFilteredGames] = useState<VideogameDto[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    platform: '',
  });

  useEffect(() => {
    loadVideogames();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, videogames]);

  const loadVideogames = async () => {
    try {
      setLoading(true);
      const data = await videogamesAPI.getAll();
      setVideogames(data);
      setFilteredGames(data);
    } catch (err: any) {
      setError('Error al cargar los videojuegos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...videogames];

    if (filters.search) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.genre) {
      filtered = filtered.filter(game => game.genre === filters.genre);
    }

    if (filters.platform) {
      filtered = filtered.filter(game => game.platform === filters.platform);
    }

    setFilteredGames(filtered);
  };

  const genres = [...new Set(videogames.map(g => g.genre))];
  const platforms = [...new Set(videogames.map(g => g.platform))];

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
            Catálogo de Videojuegos 🎮
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Explora nuestra colección de juegos. Inicia sesión para hacer reservas.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Filtros */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar juego"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Género"
                value={filters.genre}
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                {genres.map(genre => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Plataforma"
                value={filters.platform}
                onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
              >
                <MenuItem value="">Todas</MenuItem>
                {platforms.map(platform => (
                  <MenuItem key={platform} value={platform}>{platform}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Grid de videojuegos */}
        <Grid container spacing={3}>
          {filteredGames.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid rgba(0, 255, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 30px rgba(0, 255, 255, 0.4)',
                  },
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    background: game.imageUrl
                      ? `url(${game.imageUrl}) center/cover`
                      : 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!game.imageUrl && (
                    <SportsEsports sx={{ fontSize: 80, color: 'primary.main' }} />
                  )}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    {game.title}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip label={game.genre} size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label={game.platform} size="small" sx={{ mb: 1 }} />
                  </Box>

                  {game.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {game.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {game.isMultiplayer && (
                      <Chip
                        icon={<People />}
                        label="Multijugador"
                        size="small"
                        color="secondary"
                        sx={{ mr: 1 }}
                      />
                    )}
                    <Chip
                      icon={<Schedule />}
                      label={`${game.maxSessionMinutes} min`}
                      size="small"
                    />
                  </Box>

                  {game.averageRating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={game.averageRating} readOnly precision={0.1} size="small" />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        ({game.totalReviews} reseñas)
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    color={game.availableCopies > 0 ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 600 }}
                  >
                    {game.availableCopies > 0
                      ? `${game.availableCopies} copias disponibles`
                      : 'No disponible'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredGames.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SportsEsports sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron videojuegos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intenta ajustar los filtros de búsqueda
            </Typography>
          </Box>
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
            ¿Quieres reservar un juego?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Crea una cuenta para hacer reservas y disfrutar de todos nuestros servicios
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