import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme, Box, useColorModeValue } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import muiTheme from './theme/mui-theme';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
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
import Coupons from './pages/Coupons/index';
import ProtectedRoute from './components/ProtectedRoute';
import { ColorModeProvider } from '@chakra-ui/react';
import AdminLayout from './components/AdminLayout';

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
            <RestaurantProvider>
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
                        <AdminLayout title="Dashboard">
                          <Dashboard />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <AdminLayout title="Pedidos">
                          <Orders />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute>
                        <AdminLayout title="Produtos">
                          <Products />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/categories"
                    element={
                      <ProtectedRoute>
                        <AdminLayout title="Categorias">
                          <Categories />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customers"
                    element={
                      <ProtectedRoute>
                        <AdminLayout title="Clientes">
                          <Customers />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <AdminLayout title="Configurações">
                          <Settings />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/whatsapp"
                    element={
                      <ProtectedRoute>
                        <AdminLayout title="Configurações do WhatsApp">
                          <WhatsAppSettings />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/restaurant"
                    element={
                      <ProtectedRoute>
                        <AdminLayout title="Configurações do Restaurante">
                          <RestaurantSettings />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/coupons"
                    element={
                      <ProtectedRoute>
                        <AdminLayout title="Cupons de Desconto">
                          <Coupons />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                </Box>
              </CartProvider>
            </RestaurantProvider>
          </AuthProvider>
        </Router>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default App;