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
  Chip,
  Tabs,
  Tab,
  MenuItem
} from '@mui/material'
import { Add, Edit, Delete, Restaurant } from '@mui/icons-material'
import Layout from '../../components/Dashboard/Layout'
import axiosInstance from '../../api/axiosConfig'

interface MenuCategory {
  id: number
  name: string
  description?: string
}

interface MenuItem {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  categoryId: number
  categoryName: string
  isAvailable: boolean
}

export default function AdminMenuPage() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    categoryId: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, itemsRes] = await Promise.all([
        axiosInstance.get('/Menu/categories'),
        axiosInstance.get('/Menu/items')
      ])

      // Extraer solo las categorías sin items
      const cats = categoriesRes.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description
      }))

      setCategories(cats)
      setMenuItems(itemsRes.data)
    } catch (err) {
      setError('Error al cargar el menú')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditMode(true)
      setSelectedItem(item)
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        imageUrl: item.imageUrl || '',
        categoryId: item.categoryId
      })
    } else {
      setEditMode(false)
      setSelectedItem(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        categoryId: categories[0]?.id || 0
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditMode(false)
    setSelectedItem(null)
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
        
      if (editMode && selectedItem) {
        await axiosInstance.put(`/Menu/items/${selectedItem.id}`, formData)
        setSuccess('Item actualizado exitosamente')
      } else {
        await axiosInstance.post('/Menu/items', formData)
        setSuccess('Item creado exitosamente')
      }
      handleCloseDialog()
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el item')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este item?')) return

    try {
      await axiosInstance.delete(`/Menu/items/${id}`)
      setSuccess('Item eliminado exitosamente')
      loadData()
    } catch (err) {
      setError('Error al eliminar el item')
    }
  }

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await axiosInstance.put(`/Menu/items/${item.id}`, {
        isAvailable: !item.isAvailable
      })
      setSuccess(`Item ${!item.isAvailable ? 'activado' : 'desactivado'} exitosamente`)
      loadData()
    } catch (err) {
      setError('Error al cambiar la disponibilidad')
    }
  }

  const getItemsByCategory = (categoryId: number) => {
    return menuItems.filter(item => item.categoryId === categoryId)
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
              Gestión del Menú 🍔
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Administra los items del menú por categoría
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size='large'
          >
            Agregar Item
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

        {/* Tabs por categoría */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant='scrollable'
            scrollButtons='auto'
          >
            {categories.map((category, index) => (
              <Tab
                key={category.id}
                label={`${category.name} (${getItemsByCategory(category.id).length})`}
                icon={<Restaurant />}
                iconPosition='start'
              />
            ))}
          </Tabs>
        </Box>

        {/* Items de la categoría seleccionada */}
        {categories.map((category, index) => (
          <Box key={category.id} hidden={tabValue !== index}>
            <Grid container spacing={3}>
              {getItemsByCategory(category.id).map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      border: '2px solid rgba(0, 255, 255, 0.3)',
                      boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                      opacity: item.isAvailable ? 1 : 0.6
                    }}
                  >
                    <Box
                      sx={{
                        height: 150,
                        background: item.imageUrl
                          ? `url(${item.imageUrl}) center/cover`
                          : 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {!item.imageUrl && (
                        <Restaurant sx={{ fontSize: 60, color: 'primary.main' }} />
                      )}
                    </Box>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          mb: 1
                        }}
                      >
                        <Typography variant='h6' sx={{ fontWeight: 700 }}>
                          {item.name}
                        </Typography>
                        <Chip
                          label={item.isAvailable ? 'Disponible' : 'No disponible'}
                          size='small'
                          color={item.isAvailable ? 'success' : 'default'}
                        />
                      </Box>
                      {item.description && (
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                          {item.description}
                        </Typography>
                      )}
                      <Typography
                        variant='h6'
                        color='primary.main'
                        sx={{ fontWeight: 700 }}
                      >
                        ${item.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button size='small' onClick={() => handleToggleAvailable(item)}>
                        {item.isAvailable ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Box>
                        <IconButton
                          color='primary'
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton color='error' onClick={() => handleDelete(item.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {getItemsByCategory(category.id).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Restaurant sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant='h6' color='text.secondary'>
                  No hay items en esta categoría
                </Typography>
              </Box>
            )}
          </Box>
        ))}

        {/* Dialog para crear/editar */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
          <DialogTitle>{editMode ? 'Editar Item' : 'Agregar Item'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Nombre'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
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
                  type='number'
                  label='Precio'
                  value={formData.price}
                  onChange={e =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label='Categoría'
                  value={formData.categoryId}
                  onChange={e =>
                    setFormData({ ...formData, categoryId: parseInt(e.target.value) })
                  }
                  required
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={!formData.name || !formData.categoryId || formData.price <= 0}
            >
              {editMode ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}
