import {
  AdminPanelSettings,
  CalendarToday,
  Delete,
  Edit,
  Email,
  Person
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Rating,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosConfig'
import { GameReservationDto, gameReservationsAPI } from '../api/gameReservations'
import { ReviewDto, reviewsAPI } from '../api/reviews'
import Layout from '../components/Dashboard/Layout'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../utils/useNotification'

export default function ProfilePage() {
  const { user, isAdmin } = useAuth()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { showSuccess } = useNotification()

  const handleEditProfile = () => {
    setEditDialogOpen(true)
  }

  const handleSaveProfile = () => {
    showSuccess('Perfil actualizado exitosamente')
    setEditDialogOpen(false)
  }

  const navigate = useNavigate()
  const [myReviews, setMyReviews] = useState<ReviewDto[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [myReservations, setMyReservations] = useState<GameReservationDto[]>([])
  const [myTableReservations, setMyTableReservations] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      loadMyReviews()
      loadMyReservations()
      loadMyTableReservations()
    }
  }, [user])

  const loadMyReviews = async () => {
    if (!user?.id) return

    try {
      setLoadingReviews(true)
      const reviews = await reviewsAPI.getByUser(user.id)
      setMyReviews(reviews)
    } catch (err) {
      console.error('Error al cargar reseñas:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  const loadMyReservations = async () => {
    if (!user?.id) return

    try {
      const reservations = await gameReservationsAPI.getByUser(user.id)
      setMyReservations(reservations)
    } catch (err) {
      console.error('Error al cargar reservas:', err)
    }
  }

  const loadMyTableReservations = async () => {
    if (!user?.id) return
    
    try {
      const response = await axiosInstance.get(
        `/TableReservations/user/${user.id}`
      )
      setMyTableReservations(response.data)
    } catch (err) {
      console.error('Error al cargar reservas de mesas:', err)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return

    try {
      await reviewsAPI.delete(reviewId)
      showSuccess('Reseña eliminada exitosamente')
      loadMyReviews()
    } catch (err) {
      console.error('Error al eliminar reseña:', err)
    }
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
          Mi Perfil 👤
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          Información de tu cuenta
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                border: '2px solid rgba(0, 255, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                textAlign: 'center'
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
                    boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)'
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>

                <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                  {user?.username}
                </Typography>

                {isAdmin && (
                  <Chip
                    label='ADMINISTRADOR'
                    icon={<AdminPanelSettings />}
                    color='secondary'
                    sx={{
                      fontWeight: 700,
                      boxShadow: '0 0 15px rgba(255, 0, 255, 0.4)'
                    }}
                  />
                )}

                <Button
                  fullWidth
                  variant='outlined'
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
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
              }}
            >
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                  Información Personal
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Usuario
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {user?.username}
                      </Typography>
                    </Box>
                  </Box>

                  {user?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Email
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 600 }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {(user?.firstName || user?.lastName) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Nombre Completo
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 600 }}>
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Rol
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {isAdmin ? 'Administrador' : 'Usuario'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant='h6' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  Estadísticas
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(0, 255, 255, 0.05)',
                        border: '1px solid rgba(0, 255, 255, 0.2)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography
                        variant='h4'
                        sx={{ fontWeight: 700, color: 'primary.main' }}
                      >
                        {(myReservations?.length || 0) + (myTableReservations?.length || 0)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Reservas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255, 0, 255, 0.05)',
                        border: '1px solid rgba(255, 0, 255, 0.2)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography
                        variant='h4'
                        sx={{ fontWeight: 700, color: 'secondary.main' }}
                      >
                        {myReviews.length}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Reseñas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255, 170, 0, 0.05)',
                        border: '1px solid rgba(255, 170, 0, 0.2)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant='h4' sx={{ fontWeight: 700, color: '#ffaa00' }}>
                        {myReviews.length > 0
                          ? (
                              myReviews.reduce((acc, r) => acc + r.rating, 0) /
                              myReviews.length
                            ).toFixed(1)
                          : '0.0'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Rating Promedio
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant='h6' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  Mis Reseñas
                </Typography>

                {loadingReviews ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : myReviews.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No has dejado reseñas aún
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {myReviews.slice(0, 3).map(review => (
                      <Card
                        key={review.id}
                        sx={{
                          border: '1px solid rgba(0, 255, 255, 0.2)',
                          background: 'rgba(0, 255, 255, 0.03)'
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start'
                            }}
                          >
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant='subtitle1'
                                sx={{ fontWeight: 600, mb: 1, cursor: 'pointer' }}
                                onClick={() =>
                                  navigate(`/videogames/${review.videogameId}/reviews`)
                                }
                              >
                                {review.videogameTitle}
                              </Typography>
                              <Rating
                                value={review.rating}
                                readOnly
                                size='small'
                                sx={{ mb: 1 }}
                              />
                              {review.comment && (
                                <Typography variant='body2' color='text.secondary'>
                                  {review.comment}
                                </Typography>
                              )}
                            </Box>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                    {myReviews.length > 3 && (
                      <Button variant='text' onClick={() => navigate('/my-reviews')}>
                        Ver todas mis reseñas
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dialog de edición */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label='Nombre'
                defaultValue={user?.firstName}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label='Apellido'
                defaultValue={user?.lastName}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label='Email'
                type='email'
                defaultValue={user?.email}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button variant='contained' onClick={handleSaveProfile}>
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}
