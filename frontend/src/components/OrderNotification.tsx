import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { 
  useToast, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Text, 
  Badge, 
  Flex, 
  Box, 
  Divider,
  List,
  ListItem,
  Heading
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import orderService, { OrderStatus } from '../services/orderService';

// Interface para os itens do pedido
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  additionalOptions?: any;
  selectedOptions?: any[];
  product?: {
    name: string;
  };
  total?: number;
  unitPrice?: number;
  totalPrice?: number;
  totalUnitPrice?: number;
  additionalOptionsTotal?: number;
  Complementos?: Record<string, any>;
  Molhos?: string;
  Crispys?: string;
  Adicionais?: string;
  Temperos?: string;
  [key: string]: any; // Index signature to allow dynamic property access
}

// Interface para o pedido
interface Order {
  id: string;
  orderNumber?: string;
  status: OrderStatus;
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  subtotal: number;
  notes?: string;
  orderItems?: OrderItem[];
  restaurant?: {
    id: string;
    name: string;
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
}

// Função para processar os itens do pedido
const processOrderItems = (order: any): OrderItem[] => {
  if (!order) return [];
  
  let items: OrderItem[] = [];
  
  // Verificar se temos orderItems
  if (order.orderItems) {
    try {
      // Se orderItems for uma string, tentar parsear
      if (typeof order.orderItems === 'string') {
        items = JSON.parse(order.orderItems);
      } else if (Array.isArray(order.orderItems)) {
        items = order.orderItems;
      }
    } catch (e) {
      console.error('Erro ao processar orderItems:', e);
    }
  } 
  // Verificar se temos items
  else if (order.items) {
    try {
      // Se items for uma string, tentar parsear
      if (typeof order.items === 'string') {
        items = JSON.parse(order.items);
      } else if (Array.isArray(order.items)) {
        items = order.items;
      }
    } catch (e) {
      console.error('Erro ao processar items:', e);
    }
  }
  // Verificar se os itens estão no campo notes (como visto no retorno do servidor)
  else if (order.notes && typeof order.notes === 'string' && (order.notes.startsWith('[') || order.notes.startsWith('{'))) {
    try {
      const parsedNotes = JSON.parse(order.notes);
      
      if (Array.isArray(parsedNotes)) {
        items = parsedNotes;
      } else if (typeof parsedNotes === 'object') {
        // Caso seja um objeto único e não um array
        items = [parsedNotes];
      }
    } catch (e) {
      console.error('Erro ao processar notes como itens:', e);
    }
  }
  
  // Processar cada item para garantir que tenha as propriedades necessárias
  return items.map(item => {
    // Calcular valor total dos complementos
    let additionalOptionsTotal = 0;
    
    // Verificar se temos additionalOptions (formato padrão)
    if (item.additionalOptions) {
      additionalOptionsTotal += item.additionalOptions.reduce(
        (sum: number, opt: any) => sum + (opt.option?.price || 0),
        0
      );
    }
    
    // Verificar se temos selectedOptions (outro formato possível)
    if (item.selectedOptions && Array.isArray(item.selectedOptions)) {
      additionalOptionsTotal += item.selectedOptions.reduce(
        (sum: number, opt: any) => sum + (opt.option?.price || 0),
        0
      );
    }
    
    // Verificar se temos complementos no formato da imagem (Molhos, Crispys, etc)
    if (item.Complementos) {
      // Processar complementos no formato de objeto
      Object.entries(item.Complementos).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'price' in value) {
          additionalOptionsTotal += Number(value.price) || 0;
        }
      });
    }
    
    // Verificar se additionalOptions é um objeto com categorias (Molhos, Crispys, etc)
    if (item.additionalOptions && typeof item.additionalOptions === 'object' && !Array.isArray(item.additionalOptions)) {
      Object.entries(item.additionalOptions).forEach(([category, value]) => {
        if (typeof value === 'object' && value !== null && 'price' in value) {
          const optionPrice = typeof value.price === 'string' ? parseFloat(value.price) : Number(value.price) || 0;
          const optionName = 'name' in value ? String(value.name) : category;
          console.log(`Adicionando complemento ${category}: ${optionName} - Preço: ${optionPrice}`);
          additionalOptionsTotal += optionPrice;
        }
      });
    }
    
