import React from 'react';
import {
  Box, 
  Text, 
  Badge, 
  Button, 
  Stack, 
  Flex,
  Icon,
  Divider,
  useToast
} from '@chakra-ui/react';
import { FiUser, FiPhone, FiMapPin, FiClock, FiDollarSign, FiPackage } from 'react-icons/fi';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import orderService from '../../services/orderService';

// Enums para status do pedido - deve corresponder ao backend
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

// Props do componente
interface OrderCardProps {
  order: {
    id: string;
    orderNumber?: string;
    status: OrderStatus;
    customerName: string;
    customerPhone?: string;
    deliveryAddress?: string;
    createdAt: string;
    total: number;
    subtotal?: number;
    notes?: string;
    restaurant?: {
      id: string;
      name?: string;
      evolutionApiInstanceName?: string;
    };
    couponCode?: string;
    couponId?: string;
    discountValue?: number;
    coupon?: {
      id: string;
      code: string;
      type: string;
      value: number;
    };
  };
  onStatusChange: () => void;
}

const getNextStatus = (currentStatus: string): OrderStatus | null => {
  switch (currentStatus) {
    case OrderStatus.PENDING:
      return OrderStatus.PREPARING;
    case OrderStatus.CONFIRMED:
      return OrderStatus.PREPARING;
    case OrderStatus.PREPARING:
      return OrderStatus.READY;
    case OrderStatus.READY:
      return OrderStatus.OUT_FOR_DELIVERY;
    case OrderStatus.OUT_FOR_DELIVERY:
      return OrderStatus.DELIVERED;
    default:
      return null;
  }
};

// Função auxiliar para obter o nome amigável do status
const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendente',
    'confirmed': 'Confirmado',
    'preparing': 'Em Preparo',
    'ready': 'Pronto',
    'out_for_delivery': 'Saiu para Entrega',
    'delivered': 'Entregue',
    'canceled': 'Cancelado'
  };
  return statusMap[status] || status;
};

// Função auxiliar para obter a cor do status
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': 'yellow',
    'confirmed': 'blue',
    'preparing': 'orange',
    'ready': 'green',
    'out_for_delivery': 'purple',
    'delivered': 'purple',
    'canceled': 'red'
  };
  return colorMap[status] || 'gray';
};

// Função auxiliar para obter o texto do botão de ação
const getActionButtonText = (status: string): string => {
  const textMap: Record<string, string> = {
    'pending': 'Aceitar e Iniciar Preparo',
    'confirmed': 'Iniciar Preparo',
    'preparing': 'Marcar como Pronto',
    'ready': 'Marcar Saiu para Entrega',
    'out_for_delivery': 'Marcar Entrega Concluída',
    'delivered': 'Pedido Finalizado',
    'canceled': 'Pedido Cancelado'
  };
  return textMap[status] || 'Avançar Status';
};

// Função auxiliar para obter a cor do botão de ação
const getActionButtonColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': 'blue',
    'confirmed': 'orange',
    'preparing': 'green',
    'ready': 'purple',
    'out_for_delivery': 'purple',
    'delivered': 'gray',
    'canceled': 'gray'
  };
  return colorMap[status] || 'gray';
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange }) => {
  const toast = useToast();

  // Formatando a data de criação
  const formattedDate = new Date(order.createdAt).toLocaleString('pt-BR');

  // Verificando se é possível avançar o status deste pedido
  const nextStatus = getNextStatus(order.status);
  const canProgress = nextStatus !== null && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELED;

  // Função para mudar o status do pedido
  const handleChangeStatus = async () => {
    if (!nextStatus) return;

    try {
      // Usar o serviço em vez da chamada direta à API
      await orderService.updateOrderStatus(
        order.id,
        nextStatus,
        order.customerPhone,
        order.restaurant?.name
      );

      toast({
        title: 'Status atualizado',
        description: `O pedido foi movido para ${getStatusName(nextStatus)}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Notificar o componente pai que o status foi alterado
      onStatusChange();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      p={4} 
      mb={4} 
      boxShadow="sm"
      bg="white"
      position="relative"
    >
      {/* Cabeçalho do card */}
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <Text fontWeight="bold" fontSize="lg">
          #{order.orderNumber || order.id.substring(0, 8)}
        </Text>
        <Badge colorScheme={getStatusColor(order.status)} p={1} borderRadius="md">
          {getStatusName(order.status)}
        </Badge>
      </Flex>

      <Divider my={2} />

      {/* Informações do cliente */}
      <Stack spacing={2} mb={3}>
        <Flex alignItems="center">
          <Icon as={FiUser} mr={2} color="gray.500" />
          <Text>{order.customerName}</Text>
        </Flex>
        
        {order.customerPhone && (
          <Flex alignItems="center">
            <Icon as={FiPhone} mr={2} color="gray.500" />
            <Text>{order.customerPhone}</Text>
          </Flex>
        )}
        
        {order.deliveryAddress && (
          <Flex alignItems="center">
            <Icon as={FiMapPin} mr={2} color="gray.500" />
            <Text fontSize="sm" isTruncated>{order.deliveryAddress}</Text>
          </Flex>
        )}
        
        <Flex alignItems="center">
          <Icon as={FiClock} mr={2} color="gray.500" />
          <Text fontSize="sm">{formattedDate}</Text>
        </Flex>
        
        <Flex alignItems="center">
          <Icon as={FiDollarSign} mr={2} color="gray.500" />
          {order.couponCode && order.discountValue && order.discountValue > 0 ? (
            <Flex direction="column">
              <Text textDecoration="line-through" fontSize="xs" color="gray.500">
                {formatCurrency(Number(order.subtotal) || Number(order.total) + Number(order.discountValue) || 0)}
              </Text>
              <Text fontWeight="bold">
                {formatCurrency(Number(order.total) || 0)}
              </Text>
              <Text fontSize="xs" color="green.500">
                Cupom: {order.couponCode} (-{formatCurrency(Number(order.discountValue) || 0)})
              </Text>
            </Flex>
          ) : (
            <Text fontWeight="bold">{formatCurrency(order.total)}</Text>
          )}
        </Flex>
      </Stack>

      {/* Observações se houver */}
      {order.notes && (
        <Box mt={2} p={2} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontStyle="italic">
            Observações: {order.notes}
          </Text>
        </Box>
      )}

      {/* Botão de ação */}
      <Flex justifyContent="flex-end" mt={3}>
        <Button
          colorScheme={getActionButtonColor(order.status)}
          size="sm"
          isDisabled={!canProgress}
          onClick={handleChangeStatus}
          width="full"
          leftIcon={<Icon as={FiPackage} />}
        >
          {getActionButtonText(order.status)}
        </Button>
      </Flex>
    </Box>
  );
};

export default OrderCard; 