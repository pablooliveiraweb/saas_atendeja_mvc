import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Grid,
  Flex,
  Text,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
  Badge,
  HStack,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Icon,
} from '@chakra-ui/react';
import {
  RepeatIcon,
  StarIcon,
  ViewIcon,
  SettingsIcon,
  CheckCircleIcon,
  CalendarIcon,
  ChevronUpIcon,
  HamburgerIcon,
  InfoIcon,
  TimeIcon,
} from '@chakra-ui/icons';

// Interface para a resposta da API do dashboard
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  newCustomers: number;
  averageOrderValue: number;
}

// Dados fictícios para o gráfico de categorias mais vendidas
const topCategories = [
  { name: 'Hambúrgueres', percentage: 35, color: 'red.400' },
  { name: 'Pizzas', percentage: 25, color: 'green.400' },
  { name: 'Bebidas', percentage: 20, color: 'blue.400' },
  { name: 'Sobremesas', percentage: 15, color: 'purple.400' },
  { name: 'Acompanhamentos', percentage: 5, color: 'yellow.400' },
];

// Dados fictícios para pedidos recentes
const recentOrders = [
  { id: '#1234', customer: 'João Silva', total: 'R$ 89,90', status: 'Entregue', date: '10/03/2025' },
  { id: '#1235', customer: 'Maria Oliveira', total: 'R$ 65,50', status: 'Em preparo', date: '10/03/2025' },
  { id: '#1236', customer: 'Pedro Santos', total: 'R$ 112,00', status: 'Enviado', date: '09/03/2025' },
  { id: '#1237', customer: 'Ana Costa', total: 'R$ 45,00', status: 'Entregue', date: '09/03/2025' },
];

