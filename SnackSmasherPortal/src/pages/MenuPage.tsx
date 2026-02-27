import { useEffect, useState } from 'react';
import {
  Box,
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
} from '@mui/material';
import {
  Restaurant,
  ExpandMore,
  AttachMoney,
} from '@mui/icons-material';
import Layout from '../components/Dashboard/Layout';
import { menuAPI, MenuCategoryDto } from '../api/menu';

export default function MenuPage() {
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
          Menú 🍔
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Descubre nuestra deliciosa selección de comida y bebidas
        </Typography>

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
      </Box>
    </Layout>
  );
}