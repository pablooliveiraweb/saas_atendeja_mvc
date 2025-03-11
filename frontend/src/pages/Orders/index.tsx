import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { 
  Box, 
  Heading, 
  Grid, 
  GridItem, 
  Text, 
  useToast, 
  Skeleton,
  Stack,
  Flex,
  Badge,
  Button,
  Icon,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  HStack
} from '@chakra-ui/react';
import OrderCard from '../../components/OrderCard';
import orderService, { Order, OrderStatus } from '../../services/orderService';
import { FiRefreshCw, FiChevronDown, FiCheck, FiHelpCircle, FiTruck } from 'react-icons/fi';
import OrderSearch from '../../components/OrderSearch';

// Função para ordenar pedidos por data (mais recentes primeiro)
const sortOrdersByDate = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Interface para propriedades da coluna de pedidos
interface OrderColumnProps {
  title: string;
  color: string;
  orders: Order[];
  onStatusChange: () => void;
  isLoading: boolean;
}

// Componente para uma coluna de pedidos
const OrderColumn: React.FC<OrderColumnProps> = ({ title, color, orders, onStatusChange, isLoading }) => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const toast = useToast();

  // Limpar seleções quando os pedidos mudarem
  useEffect(() => {
    setSelectedOrders([]);
  }, [orders]);

  // Alternar seleção de um pedido
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  // Selecionar ou desselecionar todos os pedidos
  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  // Atualizar status de múltiplos pedidos
  const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
    if (selectedOrders.length === 0) {
      toast({
        title: 'Nenhum pedido selecionado',
        description: 'Selecione pelo menos um pedido para atualizar o status',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const promises = selectedOrders.map(orderId => {
        // Encontrar o pedido completo usando o ID
        const order = orders.find(o => o.id === orderId);
        if (order) {
          return orderService.updateOrderStatus(
            orderId, 
            newStatus,
            order.customerPhone,
            order.restaurant?.name
          );
        } else {
          return orderService.updateOrderStatus(orderId, newStatus);
        }
      });
      
      await Promise.all(promises);
      
      toast({
        title: 'Status atualizado',
        description: `${selectedOrders.length} pedidos atualizados com sucesso`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Limpar seleções e recarregar pedidos
      setSelectedOrders([]);
      onStatusChange();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status dos pedidos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Determinar próximo status com base no título da coluna
  const getNextStatus = (): OrderStatus | null => {
    switch (title) {
      case 'Pedidos Confirmados':
        return OrderStatus.PREPARING;
      case 'Em Preparo':
        return OrderStatus.READY;
      case 'Pedidos Prontos':
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  };

  // Obter ícone com base no próximo status
  const getActionIcon = () => {
    switch (getNextStatus()) {
      case OrderStatus.PREPARING:
        return FiCheck;
      case OrderStatus.READY:
        return FiHelpCircle;
      case OrderStatus.DELIVERED:
        return FiTruck;
      default:
        return FiCheck;
    }
  };

  // Obter texto do botão com base no próximo status
  const getActionText = () => {
    switch (getNextStatus()) {
      case OrderStatus.PREPARING:
        return 'Iniciar Preparo';
      case OrderStatus.READY:
        return 'Marcar como Pronto';
      case OrderStatus.DELIVERED:
        return 'Marcar como Entregue';
      default:
        return 'Avançar Status';
    }
  };

  const nextStatus = getNextStatus();
  const showBulkActions = orders.length > 0 && nextStatus;

  return (
    <Box 
      bg="gray.50" 
      p={4} 
      borderRadius="md" 
      height="100%" 
      minH="70vh"
      maxH="85vh"
      overflowY="auto"
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color={`${color}.600`}>
          {title}
        </Heading>
        <Badge colorScheme={color} fontSize="sm" p={1} borderRadius="md">
          {orders.length}
        </Badge>
      </Flex>

      {showBulkActions && (
        <Flex mb={4} justify="space-between" align="center">
          <Checkbox 
            isChecked={selectedOrders.length > 0 && selectedOrders.length === orders.length}
            isIndeterminate={selectedOrders.length > 0 && selectedOrders.length < orders.length}
            onChange={toggleSelectAll}
          >
            <Text fontSize="sm">{selectedOrders.length} selecionados</Text>
          </Checkbox>
          
          {selectedOrders.length > 0 && (
            <Button
              size="xs"
              colorScheme={color}
              leftIcon={<Icon as={getActionIcon()} />}
              onClick={() => handleBulkStatusUpdate(nextStatus)}
            >
              {getActionText()}
            </Button>
          )}
        </Flex>
      )}

      {isLoading ? (
        <Stack spacing={4}>
          <Skeleton height="150px" />
          <Skeleton height="150px" />
        </Stack>
      ) : orders.length > 0 ? (
        orders.map(order => (
          <Box key={order.id} position="relative">
            {showBulkActions && (
              <Checkbox
                position="absolute"
                top={2}
                right={2}
                zIndex={1}
                isChecked={selectedOrders.includes(order.id)}
                onChange={() => toggleOrderSelection(order.id)}
              />
            )}
            <OrderCard
              order={order}
              onStatusChange={onStatusChange}
            />
          </Box>
        ))
      ) : (
        <Box py={8} textAlign="center">
          <Text color="gray.500">Nenhum pedido nesta seção</Text>
        </Box>
      )}
    </Box>
  );
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const toast = useToast();

  // Buscar pedidos
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await orderService.fetchAllOrders();
      setOrders(sortOrdersByDate(fetchedOrders));
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Falha ao carregar pedidos. Por favor, tente novamente.');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar pedidos quando o componente montar
  useEffect(() => {
    fetchOrders();
    
    // Configurar atualização automática a cada 30 segundos
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    // Limpar intervalo quando o componente desmontar
    return () => clearInterval(intervalId);
  }, []);

  // Filtrar pedidos por status
  const pendingOrders = orders.filter(
    order => order.status === OrderStatus.PENDING
  );
  
  const preparingOrders = orders.filter(
    order => order.status === OrderStatus.PREPARING
  );
  
  const readyOrders = orders.filter(
    order => order.status === OrderStatus.READY
  );
  
  const outForDeliveryOrders = orders.filter(
    order => order.status === OrderStatus.OUT_FOR_DELIVERY
  );

  // Função para atualizar manualmente os pedidos
  const handleRefresh = () => {
    fetchOrders();
    toast({
      title: 'Atualizando',
      description: 'Buscando pedidos mais recentes...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Layout title="Gerenciamento de Pedidos">
      <Box p={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">Gerenciamento de Pedidos</Heading>
          <Flex alignItems="center">
            <Text fontSize="sm" color="gray.500" mr={2}>
              Atualizado: {lastRefresh.toLocaleTimeString()}
            </Text>
            <Button 
              size="sm" 
              leftIcon={<Icon as={FiRefreshCw} />} 
              onClick={handleRefresh}
              isLoading={isLoading}
            >
              Atualizar
            </Button>
          </Flex>
        </Flex>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box mb={6}>
          <OrderSearch 
            onSelectOrder={(order) => {
              // Destacar o pedido selecionado ou realizar outra ação
              toast({
                title: 'Pedido selecionado',
                description: `Pedido #${order.orderNumber || order.id.substring(0, 8)} - ${order.customerName}`,
                status: 'info',
                duration: 3000,
                isClosable: true,
              });
            }}
          />
        </Box>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(3, 1fr)"
          }}
          gap={6}
          mt={4}
        >
          <GridItem>
            <OrderColumn
              title="Em Preparo"
              color="orange"
              orders={preparingOrders}
              onStatusChange={fetchOrders}
              isLoading={isLoading}
            />
          </GridItem>
          <GridItem>
            <OrderColumn
              title="Pedidos Prontos"
              color="green"
              orders={readyOrders}
              onStatusChange={fetchOrders}
              isLoading={isLoading}
            />
          </GridItem>
          <GridItem>
            <OrderColumn
              title="Saiu para Entrega"
              color="purple"
              orders={outForDeliveryOrders}
              onStatusChange={fetchOrders}
              isLoading={isLoading}
            />
          </GridItem>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Orders; 