const Dashboard: React.FC = () => {
  const { token, user, restaurant } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    newCustomers: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cores para o tema
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Esta chamada será implementada no backend
        const response = await axios.get<DashboardStats>(`${process.env.REACT_APP_API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (err: any) {
        setError('Erro ao carregar dados do dashboard');
        console.error(err);
        
        // Para fins de demonstração, definir dados de exemplo
        setStats({
          totalOrders: 127,
          totalRevenue: 5840.50,
          newCustomers: 18,
          averageOrderValue: 45.99,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Flex align="center" justify="center" h="64">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      {/* Cabeçalho com boas-vindas */}
      <Box mb={8} p={4} bg={cardBg} rounded="lg" shadow="sm">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" color={textColor}>Bem-vindo, {user?.name}</Heading>
            <Text color="gray.500" mt={1}>
              {restaurant?.name ? `Restaurante: ${restaurant.name}` : 'Painel de Controle'}
            </Text>
          </Box>
          <HStack>
            <Badge colorScheme="green" p={2} borderRadius="md">
              <Flex align="center">
                <Box mr={2}>
                  <CheckCircleIcon />
                </Box>
                <Text>Sistema Ativo</Text>
              </Flex>
            </Badge>
            <Text color="gray.500">
              <Box as="span" mr={2} display="inline-block">
                <CalendarIcon />
              </Box>
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </HStack>
        </Flex>
      </Box>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Cards de estatísticas */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
          <CardBody>
            <Flex align="center">
              <Flex
                p={3}
                rounded="full"
                bg="blue.50"
                color="blue.500"
                mr={4}
                justify="center"
                align="center"
              >
                <RepeatIcon boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Pedidos Realizados
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {stats.totalOrders}
                </Text>
                <Text fontSize="xs" color="green.500">
                  <Box as="span" mr={1} display="inline-flex" alignItems="center">
                    <ChevronUpIcon />
                  </Box>
                  +12% em relação ao mês anterior
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
          <CardBody>
            <Flex align="center">
              <Flex
                p={3}
                rounded="full"
                bg="green.50"
                color="green.500"
                mr={4}
                justify="center"
                align="center"
              >
                <StarIcon boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Faturamento Total
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  R$ {stats.totalRevenue.toFixed(2)}
                </Text>
                <Text fontSize="xs" color="green.500">
                  <Box as="span" mr={1} display="inline-flex" alignItems="center">
                    <ChevronUpIcon />
                  </Box>
                  +8% em relação ao mês anterior
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
          <CardBody>
            <Flex align="center">
              <Flex
                p={3}
                rounded="full"
                bg="purple.50"
                color="purple.500"
                mr={4}
                justify="center"
                align="center"
              >
                <ViewIcon boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Novos Clientes
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {stats.newCustomers}
                </Text>
                <Text fontSize="xs" color="green.500">
                  <Box as="span" mr={1} display="inline-flex" alignItems="center">
                    <ChevronUpIcon />
                  </Box>
                  +5% em relação ao mês anterior
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
          <CardBody>
            <Flex align="center">
              <Flex
                p={3}
                rounded="full"
                bg="yellow.50"
                color="yellow.500"
                mr={4}
                justify="center"
                align="center"
              >
                <SettingsIcon boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Ticket Médio
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  R$ {stats.averageOrderValue.toFixed(2)}
                </Text>
                <Text fontSize="xs" color="green.500">
                  <Box as="span" mr={1} display="inline-flex" alignItems="center">
                    <ChevronUpIcon />
                  </Box>
                  +3% em relação ao mês anterior
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Gráficos e tabelas */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={8}>
        {/* Pedidos recentes */}
        <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
          <CardHeader pb={0}>
            <Heading size="md" color={textColor}>Pedidos Recentes</Heading>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Box as="table" width="full" mt={2}>
                <Box as="thead" bg={statBg}>
                  <Box as="tr">
                    <Box as="th" px={4} py={3} textAlign="left">ID</Box>
                    <Box as="th" px={4} py={3} textAlign="left">Cliente</Box>
                    <Box as="th" px={4} py={3} textAlign="left">Total</Box>
                    <Box as="th" px={4} py={3} textAlign="left">Status</Box>
                    <Box as="th" px={4} py={3} textAlign="left">Data</Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {recentOrders.map((order, index) => (
                    <Box as="tr" key={index} borderTopWidth={1} borderColor="gray.100">
                      <Box as="td" px={4} py={3}>{order.id}</Box>
                      <Box as="td" px={4} py={3}>{order.customer}</Box>
                      <Box as="td" px={4} py={3}>{order.total}</Box>
                      <Box as="td" px={4} py={3}>
                        <Badge 
                          colorScheme={
                            order.status === 'Entregue' ? 'green' : 
                            order.status === 'Enviado' ? 'blue' : 'yellow'
                          }
                        >
                          {order.status}
                        </Badge>
                      </Box>
                      <Box as="td" px={4} py={3}>{order.date}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <Flex justify="center" mt={4}>
              <Button colorScheme="blue" size="sm">
                Ver Todos os Pedidos
              </Button>
            </Flex>
          </CardBody>
        </Card>

        {/* Categorias mais vendidas */}
        <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
          <CardHeader pb={0}>
            <Heading size="md" color={textColor}>Categorias Mais Vendidas</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {topCategories.map((category, index) => (
                <Box key={index}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontWeight="medium">{category.name}</Text>
                    <Text fontWeight="medium">{category.percentage}%</Text>
                  </Flex>
                  <Progress 
                    value={category.percentage} 
                    size="sm" 
                    colorScheme={category.color.split('.')[0]} 
                    borderRadius="full"
                  />
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Ações rápidas */}
      <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden" mb={8}>
        <CardHeader>
          <Heading size="md" color={textColor}>Ações Rápidas</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Button leftIcon={<HamburgerIcon />} colorScheme="blue" variant="outline" size="lg">
              Gerenciar Produtos
            </Button>
            <Button leftIcon={<InfoIcon />} colorScheme="green" variant="outline" size="lg">
              Gerenciar Categorias
            </Button>
            <Button leftIcon={<TimeIcon />} colorScheme="purple" variant="outline" size="lg">
              Relatórios
            </Button>
            <Button leftIcon={<StarIcon />} colorScheme="yellow" variant="outline" size="lg">
              Financeiro
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Layout>
  );
};

export default Dashboard; 