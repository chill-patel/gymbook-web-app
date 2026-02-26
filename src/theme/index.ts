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

export const Layout = {
  pageMaxWidth: 1200,
  pageMaxWidthNarrow: 600,
  cardStripeWidth: 4,
  cardPadding: 2.5,
  sectionSpacing: 3,
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
    // pageTitle: 20px bold
    h4: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4 },
    // subheading: 18px medium
    h5: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.44 },
    // heading: 16px medium
    h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.375 },
    // sectionTitle / body: 14px
    body1: { fontSize: '0.875rem', lineHeight: 1.43 },
    // label: 12px
    body2: { fontSize: '0.75rem', lineHeight: 1.5 },
    // caption: 10px
    caption: { fontSize: '0.625rem', lineHeight: 1.4 },
    button: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
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
          fontWeight: 600,
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
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: 11,
          height: 22,
        },
        sizeSmall: {
          height: 22,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: `${Colors.primary}14`,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
