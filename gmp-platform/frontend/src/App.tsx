import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
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

const theme = createTheme({
  palette: {
    primary: { main: '#0D6EAA' },
    secondary: { main: '#00897B' },
    error: { main: '#E65100' },
    background: { default: '#EFF2F7' },
    text: {
      primary: '#2C3E56',
      secondary: '#4A5E76',
      disabled: '#7B8FA8',
    },
    divider: '#D6DEE8',
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Noto Sans SC', sans-serif",
    fontSize: 14,
    h6: {
      fontSize: 16,
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#2C3E56',
          boxShadow: 'none',
          borderBottom: '1px solid #D6DEE8',
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
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
