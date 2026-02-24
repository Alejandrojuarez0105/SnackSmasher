import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ReactNode } from 'react';

const neonTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ffff', // Cyan neón
      light: '#66ffff',
      dark: '#00cccc',
    },
    secondary: {
      main: '#ff00ff', // Magenta neón
      light: '#ff66ff',
      dark: '#cc00cc',
    },
    error: {
      main: '#ff0055', // Rojo neón
    },
    warning: {
      main: '#ffaa00', // Naranja neón
    },
    success: {
      main: '#00ff88', // Verde neón
    },
    background: {
      default: '#0a0a0f', // Negro azulado oscuro
      paper: '#1a1a2e', // Gris azulado
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0c8',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
    },
    h2: {
      fontWeight: 600,
      textShadow: '0 0 8px #00ffff, 0 0 16px #00ffff',
    },
    h3: {
      fontWeight: 600,
      textShadow: '0 0 6px #00ffff, 0 0 12px #00ffff',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'uppercase',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00ffff 0%, #00cccc 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00cccc 0%, #009999 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(0, 255, 255, 0.6)',
            boxShadow: '0 8px 30px rgba(0, 255, 255, 0.2)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 255, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ffff',
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 600,
        },
        filled: {
          background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 204, 204, 0.2) 100%)',
          border: '1px solid rgba(0, 255, 255, 0.4)',
        },
      },
    },
  },
});

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  return <ThemeProvider theme={neonTheme}>{children}</ThemeProvider>;
};