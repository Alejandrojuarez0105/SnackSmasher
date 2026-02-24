import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import { AppThemeProvider } from './components/Login/AppThemeProvider';
import { AuthProvider } from './context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <AppThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </AppThemeProvider>
  );
}

export default App;