import { api } from './api';

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

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
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
}

// Objeto que contém as funções de serviço de pedidos
const orderService = {
  /**
   * Busca todos os pedidos
   */
  fetchAllOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  /**
   * Busca pedidos pelo status
   * @param status Status do pedido a ser filtrado
   */
  fetchOrdersByStatus: async (status: OrderStatus): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders`, {
      params: { status }
    });
    return response.data;
  },

  /**
   * Atualiza o status de um pedido
   * @param orderId ID do pedido
   * @param status Novo status
   * @param customerPhone Opcional - Número do telefone do cliente (para notificação)
   * @param restaurantName Opcional - Nome do restaurante (para notificação)
   */
  updateOrderStatus: async (
    orderId: string, 
    status: OrderStatus | string, 
    customerPhone?: string,
    restaurantName?: string
  ): Promise<Order> => {
    // Verificação adicional para garantir que o ID é válido
    if (!orderId) {
      console.error('ID do pedido não fornecido!');
      throw new Error('ID do pedido é obrigatório');
    }

    console.log(`Tentando atualizar pedido ${orderId} para status: ${status}`);

    // Se customerPhone e restaurantName forem fornecidos, incluímos dados de notificação
    const payload: any = { status };
    
    if (customerPhone && restaurantName) {
      payload.sendNotification = true;
      payload.notificationData = {
        customerPhone,
        restaurantName
      };
    }
    
    console.log('Enviando requisição:', {
      url: `/orders/${orderId}/status`,
      payload
    });
    
    // Tentar especificamente o endpoint de atualização de status
    const response = await api.patch<Order>(`/orders/${orderId}/status`, payload);
    console.log('Resposta da API:', response.status, response.statusText);
    return response.data;
  },

  /**
   * Busca um pedido pelo ID
   * @param orderId ID do pedido
   */
  fetchOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Retorna mensagens para cada status de pedido (para uso no frontend)
   * @param status Status do pedido
   * @param orderNumber Número do pedido
   */
  getStatusMessage: (status: OrderStatus, orderNumber: string): string => {
    const messages: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: `🕒 O pedido #${orderNumber} está pendente de confirmação.`,
      [OrderStatus.CONFIRMED]: `✅ O pedido #${orderNumber} foi confirmado com sucesso!`,
      [OrderStatus.PREPARING]: `👨‍🍳 O pedido #${orderNumber} está sendo preparado.`,
      [OrderStatus.READY]: `🎁 O pedido #${orderNumber} está pronto!`,
      [OrderStatus.OUT_FOR_DELIVERY]: `🚚 O pedido #${orderNumber} está saindo para entrega.`,
      [OrderStatus.DELIVERED]: `🚚 O pedido #${orderNumber} foi entregue!`,
      [OrderStatus.CANCELED]: `❌ O pedido #${orderNumber} foi cancelado.`,
    };
    
    return messages[status] || `Pedido #${orderNumber}`;
  }
};

// Exportação do objeto orderService para usar como default e named export
export { orderService };
export default orderService; 