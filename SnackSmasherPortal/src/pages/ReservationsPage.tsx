import { useEffect, useState } from 'react'
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
  Tab
} from '@mui/material'
import {
  EventSeat,
  SportsEsports,
  Cancel,
  CheckCircle,
  AdminPanelSettings
} from '@mui/icons-material'
import Layout from '../components/Dashboard/Layout'
import { gameReservationsAPI, GameReservationDto } from '../api/gameReservations'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { useNotification } from '../utils/useNotification'
import axiosInstance from '../api/axiosConfig'

interface TableReservationDto {
  id: number;
  userId: number;
  username: string;
  tableId: number;
  tableNumber: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  notes?: string;
  status: string;
  createdAt: string;
}

export default function ReservationsPage() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const { showSuccess, showError } = useNotification()
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [gameReservations, setGameReservations] = useState<GameReservationDto[]>([])
  const [allReservations, setAllReservations] = useState<GameReservationDto[]>([])
  const [tableReservations, setTableReservations] = useState<any[]>([])

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      if (isAdmin) {
        const allGameData = await gameReservationsAPI.getAll()
        setAllReservations(allGameData)
      }

      const gameData = await gameReservationsAPI.getByUser(user.id)
      setGameReservations(gameData)
      const tableData = await axiosInstance.get(`/TableReservations/user/${user.id}`)
      setTableReservations(tableData.data)
    } catch (err: any) {
      setError('Error al cargar las reservas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (id: number) => {
    try {
      await gameReservationsAPI.cancel(id)
      showSuccess('Reserva cancelada exitosamente')
      loadReservations()
    } catch (err: any) {
      showError('Error al cancelar la reserva')
    }
  }

  const handleConfirmReservation = async (id: number) => {
    try {
      await axiosInstance.put(`/GameReservations/${id}/confirm`);
      showSuccess('Reserva confirmada exitosamente');
      loadReservations();
    } catch (err) {
      showError('Error al confirmar la reserva');
    }
  }

    const handleCancelTableReservation = async (id: number) => {
    try {
      await axiosInstance.put(`/TableReservations/${id}`, { Status: 'Cancelled' })
      showSuccess('Reserva de mesa cancelada exitosamente')
      loadReservations()
    } catch (err) {
      showError('Error al cancelar la reserva de mesa')
    }
  }

  const activeReservations = gameReservations.filter(r => r.status === 'Active')
  const pastReservations = gameReservations.filter(r => r.status !== 'Active')
  const activeTableReservations = tableReservations.filter((r: any) => r.status === 'Active')
  const pastTableReservations = tableReservations.filter((r: any) => r.status !== 'Active')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Completed':
        return 'info'
      case 'Cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Activa'
      case 'Completed':
        return 'Completada'
      case 'Cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message='Cargando reservas...' />
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
          Mis Reservas 📅
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          Gestiona tus reservas de juegos y mesas
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <Tab
              icon={<SportsEsports />}
              label={`Mis Reservas Activas (${activeReservations.length})`}
              iconPosition='start'
            />
            <Tab
              icon={<EventSeat />}
              label={`Mi Historial (${pastReservations.length})`}
              iconPosition='start'
            />
            {isAdmin && (
              <Tab
                icon={<AdminPanelSettings />}
                label={`Todas las Reservas (${allReservations.length})`}
                iconPosition='start'
              />
            )}
          </Tabs>
        </Box>

       {/* Reservas Activas */}
{tabValue === 0 && (
  <Grid container spacing={3}>
    {activeReservations.length === 0 && activeTableReservations.length === 0 ? (
      <Grid item xs={12}>
        <Card
          sx={{
            border: '2px solid rgba(0, 255, 255, 0.3)',
            background: 'rgba(0, 255, 255, 0.05)'
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SportsEsports
              sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant='h6' color='text.secondary'>
              No tienes reservas activas
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Ve a la sección de Videojuegos o Mesas para crear una reserva
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ) : (
      <>
        {/* Reservas de Juegos */}
        {activeReservations.map(reservation => (
          <Grid item xs={12} md={6} key={`game-${reservation.id}`}>
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
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SportsEsports sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                      {reservation.videogameTitle}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(reservation.status)}
                    color={getStatusColor(reservation.status) as any}
                    size='small'
                    icon={<CheckCircle />}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5 }}
                  >
                    📅 Fecha: {reservation.reservationDate}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5 }}
                  >
                    ⏰ Horario: {reservation.startTime} - {reservation.endTime}
                  </Typography>
                  {reservation.notes && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 1 }}
                    >
                      📝 {reservation.notes}
                    </Typography>
                  )}
                </Box>

                <Button
                  fullWidth
                  variant='outlined'
                  color='error'
                  startIcon={<Cancel />}
                  onClick={() => handleCancelReservation(reservation.id)}
                >
                  Cancelar Reserva
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Reservas de Mesas */}
        {activeTableReservations.map((reservation: any) => (
          <Grid item xs={12} md={6} key={`table-${reservation.id}`}>
            <Card
              sx={{
                border: '2px solid rgba(255, 0, 255, 0.3)',
                boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(255, 0, 255, 0.3)'
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventSeat sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                      Mesa #{reservation.tableNumber}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(reservation.status)}
                    color={getStatusColor(reservation.status) as any}
                    size='small'
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5 }}
                  >
                    📅 Fecha: {reservation.reservationDate}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5 }}
                  >
                    ⏰ Horario: {reservation.startTime} - {reservation.endTime}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5 }}
                  >
                    👥 Invitados: {reservation.guestCount}
                  </Typography>
                  {reservation.notes && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 1 }}
                    >
                      📝 {reservation.notes}
                    </Typography>
                  )}
                </Box>

                <Button
                  fullWidth
                  variant='outlined'
                  color='error'
                  startIcon={<Cancel />}
                  onClick={() => handleCancelTableReservation(reservation.id)}
                >
                  Cancelar Reserva de Mesa
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </>
    )}
  </Grid>
)}

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
            </Alert>
          )}

        {/* Historial */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {pastReservations.length === 0 ? (
              <Grid item xs={12}>
                <Card
                  sx={{
                    border: '2px solid rgba(0, 255, 255, 0.3)',
                    background: 'rgba(0, 255, 255, 0.05)'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <EventSeat sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant='h6' color='text.secondary'>
                      No tienes reservas pasadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              pastReservations.map(reservation => (
                <Grid item xs={12} md={6} key={reservation.id}>
                  <Card
                    sx={{
                      border: '1px solid rgba(0, 255, 255, 0.2)',
                      opacity: 0.8
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          mb: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SportsEsports sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant='h6' sx={{ fontWeight: 600 }}>
                            {reservation.videogameTitle}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(reservation.status)}
                          color={getStatusColor(reservation.status) as any}
                          size='small'
                        />
                      </Box>

                      <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                        📅 {reservation.reservationDate}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        ⏰ {reservation.startTime} - {reservation.endTime}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
        {/* Todas las Reservas (Solo Admin) */}
        {isAdmin && tabValue === 2 && (
          <Grid container spacing={3}>
            {allReservations.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <EventSeat sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant='h6' color='text.secondary'>
                      No hay reservas en el sistema
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              allReservations.map(reservation => (
                <Grid item xs={12} md={6} key={reservation.id}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
                      >
                        <Typography variant='h6' sx={{ fontWeight: 700 }}>
                          {reservation.videogameTitle}
                        </Typography>
                        <Chip
                          label={getStatusLabel(reservation.status)}
                          color={getStatusColor(reservation.status) as any}
                          size='small'
                        />
                      </Box>

                      <Typography variant='body2' sx={{ mb: 1 }}>
                        👤 Usuario: <strong>{reservation.username}</strong>
                      </Typography>

                      <Typography variant='body2'>
                        📅 {reservation.reservationDate}
                      </Typography>

                      <Typography variant='body2'>
                        ⏰ {reservation.startTime} - {reservation.endTime}
                      </Typography>

                      {reservation.status === 'Active' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          onClick={() => handleConfirmReservation(reservation.id)}
                        >
                          Confirmar Reserva
                          </Button>
                        <Button
                          fullWidth
                          variant='outlined'
                          color='error'
                          startIcon={<Cancel />}
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          Cancelar Reserva
                        </Button>
                        </Box>
                      )}
                      {reservation.status === 'Confirmed' && (
                        <Chip
                        label="Confirmada"
                        color="success"
                        icon={<CheckCircle />}
                        sx={{ width: '100%' }}
                        />
                        )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </Layout>
  )
}
