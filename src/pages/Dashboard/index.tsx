import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  Flex,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { ViewIcon, StarIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { categoriesService } from '../../services/categoriesService';
import { productsService } from '../../services/productsService';
import Layout from '../../components/Layout';

// Componente de estatística personalizado
const StatCard = ({ label, value, helpText }: { label: string, value: string | number, helpText: string }) => (
  <Box p={6} bg="white" borderRadius="md" boxShadow="sm">
    <Text fontSize="sm" color="gray.500">{label}</Text>
    <Text fontSize="2xl" fontWeight="bold">{value}</Text>
    <Text fontSize="sm" color="gray.500">{helpText}</Text>
  </Box>
);

const Dashboard: React.FC = () => {
  const { user, restaurant } = useAuth();
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (restaurant) {
          try {
            const categories = await categoriesService.getAll();
            setCategoriesCount(categories.length);
          } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            setCategoriesCount(0);
          }
          
          try {
            const products = await productsService.getAll();
            setProductsCount(products.length);
          } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            setProductsCount(0);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [restaurant]);

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <Flex align="center" justify="center" h="64">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <Container maxW="container.xl" py={8}>
        <Heading size="lg" mb={8}>
          Dashboard
        </Heading>

        {!restaurant ? (
          <Box p={6} bg="yellow.100" borderRadius="md" mb={8}>
            <Heading size="md" mb={2}>
              Bem-vindo ao Atende!
            </Heading>
            <Text>
              Você ainda não está associado a nenhum restaurante. Entre em contato com o administrador
              para configurar seu restaurante.
            </Text>
          </Box>
        ) : (
          <>
            <Box p={6} bg="white" borderRadius="md" boxShadow="sm" mb={8}>
              <Heading size="md" mb={4}>
                Informações do Restaurante
              </Heading>
              <Text>
                <strong>Nome:</strong> {restaurant.name}
              </Text>
              {/* Adicione mais informações do restaurante conforme necessário */}
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
              <StatCard 
                label="Categorias" 
                value={categoriesCount} 
                helpText="Categorias cadastradas" 
              />
              <StatCard 
                label="Produtos" 
                value={productsCount} 
                helpText="Produtos cadastrados" 
              />
              {/* Adicione mais estatísticas conforme necessário */}
            </Grid>

            <Heading size="md" mb={4}>
              Acesso Rápido
            </Heading>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
              <Flex
                p={6}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                direction="column"
                align="center"
              >
                <ViewIcon boxSize={12} mb={4} color="blue.500" />
                <Heading size="sm" mb={2}>
                  Categorias
                </Heading>
                <Text textAlign="center" mb={4}>
                  Gerencie as categorias do seu cardápio
                </Text>
                <Button
                  as={RouterLink}
                  to="/categories"
                  colorScheme="blue"
                  variant="outline"
                  mt="auto"
                >
                  Ver Categorias
                </Button>
              </Flex>

              <Flex
                p={6}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                direction="column"
                align="center"
              >
                <StarIcon boxSize={12} mb={4} color="blue.500" />
                <Heading size="sm" mb={2}>
                  Produtos
                </Heading>
                <Text textAlign="center" mb={4}>
                  Gerencie os produtos do seu cardápio
                </Text>
                <Button
                  as={RouterLink}
                  to="/products"
                  colorScheme="blue"
                  variant="outline"
                  mt="auto"
                >
                  Ver Produtos
                </Button>
              </Flex>

              {/* Adicione mais cards de acesso rápido conforme necessário */}
            </Grid>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Dashboard; 