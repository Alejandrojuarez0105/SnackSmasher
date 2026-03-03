import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/routes'
import { AppThemeProvider } from './components/Login/AppThemeProvider'
import { AuthProvider } from './context/AuthContext'
import { SnackbarProvider } from 'notistack'
import CssBaseline from '@mui/material/CssBaseline'

function App() {
  return (
    <AppThemeProvider>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        autoHideDuration={3000}
        sx={{
          '& .SnackbarContent-root': {
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
          }
        }}
      >
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </AppThemeProvider>
  )
}

export default App
