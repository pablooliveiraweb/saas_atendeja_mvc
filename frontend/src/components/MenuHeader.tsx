import React from 'react';
import { Box, Typography, Avatar, Container, Grid, Paper, Button } from '@mui/material';
import { RestaurantInfo } from '../services/menuService';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';

interface MenuHeaderProps {
  restaurant: RestaurantInfo;
  isLoggedIn?: boolean;
  userName?: string;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ 
  restaurant, 
  isLoggedIn = false, 
  userName = '' 
}) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 0,
        background: 'white',
        color: '#333333',
        mb: 4,
        py: 3,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #edf2f7'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Informações do restaurante (lado esquerdo) */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textAlign: 'left'
          }}>
            <Avatar
              src={restaurant.logo}
              alt={restaurant.name}
              sx={{
                width: 70,
                height: 70,
                mr: 2,
                border: '3px solid #f8f9fa',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
            
            <Box>
              <Typography 
                variant="h5" 
                component="h1" 
                fontWeight="bold" 
                sx={{ 
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  color: '#333333'
                }}
              >
                {restaurant.name}
              </Typography>
              
              {restaurant.description && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666666',
                    maxWidth: '400px',
                    mb: 1
                  }}
                >
                  {restaurant.description}
                </Typography>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 2,
                color: '#666666',
                fontSize: '0.8rem'
              }}>
                {restaurant.openingHours && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" sx={{ color: '#3182ce' }} />
                    <Typography variant="body2">
                      {restaurant.openingHours}
                    </Typography>
                  </Box>
                )}
                
                {restaurant.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" sx={{ color: '#3182ce' }} />
                    <Typography variant="body2">
                      {restaurant.address}
                    </Typography>
                  </Box>
                )}
                
                {restaurant.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon fontSize="small" sx={{ color: '#3182ce' }} />
                    <Typography variant="body2">
                      {restaurant.phone}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          
          {/* Informações do cliente (lado direito) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoggedIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#3182ce', width: 40, height: 40 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Olá, {userName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Meu Perfil
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: '#3182ce', 
                    mr: 1,
                    '&:hover': {
                      bgcolor: '#2c5282'
                    }
                  }}
                >
                  Entrar
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderColor: '#3182ce', 
                    color: '#3182ce',
                    '&:hover': {
                      borderColor: '#2c5282',
                      bgcolor: 'rgba(49, 130, 206, 0.04)'
                    }
                  }}
                >
                  Cadastrar
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default MenuHeader; 