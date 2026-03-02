import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating
} from '@mui/material'
import { SportsEsports, People, Schedule, Star } from '@mui/icons-material'
import Layout from '../components/Dashboard/Layout'
import { videogamesAPI, VideogameDto } from '../api/videogames'
import { gameReservationsAPI, CreateGameReservationDto } from '../api/gameReservations'
import { reviewsAPI, CreateReviewDto } from '../api/reviews'
import LoadingSpinner from '../components/LoadingSpinner'

export default function VideogamesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [videogames, setVideogames] = useState<VideogameDto[]>([])
  const [filteredGames, setFilteredGames] = useState<VideogameDto[]>([])
  const [selectedGame, setSelectedGame] = useState<VideogameDto | null>(null)
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    platform: ''
  })
  const [reservationForm, setReservationForm] = useState({
    reservationDate: '',
    startTime: '',
    endTime: '',
    notes: ''
  })
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedGameForReview, setSelectedGameForReview] = useState<VideogameDto | null>(
    null
  )
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  })

  useEffect(() => {
    loadVideogames()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, videogames])

  const loadVideogames = async () => {
    try {
      setLoading(true)
      const data = await videogamesAPI.getAll()
      setVideogames(data)
      setFilteredGames(data)
    } catch (err: any) {
      setError('Error al cargar los videojuegos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...videogames]

    if (filters.search) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.genre) {
      filtered = filtered.filter(game => game.genre === filters.genre)
    }

    if (filters.platform) {
      filtered = filtered.filter(game => game.platform === filters.platform)
    }

    setFilteredGames(filtered)
  }

  const handleReserve = (game: VideogameDto) => {
    setSelectedGame(game)
    setReservationDialogOpen(true)
  }

  const handleReservationSubmit = async () => {
    if (!selectedGame) return

    try {
      const reservationData: CreateGameReservationDto = {
        videogameId: selectedGame.id,
        reservationDate: reservationForm.reservationDate,
        startTime: reservationForm.startTime,
        endTime: reservationForm.endTime,
        notes: reservationForm.notes
      }

      await gameReservationsAPI.create(reservationData)
      setSuccess('Reserva creada exitosamente')
      setReservationDialogOpen(false)
      setReservationForm({ reservationDate: '', startTime: '', endTime: '', notes: '' })
      loadVideogames()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la reserva')
    }
  }

  const handleOpenReviewDialog = (game: VideogameDto) => {
    setSelectedGameForReview(game)
    setReviewForm({ rating: 5, comment: '' })
    setReviewDialogOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedGameForReview) return

    try {
      const reviewData: CreateReviewDto = {
        videogameId: selectedGameForReview.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      }

      await reviewsAPI.create(reviewData)
      setSuccess('Reseña agregada exitosamente')
      setReviewDialogOpen(false)
      loadVideogames() // Recargar para actualizar las calificaciones
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Ya has dejado una reseña para este juego')
      } else {
        setError('Error al crear la reseña')
      }
    }
  }

  const genres = [...new Set(videogames.map(g => g.genre))]
  const platforms = [...new Set(videogames.map(g => g.platform))]

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message='Cargando videojuegos...' />
      </Layout>
    )
  }

  return (
    <Layout>
      <Box>
        <Typography
          variant='h4'
          gutterBottom
          className='neon-text'
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Videojuegos 🎮
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          Explora nuestra colección y reserva tu juego favorito
        </Typography>

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

        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar juego"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              placeholder="Buscar por título..."
              InputProps={{
                startAdornment : (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <SportsEsports sx={{ color: 'primary.main' }} />
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label='Género'
              value={filters.genre}
              onChange={e => setFilters({ ...filters, genre: e.target.value })}
            >
              <MenuItem value=''>
              <em>Todos los géneros</em>
              </MenuItem>
              {genres.map(genre => (
                <MenuItem key={genre} value={genre}>{genre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label='Plataforma'
              value={filters.platform}
              onChange={e => setFilters({ ...filters, platform: e.target.value })}
            >
              <MenuItem value=''>
              <em>Todas las plataformas</em>
              </MenuItem>
              {platforms.map(platform => (
                <MenuItem key={platform} value={platform}>{platform}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Resultados y botón de limpiar filtros */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Mostrando {filteredGames.length} de {videogames.length} juegos
          </Typography>
          {(filters.search || filters.genre || filters.platform) && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilters({ search: '', genre: '', platform: '' })}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>

        {/* Grid de videojuegos */}
        <Grid container spacing={3}>
          {filteredGames.map(game => (
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
                    boxShadow: '0 8px 30px rgba(0, 255, 255, 0.4)'
                  }
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    background: game.imageUrl
                      ? `url(${game.imageUrl}) center/cover`
                      : 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!game.imageUrl && (
                    <SportsEsports sx={{ fontSize: 80, color: 'primary.main' }} />
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant='h6' gutterBottom sx={{ fontWeight: 700 }}>
                    {game.title}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip label={game.genre} size='small' sx={{ mr: 1, mb: 1 }} />
                    <Chip label={game.platform} size='small' sx={{ mb: 1 }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {game.isMultiplayer && (
                      <Chip
                        icon={<People />}
                        label='Multijugador'
                        size='small'
                        color='secondary'
                        sx={{ mr: 1 }}
                      />
                    )}
                    <Chip
                      icon={<Schedule />}
                      label={`${game.maxSessionMinutes} min`}
                      size='small'
                    />
                  </Box>

                  {game.averageRating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating
                        value={game.averageRating}
                        readOnly
                        precision={0.1}
                        size='small'
                      />
                      <Typography variant='caption' sx={{ ml: 1 }}>
                        ({game.totalReviews})
                      </Typography>
                    </Box>
                  )}

                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    Copias disponibles: {game.availableCopies}/{game.totalCopies}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant='contained'
                        disabled={game.availableCopies === 0}
                        onClick={() => handleReserve(game)}
                      >
                        {game.availableCopies === 0 ? 'No Disponible' : 'Reservar'}
                      </Button>
                      <Button
                        variant='outlined'
                        onClick={() => handleOpenReviewDialog(game)}
                        startIcon={<Star />}
                      >
                        Reseña
                      </Button>
                    </Box>
                    <Button
                      fullWidth
                      variant='text'
                      size='small'
                      onClick={() => navigate(`/videogames/${game.id}/reviews`)}
                      sx={{ textTransform: 'none' }}
                    >
                      Ver Reseñas {game.totalReviews} reseña
                      {game.totalReviews !== 1 ? 's' : ''}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog de reserva */}
        <Dialog
          open={reservationDialogOpen}
          onClose={() => setReservationDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Reservar {selectedGame?.title}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type='date'
                label='Fecha'
                value={reservationForm.reservationDate}
                onChange={e =>
                  setReservationForm({
                    ...reservationForm,
                    reservationDate: e.target.value
                  })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
              <TextField
                fullWidth
                type='time'
                label='Hora de inicio'
                value={reservationForm.startTime}
                onChange={e =>
                  setReservationForm({ ...reservationForm, startTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type='time'
                label='Hora de fin'
                value={reservationForm.endTime}
                onChange={e =>
                  setReservationForm({ ...reservationForm, endTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Notas (opcional)'
                value={reservationForm.notes}
                onChange={e =>
                  setReservationForm({ ...reservationForm, notes: e.target.value })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReservationDialogOpen(false)}>Cancelar</Button>
            <Button
              variant='contained'
              onClick={handleReservationSubmit}
              disabled={
                !reservationForm.reservationDate ||
                !reservationForm.startTime ||
                !reservationForm.endTime
              }
            >
              Confirmar Reserva
            </Button>
          </DialogActions>
        </Dialog>
        {/* Dialog de reseña */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Dejar Reseña: {selectedGameForReview?.title}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography component='legend' gutterBottom>
                Calificación
              </Typography>
              <Rating
                value={reviewForm.rating}
                onChange={(_, newValue) =>
                  setReviewForm({ ...reviewForm, rating: newValue || 5 })
                }
                size='large'
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Comentario (opcional)'
                value={reviewForm.comment}
                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                sx={{ mt: 3 }}
                placeholder='¿Qué te pareció este juego?'
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Cancelar</Button>
            <Button variant='contained' onClick={handleSubmitReview}>
              Publicar Reseña
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}
