import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material'
import { Add, Edit, Delete, TableRestaurant } from '@mui/icons-material'
import Layout from '../../components/Dashboard/Layout'
import axiosInstance from '../../api/axiosConfig'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useNotification } from '../../utils/useNotification'

interface Table {
  id: number
  number: number
  capacity: number
  description?: string
  isActive: boolean
}

export default function AdminTablesPage() {
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<Table[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [error, setError] = useState('')
  const { showSuccess, showError } = useNotification()
  const [formData, setFormData] = useState({
    number: 0,
    capacity: 2,
    description: ''
  })

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/Tables')
      setTables(response.data)
    } catch (err) {
      setError('Error al cargar mesas')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditMode(true)
      setSelectedTable(table)
      setFormData({
        number: table.number,
        capacity: table.capacity,
        description: table.description || ''
      })
    } else {
      setEditMode(false)
      setSelectedTable(null)
      setFormData({
        number: 0,
        capacity: 2,
        description: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditMode(false)
    setSelectedTable(null)
  }

  const handleSubmit = async () => {
    try {
      if (editMode && selectedTable) {
        await axiosInstance.put(`/Tables/${selectedTable.id}`, formData)
        showSuccess('Mesa actualizada exitosamente')
      } else {
        await axiosInstance.post('/Tables', formData)
        showSuccess('Mesa creada exitosamente')
      }
      handleCloseDialog()
      loadTables()
    } catch (err: any) {
      showError(err.response?.data?.message || 'Error al guardar la mesa')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta mesa?')) return

    try {
      await axiosInstance.delete(`/Tables/${id}`)
      showSuccess('Mesa eliminada exitosamente')
      loadTables()
    } catch (err) {
      showError('Error al eliminar la mesa')
    }
  }

  const handleToggleActive = async (table: Table) => {
    try {
      await axiosInstance.put(`/Tables/${table.id}`, {
        isActive: !table.isActive
      })
      showSuccess(`Mesa ${!table.isActive ? 'activada' : 'desactivada'} exitosamente`)
      loadTables()
    } catch (err) {
      showError('Error al cambiar el estado de la mesa')
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message='Cargando mesas...' />
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth='lg'>
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
              Gestión de Mesas 🪑
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Administra las mesas disponibles para reservas
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size='large'
          >
            Agregar Mesa
          </Button>
        </Box>

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {tables.map(table => (
            <Grid item xs={12} sm={6} md={4} key={table.id}>
              <Card
                sx={{
                  border: '2px solid rgba(0, 255, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                  opacity: table.isActive ? 1 : 0.6
                }}
              >
                <Box
                  sx={{
                    height: 150,
                    background:
                      'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TableRestaurant sx={{ fontSize: 80, color: 'primary.main' }} />
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
                    <Typography variant='h5' sx={{ fontWeight: 700 }}>
                      Mesa #{table.number}
                    </Typography>
                    <Chip
                      label={table.isActive ? 'Activa' : 'Inactiva'}
                      size='small'
                      color={table.isActive ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
                    👥 Capacidad: {table.capacity} personas
                  </Typography>
                  {table.description && (
                    <Typography variant='body2' color='text.secondary'>
                      📝 {table.description}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button size='small' onClick={() => handleToggleActive(table)}>
                    {table.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Box>
                    <IconButton color='primary' onClick={() => handleOpenDialog(table)}>
                      <Edit />
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDelete(table.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog para crear/editar */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
          <DialogTitle>{editMode ? 'Editar Mesa' : 'Agregar Mesa'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type='number'
                  label='Número de Mesa'
                  value={formData.number}
                  onChange={e =>
                    setFormData({ ...formData, number: parseInt(e.target.value) })
                  }
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type='number'
                  label='Capacidad (personas)'
                  value={formData.capacity}
                  onChange={e =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) })
                  }
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Descripción (opcional)'
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Ej: Mesa cerca de la ventana, Mesa VIP...'
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={!formData.number || !formData.capacity}
            >
              {editMode ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}
