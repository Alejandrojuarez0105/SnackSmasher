import { Event, EventSeat, SportsEsports, TrendingUp } from '@mui/icons-material'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosConfig'
import { eventsAPI } from '../api/events'
import { GameReservationDto, gameReservationsAPI } from '../api/gameReservations'
import { VideogameDto, videogamesAPI } from '../api/videogames'
import Layout from '../components/Dashboard/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topGames, setTopGames] = useState<VideogameDto[]>([])
  const [myReservations, setMyReservations] = useState<GameReservationDto[]>([])
  const [myTableReservations, setMyTableReservations] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [stats, setStats] = useState({
    totalGames: 0,
    activeReservations: 0,
    upcomingEvents: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [gamesData, topRatedData, gameReservationsData, tableReservationsData, eventsData] = await Promise.all([
        videogamesAPI.getAll(),
        videogamesAPI.getTopRated(5),
        user?.id ? gameReservationsAPI.getByUser(user.id) : Promise.resolve([]),
        user?.id ? axiosInstance.get(`/TableReservations/user/${user.id}`).then(res => res.data) : Promise.resolve([]),
        eventsAPI.getUpcoming()
      ])

      setTopGames(topRatedData)
      setMyReservations(gameReservationsData.filter((r: any) => r.status === 'Active').slice(0, 5));
      setMyTableReservations(tableReservationsData.filter((r: any) => r.status === 'Active').slice(0, 5));
      setUpcomingEvents(eventsData.slice(0, 3));

      const totalActiveReservations = 
      gameReservationsData.filter((r: any) => r.status === 'Active').length +
      tableReservationsData.filter((r: any) => r.status === 'Active').length;

      setStats({
        totalGames: gamesData.length,
        activeReservations: totalActiveReservations,
        upcomingEvents: eventsData.length
      })
    } catch (err: any) {
      setError('Error al cargar los datos del dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        border: `2px solid ${color}40`,
        boxShadow: `0 0 20px ${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 30px ${color}40`
        }
      }}
    >
      <CardContent>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {title}
            </Typography>
            <Typography variant='h3' sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              background: `${color}20`,
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              border: `2px solid ${color}40`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message='Cargando dashboard...' />
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
          Bienvenido, {user?.username}! 🎮
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          Tu centro de control para juegos, reservas y eventos
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title='Juegos Disponibles'
              value={stats.totalGames}
              icon={<SportsEsports sx={{ fontSize: 40, color: '#00ffff' }} />}
              color='#00ffff'
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title='Reservas Activas'
              value={stats.activeReservations}
              icon={<EventSeat sx={{ fontSize: 40, color: '#ff00ff' }} />}
              color='#ff00ff'
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title='Eventos Próximos'
              value={stats.upcomingEvents}
              icon={<Event sx={{ fontSize: 40, color: '#00ff88' }} />}
              color='#00ff88'
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Top juegos valorados */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                border: '2px solid rgba(0, 255, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Top Juegos Valorados
                  </Typography>
                </Box>
                {topGames.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No hay juegos valorados aún
                  </Typography>
                ) : (
                  topGames.map((game, index) => (
                    <Box
                      key={game.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        background: 'rgba(0, 255, 255, 0.05)',
                        border: '1px solid rgba(0, 255, 255, 0.2)',
                        '&:hover': {
                          background: 'rgba(0, 255, 255, 0.1)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography
                          variant='h6'
                          sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            minWidth: 30
                          }}
                        >
                          #{index + 1}
                        </Typography>
                        <Box>
                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                            {game.title}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {game.platform} • {game.genre}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`⭐ ${game.averageRating?.toFixed(1) || 'N/A'}`}
                        size='small'
                        sx={{
                          background: 'rgba(255, 170, 0, 0.2)',
                          border: '1px solid rgba(255, 170, 0, 0.4)',
                          color: '#ffaa00',
                          fontWeight: 700
                        }}
                      />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Mis reservas activas */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                border: '2px solid rgba(255, 0, 255, 0.3)',
                boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventSeat sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Mis Reservas Activas
                  </Typography>
                </Box>
                {myReservations.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No tienes reservas activas
                  </Typography>
                ) : (
                  myReservations.map(reservation => (
                    <Box
                      key={reservation.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        background: 'rgba(255, 0, 255, 0.05)',
                        border: '1px solid rgba(255, 0, 255, 0.2)',
                        '&:hover': {
                          background: 'rgba(255, 0, 255, 0.1)'
                        }
                      }}
                    >
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {reservation.videogameTitle}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        📅 {reservation.reservationDate} • ⏰ {reservation.startTime} -{' '}
                        {reservation.endTime}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Eventos Próximos */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                border: '2px solid rgba(0, 255, 0, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Event sx={{ mr: 1, color: '#00ff88' }} />
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Próximos Eventos
                  </Typography>
                </Box>
                {upcomingEvents.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No hay eventos próximos
                  </Typography>
                ) : (
                  upcomingEvents.map((event: any) => (
                    <Box
                      key={event.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        background: 'rgba(0, 255, 136, 0.05)',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        '&:hover': {
                          background: 'rgba(0, 255, 136, 0.1)'
                        }
                      }}
                    >
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        📅 {new Date(event.eventDate).toLocaleDateString('es-ES')} • ⏰{' '}
                        {event.startTime}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
}
