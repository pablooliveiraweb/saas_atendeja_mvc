import api from './api';
import { Product } from '../types/product';
import { Category } from '../types/category';

// Obter a URL base da API
// Primeiro tenta usar a variável de ambiente, depois tenta obter do servidor atual, ou usa uma URL fixa
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Tentar obter a URL base do servidor atual
  const currentUrl = window.location.origin;
  
  // Se estamos em localhost:3000 (frontend), a API provavelmente está em localhost:3001 (backend)
  if (currentUrl.includes('localhost:3000')) {
    return 'http://localhost:3001';
  }
  
  // Caso contrário, usar a mesma origem
  return currentUrl;
};

const API_URL = getBaseUrl();
console.log('API_URL em menuService:', API_URL);

// Função para garantir que a URL da imagem tenha o caminho completo
const getFullImageUrl = (path: string | undefined): string | undefined => {
  if (!path) return undefined;
  
  // Se já começa com http:// ou https://, já é uma URL completa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Se começa com data:, é uma URL de dados (base64)
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Garantir que o caminho comece com /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Retornar a URL completa
  return `${API_URL}${normalizedPath}`;
};

export interface RestaurantInfo {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  operatingHours?: string | object;
  openingHours?: string;
  themeColor?: string;
}

export interface CustomerOrderData {
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
  deliveryMethod: 'pickup' | 'delivery' | 'dineIn';
  paymentMethod: 'money' | 'pix' | 'credit' | 'debit';
  changeFor?: number;
  deliveryAddress?: string;
  notes?: string;
}

export interface OrderResponse {
  id: string;
  customerName?: string;
  customerPhone?: string;
  items?: any[];
  status?: string;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
  notes?: string;
  savedInDb?: boolean;
  [key: string]: any;
}

