import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#001742', // Deep navy blue
      light: '#4F46E5', // Indigo used for buttons
    },
    secondary: {
      main: '#4F46E5',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#64748b',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#001742',
    },
    h2: {
      fontWeight: 700,
      color: '#001742',
    },
    h3: {
      fontWeight: 600,
      color: '#001742',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
        containedPrimary: {
          backgroundColor: '#4F46E5',
          '&:hover': {
            backgroundColor: '#4338CA',
            boxShadow: 'none',
          }
        }
      }
    }
  }
});

export default theme;