    // Verificar campos específicos como Molhos, Crispys, etc.
    const complementosEspecificos = ['Molhos', 'Crispys', 'Adicionais', 'Temperos'];
    complementosEspecificos.forEach(campo => {
      if (item[campo] && typeof item[campo] === 'string' && item[campo].includes('+R$')) {
        // Extrair o valor do preço do formato "+R$ X.XX"
        const match = item[campo].match(/\+R\$\s*(\d+(\.\d+)?)/);
        if (match && match[1]) {
          const valorComplemento = Number(match[1]) || 0;
          console.log(`Complemento ${campo}: ${item[campo]} - Valor extraído: ${valorComplemento}`);
          additionalOptionsTotal += valorComplemento;
        }
      }
    });
    
    // Verificar se há complementos no formato da imagem (como no exemplo: "Molhos: Teriaki +R$ 1.50")
    Object.entries(item).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('+R$')) {
        const match = value.match(/\+R\$\s*(\d+(\.\d+)?)/);
        if (match && match[1]) {
          const valorComplemento = Number(match[1]) || 0;
          console.log(`Complemento direto ${key}: ${value} - Valor extraído: ${valorComplemento}`);
          additionalOptionsTotal += valorComplemento;
        }
      }
    });
    

    // Calcular preço unitário total (base + complementos)
    const basePrice = Number(item.price) || 0;
    const totalUnitPrice = basePrice + additionalOptionsTotal;

    // Calcular total do item
    const itemTotal = totalUnitPrice * (item.quantity || 1);

    return {
      ...item,
      name: item.name || item.product?.name || 'Item sem nome',
      price: basePrice,
      totalUnitPrice,
      quantity: item.quantity || 1,
      additionalOptions: item.additionalOptions || {},
      additionalOptionsTotal,
      total: itemTotal,
      unitPrice: basePrice
    };
  });
};

// Função para calcular o valor total dos itens diretamente do objeto do pedido
const calculateOrderTotal = (order: any): number => {
  if (!order) return 0;
  
  console.log('Calculando valor total do pedido...');
  
  // Processar os itens do pedido
  const processedItems = processOrderItems(order);
  
  // Calcular o total somando o total de cada item
  const calculatedTotal = processedItems.reduce((total, item) => {
    const itemTotal = item.total || 0;
    console.log(`  Item: ${item.name}, Total: ${itemTotal}`);
    return total + itemTotal;
  }, 0);
  
  console.log(`Total calculado: ${calculatedTotal}`);
  
  // Se o pedido tiver um total definido pelo servidor, comparar
  if (order.total) {
    const serverTotal = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
    console.log(`Total do servidor: ${serverTotal}`);
    console.log(`Diferença: ${Math.abs(calculatedTotal - serverTotal)}`);
  }
  
  return calculatedTotal;
};

