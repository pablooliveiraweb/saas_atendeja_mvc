import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme, Box, useColorModeValue } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import muiTheme from './theme/mui-theme';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './App.css';
import Login from './pages/Login/index';
import Dashboard from './pages/Dashboard/index';
import Orders from './pages/Orders/index';
import Products from './pages/Products/index';
import Categories from './pages/Categories/index';
import Customers from './pages/Customers/index';
import Settings from './pages/Settings/index';
import WhatsAppSettings from './pages/Settings/WhatsAppSettings';
import RestaurantSettings from './pages/Settings/RestaurantSettings';
import Menu from './pages/Menu/index';
import LandingPage from './pages/LandingPage/index';
import ProtectedRoute from './components/ProtectedRoute';
import { ColorModeProvider } from '@chakra-ui/react';

// Configuração do tema personalizado com suporte para modo escuro
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: mode('gray.100', 'gray.800')(props),
        color: mode('gray.800', 'white')(props),
      },
    }),
  },
  components: {
    // Personalizações para componentes específicos no modo escuro
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: mode('white', 'gray.700')(props),
          borderColor: mode('gray.200', 'gray.600')(props),
        },
      }),
    },
    // Tema para containers de conteúdo
    Container: {
      baseStyle: (props: any) => ({
        bg: mode('white', 'gray.700')(props),
        color: mode('gray.800', 'white')(props),
        borderColor: mode('gray.200', 'gray.600')(props),
        borderRadius: 'md',
        boxShadow: 'sm',
      }),
    },
    // Tema para áreas de conteúdo
    ContentArea: {
      baseStyle: (props: any) => ({
        bg: mode('white', 'gray.700')(props),
        color: mode('gray.800', 'white')(props),
        borderColor: mode('gray.200', 'gray.600')(props),
        borderRadius: 'md',
        boxShadow: 'sm',
        p: 4,
      }),
    },
  },
});

// Componente Menu com provedor de tema do Material UI
const MenuWithMuiTheme = () => (
  <MuiThemeProvider theme={muiTheme}>
    <Menu />
  </MuiThemeProvider>
);

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeProvider>
        <Router>
          <AuthProvider>
            <CartProvider>
              <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.800')}>
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={
                  <React.Fragment>
                    <LandingPage key={(() => {
                      console.log('Renderizando LandingPage na rota /');
                      return 'landing-page';
                    })()} />
                  </React.Fragment>
                } />
                <Route path="/menu/:slug" element={<MenuWithMuiTheme />} />
                <Route path="/login" element={<Login />} />
                
                {/* Rotas Protegidas */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/whatsapp"
                  element={
                    <ProtectedRoute>
                      <WhatsAppSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/restaurant"
                  element={
                    <ProtectedRoute>
                      <RestaurantSettings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              </Box>
            </CartProvider>
          </AuthProvider>
        </Router>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default App;