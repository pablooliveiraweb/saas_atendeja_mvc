import { createTheme } from '@mui/material/styles';

// Criar um tema completo do Material UI para o menu/cardápio digital
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#3182ce', // Azul similar ao do Chakra UI
      light: '#4299e1',
      dark: '#2b6cb0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#38b2ac', // Verde-água similar ao do Chakra UI
      light: '#4fd1c5',
      dark: '#319795',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e53e3e',
      light: '#fc8181',
      dark: '#c53030',
    },
    warning: {
      main: '#dd6b20',
      light: '#ed8936',
      dark: '#c05621',
    },
    info: {
      main: '#3182ce',
      light: '#4299e1',
      dark: '#2b6cb0',
    },
    success: {
      main: '#38a169',
      light: '#48bb78',
      dark: '#2f855a',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
      disabled: '#a0aec0',
    },
    background: {
      default: '#f7fafc',
      paper: '#ffffff',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',
          padding: '0.5rem 1rem',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '1rem',
          paddingRight: '1rem',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#e2e8f0',
        },
      },
    },
  },
});

export default muiTheme;