const OrderNotification: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundIntervalRef = useRef<number | null>(null);

  // Função para tocar o som de notificação
  const playAlarmSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.warn('Erro ao tocar áudio:', e);
        });
      }
    } catch (e) {
      console.warn('Erro ao tocar áudio:', e);
    }
  }, []);

  // Função para parar a repetição do som
  const stopRepeatingAlarm = useCallback(() => {
    if (soundIntervalRef.current) {
      window.clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
  }, []);

  // Função para abrir o modal com os detalhes do pedido
  const handleViewOrderDetails = useCallback((order: Order) => {
    setCurrentOrder(order);
    setIsOpen(true);
    
    // Iniciar a repetição do som se o pedido estiver pendente
    if (order.status === OrderStatus.PENDING) {
      playAlarmSound();
      
      // Repetir o som a cada 5 segundos
      if (!soundIntervalRef.current) {
        soundIntervalRef.current = window.setInterval(() => {
          playAlarmSound();
        }, 5000);
      }
    }
  }, [playAlarmSound]);

  // Função para fechar o modal
  const handleCloseOrderModal = useCallback(() => {
    setIsOpen(false);
    stopRepeatingAlarm();
  }, [stopRepeatingAlarm]);

  // Função para aceitar o pedido
  const handleAcceptOrder = async () => {
    if (!currentOrder) return;
    
    try {
      setIsLoadingAction(true);
      
      // Parar a repetição do som imediatamente
      stopRepeatingAlarm();
      
      // Adicionar o pedido à lista de pedidos recentemente aceitos
      const recentlyAcceptedOrdersJson = localStorage.getItem('recentlyAcceptedOrders');
      const recentlyAcceptedOrders = recentlyAcceptedOrdersJson 
        ? JSON.parse(recentlyAcceptedOrdersJson) 
        : [];
      
      // Adicionar o pedido atual com timestamp
      recentlyAcceptedOrders.push({
        id: currentOrder.id,
        timestamp: new Date().getTime()
      });
      
      // Salvar a lista atualizada
      localStorage.setItem('recentlyAcceptedOrders', JSON.stringify(recentlyAcceptedOrders));
      
      // Obter o nome do restaurante
      const restaurantName = currentOrder.restaurant?.name || 'Restaurante';
      
      // Atualizar status usando o serviço orderService
      await orderService.updateOrderStatus(
        currentOrder.id,
        OrderStatus.PREPARING,
        currentOrder.customerPhone || '',
        restaurantName
      );
      
      // Atualizar estado local
      const updateData = { 
        status: OrderStatus.PREPARING,
        updatedAt: new Date().toISOString()
      };
      
      setCurrentOrder({
        ...currentOrder,
        ...updateData
      });
      
      // Feedback
      toast({
        title: 'Pedido aceito',
        description: `O pedido #${currentOrder.id.substring(0, 8)} foi aceito e está em produção.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Fechar modal e limpar estado de carregamento
      setIsLoadingAction(false);
      handleCloseOrderModal();
      
      // Disparar evento para atualizar outras partes da aplicação
      const event = new CustomEvent('order-status-updated', { 
        detail: { orderId: currentOrder.id, status: OrderStatus.PREPARING } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error);
      
      // Feedback de erro
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar o pedido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      setIsLoadingAction(false);
    }
  };

  // Função para rejeitar o pedido
  const handleRejectOrder = async () => {
    if (!currentOrder) return;
    
    try {
      setIsLoadingAction(true);
      
      // Atualizar status usando o serviço orderService
      await orderService.updateOrderStatus(
        currentOrder.id,
        OrderStatus.CANCELED,
        currentOrder.customerPhone || '',
        currentOrder.restaurant?.name || ''
      );
      
      // Atualizar estado local
      const updateData = { 
        status: OrderStatus.CANCELED,
        updatedAt: new Date().toISOString()
      };
      
      setCurrentOrder({
        ...currentOrder,
        ...updateData
      });
      
      // Parar a repetição do som
      stopRepeatingAlarm();
      
      // Feedback
      toast({
        title: 'Pedido rejeitado',
        description: `O pedido #${currentOrder.id.substring(0, 8)} foi rejeitado.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Fechar modal e limpar estado de carregamento
      setIsLoadingAction(false);
      handleCloseOrderModal();
      
      // Disparar evento para atualizar outras partes da aplicação
      const event = new CustomEvent('order-status-updated', { 
        detail: { orderId: currentOrder.id, status: OrderStatus.CANCELED } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Erro ao rejeitar pedido:", error);
      
      // Feedback de erro
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o pedido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      setIsLoadingAction(false);
    }
  };

  // Função para ir para a página de pedidos
  const handleGoToOrders = () => {
    navigate('/orders');
    handleCloseOrderModal();
  };

  // Listener para novos pedidos criados via evento
  useEffect(() => {
    const handleNewOrderEvent = (event: any) => {
      const order = event.detail;
      if (!order || !order.id) return;
      
      console.log('OrderNotification recebeu evento de novo pedido:', order);
      
      // Tocar alarme sonoro
      playAlarmSound();
      
      // Exibir toast
      toast({
        title: 'Novo Pedido!',
        description: `Pedido de ${order.customerName} - ${formatCurrency(Number(order.total) || 0)}`,
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      
      // Abrir modal
      handleViewOrderDetails(order);
    };
    
    // Adicionar o listener
    window.addEventListener('new-order-created', handleNewOrderEvent);
    
    return () => {
      window.removeEventListener('new-order-created', handleNewOrderEvent);
      stopRepeatingAlarm();
    };
  }, [playAlarmSound, handleViewOrderDetails, stopRepeatingAlarm, toast]);

  // Listener para o evento play-notification-sound
  useEffect(() => {
    const handlePlayNotificationSound = () => {
      console.log('🔊 Evento de som personalizado recebido, tocando notificação...');
      playAlarmSound();
    };
    
    // Adicionar o listener para o evento específico de som
    window.addEventListener('play-notification-sound', handlePlayNotificationSound);
    
    return () => {
      window.removeEventListener('play-notification-sound', handlePlayNotificationSound);
    };
  }, [playAlarmSound]);

  // Função para obter a cor do status
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

  // Processar os itens do pedido atual
  const orderItems = useMemo(() => {
    if (!currentOrder) return { items: [], calculatedSubtotal: 0 };
    
    console.log('Processando pedido:', currentOrder);
    
    const processedItems = processOrderItems(currentOrder);
    
    // Calcular o subtotal somando o total de cada item
    const calculatedSubtotal = processedItems.reduce((total, item) => {
      return total + (item.total || 0);
    }, 0);
    
    console.log(`Subtotal calculado: ${calculatedSubtotal}`);
    
    return {
      items: processedItems,
      calculatedSubtotal
    };
  }, [currentOrder]);

  // Extrair os itens processados e o subtotal calculado
  const { items: processedOrderItems, calculatedSubtotal } = orderItems || { items: [], calculatedSubtotal: 0 };
  
  // Usar o valor total calculado (que inclui os complementos)
  const displayTotal = calculatedSubtotal;
  
  // Verificar se há discrepância entre o valor calculado e o valor do servidor
  const serverTotal = currentOrder?.total ? 
    (typeof currentOrder.total === 'string' ? parseFloat(currentOrder.total) : currentOrder.total) : 0;
  const hasDiscrepancy = Math.abs(displayTotal - serverTotal) > 0.1;
  
  // Verificar se o pedido tem complementos
  const hasAdditionalOptions = useMemo(() => {
    if (!processedOrderItems || processedOrderItems.length === 0) return false;
    
    return processedOrderItems.some(item => 
      item.additionalOptions && Object.keys(item.additionalOptions).length > 0
    );
  }, [processedOrderItems]);

  return (
    <>
      {/* Modal para exibir detalhes do pedido */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseOrderModal}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay 
          bg="rgba(0, 0, 0, 0.7)"
          backdropFilter="blur(2px)"
        />
        <ModalContent 
          borderWidth="1px"
          borderColor={currentOrder?.status === 'pending' ? 'orange.300' : 'gray.200'}
          boxShadow={currentOrder?.status === 'pending' ? 'lg' : 'base'}
        >
          <ModalHeader borderBottomWidth="1px" bg={currentOrder?.status === 'pending' ? 'orange.50' : 'white'}>
            <Flex justify="space-between" align="center">
              <Box>
                {currentOrder?.status === 'pending' && (
                  <Text fontSize="sm" color="orange.500" fontWeight="bold" mb={1}>
                    ⚠️ NOVO PEDIDO PENDENTE
                  </Text>
                )}
                Pedido #{currentOrder?.id?.substring(0, 8)}
                {currentOrder && (
                  <Text fontSize="sm" fontWeight="normal" mt={1}>
                    {new Date(currentOrder.createdAt).toLocaleString()}
                  </Text>
                )}
                {currentOrder && currentOrder.couponCode && currentOrder.discountValue && currentOrder.discountValue > 0 && (
                  <Text fontSize="sm" fontWeight="normal" color="green.500" mt={1}>
                    Cupom aplicado: {currentOrder.couponCode} (-{formatCurrency(Number(currentOrder.discountValue) || 0)})
                  </Text>
                )}
              </Box>
              <Badge 
                ml={2} 
                colorScheme={getStatusColor(currentOrder?.status || 'pending')}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="md"
              >
                {currentOrder?.status === 'preparing' 
                  ? 'Em Produção' 
                  : currentOrder?.status || 'Pendente'}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalBody>
            <Box mb={4}>
              <Heading size="sm" mb={2}>Informações do Cliente</Heading>
              <Text><strong>Nome:</strong> {currentOrder?.customerName}</Text>
              {currentOrder?.customerPhone && (
                <Text><strong>Telefone:</strong> {currentOrder.customerPhone}</Text>
              )}
              {currentOrder?.deliveryAddress && (
                <Text><strong>Endereço:</strong> {currentOrder.deliveryAddress}</Text>
              )}
              {currentOrder?.notes && (
                <Text mt={2}><strong>Observações:</strong> {currentOrder.notes}</Text>
              )}
            </Box>
            
            <Divider my={4} />
            
            {/* Itens do pedido */}
            <Box mt={4}>
              <Text fontWeight="bold" mb={2}>
                Itens do Pedido:
              </Text>
              {processedOrderItems && processedOrderItems.length > 0 ? (
                <List spacing={2}>
                  {processedOrderItems.map((item, index) => (
                    <ListItem key={index} p={2} borderWidth="1px" borderRadius="md">
                      <Flex justifyContent="space-between">
                        <Box>
                          <Text fontWeight="bold">
                            {item.quantity}x {item.name}
                          </Text>
                          {item.notes && (
                            <Text fontSize="sm" color="gray.600">
                              Obs: {item.notes}
                            </Text>
                          )}
                          {item.additionalOptions && Object.keys(item.additionalOptions).length > 0 && (
                            <Box mt={1} pl={2} borderLeftWidth="1px" borderLeftColor="gray.300">
                              <Text fontSize="sm" fontWeight="medium">
                                Complementos:
                              </Text>
                              <List pl={2}>
                                {Object.entries(item.additionalOptions).map(([groupName, value], idx) => {
                                  // Verificar o tipo de valor e formatar adequadamente
                                  let displayText = '';
                                  let optionPrice = 0;
                                  
                                  if (typeof value === 'object' && value !== null && 'name' in value) {
                                    // Formato: {"Molhos":{"name":"Tarê","price":1.5}}
                                    displayText = `${groupName}: ${value.name}`;
                                    if ('price' in value) {
                                      if (typeof value.price === 'string') {
                                        optionPrice = parseFloat(value.price);
                                      } else if (typeof value.price === 'number') {
                                        optionPrice = value.price;
                                      }
                                      if (!isNaN(optionPrice) && optionPrice > 0) {
                                        displayText += ` (+${formatCurrency(optionPrice)})`;
                                      }
                                    }
                                  } else if (typeof value === 'object' && value !== null) {
                                    // Outros formatos de objeto
                                    displayText = `${groupName}: ${JSON.stringify(value)}`;
                                  } else {
                                    // Valores simples (string, número, etc.)
                                    displayText = `${groupName}: ${String(value)}`;
                                  }
                                  
                                  return (
                                    <ListItem key={idx} fontSize="sm">
                                      {displayText}
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </Box>
                          )}
                        </Box>
                        <Box textAlign="right">
                          <Text fontWeight="bold" fontSize="md" color="green.600">
                            {formatCurrency(item.total || (item.price * item.quantity))}
                          </Text>
                          {item.additionalOptionsTotal && item.additionalOptionsTotal > 0 && (
                            <Text fontSize="xs" color="gray.600">
                              Base: {formatCurrency(item.price)} <br />
                              + Complementos: {formatCurrency(item.additionalOptionsTotal)} <br />
                              = Unitário: {formatCurrency(item.totalUnitPrice || 0)} x {item.quantity}
                            </Text>
                          )}
                          {/* Exibir preço unitário mesmo sem complementos para clareza */}
                          {(!item.additionalOptionsTotal || item.additionalOptionsTotal === 0) && (
                            <Text fontSize="xs" color="gray.600">
                              {formatCurrency(item.price)} x {item.quantity}
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Text>Nenhum item encontrado</Text>
              )}
            </Box>
            
            <Divider my={4} />
            
            {/* Resumo financeiro */}
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text>Subtotal:</Text>
                <Text>{formatCurrency(displayTotal)}</Text>
              </Flex>
              
              {currentOrder?.discountValue && currentOrder.discountValue > 0 && (
                <Flex justify="space-between" mb={2} color="green.500">
                  <Text>Desconto ({currentOrder.couponCode}):</Text>
                  <Text>-{formatCurrency(Number(currentOrder.discountValue))}</Text>
                </Flex>
              )}
              
              <Flex justify="space-between" fontWeight="bold">
                <Text>Total:</Text>
                <Text>{formatCurrency(displayTotal)}</Text>
              </Flex>
              
              {/* Verificar se há discrepância entre o valor calculado e o valor do servidor */}
              {hasDiscrepancy && (
                <>
                  <Flex justify="space-between" mt={1} color="gray.500" fontSize="sm">
                    <Text>Total informado pelo servidor:</Text>
                    <Text>{formatCurrency(serverTotal)}</Text>
                  </Flex>
                  <Text fontSize="xs" color="orange.500" mt={1} textAlign="right">
                    * O valor total foi recalculado para incluir corretamente os complementos.
                  </Text>
                </>
              )}
              
              {/* Adicionar informação sobre o cálculo do total */}
              {hasAdditionalOptions && (
                <Text fontSize="xs" color="gray.500" mt={2} textAlign="right">
                  * O valor total inclui o preço base dos produtos e todos os complementos selecionados.
                </Text>
              )}
            </Box>
          </ModalBody>
          <ModalFooter borderTopWidth="1px">
            {currentOrder?.status === 'pending' ? (
              <>
                <Button 
                  colorScheme="red" 
                  mr={3} 
                  onClick={handleRejectOrder}
                  isLoading={isLoadingAction}
                >
                  Rejeitar
                </Button>
                <Button 
                  colorScheme="green" 
                  onClick={handleAcceptOrder}
                  isLoading={isLoadingAction}
                >
                  Aceitar Pedido
                </Button>
              </>
            ) : (
              <>
                <Button 
                  colorScheme="blue" 
                  mr={3} 
                  onClick={handleCloseOrderModal}
                >
                  Fechar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGoToOrders}
                >
                  Ver Todos os Pedidos
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Elemento de áudio para notificação */}
      <audio 
        ref={audioRef}
        src="/notification.mp3" 
        preload="auto"
        style={{ display: 'none' }}
      />
    </>
  );
};

export default OrderNotification;