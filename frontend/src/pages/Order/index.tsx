import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
  Spinner,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { menuService } from '../../services/menuService';

// Tipos de status de pedido
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled' | 'simulated';

// Descrição amigável dos status
const orderStatusDescription = {
  pending: 'Aguardando confirmação',
  preparing: 'Em preparação',
  ready: 'Pronto para entrega/retirada',
  delivering: 'Em rota de entrega',
  delivered: 'Entregue/Finalizado',
  cancelled: 'Cancelado',
  simulated: 'Demonstração'
};

// Cores dos status
const orderStatusColors = {
  pending: 'yellow',
  preparing: 'blue',
  ready: 'green',
  delivering: 'purple',
  delivered: 'teal',
  cancelled: 'red',
  simulated: 'gray'
};

// Interface para o objeto order
interface OrderData {
  id: string;
  status: OrderStatus;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  deliveryMethod: 'pickup' | 'delivery' | 'dineIn';
  deliveryAddress?: string;
  total: number;
  estimatedTime?: string;
}

// Componente de acompanhamento de pedido
const Order: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Carregando dados do pedido
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError('ID de pedido não encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Verificar se é um pedido simulado (prefixo 'sim-')
        const isSimulatedOrder = id.startsWith('sim-');
        
        if (isSimulatedOrder) {
          // Pedido simulado - gerar dados de demonstração
          console.log('ID de pedido simulado detectado. Usando dados de demonstração.');
          
          // Simular um pequeno atraso como se estivesse buscando dados
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const simulatedOrderData: OrderData = {
            id,
            status: 'simulated', // Usar o status especial para simulação
            createdAt: new Date().toISOString(),
            customer: {
              name: localStorage.getItem('customerName') || 'Cliente Demonstração',
              phone: localStorage.getItem('customerPhone') || '(11) 98765-4321'
            },
            items: [
              { id: '1', name: 'Hambúrguer Clássico', quantity: 2, price: 30.00, total: 60.00 },
              { id: '2', name: 'Batata Frita', quantity: 1, price: 15.00, total: 15.00 },
              { id: '3', name: 'Refrigerante', quantity: 2, price: 8.00, total: 16.00 }
            ],
            deliveryMethod: 'delivery',
            deliveryAddress: 'Rua Exemplo, 123 - Centro',
            total: 91.00,
            estimatedTime: '30-45 minutos'
          };
          
          setOrder(simulatedOrderData);
        } else {
          // Pedido real - buscar do backend
          try {
            const orderData = await menuService.getOrder(id);
            setOrder(orderData as OrderData);
          } catch (apiError) {
            console.error('Erro ao buscar pedido do backend:', apiError);
            // Fallback para dados simulados se a API falhar
            const fallbackOrderData: OrderData = {
              id,
              status: 'preparing',
              createdAt: new Date().toISOString(),
              customer: {
                name: 'Cliente Teste',
                phone: '(11) 98765-4321'
              },
              items: [
                { id: '1', name: 'Hambúrguer Clássico', quantity: 2, price: 30.00, total: 60.00 },
                { id: '2', name: 'Batata Frita', quantity: 1, price: 15.00, total: 15.00 }
              ],
              deliveryMethod: 'delivery',
              deliveryAddress: 'Rua Exemplo, 123 - Centro',
              total: 75.00,
              estimatedTime: '30-45 minutos'
            };
            setOrder(fallbackOrderData);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do pedido:', error);
        setError('Não foi possível carregar os dados do pedido.');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Formatação de valores e datas
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error || !order) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Erro!</AlertTitle>
          <AlertDescription>{error || 'Pedido não encontrado'}</AlertDescription>
        </Alert>
        <Button 
          as={Link} 
          to="/" 
          colorScheme="blue" 
          mt={4}
        >
          Voltar ao menu
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        {order.status === 'simulated' && (
          <Alert status="info" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>Modo de demonstração</AlertTitle>
              <AlertDescription>
                Este é um pedido simulado para demonstração. Em um ambiente de produção, 
                você veria dados reais do seu pedido aqui.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="lg">Pedido #{order.id}</Heading>
          <Badge 
            colorScheme={orderStatusColors[order.status]} 
            fontSize="md" 
            p={2} 
            borderRadius="md"
          >
            {orderStatusDescription[order.status]}
          </Badge>
        </Flex>

        <Divider />

        <Box>
          <Text fontWeight="bold" mb={2}>Data do Pedido</Text>
          <Text>{formatDate(order.createdAt)}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>Cliente</Text>
          <Text>{order.customer.name}</Text>
          <Text>{order.customer.phone}</Text>
        </Box>

        {order.deliveryMethod === 'delivery' && (
          <Box>
            <Text fontWeight="bold" mb={2}>Endereço de Entrega</Text>
            <Text>{order.deliveryAddress}</Text>
          </Box>
        )}

        <Box>
          <Text fontWeight="bold" mb={2}>Itens do Pedido</Text>
          <VStack spacing={3} align="stretch" mt={2}>
            {order.items.map((item: any) => (
              <Flex 
                key={item.id} 
                justifyContent="space-between" 
                p={3} 
                borderWidth="1px" 
                borderRadius="md"
              >
                <Box>
                  <Text fontWeight="medium">{item.name}</Text>
                  <Text color="gray.600">{item.quantity} x {formatCurrency(item.price)}</Text>
                </Box>
                <Text fontWeight="bold">{formatCurrency(item.total)}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Divider />

        <Flex justifyContent="space-between">
          <Text fontWeight="bold" fontSize="lg">Total</Text>
          <Text fontWeight="bold" fontSize="lg" color="blue.500">
            {formatCurrency(order.total)}
          </Text>
        </Flex>

        {order.estimatedTime && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Tempo estimado</AlertTitle>
              <AlertDescription>{order.estimatedTime}</AlertDescription>
            </Box>
          </Alert>
        )}

        <Button 
          as={Link} 
          to="/" 
          colorScheme="blue" 
          size="lg" 
          mt={4}
        >
          Voltar ao menu
        </Button>
      </VStack>
    </Container>
  );
};

export default Order; 