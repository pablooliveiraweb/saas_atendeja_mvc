import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  Box, 
  Heading, 
  Divider, 
  SimpleGrid, 
  useToast, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  VStack,
  Button,
  Text,
  Icon,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { FaWhatsapp, FaStore, FaKey, FaArrowRight } from 'react-icons/fa';
import ChangePasswordForm from '../../components/ChangePasswordForm';
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

const Settings: React.FC = () => {
  const { restaurant: authRestaurant } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
    <Layout title="Configurações">
      <Box p={4}>
        <Heading size="lg" mb={4}>Configurações</Heading>
        <Divider mb={6} />

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="md" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor={borderColor}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'md' }}
          >
            <VStack spacing={4} align="stretch">
              <Flex align="center">
                <Icon as={FaWhatsapp} boxSize={8} color="green.500" mr={3} />
                <Heading size="md">WhatsApp</Heading>
              </Flex>
              <Text color="gray.600">
                Configure a integração com WhatsApp para comunicação com seus clientes.
              </Text>
              <Button 
                as={RouterLink} 
                to="/settings/whatsapp" 
                colorScheme="green" 
                rightIcon={<FaArrowRight />}
                mt={2}
              >
                Configurar WhatsApp
              </Button>
            </VStack>
          </Box>
          
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="md" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor={borderColor}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'md' }}
          >
            <VStack spacing={4} align="stretch">
              <Flex align="center">
                <Icon as={FaStore} boxSize={8} color="blue.500" mr={3} />
                <Heading size="md">Restaurante</Heading>
              </Flex>
              <Text color="gray.600">
                Atualize as informações do seu restaurante, como endereço, horário de funcionamento e logo.
              </Text>
              <Button 
                as={RouterLink} 
                to="/settings/restaurant" 
                colorScheme="blue" 
                rightIcon={<FaArrowRight />}
                mt={2}
              >
                Configurar Restaurante
              </Button>
            </VStack>
          </Box>
          
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="md" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor={borderColor}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'md' }}
          >
            <VStack spacing={4} align="stretch">
              <Flex align="center">
                <Icon as={FaKey} boxSize={8} color="purple.500" mr={3} />
                <Heading size="md">Segurança</Heading>
              </Flex>
              <Text color="gray.600">
                Altere sua senha e configure opções de segurança da sua conta.
              </Text>
              <ChangePasswordForm />
            </VStack>
          </Box>
        </SimpleGrid>

        {!restaurantId && (
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
    </Layout>
  );
};

export default Settings; 