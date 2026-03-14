import {
  AdminPanelSettings,
  Cancel,
  CheckCircle,
  EventSeat,
  SportsEsports
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Tab,
  Tabs,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosConfig'
import { GameReservationDto, gameReservationsAPI } from '../api/gameReservations'
import Layout from '../components/Dashboard/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../utils/useNotification'

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
  linkedGameReservationId?: number;
  linkedVideogameTitle?: string;
}

export default function ReservationsPage() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const { showSuccess, showError } = useNotification()
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [gameReservations, setGameReservations] = useState<GameReservationDto[]>([])
  const [allReservations, setAllReservations] = useState<GameReservationDto[]>([])
  const [tableReservations, setTableReservations] = useState<TableReservationDto[]>([])
  const [allTableReservations, setAllTableReservations] = useState<TableReservationDto[]>([])
  const [adminFilter, setAdminFilter] = useState<string>('all')

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

        const allTableData = await axiosInstance.get('/TableReservations')
        setAllTableReservations(allTableData.data)
      }

      const gameData = await gameReservationsAPI.getByUser(user.id)
      console.log('🎮 DEBUG - Reservas de juegos RAW:', gameData)
      setGameReservations(gameData)
      const tableData = await axiosInstance.get(`/TableReservations/user/${user.id}`)
      console.log('💺 DEBUG - Reservas de mesas RAW:', tableData.data)
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
      const reservation = gameReservations.find(r => r.id === id) || allReservations.find(r => r.id === id)
      await gameReservationsAPI.cancel(id)

      if (reservation?.linkedTableReservationId) {
        await axiosInstance.put(`/TableReservations/${reservation.linkedTableReservationId}`, { 
          Status: 'Cancelled' 
        })
      }

      showSuccess('Reserva cancelada exitosamente')
      loadReservations()
    } catch (err: any) {
      showError('Error al cancelar la reserva')
    }
  }

  const handleConfirmReservation = async (id: number) => {
    try {
      const reservation = allReservations.find(r => r.id === id)

      await axiosInstance.put(`/GameReservations/${id}/confirm`);

      if (reservation?.linkedTableReservationId) {
        await axiosInstance.put(`/TableReservations/${reservation.linkedTableReservationId}`, { 
          Status: 'Confirmed' 
        })
      }

      showSuccess('Reserva confirmada exitosamente');
      loadReservations();
    } catch (err) {
      showError('Error al confirmar la reserva');
    }
  }

  const handleConfirmTableReservation = async (id: number) => {
    try {
      await axiosInstance.put(`/TableReservations/${id}`, { Status: 'Confirmed' });
      showSuccess('Reserva de mesa confirmada exitosamente');
      loadReservations();
    } catch (err) {
      showError('Error al confirmar la reserva de mesa');
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
  
  // FILTRADO DE RESERVAS (Activas, Pasadas, Combinadas)
  // 1. Filtrar por estado
  const activeGameReservations = gameReservations.filter(r => r.status === 'Active')
  const pastGameReservations = gameReservations.filter(r => r.status === 'Completed' || r.status === 'Cancelled')
  const activeTableReservationsAll = tableReservations.filter(r => r.status === 'Active')
  const pastTableReservationsAll = tableReservations.filter(r => r.status === 'Completed' || r.status === 'Cancelled')
  
  // 2. Para cálculo de totales (para los Tabs)
  const activeReservations = activeGameReservations
  const activeTableReservations = activeTableReservationsAll
  const pastReservations = pastGameReservations
  const pastTableReservations = pastTableReservationsAll
  
  // 3. Filtrar para el admin PRIMERO (antes de separar combinadas)
  const filteredAdminGameReservations = adminFilter === 'all'
  ? allReservations
  : allReservations.filter(r => {
      if (adminFilter === 'active') return r.status === 'Active';
      if (adminFilter === 'confirmed') return r.status === 'Confirmed';
      if (adminFilter === 'completed') return r.status === 'Completed';
      if (adminFilter === 'cancelled') return r.status === 'Cancelled';
      return true;
    })
    
  const filteredAdminTableReservations = adminFilter === 'all'
  ? allTableReservations
  : allTableReservations.filter((r: any) => {
      if (adminFilter === 'active') return r.status === 'Active';
      if (adminFilter === 'confirmed') return r.status === 'Confirmed';
      if (adminFilter === 'completed') return r.status === 'Completed';
      if (adminFilter === 'cancelled') return r.status === 'Cancelled';
      return true;
    })
    
  // 4. Separar en: SOLO juegos, SOLO mesas, y COMBINADAS (para usuario)
  const activeGameOnly = activeGameReservations.filter(r => !r.linkedTableReservationId)
  const activeCombined = activeGameReservations.filter(r => r.linkedTableReservationId)

  // Obtener IDs de mesas vinculadas a juegos combinados
  const linkedTableIds = activeCombined
  .map(r => r.linkedTableReservationId)
  .filter(id => id !== null) as number[]

  const activeTableOnly = activeTableReservationsAll.filter(
    r => !r.linkedGameReservationId && !linkedTableIds.includes(r.id)
  )
  console.log('🔍 DEBUG - Reservas combinadas:', activeCombined)
  console.log('🔍 DEBUG - Mesas activas ALL:', activeTableReservationsAll)
  console.log('🔍 DEBUG - Mesas solo (sin combinadas):', activeTableOnly)
  
  const pastGameOnly = pastGameReservations.filter(r => !r.linkedTableReservationId)
  const pastCombined = pastGameReservations.filter(r => r.linkedTableReservationId)

  //Excluir del historial las mesas vinculadas
  const linkedPastTableIds = pastCombined
  .map(r => r.linkedTableReservationId)
  .filter(id => id !== null) as number[]

  const pastTableOnly = pastTableReservationsAll.filter(
    r => !r.linkedGameReservationId && !linkedPastTableIds.includes(r.id)
  )
  
  
  // 5. Separar en: SOLO juegos, SOLO mesas, y COMBINADAS (para admin)
  const filteredAdminGameOnly = filteredAdminGameReservations.filter(r => !r.linkedTableReservationId)
  const filteredAdminCombined = filteredAdminGameReservations.filter(r => r.linkedTableReservationId)

  const filteredAdminLinkedTableIds = filteredAdminCombined
  .map(r => r.linkedTableReservationId)
  .filter(id => id !== null) as number[]
  const filteredAdminTableOnly = filteredAdminTableReservations.filter(
    r => !r.linkedGameReservationId && !filteredAdminLinkedTableIds.includes(r.id)
  )
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Confirmed':
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
      case 'Confirmed':
        return 'Confirmada'
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
              label={`Mis Reservas Activas (${activeGameOnly.length + activeTableOnly.length + activeCombined.length})`}
              iconPosition='start'
            />
            <Tab
              icon={<EventSeat />}
              label={`Mi Historial (${pastGameOnly.length + pastTableOnly.length + pastCombined.length})`}
              iconPosition='start'
            />
            {isAdmin && (
              <Tab
                icon={<AdminPanelSettings />}
                label={`Todas las Reservas (${filteredAdminGameOnly.length + filteredAdminTableOnly.length + filteredAdminCombined.length})`}
                iconPosition='start'
              />
            )}
          </Tabs>
        </Box>

       {/* Reservas Activas */}
       {tabValue === 0 && (
        <Grid container spacing={3}>
          {activeGameOnly.length === 0 && activeTableOnly.length === 0 && activeCombined.length === 0 ? (
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
            {/* Reservas SOLA de Juegos */}
            {activeGameOnly.map(reservation => (
              <Grid item xs={12} md={6} key={`game-only-${reservation.id}`}>
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

        {/* Reservas SOLO de Mesas */}
        {activeTableOnly.map((reservation: TableReservationDto) => (
          <Grid item xs={12} md={6} key={`table-only-${reservation.id}`}>
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
        {/* Reservas COMBINADAS */}
        {activeCombined.map(reservation => {
          const linkedTable = activeTableReservationsAll.find(t => t.id === reservation.linkedTableReservationId)

          return (
            <Grid item xs={12} md={6} key={`combined-${reservation.id}`}>
              <Card
                sx={{
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, rgba(0, 255, 255, 0.5), rgba(255, 0, 255, 0.5)) 1',
                  boxShadow: '0 0 25px rgba(128, 128, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 35px rgba(128, 128, 255, 0.4)'
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SportsEsports sx={{ color: 'primary.main' }} />
                      <EventSeat sx={{ color: 'secondary.main' }} />
                      <Typography variant='h6' sx={{ fontWeight: 700 }}>
                        Reserva combinada
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusLabel(reservation.status)}
                      color={getStatusColor(reservation.status) as any}
                      size='small'
                      icon={<CheckCircle />}
                    />
                  </Box>

                  {/* Informacion del juego */}
                  <Box
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 1,
                      background: 'rgba(0, 255, 255, 0.1)',
                      border: '1px solid rgba(0, 255, 255, 0.3)'
                    }}
                  >

                  <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    🎮 Videojuego
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {reservation.videogameTitle}
                  </Typography>
                  </Box>

                  {/* Informacion de la mesa */}
                  {linkedTable && (
                    <Box
                      sx={{
                        mb: 2,
                        p: 1.5,
                        borderRadius: 1,
                        background: 'rgba(255, 0, 255, 0.1)',
                        border: '1px solid rgba(255, 0, 255, 0.3)'
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{ fontWeight: 600, color: 'secondary.main', mb: 1 }}
                      >
                        🪑 Mesa
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Mesa #{linkedTable.tableNumber} • {linkedTable.guestCount} personas
                      </Typography>
                    </Box>
                  )}

                  {/* Horario */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                      📅 Fecha: {reservation.reservationDate}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      ⏰ Horario: {reservation.startTime} - {reservation.endTime}
                    </Typography>
                  </Box>
                  <Button
                  fullWidth
                  variant='outlined'
                  color='error'
                  startIcon={<Cancel />}
                  onClick={() => handleCancelReservation(reservation.id)}
                  >
                    Cancelar Reserva Combinada
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
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
            {pastReservations.length === 0 && pastTableReservations.length === 0 ? (
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
              <>
              {/* Historial de Juegos */}
              {pastReservations.map(reservation => (
                <Grid item xs={12} md={6} key={`game-past-${reservation.id}`}>
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
              ))}
              {/* Historial de Mesas */}
              {pastTableReservations.map((reservation: TableReservationDto) => (
                <Grid item xs={12} md={6} key={`table-past-${reservation.id}`}>
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
                          <EventSeat sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant='h6' sx={{ fontWeight: 600 }}>
                            Mesa #{reservation.tableNumber}
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
                      <Typography variant='body2' color='text.secondary'>
                        👥 {reservation.guestCount} personas
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </>
            )}
          </Grid>
        )}
        {/* Filtros para Admin */}
        {isAdmin && tabValue === 2 && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant={adminFilter === 'all' ? 'contained' : 'outlined'}
              size='small'
              onClick={() => setAdminFilter('all')}
            >
              Todas ({filteredAdminGameOnly.length + filteredAdminTableOnly.length + filteredAdminCombined.length})
            </Button>
            <Button
              variant={adminFilter === 'active' ? 'contained' : 'outlined'}
              size='small'
              color='warning'
              onClick={() => setAdminFilter('active')}
            >
              Activas ({
              allReservations.filter(r => r.status === 'Active' && !r.linkedTableReservationId).length + 
              allTableReservations.filter((r: any) => r.status === 'Active' && !r.linkedGameReservationId && !allReservations.some(gr => gr.linkedTableReservationId === r.id)).length +
              allReservations.filter(r => r.status === 'Active' && r.linkedTableReservationId).length
              })
            </Button>

            <Button
              variant={adminFilter === 'confirmed' ? 'contained' : 'outlined'}
              size='small'
              color='success'
              onClick={() => setAdminFilter('confirmed')}
            >
              Confirmadas ({
              allReservations.filter(r => r.status === 'Confirmed' && !r.linkedTableReservationId).length + 
              allTableReservations.filter((r: any) => r.status === 'Confirmed' && !r.linkedGameReservationId && !allReservations.some(gr => gr.linkedTableReservationId === r.id)).length +
              allReservations.filter(r => r.status === 'Confirmed' && r.linkedTableReservationId).length
              })
            </Button>
            <Button
              variant={adminFilter === 'completed' ? 'contained' : 'outlined'}
              size='small'
              color='info'
              onClick={() => setAdminFilter('completed')}
            >
              Completadas ({
              allReservations.filter(r => r.status === 'Completed' && !r.linkedTableReservationId).length +
              allTableReservations.filter((r: any) => r.status === 'Completed' && !r.linkedGameReservationId && !allReservations.some(gr => gr.linkedTableReservationId === r.id)).length +
              allReservations.filter(r => r.status === 'Completed' && r.linkedTableReservationId).length
              })
            </Button>
            <Button
              variant={adminFilter === 'cancelled' ? 'contained' : 'outlined'}
              size='small'
              color='error'
              onClick={() => setAdminFilter('cancelled')}
            >
              Canceladas ({
              allReservations.filter(r => r.status === 'Cancelled' && !r.linkedTableReservationId).length + 
              allTableReservations.filter((r: any) => r.status === 'Cancelled' && !r.linkedGameReservationId && !allReservations.some(gr => gr.linkedTableReservationId === r.id)).length +
              allReservations.filter(r => r.status === 'Cancelled' && r.linkedTableReservationId).length
              })
            </Button>
          </Box>
        )}
        {/* Todas las Reservas (Solo Admin) */}
        {isAdmin && tabValue === 2 && (
          <Grid container spacing={3}>
            {filteredAdminGameOnly.length === 0 && filteredAdminTableOnly.length === 0 && filteredAdminCombined.length === 0 ? (
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
              <>
              {/* Reservas de Juegos */}
              { filteredAdminGameOnly.map(reservation => (
                <Grid item xs={12} md={6} key={`admin-game-${reservation.id}`}>
                  <Card
                  sx={{
                    border: '2px solid rgba(0, 255, 255, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                  }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
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
                        {reservation.status === 'Completed' && (
                          <Chip
                          label="Completada"
                          color="info"
                          sx={{ width: '100%' }}
                          />
                        )}

                        {reservation.status === 'Cancelled' && (
                          <Chip
                          label="Cancelada"
                          color="error"
                          sx={{ width: '100%' }}
                          />
                        )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {/* Reservas de Mesas */}
              {filteredAdminTableOnly.map((reservation: TableReservationDto) => (
                <Grid item xs={12} md={6} key={`admin-table-${reservation.id}`}>
                  <Card
                  sx={{border: '2px solid rgba(255, 0, 255, 0.3)',
                    boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)',
                  }}
                  >
                    <CardContent>
                      <Box
                      sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
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
                        
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        👤 Usuario: <strong>{reservation.username}</strong>
                      </Typography>
                      
                      <Typography variant='body2'>
                        📅 {reservation.reservationDate}
                      </Typography>
                      
                      <Typography variant='body2'>
                        ⏰ {reservation.startTime} - {reservation.endTime}
                      </Typography>
                      
                      <Typography variant='body2' sx={{ mb: 2 }}>
                        👥 Invitados: {reservation.guestCount}
                      </Typography>
                      
                      {reservation.status === 'Active' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          onClick={() => handleConfirmTableReservation(reservation.id)}
                        >
                          Confirmar reserva
                          </Button>
                          <Button
                          fullWidth
                          variant='outlined'
                          color='error'
                          startIcon={<Cancel />}
                          onClick={() => handleCancelTableReservation(reservation.id)}
                          >
                            Cancelar reserva
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
                
                {reservation.status === 'Completed' && (
                  <Chip
                    label="Completada"
                    color="info"
                    sx={{ width: '100%' }}
                  />
                )}

                {reservation.status === 'Cancelled' && (
                  <Chip
                    label="Cancelada"
                    color="error"
                    sx={{ width: '100%' }}
                  />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {/* Reservas COMBINADAS (Admin) */}
          {filteredAdminCombined.map(reservation => {
            const linkedTable = allTableReservations.find(t => t.id === reservation.linkedTableReservationId);
            
            return (
              <Grid item xs={12} md={6} key={`admin-combined-${reservation.id}`}>
                <Card
                  sx={{
                    border: '2px solid',
                    borderImage: 'linear-gradient(135deg, rgba(0, 255, 255, 0.5), rgba(255, 0, 255, 0.5)) 1',
                    boxShadow: '0 0 25px rgba(128, 128, 255, 0.3)',
                  }}
                >
                  <CardContent>
                    {/* Header con ambos iconos */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        mb: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SportsEsports sx={{ color: 'primary.main' }} />
                        <EventSeat sx={{ color: 'secondary.main' }} />
                        <Typography variant='h6' sx={{ fontWeight: 700 }}>
                          Reserva Combinada
                        </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(reservation.status)}
                          color={getStatusColor(reservation.status) as any}
                          size='small'
                        />
                      </Box>
                      
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        👤 Usuario: <strong>{reservation.username}</strong>
                      </Typography>
                      
                      {/* Información del Juego */}
                      <Box
                        sx={{
                          p: 1.5,
                          mb: 2,
                          borderRadius: 1,
                          background: 'rgba(0, 255, 255, 0.1)',
                          border: '1px solid rgba(0, 255, 255, 0.3)'
                        }}
                      >
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                          🎮 Videojuego
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {reservation.videogameTitle}
                        </Typography>
                      </Box>
                      
                      {/* Información de la Mesa */}
                      {linkedTable && (
                        <Box
                          sx={{
                            p: 1.5,
                            mb: 2,
                            borderRadius: 1,
                            background: 'rgba(255, 0, 255, 0.1)',
                            border: '1px solid rgba(255, 0, 255, 0.3)'
                          }}
                        >
                          <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'secondary.main', mb: 1 }}>
                            🪑 Mesa
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Mesa #{linkedTable.tableNumber} • {linkedTable.guestCount} personas
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography variant='body2'>
                        📅 {reservation.reservationDate}
                      </Typography>
                      
                      <Typography variant='body2' sx={{ mb: 2 }}>
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
                            Confirmar
                            </Button>
                            <Button
                              fullWidth
                              variant='outlined'
                              color='error'
                              startIcon={<Cancel />}
                              onClick={() => handleCancelReservation(reservation.id)}
                            >
                              Cancelar
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
                        
                        {reservation.status === 'Completed' && (
                          <Chip
                            label="Completada"
                            color="info"
                            sx={{ width: '100%' }}
                          />
                        )}
                        
                        {reservation.status === 'Cancelled' && (
                          <Chip
                            label="Cancelada"
                            color="error"
                            sx={{ width: '100%' }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </>
          )}
        </Grid>
      )}
    </Box>
  </Layout>
  )
}
