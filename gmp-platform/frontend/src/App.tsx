import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { SnackbarProvider } from './components/SnackbarProvider';
import AppRouter from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * eDHR Design System — Industrial-Grade Color Palette
 *
 * Primary  : #1565C0 (deep professional blue — trust, precision, authority)
 * Secondary: #00897B (teal green — compliance, approval, completion)
 * Success  : #2E7D32 (green — pass, effective, released)
 * Warning  : #F57F17 (amber — pending, attention needed)
 * Error    : #C62828 (red — rejected, terminated, invalid) — MUST be red, not orange
 * Info     : #0277BD (light blue — running, in-progress)
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      light: '#1E88E5',
      dark: '#0D47A1',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00897B',
      light: '#26A69A',
      dark: '#00695C',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F57F17',
      light: '#FFB300',
      dark: '#E65100',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#B71C1C',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0277BD',
      light: '#03A9F4',
      dark: '#01579B',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F0F2F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2332',
      secondary: '#5A6878',
      disabled: '#8E9BAF',
    },
    divider: '#E2E6EC',
  },
  typography: {
    fontFamily: "'Noto Sans SC', 'Inter', 'Roboto', -apple-system, sans-serif",
    fontSize: 14.5,
    h4: {
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h5: {
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    h6: {
      fontSize: 16.5,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: 14.5,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: 13,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F0F2F5',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid #E8ECF0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A2332',
          boxShadow: 'none',
          borderBottom: '1px solid #E2E6EC',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: 13,
            color: '#5A6878',
            backgroundColor: '#F8FAFB',
            borderBottom: '2px solid #E2E6EC',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #EEF0F3',
          padding: '10px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#FAFBFC',
          },
          '&:hover': {
            backgroundColor: '#F0F4F8 !important',
          },
          '&.MuiTableRow-head': {
            '&:nth-of-type(even)': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        ul: {
          '& .MuiPaginationItem-root': {
            borderRadius: 6,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
