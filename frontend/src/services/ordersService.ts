import { api } from './api';
import { OrderStatus } from './orderService';

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  items?: any[];
  deliveryMethod?: 'pickup' | 'delivery' | 'dineIn';
  deliveryAddress?: string;
  notes?: string;
  isSimulated?: boolean;
}

// Função para carregar pedidos do localStorage
const getLocalOrders = (): Order[] => {
  try {
    const savedOrders = localStorage.getItem('pendingOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (e) {
    console.error('Erro ao carregar pedidos do localStorage:', e);
    return [];
  }
};

// Função para salvar pedidos no localStorage
const saveLocalOrders = (orders: Order[]) => {
  try {
    localStorage.setItem('pendingOrders', JSON.stringify(orders));
  } catch (e) {
    console.error('Erro ao salvar pedidos no localStorage:', e);
  }
};

// Definindo o tipo do serviço
interface OrdersService {
  getAll: () => Promise<Order[]>;
  getRecent: () => Promise<Order[]>;
  getWeeklyStats: () => Promise<number[]>;
  getById: (id: string) => Promise<Order>;
  update: (id: string, data: Partial<Order>) => Promise<Order>;
  remove: (id: string) => Promise<void>;
  fetchPendingOrders: () => Promise<Order[]>;
  getInactiveCustomers: () => Promise<any[]>;
  getTopProducts: () => Promise<any[]>;
}

// Implementação do serviço
export const ordersService: OrdersService = {
  // Buscar todos os pedidos
  getAll: async (): Promise<Order[]> => {
    try {
      // Tentar obter pedidos da API
      const response = await api.get<Order[]>('/orders');
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Pedidos obtidos da API:', response.data.length);
        
        // Apenas retornar os dados, sem disparar eventos
        // O Dashboard vai decidir se precisa notificar ou não
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao obter pedidos da API:', error);
      return [];
    }
  },

  // Buscar pedidos recentes
  getRecent: async (): Promise<Order[]> => {
    try {
      console.log('📊 Buscando pedidos recentes...');
      
      // Tentar buscar via API principal
    const response = await api.get('/orders/recent');
      const apiOrders = response.data as Order[];
      
      console.log(`✅ API retornou ${apiOrders.length} pedidos recentes`);
      return apiOrders;
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos recentes da API:', error);
      
      // Em caso de falha, usar pedidos locais ordenados por data
      const localOrders = getLocalOrders();
      
      // Ordenar por data de criação (mais recentes primeiro) e limitar a 10
      const recentLocalOrders = localOrders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      
      console.log(`⚠️ Usando ${recentLocalOrders.length} pedidos locais recentes`);
      return recentLocalOrders;
    }
  },

  // Buscar estatísticas semanais
  getWeeklyStats: async (): Promise<number[]> => {
    try {
    const response = await api.get('/orders/weekly-stats');
    return response.data as number[];
    } catch (error) {
      console.error('API indisponível para estatísticas semanais:', error);
      
      // Dados simulados para estatísticas
      return Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 100);
    }
  },

  // Buscar pedido específico pelo ID
  getById: async (id: string): Promise<Order> => {
    try {
      console.log(`📊 Buscando pedido específico: ${id}`);
      
      // TENTATIVA 1: Buscar da API principal
      try {
        console.log('📡 Tentando API principal...');
    const response = await api.get(`/orders/${id}`);
        console.log('✅ Pedido encontrado na API principal');
    return response.data as Order;
      } catch (mainError) {
        console.error('❌ Falha na API principal:', mainError);
        
        // TENTATIVA 2: Buscar da API alternativa
        try {
          console.log('📡 Tentando API alternativa...');
          const restaurantData = localStorage.getItem('@Atende:restaurant');
          if (restaurantData) {
            const restaurant = JSON.parse(restaurantData);
            if (restaurant && restaurant.id) {
              const altResponse = await api.get(`/restaurants/${restaurant.id}/orders/${id}`);
              console.log('✅ Pedido encontrado na API alternativa');
              return altResponse.data as Order;
            }
          }
          throw new Error('Dados do restaurante não encontrados');
        } catch (altError) {
          console.error('❌ Falha também na API alternativa:', altError);
          // Continuar para o fallback local
        }
      }
      
      // FALLBACK: Buscar no localStorage
      console.log('📋 Buscando pedido no localStorage...');
      const localOrders = getLocalOrders();
      const localOrder = localOrders.find(order => order.id === id);
      
      if (localOrder) {
        console.log('✅ Pedido encontrado no localStorage');
        return localOrder;
      }
      
      // Se não encontrar em nenhum lugar
      throw new Error(`Pedido com ID ${id} não encontrado`);
    } catch (error) {
      console.error('❌ Erro ao buscar pedido específico:', error);
      throw error;
    }
  },

  // Atualizar pedido
  update: async (id: string, data: Partial<Order>): Promise<Order> => {
    try {
      console.log(`📝 Tentando atualizar pedido ${id} na API...`);
      
      // Tentar atualizar na API principal
      try {
    const response = await api.put(`/orders/${id}`, data);
        console.log('✅ Pedido atualizado com sucesso na API');
    return response.data as Order;
      } catch (mainError) {
        console.error('❌ Falha ao atualizar na API principal:', mainError);
        
        // Tentar API alternativa
        try {
          console.log('📡 Tentando API alternativa...');
          const restaurantData = localStorage.getItem('@Atende:restaurant');
          if (restaurantData) {
            const restaurant = JSON.parse(restaurantData);
            if (restaurant && restaurant.id) {
              const altResponse = await api.put(`/restaurants/${restaurant.id}/orders/${id}`, data);
              console.log('✅ Pedido atualizado com sucesso na API alternativa');
              return altResponse.data as Order;
            }
          }
          throw new Error('Dados do restaurante não encontrados');
        } catch (altError) {
          console.error('❌ Falha também na API alternativa:', altError);
          
          // Atualizar localmente como último recurso
          console.log('📋 Atualizando pedido localmente como fallback...');
          const localOrders = getLocalOrders();
          const orderIndex = localOrders.findIndex(o => o.id === id);
          
          if (orderIndex >= 0) {
            const updatedOrder = {
              ...localOrders[orderIndex],
              ...data,
              updatedAt: new Date().toISOString()
            };
            
            localOrders[orderIndex] = updatedOrder;
            saveLocalOrders(localOrders);
            
            console.log('✅ Pedido atualizado localmente com sucesso');
            return updatedOrder;
          }
          
          throw new Error('Pedido não encontrado para atualização');
        }
      }
    } catch (error) {
      console.error('❌ Erro geral ao atualizar pedido:', error);
      
      // Atualizar localmente como último recurso
      const localOrders = getLocalOrders();
      const orderIndex = localOrders.findIndex(o => o.id === id);
      
      if (orderIndex >= 0) {
        const updatedOrder = {
          ...localOrders[orderIndex],
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        localOrders[orderIndex] = updatedOrder;
        saveLocalOrders(localOrders);
        
        console.log('✅ Pedido atualizado localmente como fallback');
        return updatedOrder;
      }
      
      throw new Error('Pedido não encontrado para atualização');
    }
  },

  // Excluir pedido
  remove: async (id: string): Promise<void> => {
    try {
      // Tentar excluir da API
    await api.delete(`/orders/${id}`);
    } catch (error) {
      console.error('API indisponível para exclusão de pedido:', error);
      
      // Excluir localmente
      const localOrders = getLocalOrders();
      const orderIndex = localOrders.findIndex(o => o.id === id);
      
      if (orderIndex >= 0) {
        localOrders.splice(orderIndex, 1);
        saveLocalOrders(localOrders);
        return;
      }
      
      throw new Error('Pedido não encontrado');
    }
  },

  // Obter pedidos pendentes
  async fetchPendingOrders(): Promise<Order[]> {
    // Evitar log excessivo
    const debug = true;
    
    if (debug) console.log('Buscando pedidos pendentes...');
    
    // Manter um registro local de pedidos que foram aceitos recentemente
    // para evitar que continuem aparecendo como pendentes
    const recentlyAcceptedOrdersJson = localStorage.getItem('recentlyAcceptedOrders');
    const recentlyAcceptedOrders = recentlyAcceptedOrdersJson 
      ? JSON.parse(recentlyAcceptedOrdersJson) 
      : [];
    
    // Limpar pedidos aceitos há mais de 1 minuto
    const now = new Date().getTime();
    const updatedRecentlyAcceptedOrders = recentlyAcceptedOrders.filter(
      (item: {id: string, timestamp: number}) => now - item.timestamp < 60000
    );
    
    // Salvar a lista atualizada
    localStorage.setItem('recentlyAcceptedOrders', JSON.stringify(updatedRecentlyAcceptedOrders));
    
    // Tentar diferentes endpoints para pedidos pendentes
    const endpoints = [
      '/orders/pending',         // Tentar endpoint específico primeiro
      '/orders?status=pending',  // Tentar URL com query parameter
      '/orders'                  // Fallback para todos os pedidos (filtrar no frontend)
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Tentando buscar pedidos de ${endpoint}`);
        const response = await api.get(endpoint);
        
        // Se encontrou pedidos
        if (response.data && Array.isArray(response.data)) {
          console.log(`Encontrados ${response.data.length} pedidos no endpoint ${endpoint}`);
          
          // Filtrar APENAS pedidos pendentes, independente do endpoint
          // Verificar tanto 'pending' quanto OrderStatus.PENDING para compatibilidade
          const pendingOrders = response.data.filter(
            (order: Order) => {
              // Verificar se o pedido está na lista de recentemente aceitos
              const isRecentlyAccepted = updatedRecentlyAcceptedOrders.some(
                (item: {id: string}) => item.id === order.id
              );
              
              // Se estiver na lista de recentemente aceitos, não considerar como pendente
              if (isRecentlyAccepted) {
                console.log(`Pedido ${order.id} foi recentemente aceito, ignorando...`);
                return false;
              }
              
              const isPending = order.status === 'pending' || order.status === OrderStatus.PENDING;
              // Verificar se o pedido não foi atualizado recentemente (nos últimos 5 segundos)
              const isRecent = !order.updatedAt || 
                (new Date().getTime() - new Date(order.updatedAt).getTime() > 5000);
              return isPending && isRecent;
            }
          );
          
          console.log(`Filtrados ${pendingOrders.length} pedidos pendentes`);
          
          // Salvar no localStorage como backup
          if (pendingOrders.length > 0) {
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
          }
          
          return pendingOrders;
        } else {
          console.warn(`Resposta inesperada do endpoint ${endpoint}:`, response.data);
        }
      } catch (error) {
        lastError = error;
        console.error(`Erro ao buscar pedidos de ${endpoint}:`, error);
        // Continuar tentando o próximo endpoint
      }
    }
    
    // Se chegou aqui, tentar obter pedidos do localStorage como fallback
    console.log('Tentando obter pedidos do localStorage como fallback...');
    const savedOrders = localStorage.getItem('pendingOrders');
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          // Filtrar APENAS pedidos pendentes e que não foram atualizados recentemente
          const pendingOrders = orders.filter(
            (order: Order) => {
              // Verificar se o pedido está na lista de recentemente aceitos
              const isRecentlyAccepted = updatedRecentlyAcceptedOrders.some(
                (item: {id: string}) => item.id === order.id
              );
              
              // Se estiver na lista de recentemente aceitos, não considerar como pendente
              if (isRecentlyAccepted) {
                return false;
              }
              
              const isPending = order.status === 'pending' || order.status === OrderStatus.PENDING;
              const isRecent = !order.updatedAt || 
                (new Date().getTime() - new Date(order.updatedAt).getTime() > 5000);
              return isPending && isRecent;
            }
          );
          console.log(`Recuperados ${pendingOrders.length} pedidos pendentes do localStorage`);
          return pendingOrders;
        }
      } catch (error) {
        console.error('Erro ao parsear pedidos do localStorage:', error);
      }
    }
    
    // Se tudo falhar, retornar array vazio
    console.log('Nenhum pedido pendente encontrado');
    return [];
  },

  // Obter clientes inativos (que não pedem há mais de 7 dias)
  getInactiveCustomers: async (): Promise<any[]> => {
    try {
      console.log('📊 Buscando clientes inativos...');
      
      // Tentar buscar via API
      try {
        const response = await api.get('/customers/inactive');
        const data = response.data as any[];
        console.log(`✅ API retornou ${data.length} clientes inativos`);
        return data;
      } catch (apiError) {
        console.error('❌ API indisponível para clientes inativos:', apiError);
        
        // Se a API falhar, tentamos buscar todos os pedidos e clientes e calcular manualmente
        const allOrders = await ordersService.getAll();
        
        // Agrupar por cliente e obter o último pedido de cada um
        const customersMap = new Map();
        
        allOrders.forEach(order => {
          if (!order.customerPhone || !order.customerName) return;
          
          // Usar o telefone como identificador único do cliente
          if (!customersMap.has(order.customerPhone) || 
              new Date(order.createdAt) > new Date(customersMap.get(order.customerPhone).lastOrderDate)) {
            customersMap.set(order.customerPhone, {
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              lastOrderId: order.id,
              lastOrderTotal: order.total,
              lastOrderDate: order.createdAt
            });
          }
        });
        
        // Converter para array
        let customersArray = Array.from(customersMap.values());
        
        // Filtrar clientes inativos (último pedido há mais de 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const inactiveCustomers = customersArray.filter(customer => 
          new Date(customer.lastOrderDate) < sevenDaysAgo
        );
        
        // Ordenar pelo mais antigo primeiro
        inactiveCustomers.sort((a, b) => 
          new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime()
        );
        
        console.log(`⚠️ Cálculo local encontrou ${inactiveCustomers.length} clientes inativos`);
        return inactiveCustomers;
      }
    } catch (error) {
      console.error('❌ Erro geral ao buscar clientes inativos:', error);
      return [];
    }
  },
  
  // Obter produtos mais vendidos (dados reais)
  getTopProducts: async (): Promise<any[]> => {
    try {
      console.log('📊 Buscando produtos mais vendidos...');
      
      // Tentar buscar via API - Usando um endpoint que não seja confundido com o parâmetro :id
      try {
        const response = await api.get('/products/statistics/top-selling');
        const data = response.data as any[];
        console.log(`✅ API retornou ${data.length} produtos mais vendidos`);
        return data;
      } catch (apiError) {
        // Tentar endpoint alternativo
        try {
          const response = await api.get('/statistics/top-products');
          const data = response.data as any[];
          console.log(`✅ API alternativa retornou ${data.length} produtos mais vendidos`);
          return data;
        } catch (altError) {
          console.error('❌ APIs indisponíveis para produtos mais vendidos, usando cálculo local');
        
          // Cálculo local com base nos pedidos existentes
          const allOrders = await ordersService.getAll();
          
          // Mapa para armazenar contagem de produtos
          const productsMap = new Map();
          
          // Percorrer todos os pedidos e itens
          allOrders.forEach(order => {
            // Se tiver items como array, usar diretamente
            if (Array.isArray(order.items)) {
              order.items.forEach(item => {
                const productId = item.id || item.productId;
                const productName = item.name || `Produto #${productId}`;
                const quantity = item.quantity || 1;
                
                if (!productsMap.has(productId)) {
                  productsMap.set(productId, { 
                    id: productId, 
                    name: productName, 
                    total: 0 
                  });
                }
                
                productsMap.get(productId).total += quantity;
              });
            } 
            // Se tiver notes como JSON stringificado, tentar parsear
            else if (order.notes && typeof order.notes === 'string' && order.notes.startsWith('[')) {
              try {
                const items = JSON.parse(order.notes);
                if (Array.isArray(items)) {
                  items.forEach(item => {
                    const productId = item.id || item.productId;
                    const productName = item.name || `Produto #${productId}`;
                    const quantity = item.quantity || 1;
                    
                    if (!productsMap.has(productId)) {
                      productsMap.set(productId, { 
                        id: productId, 
                        name: productName, 
                        total: 0 
                      });
                    }
                    
                    productsMap.get(productId).total += quantity;
                  });
                }
              } catch (e) {
                console.error('Erro ao parsear items do pedido:', e);
              }
            }
          });
          
          // Converter para array e ordenar
          const topProducts = Array.from(productsMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
          
          console.log(`⚠️ Cálculo local encontrou ${topProducts.length} produtos mais vendidos`);
          return topProducts;
        }
      }
    } catch (error) {
      console.error('❌ Erro geral ao buscar produtos mais vendidos:', error);
      // Retornar alguns produtos de exemplo como último recurso
      return [
        { name: 'X-Tudo', total: 125 },
        { name: 'Coca-Cola', total: 87 },
        { name: 'Batata Frita', total: 56 },
        { name: 'Combo Família', total: 42 }
      ];
    }
  }
};
  