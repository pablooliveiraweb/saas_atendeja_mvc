import React, { useState, useEffect } from 'react';
import { Box, Heading, Divider, useToast, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import WhatsAppTestButton from '../../components/WhatsAppTestButton';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Restaurant {
  id: string;
  name: string;
  evolutionApiInstanceName?: string;
  evolutionApiInstanceConnected?: boolean;
  evolutionApiInstanceToken?: string;
  [key: string]: any;
}

const WhatsAppSettings: React.FC = () => {
  const { restaurant: authRestaurant } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        
        // Usar o restaurante do contexto de autenticação se disponível
        if (authRestaurant && authRestaurant.id) {
          setRestaurantId(authRestaurant.id);
          setIsLoading(false);
          return;
        }
        
        // Caso contrário, buscar o restaurante do usuário logado
        const response = await api.get<Restaurant>('/users/me/restaurant');
        if (response.data && response.data.id) {
          setRestaurantId(response.data.id);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do restaurante:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do restaurante.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [toast, authRestaurant]);

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>Configurações do WhatsApp</Heading>
      <Divider mb={6} />

      {restaurantId ? (
        <WhatsAppTestButton restaurantId={restaurantId} />
      ) : (
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>Restaurante não encontrado</AlertTitle>
            <AlertDescription>
              Não foi possível encontrar o restaurante associado ao seu usuário. Por favor, verifique se você está logado corretamente.
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default WhatsAppSettings; 