import React, { useState } from 'react';
import {
  Box,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  useToast,
  List,
  ListItem,
  Text,
  Badge,
  Flex,
  Divider
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { api } from '../../services/api';
import orderService, { Order, OrderStatus } from '../../services/orderService';
import { formatDateTime } from '../../utils/formatters';

// Função auxiliar para obter o nome amigável do status
const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendente',
    'confirmed': 'Confirmado',
    'preparing': 'Em Preparo',
    'ready': 'Pronto',
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
    'delivered': 'purple',
    'canceled': 'red'
  };
  return colorMap[status] || 'gray';
};

interface OrderSearchProps {
  onSelectOrder?: (order: Order) => void;
}

const OrderSearch: React.FC<OrderSearchProps> = ({ onSelectOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const toast = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: 'Termo de busca vazio',
        description: 'Digite um número de pedido ou telefone para buscar',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get<Order[]>('/orders/search', {
        params: { term: searchTerm }
      });
      
      setSearchResults(response.data);
      
      if (response.data.length === 0) {
        toast({
          title: 'Nenhum resultado',
          description: 'Não encontramos pedidos com esse termo de busca',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível realizar a busca de pedidos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectOrder = (order: Order) => {
    if (onSelectOrder) {
      onSelectOrder(order);
    }
    // Limpar resultados após seleção
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <Box>
      <InputGroup size="md">
        <Input
          pr="4.5rem"
          placeholder="Buscar por número do pedido ou telefone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <InputRightElement width="4.5rem">
          <IconButton
            h="1.75rem"
            size="sm"
            aria-label="Buscar pedidos"
            icon={<FiSearch />}
            onClick={handleSearch}
            isLoading={isLoading}
          />
        </InputRightElement>
      </InputGroup>

      {searchResults.length > 0 && (
        <Box mt={2} borderWidth="1px" borderRadius="md" maxH="300px" overflowY="auto">
          <List spacing={0}>
            {searchResults.map((order, index) => (
              <React.Fragment key={order.id}>
                {index > 0 && <Divider />}
                <ListItem 
                  p={3} 
                  _hover={{ bg: 'gray.50' }}
                  cursor="pointer"
                  onClick={() => handleSelectOrder(order)}
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Flex alignItems="center">
                        <Text fontWeight="bold">
                          #{order.orderNumber || order.id.substring(0, 8)}
                        </Text>
                        <Badge ml={2} colorScheme={getStatusColor(order.status)}>
                          {getStatusName(order.status)}
                        </Badge>
                      </Flex>
                      <Text fontSize="sm">{order.customerName}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatDateTime(order.createdAt)}
                      </Text>
                    </Box>
                  </Flex>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default OrderSearch; 