export const menuService = {
  // Buscar informações do restaurante
  getRestaurantInfo: async (restaurantId: string): Promise<RestaurantInfo> => {
    const response = await api.get<RestaurantInfo>(`/restaurants/${restaurantId}`);
    return response.data;
  },

  // Buscar categorias do restaurante
  getCategories: async (restaurantId: string): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>(`/restaurants/${restaurantId}/categories`);
      console.log('Categorias carregadas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  },

  // Buscar produtos do restaurante
  getProducts: async (restaurantId: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/products`);
      console.log('Resposta original da API:', response.data);
      
      // Tipo adequado para a resposta
      const responseData = response.data as any[];
      
      // Primeiro, vamos examinar a estrutura dos dados retornados pela API
      if (responseData && responseData.length > 0) {
        console.log('Estrutura do primeiro produto:', Object.keys(responseData[0]));
        
        // Verificar se os IDs de categoria estão vindo com o formato correto
        const categoryIds = responseData.map(p => p.categoryId || p.Product_categoryId);
        console.log('IDs de categorias dos produtos:', categoryIds);
      }
      
      // Processar produtos preservando com precisão o campo categoryId
      const processedProducts = responseData.map((product: any) => {
        // Em algumas APIs, os campos podem estar em formato prefixado (Product_categoryId)
        const categoryId = product.categoryId || 
                          product.Product_categoryId || 
                          (product.category && product.category.id);
        
        console.log(`Processando produto "${product.name || product.Product_name}", categoryId: ${categoryId}`);
        
        // Obter a imagem e garantir que tenha URL completa
        const image = product.image || product.Product_image;
        const fullImageUrl = image ? getFullImageUrl(image) : undefined;
        
        // Criar o produto processado mantendo a estrutura esperada pelo frontend
        return {
          id: product.id || product.Product_id,
          name: product.name || product.Product_name,
          description: product.description || product.Product_description || "",
          price: parseFloat(product.price || product.Product_price) || 0,
          image: fullImageUrl,
          categoryId: categoryId, // Importante: manter exatamente como veio
          restaurantId: restaurantId,
          isActive: product.isActive || product.Product_isActive !== false,
          isAvailable: product.isAvailable || product.Product_isAvailable !== false,
          order: product.order || product.Product_order || 0
        };
      });
      
      console.log('Produtos processados com categoryId e URLs completas:', processedProducts.map(p => 
        `${p.name} → categoria: ${p.categoryId}, imagem: ${p.image}`
      ));
      
      return processedProducts;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Buscar produtos por categoria
  getProductsByCategory: async (restaurantId: string, categoryId: string): Promise<Product[]> => {
    try {
      const response = await api.get<any[]>(`/restaurants/${restaurantId}/categories/${categoryId}/products`);
      console.log(`Produtos da categoria ${categoryId}:`, response.data);
      
      // Processar produtos com a mesma lógica do método getProducts
      const processedProducts = response.data.map((product: any) => {
        // Em algumas APIs, os campos podem estar em formato prefixado (Product_categoryId)
        const productCategoryId = product.categoryId || 
                                 product.Product_categoryId || 
                                 (product.category && product.category.id) || 
                                 categoryId; // Usar o categoryId da URL como fallback
        
        // Obter a imagem e garantir que tenha URL completa
        const image = product.image || product.Product_image;
        const fullImageUrl = image ? getFullImageUrl(image) : undefined;
        
        return {
          id: product.id || product.Product_id,
          name: product.name || product.Product_name,
          description: product.description || product.Product_description || "",
          price: parseFloat(product.price || product.Product_price) || 0,
          image: fullImageUrl,
          categoryId: productCategoryId, // Garantir que o valor é consistente
          restaurantId: restaurantId,
          isActive: product.isActive || product.Product_isActive !== false,
          isAvailable: product.isAvailable || product.Product_isAvailable !== false,
          order: product.order || product.Product_order || 0
        };
      });
      
      return processedProducts;
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ${categoryId}:`, error);
      return [];
    }
  },

  // Criar um novo pedido
  async createOrder(restaurantId: string, orderData: CustomerOrderData): Promise<OrderResponse> {
    try {
      console.log('Iniciando criação de pedido...', orderData);
      
      // Gerar ID único para o pedido (será substituído pelo ID do banco se o salvamento for bem-sucedido)
      const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const timestamp = new Date().toISOString();
      
      // Buscar informações dos produtos do menu para obter preços reais
      let productsMap: {[key: string]: any} = {};
      
      try {
        // Tentar buscar produtos da API
        const response = await api.get(`/restaurants/${restaurantId}/products`);
        if (response.data && Array.isArray(response.data)) {
          // Criar um mapa de produtos por ID para acesso rápido
          productsMap = response.data.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
          }, {});
        }
      } catch (error) {
        console.warn('Erro ao buscar produtos do menu:', error);
        // Se falhar, continuar com valores padrão
      }
      
      // Calcular o total do pedido e preparar os itens com preços
      let total = 0;
      const itemsWithPrices = orderData.items.map(item => {
        // Tentar obter o produto pelo ID
        const product = productsMap[item.productId];
        
        // Usar preço real do produto se disponível, ou valor fixo como fallback
        const price = product ? product.price : 25.00;
        const itemTotal = price * item.quantity;
        total += itemTotal;
        
        // Retornar item com preços
        return {
          id: item.productId,
          quantity: item.quantity,
          notes: item.notes,
          price: price,
          total: itemTotal,
          name: product ? product.name : `Produto #${item.productId}` // Nome real ou padrão
        };
      });
      
      // Preparar dados para API
      const apiOrderData = {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone && orderData.customerPhone.length > 18 
          ? orderData.customerPhone.substring(0, 18) 
          : orderData.customerPhone || '',
        items: itemsWithPrices,
        deliveryMethod: orderData.deliveryMethod || 'pickup',
        deliveryAddress: orderData.deliveryAddress || '',
        notes: orderData.notes || '',
        total: total,
        restaurantId: restaurantId
      };
      
      console.log('Dados do pedido para API:', JSON.stringify(apiOrderData));
      
      // Tentar salvar no banco de dados
      let savedOrder = null;
      let savedInDb = false;
      
      try {
        // Tentar salvar via API principal - usando o axios diretamente
        console.log('Tentando salvar via API principal...');
        
        const response = await api.post('/orders', apiOrderData);
        
        if (response.status >= 200 && response.status < 300) {
          savedOrder = response.data;
          savedInDb = true;
          console.log('✅ Pedido salvo com sucesso via API principal:', savedOrder);
        }
      } catch (mainError) {
        console.error('❌ Erro na API principal:', mainError);
        
        try {
          // Tentar via rota alternativa
          console.log('Tentando salvar via rota alternativa...');
          
          const altResponse = await api.post(`/restaurants/${restaurantId}/orders`, apiOrderData);
          
          if (altResponse.status >= 200 && altResponse.status < 300) {
            savedOrder = altResponse.data;
            savedInDb = true;
            console.log('✅ Pedido salvo com sucesso via API alternativa:', savedOrder);
          }
        } catch (altError) {
          console.error('❌ Erro também na API alternativa:', altError);
          // Continuar para salvar localmente
        }
      }
      
      // Se não conseguiu salvar no banco, salvar localmente
      if (!savedInDb) {
        console.log('💾 Salvando pedido localmente...');
        
        // Criar objeto de pedido para localStorage
        const localOrder = {
          id: orderId,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          items: itemsWithPrices,
          status: 'pending',
          total,
          createdAt: timestamp,
          updatedAt: timestamp,
          deliveryMethod: orderData.deliveryMethod,
          deliveryAddress: orderData.deliveryAddress,
          notes: orderData.notes,
          savedInDb: false
        };
        
        // Obter pedidos existentes
        const existingOrders = localStorage.getItem('pendingOrders');
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        
        // Adicionar novo pedido
        orders.unshift(localOrder);
        
        // Salvar de volta no localStorage
        localStorage.setItem('pendingOrders', JSON.stringify(orders));
        console.log('✅ Pedido salvo localmente com sucesso');
        
        // Usar o pedido local como resultado
        savedOrder = localOrder;
      }
      
      // Disparar eventos para notificar a aplicação
      if (savedOrder) {
        // Evento para notificar sobre novo pedido
        const newOrderEvent = new CustomEvent('new-order-created', { 
          detail: savedOrder 
        });
        window.dispatchEvent(newOrderEvent);
        
        // Evento específico para tocar som
        const soundEvent = new CustomEvent('play-notification-sound');
        window.dispatchEvent(soundEvent);
      }
      
      // Retornar o pedido salvo (do banco ou local)
      if (savedOrder) {
        return savedOrder as OrderResponse;
      } else {
        return {
          id: orderId,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          items: itemsWithPrices,
          status: 'pending',
          total,
          createdAt: timestamp,
          updatedAt: timestamp,
          deliveryMethod: orderData.deliveryMethod,
          deliveryAddress: orderData.deliveryAddress,
          notes: orderData.notes,
          savedInDb: false
        };
      }
    } catch (error) {
      console.error('❌ Erro grave ao processar pedido:', error);
      throw error;
    }
  },

  // Verificar status do pedido
  getOrderStatus: async (restaurantId: string, orderId: string): Promise<any> => {
    const response = await api.get<any>(`/restaurants/${restaurantId}/orders/${orderId}/status`);
    return response.data;
  },

  // Método para buscar pedido pelo ID
  async getOrder(orderId: string) {
    try {
      // Tentar buscar da API primeiro
      try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
      } catch (apiError) {
        console.log('API indisponível, buscando pedido local');
        
        // Se falhar, buscar do localStorage
        const savedOrders = localStorage.getItem('pendingOrders') || '[]';
        const orders = JSON.parse(savedOrders);
        const order = orders.find((o: any) => o.id === orderId);
        
        if (order) {
          console.log('Pedido encontrado no localStorage:', order);
          return order;
        }
        
        // Se ainda não encontrar, retornar um pedido básico
        return {
          id: orderId,
          status: 'pending',
          createdAt: new Date().toISOString(),
          customerName: localStorage.getItem('customerName') || 'Cliente',
          customerPhone: localStorage.getItem('customerPhone') || '',
          items: [],
          total: 0,
          estimatedTime: '30-45 minutos'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }
}; 