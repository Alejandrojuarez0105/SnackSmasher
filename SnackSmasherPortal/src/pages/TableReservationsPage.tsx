import { useEffect, useState } from 'react';
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
  CircularProgress,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import {
  TableRestaurant,
  Add,
  SportsEsports,
} from '@mui/icons-material';
import Layout from '../components/Dashboard/Layout';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../utils/useNotification';
import { videogamesAPI, VideogameDto } from '../api/videogames';
import TimeSelector from '../components/TimeSelector';

interface Table {
  id: number;
  number: number;
  capacity: number;
  description?: string;
  isActive: boolean;
}

export default function TableReservationsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<Table[]>([]);
  const [videogames, setVideogames] = useState<VideogameDto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [includeGame, setIncludeGame] = useState(false);
  const [formData, setFormData] = useState({
    reservationDate: '',
    startTime: '',
    endTime: '',
    numberOfGuests: 2,
    notes: '',
    videogameId: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        setLoading(true);
    
        // Cargar mesas
        const tablesRes = await axiosInstance.get('/Tables');
        const activeTables = tablesRes.data.filter((t: Table) => t.isActive);
        setTables(activeTables);
    
        // Cargar videojuegos disponibles (solo activos, sin importar copias)
        const gamesData = await videogamesAPI.getAll();
        const availableGames = gamesData.filter((g: VideogameDto) =>  g.isAvailable);
        setVideogames(availableGames);

        console.log('Mesas cargadas:', activeTables.length);
        console.log('Juegos disponibles:', availableGames.length);
    
    } catch (err) {
        console.error('Error al cargar datos:', err);
        showError('Error al cargar los datos');
    } finally {
        setLoading(false);
    }
  };

  const handleOpenDialog = (table: Table) => {
    setSelectedTable(table);
    setIncludeGame(false);
    setFormData({
      reservationDate: '',
      startTime: '',
      endTime: '',
      numberOfGuests: 2,
      notes: '',
      videogameId: 0,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedTable) return;

    // Validar que la fecha no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.reservationDate);
    
    if (selectedDate < today) {
      showError('No puedes hacer reservas en el pasado');
      return;
    }

    // Validar número de invitados
    if (formData.numberOfGuests < 1 || formData.numberOfGuests > selectedTable.capacity) {
      showError(`Número de invitados inválido. Debe ser entre 1 y ${selectedTable.capacity}`);
      return;
    }

    // Validar que haya hora de inicio y fin
    if (!formData.startTime || !formData.endTime) {
      showError('Por favor, selecciona hora de inicio y fin');
      return;
    }

    // Validar que la hora de inicio sea menor que la hora de fin
    if (formData.startTime >= formData.endTime) {
      showError('La hora de inicio debe ser menor que la hora de fin');
      return;
    }

    // Si incluye juego, validar que haya copias disponibles
    if (includeGame && formData.videogameId > 0) {
        const selectedGame = videogames.find(g => g.id === formData.videogameId);
        if (!selectedGame || selectedGame.availableCopies === 0) {
            showError('El juego seleccionado no tiene copias disponibles');
            return;
        }
    }

    try {
      // Crear reserva de mesa
      const tableReservationData = {
        tableId: selectedTable.id,
        reservationDate: formData.reservationDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfGuests: formData.numberOfGuests,
        notes: formData.notes,
      };

      await axiosInstance.post('/TableReservations', tableReservationData);
      
      // Si incluye juego, crear también reserva de juego
      if (includeGame && formData.videogameId > 0) {
        const gameReservationData = {
          videogameId: formData.videogameId,
          reservationDate: formData.reservationDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          notes: `Reserva combinada con Mesa #${selectedTable.number}`,
        };
        
        await axiosInstance.post('/GameReservations', gameReservationData);
        showSuccess('Reserva de mesa y juego creada exitosamente');
      } else {
        showSuccess('Reserva de mesa creada exitosamente');
      }
      
      setDialogOpen(false);
      setIncludeGame(false);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Error al crear la reserva');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" className="neon-text" sx={{ fontWeight: 700, mb: 1 }}>
          Reservar Mesa 🪑
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Selecciona una mesa disponible para hacer tu reserva
        </Typography>

        <Grid container spacing={3}>
          {tables.map((table) => (
            <Grid item xs={12} sm={6} md={4} key={table.id}>
              <Card
                sx={{
                  border: '2px solid rgba(0, 255, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0, 255, 255, 0.3)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 150,
                    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TableRestaurant sx={{ fontSize: 80, color: 'primary.main' }} />
                </Box>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                    Mesa #{table.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    👥 Capacidad: {table.capacity} personas
                  </Typography>
                  {table.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {table.description}
                    </Typography>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog(table)}
                  >
                    Reservar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog de reserva */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Reservar Mesa #{selectedTable?.number}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha"
                  value={formData.reservationDate}
                  onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimeSelector
                  label="Hora Inicio"
                  value={formData.startTime}
                  onChange={(value) => setFormData({ ...formData, startTime: value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TimeSelector
                  label="Hora Fin"
                  value={formData.endTime}
                  onChange={(value) => setFormData({ ...formData, endTime: value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Número de Invitados"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 })}
                  required
                  inputProps={{ min: 1, max: selectedTable?.capacity }}
                  helperText={`Máximo ${selectedTable?.capacity} personas`}
                />
              </Grid>
              
              {/* Opción de incluir juego */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeGame}
                      onChange={(e) => setIncludeGame(e.target.checked)}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SportsEsports />
                      <Typography>¿Deseas reservar un juego también?</Typography>
                    </Box>
                  }
                />
              </Grid>

              {includeGame && (
                <Grid item xs={12}>
                    <TextField
                    fullWidth
                    select
                    label="Selecciona un Videojuego"
                    value={formData.videogameId}
                    onChange={(e) => setFormData({ ...formData, videogameId: parseInt(e.target.value) })}
                    required={includeGame}
                    helperText={
                        videogames.length === 0 
                        ? "No hay juegos activos en este momento" 
                        : "Los juegos sin copias disponibles aparecen deshabilitados"
                    }
                >
                    <MenuItem value={0}>
                    <em>Selecciona un juego</em>
                    </MenuItem>
                    {videogames.length === 0 ? (
                        <MenuItem value={0} disabled>
                            <em>No hay juegos disponibles</em>
                            </MenuItem>
                            ) : (
                                videogames.map((game) => (
                                <MenuItem 
                                key={game.id} 
                                value={game.id}
                                disabled={game.availableCopies === 0}
                                sx={{
                                    opacity: game.availableCopies === 0 ? 0.5 : 1,
                                    '&.Mui-disabled': {
                                        color: 'text.secondary',
                                        textDecoration: 'line-through',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span>
                                        {game.title} ({game.platform})
                                        </span>
                                        <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                                            {game.availableCopies === 0 ? (
                                                <span style={{ color: '#ff0055' }}>SIN COPIAS</span>
                                            ) : (
                                            <span style={{ color: '#00ff88' }}>{game.availableCopies} disponibles</span>
                                        )}
                                    </span>
                                </Box>
                            </MenuItem>
                        ))
                    )}
                </TextField>
            </Grid>
        )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notas (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ocasión especial, preferencias, etc."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.reservationDate || !formData.startTime || !formData.endTime || (includeGame && formData.videogameId === 0)}
            >
              Confirmar Reserva
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}