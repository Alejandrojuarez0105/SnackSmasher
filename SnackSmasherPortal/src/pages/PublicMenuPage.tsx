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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import {
  Restaurant,
  ExpandMore,
  AttachMoney,
  Login,
} from '@mui/icons-material';
import PublicLayout from '../components/Public/PublicLayout';
import { menuAPI, MenuCategoryDto } from '../api/menu';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PublicMenuPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<MenuCategoryDto[]>([]);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await menuAPI.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError('Error al cargar el menú');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <Container>
          <LoadingSpinner message='Cargando menú...' />
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
            Nuestro Menú 🍔
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Descubre nuestra deliciosa selección de comida y bebidas
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {categories.map((category) => (
          <Accordion
            key={category.id}
            defaultExpanded
            sx={{
              mb: 2,
              border: '2px solid rgba(0, 255, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
              background: 'rgba(26, 26, 46, 0.8)',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}
              sx={{
                '&:hover': {
                  background: 'rgba(0, 255, 255, 0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Restaurant sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {category.name}
                  </Typography>
                  {category.description && (
                    <Typography variant="caption" color="text.secondary">
                      {category.description}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={`${category.items.length} items`}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {category.items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card
                      sx={{
                        border: '1px solid rgba(0, 255, 255, 0.2)',
                        background: 'rgba(0, 255, 255, 0.03)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          border: '1px solid rgba(0, 255, 255, 0.4)',
                          boxShadow: '0 4px 15px rgba(0, 255, 255, 0.2)',
                        },
                      }}
                    >
                        <Box
                        sx={{
                            height: 150,
                            background: item.imageUrl
                            ? `url(${item.imageUrl})`
                            : 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        >
                            {!item.imageUrl && <Restaurant sx={{ fontSize: 60, color: 'primary.main' }} />}
                            </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            icon={<AttachMoney />}
                            label={`$${item.price.toFixed(2)}`}
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                          {item.isAvailable ? (
                            <Chip label="Disponible" size="small" color="success" />
                          ) : (
                            <Chip label="No disponible" size="small" color="error" />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

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
            ¿Listo para visitar?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Únete a nosotros y disfruta de la mejor experiencia gaming + gastronomía
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