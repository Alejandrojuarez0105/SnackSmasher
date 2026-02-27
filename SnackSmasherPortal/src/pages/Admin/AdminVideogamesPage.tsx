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
  Chip,
  CircularProgress
} from '@mui/material'
import { Add, Edit, Delete, SportsEsports } from '@mui/icons-material'
import Layout from '../../components/Dashboard/Layout'
import axiosInstance from '../../api/axiosConfig'

interface Videogame {
  id: number
  title: string
  description?: string
  genre: string
  platform: string
  isMultiplayer: boolean
  totalCopies: number
  availableCopies: number
  maxSessionMinutes: number
  imageUrl?: string
  isAvailable: boolean
}

export default function AdminVideogamesPage() {
  const [loading, setLoading] = useState(true)
  const [videogames, setVideogames] = useState<Videogame[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Videogame | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    platform: '',
    isMultiplayer: false,
    totalCopies: 1,
    maxSessionMinutes: 60,
    imageUrl: ''
  })

  useEffect(() => {
    loadVideogames()
  }, [])

  const loadVideogames = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/Videogames')
      setVideogames(response.data)
    } catch (err) {
      setError('Error al cargar videojuegos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (game?: Videogame) => {
    if (game) {
      setEditMode(true)
      setSelectedGame(game)
      setFormData({
        title: game.title,
        description: game.description || '',
        genre: game.genre,
        platform: game.platform,
        isMultiplayer: game.isMultiplayer,
        totalCopies: game.totalCopies,
        maxSessionMinutes: game.maxSessionMinutes,
        imageUrl: game.imageUrl || ''
      })
    } else {
      setEditMode(false)
      setSelectedGame(null)
      setFormData({
        title: '',
        description: '',
        genre: '',
        platform: '',
        isMultiplayer: false,
        totalCopies: 1,
        maxSessionMinutes: 60,
        imageUrl: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditMode(false)
    setSelectedGame(null)
  }

  const handleSubmit = async () => {
    try {
      // Validar URL de imagen si existe
      if (formData.imageUrl && formData.imageUrl.trim()) {
        try {
          new URL(formData.imageUrl); // Verifica que sea una URL válida
          } catch {
            setError('La URL de la imagen no es válida');
            return;
          }
        }
        
        if (editMode && selectedGame) {
          await axiosInstance.put(`/Videogames/${selectedGame.id}`, formData)
          setSuccess('Videojuego actualizado exitosamente')
        } else {
          await axiosInstance.post('/Videogames', formData)
          setSuccess('Videojuego creado exitosamente')
        }
        handleCloseDialog()
        loadVideogames()
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al guardar el videojuego')
      }
    }
    
    const handleDelete = async (id: number) => {
      if (!window.confirm('¿Estás seguro de eliminar este videojuego?')) return
      try {
        await axiosInstance.delete(`/Videogames/${id}`)
        setSuccess('Videojuego eliminado exitosamente')
        loadVideogames()
      } catch (err) {
        setError('Error al eliminar el videojuego')
      }
    }
    
    if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
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
              Gestión de Videojuegos 🎮
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Administra el catálogo de videojuegos
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size='large'
          >
            Agregar Videojuego
          </Button>
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

        <Grid container spacing={3}>
          {videogames.map(game => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <Card
                sx={{
                  border: '2px solid rgba(0, 255, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
                }}
              >
                <Box
                  sx={{
                    height: 150,
                    background: game.imageUrl
                      ? `url(${game.imageUrl}) center/cover`
                      : 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!game.imageUrl && (
                    <SportsEsports sx={{ fontSize: 60, color: 'primary.main' }} />
                  )}
                </Box>
                <CardContent>
                  <Typography variant='h6' gutterBottom sx={{ fontWeight: 700 }}>
                    {game.title}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip label={game.genre} size='small' sx={{ mr: 1 }} />
                    <Chip label={game.platform} size='small' />
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    Copias: {game.totalCopies} | Disponibles: {game.availableCopies}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Duración máxima: {game.maxSessionMinutes} min
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <IconButton color='primary' onClick={() => handleOpenDialog(game)}>
                    <Edit />
                  </IconButton>
                  <IconButton color='error' onClick={() => handleDelete(game.id)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog para crear/editar */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='md' fullWidth>
          <DialogTitle>
            {editMode ? 'Editar Videojuego' : 'Agregar Videojuego'}
          </DialogTitle>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Género'
                  value={formData.genre}
                  onChange={e => setFormData({ ...formData, genre: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label='Plataforma'
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                  SelectProps={{ native: true }}
                  required
                >
                  <option value=''>Seleccionar</option>
                  <option value='PS5'>PS5</option>
                  <option value='Xbox Series X'>Xbox Series X</option>
                  <option value='Nintendo Switch'>Nintendo Switch</option>
                  <option value='PC'>PC</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='number'
                  label='Total de Copias'
                  value={formData.totalCopies}
                  onChange={e =>
                    setFormData({ ...formData, totalCopies: parseInt(e.target.value) })
                  }
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='number'
                  label='Duración Máxima (minutos)'
                  value={formData.maxSessionMinutes}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      maxSessionMinutes: parseInt(e.target.value)
                    })
                  }
                  required
                  inputProps={{ min: 15 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='URL de Imagen'
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder='https://ejemplo.com/imagen.jpg'
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type='checkbox'
                    checked={formData.isMultiplayer}
                    onChange={e =>
                      setFormData({ ...formData, isMultiplayer: e.target.checked })
                    }
                    style={{ marginRight: 8 }}
                  />
                  <Typography>Es multijugador</Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={!formData.title || !formData.genre || !formData.platform}
            >
              {editMode ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}
