import { createTheme } from '@mui/material/styles';

export const Colors = {
  primary: '#006064',
  secondary: '#00838F',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#757575',
  textMuted: '#78909C',
  divider: 'rgba(15, 23, 42, 0.06)',
  status: {
    active: '#4CAF50',
    expiring: '#FFC107',
    expired: '#EF5350',
    none: '#E0E0E0',
  },
  financial: {
    due: '#E57373',
    paid: '#81C784',
  },
} as const;

const theme = createTheme({
  palette: {
    primary: {
      main: Colors.primary,
    },
    secondary: {
      main: Colors.secondary,
    },
    background: {
      default: Colors.background,
      paper: Colors.surface,
    },
    text: {
      primary: Colors.textPrimary,
      secondary: Colors.textSecondary,
    },
    divider: Colors.divider,
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontSize: '1.25rem', fontWeight: 700 },
    h5: { fontSize: '1.125rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.75rem' },
    caption: { fontSize: '0.625rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 18,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

export default theme;
