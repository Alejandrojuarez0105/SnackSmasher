import { Add, Delete, Edit, SportsEsports } from '@mui/icons-material'
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
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosConfig'
import Layout from '../../components/Dashboard/Layout'
import ImageUploader from '../../components/ImageUploader'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useNotification } from '../../utils/useNotification'

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
  const { showSuccess, showError } = useNotification()
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
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
        if (editMode && selectedGame) {
          await axiosInstance.put(`/Videogames/${selectedGame.id}`, formData)
          showSuccess('Videojuego actualizado exitosamente')
        } else {
          await axiosInstance.post('/Videogames', formData)
          showSuccess('Videojuego creado exitosamente')
        }
        handleCloseDialog()
        loadVideogames()
      } catch (err: any) {
        showError(err.response?.data?.message || 'Error al guardar el videojuego')
      }
    }
    
    const handleDelete = async (id: number) => {
      if (!window.confirm('¿Estás seguro de eliminar este videojuego?')) return
      try {
        await axiosInstance.delete(`/Videogames/${id}`)
        showSuccess('Videojuego eliminado exitosamente')
        loadVideogames()
      } catch (err) {
        showError('Error al eliminar el videojuego')
      }
    }
    
    const handleToggleActive = async (game: Videogame) => {
      try {
        await axiosInstance.put(`/Videogames/${game.id}`, {
          ...game,
          isAvailable: !game.isAvailable,
        });
        showSuccess(`Videojuego ${!game.isAvailable ? 'activado' : 'desactivado'} exitosamente`)
        loadVideogames()
      } catch (err) {
        showError('Error al actualizar la disponibilidad del videojuego')
      }
    };

    const filteredVideogames = videogames.filter(game => {
      const matchesGenre = selectedGenre == 'all' || game.genre === selectedGenre
      const matchesPlatform = selectedPlatform == 'all' || game.platform === selectedPlatform
      const matchesSearch = 
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.description || '').toLowerCase().includes(searchTerm.toLowerCase())

      return matchesGenre && matchesPlatform && matchesSearch
    })

    const genres = Array.from(new Set(videogames.map(g => g.genre))).sort()
    const platforms = Array.from(new Set(videogames.map(g => g.platform))).sort()

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

        {/* Barra de búsqueda y filtros */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
              fullWidth
              label='Buscar juego'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Buscar por título...'
              InputProps={{
                  startAdornment: (
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
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
            >
                <MenuItem value='all'>
                <em>Todos los géneros</em>
              </MenuItem>
              {genres.map(genre => (
                  <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
            ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <TextField
              fullWidth
              select
              label='Plataforma'
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
            >
                <MenuItem value='all'>
                <em>Todas las plataformas</em>
              </MenuItem>
              {platforms.map(platform => (
                  <MenuItem key={platform} value={platform}>
                  {platform}
                </MenuItem>
            ))}
            </TextField>
          </Grid>
        </Grid>

            {/* Resultados y botón de limpiar filtros */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Typography variant='body1' color='text.secondary'>
                Mostrando {filteredVideogames.length} de {videogames.length} juegos
              </Typography>
              {(searchTerm || selectedGenre !== 'all' || selectedPlatform !== 'all') && (
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedGenre('all')
                    setSelectedPlatform('all')
                  }}
                >
                Limpiar Filtros
              </Button>
              )}
            </Box>

        <Grid container spacing={3}>
          {filteredVideogames.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ border: '2px solid rgba(0, 255, 255, 0.3)' }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <SportsEsports sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant='h6' color='text.secondary'>
                    No se encontraron videojuegos
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Intenta ajustar tus filtros o agrega nuevos videojuegos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {filteredVideogames.map(game => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid rgba(0, 255, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                opacity: game.isAvailable ? 1 : 0.6,
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
                  <Box
                  sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      mb: 2

                  }}
                >
                  <Typography variant='h6' gutterBottom sx={{ fontWeight: 700 }}>
                    {game.title}
                  </Typography>
                  <Chip
                    label={game.isAvailable ? 'Activo' : 'Inactivo'}
                    size='small'
                    color={game.isAvailable ? 'success' : 'default'}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Chip label={game.genre} size='small' sx={{ mr: 1 }} />
                  <Chip label={game.platform} size='small' />
                </Box>
                <Typography variant='body2' color='text.secondary'>
                    Copias: {game.totalCopies} | Disponibles: {game.availableCopies}
                  </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    Duración máxima: {game.maxSessionMinutes} min
                </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button size='small' onClick={() => handleToggleActive(game)}>
                      {game.isAvailable ? 'Desactivar' : 'Activar'}
                    </Button>
                  <Box>
                      <IconButton color='primary' onClick={() => handleOpenDialog(game)}>
                        <Edit />
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDelete(game.id)}>
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
                <ImageUploader
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url})}
                  label='Imagen del videojuego'
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
      </Box>
    </Layout>
  )
}
