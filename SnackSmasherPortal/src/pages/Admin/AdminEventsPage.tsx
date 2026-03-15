import { Add, Delete, Edit, Event as EventIcon } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosConfig'
import Layout from '../../components/Dashboard/Layout'
import ImageUploader from '../../components/ImageUploader'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useNotification } from '../../utils/useNotification'

interface Event {
  id: number
  title: string
  description?: string
  eventDate: string
  startTime: string
  endTime?: string
  imageUrl?: string
  isActive: boolean
}

export default function AdminEventsPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [error, setError] = useState('')
  const { showSuccess, showError } = useNotification()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    imageUrl: ''
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/Events')
      setEvents(response.data)
    } catch (err) {
      setError('Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditMode(true)
      setSelectedEvent(event)
      setFormData({
        title: event.title,
        description: event.description || '',
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime || '',
        imageUrl: event.imageUrl || ''
      })
    } else {
      setEditMode(false)
      setSelectedEvent(null)
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        imageUrl: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditMode(false)
    setSelectedEvent(null)
  }

  const handleSubmit = async () => {
    try {
      if (editMode && selectedEvent) {
        await axiosInstance.put(`/Events/${selectedEvent.id}`, formData)
        showSuccess('Evento actualizado exitosamente')
      } else {
        await axiosInstance.post('/Events', formData)
        showSuccess('Evento creado exitosamente')
      }
      handleCloseDialog()
      loadEvents()
    } catch (err: any) {
      showError(err.response?.data?.message || 'Error al guardar el evento')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return

    try {
      await axiosInstance.delete(`/Events/${id}`)
      showSuccess('Evento eliminado exitosamente')
      loadEvents()
    } catch (err) {
      showError('Error al eliminar el evento')
    }
  }

  const handleToggleActive = async (event: Event) => {
    try {
      await axiosInstance.put(`/Events/${event.id}`, {
        isActive: !event.isActive
      })
      showSuccess(`Evento ${!event.isActive ? 'activado' : 'desactivado'} exitosamente`)
      loadEvents()
    } catch (err) {
      showError('Error al cambiar el estado del evento')
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message='Cargando eventos...' />
      </Layout>
    )
  }

  return (
    <Layout>
      <Box>
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography
              variant='h4'
              className='neon-text'
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Gestión de Eventos 🎉
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Administra eventos, torneos y transmisiones
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size='large'
          >
            Agregar Evento
          </Button>
        </Box>

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {events.map(event => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card
                sx={{
                  border: '2px solid rgba(0, 255, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                  opacity: event.isActive ? 1 : 0.6
                }}
              >
                <Box
                  sx={{
                    height: 150,
                    background: event.imageUrl
                      ? `url(${event.imageUrl}) center/cover`
                      : 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!event.imageUrl && (
                    <EventIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                  )}
                </Box>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      mb: 2
                    }}
                  >
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                      {event.title}
                    </Typography>
                    <Chip
                      label={event.isActive ? 'Activo' : 'Inactivo'}
                      size='small'
                      color={event.isActive ? 'success' : 'default'}
                    />
                  </Box>
                  {event.description && (
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                      {event.description}
                    </Typography>
                  )}
                  <Typography variant='body2' color='text.secondary'>
                    📅 {new Date(event.eventDate).toLocaleDateString('es-ES')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    ⏰ {event.startTime} {event.endTime && `- ${event.endTime}`}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button size='small' onClick={() => handleToggleActive(event)}>
                    {event.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Box>
                    <IconButton color='primary' onClick={() => handleOpenDialog(event)}>
                      <Edit />
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDelete(event.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog para crear/editar */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='md' fullWidth>
          <DialogTitle>{editMode ? 'Editar Evento' : 'Agregar Evento'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Título'
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Descripción'
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type='date'
                  label='Fecha del Evento'
                  value={formData.eventDate}
                  onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='time'
                  label='Hora de Inicio'
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='time'
                  label='Hora de Fin (opcional)'
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <ImageUploader
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url})}
                  label='Imagen del evento'
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={!formData.title || !formData.eventDate || !formData.startTime}
            >
              {editMode ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}
