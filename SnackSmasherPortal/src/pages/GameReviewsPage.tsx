import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Rating,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import { ArrowBack, Delete, Edit } from '@mui/icons-material'
import Layout from '../components/Dashboard/Layout'
import { reviewsAPI, ReviewDto } from '../api/reviews'
import { videogamesAPI, VideogameDto } from '../api/videogames'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function GameReviewsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState<VideogameDto | null>(null)
  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<ReviewDto | null>(null)
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const [gameData, reviewsData] = await Promise.all([
        videogamesAPI.getById(parseInt(id)),
        reviewsAPI.getByVideogame(parseInt(id))
      ])
      setGame(gameData)
      setReviews(reviewsData)
    } catch (err) {
      setError('Error al cargar las reseñas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return

    try {
      await reviewsAPI.delete(reviewId)
      setSuccess('Reseña eliminada exitosamente')
      loadData()
    } catch (err) {
      setError('Error al eliminar la reseña')
    }
  }

  const handleOpenEdit = (review: ReviewDto) => {
    setSelectedReview(review)
    setEditForm({ rating: review.rating, comment: review.comment || '' })
    setEditDialogOpen(true)
  }

  const handleUpdateReview = async () => {
    if (!selectedReview) return

    try {
      await reviewsAPI.update(selectedReview.id, editForm)
      setSuccess('Reseña actualizada exitosamente')
      setEditDialogOpen(false)
      loadData()
    } catch (err) {
      setError('Error al actualizar la reseña')
    }
  }

  const canEdit = (review: ReviewDto) => {
    return review.userId === user?.id
  }

  const canDelete = (review: ReviewDto) => {
    return isAdmin || review.userId === user?.id
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message='Cargando reseñas...' />
      </Layout>
    )
  }

  if (!game) {
    return (
      <Layout>
        <Container>
          <Alert severity='error'>Videojuego no encontrado</Alert>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth='lg'>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/videogames')}
          sx={{ mb: 3 }}
        >
          Volver a Videojuegos
        </Button>

        <Box sx={{ mb: 4 }}>
          <Typography variant='h4' className='neon-text' sx={{ fontWeight: 700, mb: 1 }}>
            Reseñas: {game.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating value={game.averageRating || 0} readOnly precision={0.1} />
            <Typography variant='h6' color='text.secondary'>
              {game.averageRating?.toFixed(1) || 'Sin calificar'} ({reviews.length}{' '}
              reseñas)
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' onClose={() => setSuccess('')} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {reviews.length === 0 ? (
          <Card
            sx={{
              border: '2px solid rgba(0, 255, 255, 0.3)',
              textAlign: 'center',
              py: 6
            }}
          >
            <Typography variant='h6' color='text.secondary'>
              No hay reseñas aún para este juego
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              ¡Sé el primero en dejar una reseña!
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reviews.map(review => (
              <Card
                key={review.id}
                sx={{
                  border: '2px solid rgba(0, 255, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {review.username[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                          {review.username}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {new Date(review.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                    {(canEdit(review) || canDelete(review)) && (
                      <Box>
                        {canEdit(review) && (
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleOpenEdit(review)}
                          >
                            <Edit />
                          </IconButton>
                        )}
                        {canDelete(review) && (
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDelete(review.id)}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </Box>
                  <Rating value={review.rating} readOnly sx={{ mb: 2 }} />
                  {review.comment && (
                    <Typography variant='body1'>{review.comment}</Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Dialog para editar reseña */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Editar Reseña</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography component='legend' gutterBottom>
                Calificación
              </Typography>
              <Rating
                value={editForm.rating}
                onChange={(_, newValue) =>
                  setEditForm({ ...editForm, rating: newValue || 5 })
                }
                size='large'
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Comentario'
                value={editForm.comment}
                onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                sx={{ mt: 3 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button variant='contained' onClick={handleUpdateReview}>
              Actualizar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}
