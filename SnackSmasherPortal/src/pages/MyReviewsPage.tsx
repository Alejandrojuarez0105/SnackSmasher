import { ArrowBack, Delete, RateReview, SportsEsports } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Rating,
    Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReviewDto, reviewsAPI } from '../api/reviews'
import Layout from '../components/Dashboard/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../utils/useNotification'

export default function MyReviewsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadReviews()
    }
  }, [user])

  const loadReviews = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const data = await reviewsAPI.getByUser(user.id)
      setReviews(data)
    } catch (err) {
      setError('Error al cargar las reseñas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return

    try {
      await reviewsAPI.delete(reviewId)
      showSuccess('Reseña eliminada exitosamente')
      loadReviews()
    } catch (err) {
      showError('Error al eliminar la reseña')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message='Cargando tus reseñas...' />
      </Layout>
    )
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/profile')}
            sx={{ mb: 2 }}
          >
            Volver al Perfil
          </Button>

          <Typography
            variant='h4'
            gutterBottom
            className='neon-text'
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Mis Reseñas 📝
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Todas las reseñas que has dejado sobre videojuegos
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Lista de reseñas */}
        {reviews.length === 0 ? (
          <Card
            sx={{
              border: '2px solid rgba(0, 255, 255, 0.3)',
              background: 'rgba(0, 255, 255, 0.05)'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <RateReview sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant='h6' color='text.secondary' gutterBottom>
                No has dejado ninguna reseña todavía
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Ve a la sección de Videojuegos y deja tu primera reseña
              </Typography>
              <Button
                variant='contained'
                startIcon={<SportsEsports />}
                onClick={() => navigate('/videogames')}
              >
                Explorar Videojuegos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {reviews.map(review => (
              <Grid item xs={12} md={6} key={review.id}>
                <Card
                  sx={{
                    border: '2px solid rgba(0, 255, 255, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 255, 255, 0.3)'
                    }
                  }}
                >
                  <CardContent>
                    {/* Header con título del juego */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        mb: 2
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => navigate(`/videogames/${review.videogameId}/reviews`)}
                        >
                          {review.videogameTitle}
                        </Typography>
                        <Rating value={review.rating} readOnly size='small' />
                      </Box>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDelete(review.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    {/* Comentario */}
                    {review.comment && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          mb: 2,
                          fontStyle: review.comment ? 'normal' : 'italic'
                        }}
                      >
                        {review.comment || 'Sin comentario'}
                      </Typography>
                    )}

                    {/* Fecha */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={formatDate(review.createdAt)}
                        size='small'
                        variant='outlined'
                      />
                      <Button
                        size='small'
                        onClick={() => navigate(`/videogames/${review.videogameId}/reviews`)}
                      >
                        Ver todas las reseñas
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Resumen */}
        {reviews.length > 0 && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              border: '2px solid rgba(0, 255, 255, 0.3)',
              borderRadius: 2,
              background: 'rgba(0, 255, 255, 0.05)'
            }}
          >
            <Typography variant='h6' gutterBottom sx={{ fontWeight: 700 }}>
              Resumen de tus reseñas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary'>
                  Total de reseñas
                </Typography>
                <Typography variant='h4' sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {reviews.length}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary'>
                  Calificación promedio
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='h4' sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </Typography>
                  <Rating
                    value={reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length}
                    readOnly
                    precision={0.1}
                    size='small'
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Layout>
  )
}