import { api } from './api';
import { Customer } from '../types/customer';
import { ordersService } from './ordersService';

// Função auxiliar para gerar data aleatória no passado
const getRandomPastDate = (minDays = 7, maxDays = 60) => {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - daysAgo);
  return pastDate;
};

// Função auxiliar para limpar dados antes de enviar para a API
const cleanCustomerData = (customer: Partial<Customer>) => {
  // Garantir que apenas os campos obrigatórios estejam presentes
  const requiredFields = {
    name: customer.name || 'Cliente',
    email: customer.email || `${Date.now()}@cliente.temp`,
    phone: customer.phone || '5511999999999',
  };
  
  // Log para depuração
  console.log('Dados limpos (apenas campos obrigatórios):', requiredFields);
  
  return requiredFields;
};

// Interface do serviço
interface CustomersService {
  getAll: (restaurantId: string) => Promise<Customer[]>;
  getById: (id: string, restaurantId: string) => Promise<Customer>;
  getByPhone: (phone: string, restaurantId: string) => Promise<Customer | null>;
  create: (customer: Partial<Customer>, restaurantId: string) => Promise<Customer>;
  update: (id: string, customer: Partial<Customer>, restaurantId: string) => Promise<Customer>;
  remove: (id: string, restaurantId: string) => Promise<void>;
  getTopCustomers: (restaurantId: string) => Promise<Customer[]>;
  getInactiveCustomers: (restaurantId: string) => Promise<any[]>;
  search: (query: string, restaurantId: string) => Promise<Customer[]>;
  delete: (id: string, restaurantId: string) => Promise<void>;
  createSimple: (restaurantId: string, name: string, phone: string, email?: string) => Promise<Customer>;
  ensureDefaultRestaurant: (restaurantId: string) => Promise<boolean>;
}

// Implementação do serviço
export const customersService: CustomersService = {
  // Buscar todos os clientes
  getAll: async (restaurantId: string) => {
    try {
      console.log('Buscando todos os clientes para restaurante:', restaurantId);
      
      // Tentar primeiro a rota específica de clientes
      try {
        const response = await api.get(`/restaurants/${restaurantId}/customers`);
        console.log('Clientes encontrados via rota específica:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Encontrados ${response.data.length} clientes`);
          return response.data as Customer[];
        } else {
          console.warn('Resposta não é um array:', response.data);
          return [];
        }
      } catch (specificError) {
        console.error('Erro na rota específica:', specificError);
        
        // Tentar a rota alternativa
        try {
          const altResponse = await api.get('/customers');
          console.log('Clientes encontrados via rota alternativa:', altResponse.data);
          
          if (altResponse.data && Array.isArray(altResponse.data)) {
            console.log(`Encontrados ${altResponse.data.length} clientes via rota alternativa`);
            return altResponse.data as Customer[];
          } else {
            console.warn('Resposta alternativa não é um array:', altResponse.data);
            return [];
          }
        } catch (altError) {
          console.error('Erro na rota alternativa:', altError);
          throw altError;
        }
      }
    } catch (error: any) {
      console.error('API indisponível para clientes:', error);
      return [];
    }
  },

  // Buscar cliente específico pelo ID
  getById: async (id: string, restaurantId: string) => {
    try {
      console.log(`Buscando cliente com ID ${id}...`);
      
      // Tentar primeiro a rota específica
      try {
        const response = await api.get(`/restaurants/${restaurantId}/customers/${id}`);
        return response.data as Customer;
      } catch (specificError) {
        console.error('Erro na rota específica:', specificError);
        
        // Tentar a rota alternativa
        const altResponse = await api.get(`/customers/${id}`);
        return altResponse.data as Customer;
      }
    } catch (error: any) {
      console.error('API indisponível para cliente específico:', error);
      throw new Error(`Cliente não encontrado: ${error?.message || 'Erro desconhecido'}`);
    }
  },

  // Buscar cliente pelo telefone
  getByPhone: async (phone: string, restaurantId: string) => {
    try {
      console.log(`Buscando cliente com telefone ${phone}...`);
      
      // Tentar primeiro a rota específica
      try {
        const response = await api.get(`/restaurants/${restaurantId}/customers/phone/${phone}`);
    return response.data as Customer;
      } catch (specificError) {
        console.error('Erro na rota específica:', specificError);
        
        // Tentar a rota alternativa
        try {
          const altResponse = await api.get(`/customers/phone/${phone}`);
          return altResponse.data as Customer;
        } catch (altError) {
          console.error('Erro na rota alternativa:', altError);
          return null;
        }
      }
    } catch (error: any) {
      console.error('API indisponível para busca por telefone:', error);
      return null;
    }
  },

  // Criar novo cliente
  create: async (customer: Partial<Customer>, restaurantId: string) => {
    try {
      console.log('Criando novo cliente:', customer);
      
      // Limpar dados antes de enviar
      const cleanedData = cleanCustomerData(customer);
      console.log('Dados limpos para criação:', cleanedData);
      
      // O restaurantId não deve estar no cleanedData, mas é usado na URL
      console.log('Restaurant ID para URL:', restaurantId);
      
      // Tentar primeiro a rota específica
      try {
        console.log('Tentando salvar via rota específica:', `POST /restaurants/${restaurantId}/customers`, cleanedData);
        const response = await api.post(`/restaurants/${restaurantId}/customers`, cleanedData);
        console.log('Cliente criado com sucesso via rota específica:', response.data);
        return response.data as Customer;
      } catch (specificError: any) {
        console.error('Erro na rota específica:', specificError);
        if (specificError.response) {
          console.error('Detalhes do erro:', {
            status: specificError.response.status,
            statusText: specificError.response.statusText,
            data: specificError.response.data,
            headers: specificError.response.headers,
          });
        }
        
        // Tentar via rota alternativa - não inclui restaurantId na URL
        try {
          console.log('Tentando salvar via rota alternativa:', 'POST /customers', cleanedData);
          const altResponse = await api.post('/customers', cleanedData);
          console.log('Cliente criado com sucesso via rota alternativa:', altResponse.data);
          return altResponse.data as Customer;
        } catch (altError: any) {
          console.error('Erro na rota alternativa:', altError);
          if (altError.response) {
            console.error('Detalhes do erro alternativo:', {
              status: altError.response.status,
              statusText: altError.response.statusText,
              data: altError.response.data,
              headers: altError.response.headers,
            });
          }
          throw altError;
        }
      }
    } catch (error: any) {
      console.error('API indisponível para criar cliente:', error);
      throw error;
    }
  },

  // Atualizar cliente existente
  update: async (id: string, customer: Partial<Customer>, restaurantId: string) => {
    try {
      console.log('Iniciando atualização de cliente:', { id, customer });
      
      // Limpar dados antes de enviar
      const cleanedData = cleanCustomerData(customer);
      console.log('Dados limpos para atualização:', cleanedData);
      
      // Tentar todas as combinações possíveis de rotas e métodos
      const attempts = [
        // Tentativa 1: PUT na rota específica
        async () => {
          try {
            console.log(`Tentativa 1: PUT em /restaurants/${restaurantId}/customers/${id}`);
            const response = await api.put(`/restaurants/${restaurantId}/customers/${id}`, cleanedData);
            console.log('Sucesso na tentativa 1:', response.data);
            return response.data as Customer;
          } catch (error: any) {
            console.error('Erro na tentativa 1:', error);
            if (error.response && error.response.status === 400) {
              console.error('Erro 400 na tentativa 1. Detalhes:', error.response.data);
            }
            throw error;
          }
        },
        
        // Tentativa 2: PUT na rota alternativa
        async () => {
          try {
            console.log(`Tentativa 2: PUT em /customers/${id}`);
            const response = await api.put(`/customers/${id}`, cleanedData);
            console.log('Sucesso na tentativa 2:', response.data);
            return response.data as Customer;
          } catch (error: any) {
            console.error('Erro na tentativa 2:', error);
            if (error.response && error.response.status === 400) {
              console.error('Erro 400 na tentativa 2. Detalhes:', error.response.data);
            }
            throw error;
          }
        },
        
        // Tentativa 3: PATCH na rota específica
        async () => {
          try {
            console.log(`Tentativa 3: PATCH em /restaurants/${restaurantId}/customers/${id}`);
            const response = await api.patch(`/restaurants/${restaurantId}/customers/${id}`, cleanedData);
            console.log('Sucesso na tentativa 3:', response.data);
            return response.data as Customer;
          } catch (error: any) {
            console.error('Erro na tentativa 3:', error);
            if (error.response && error.response.status === 400) {
              console.error('Erro 400 na tentativa 3. Detalhes:', error.response.data);
            }
            throw error;
          }
        },
        
        // Tentativa 4: PATCH na rota alternativa
        async () => {
          try {
            console.log(`Tentativa 4: PATCH em /customers/${id}`);
            const response = await api.patch(`/customers/${id}`, cleanedData);
            console.log('Sucesso na tentativa 4:', response.data);
    return response.data as Customer;
          } catch (error: any) {
            console.error('Erro na tentativa 4:', error);
            if (error.response && error.response.status === 400) {
              console.error('Erro 400 na tentativa 4. Detalhes:', error.response.data);
            }
            throw error;
          }
        }
      ];
      
      // Tentar cada método sequencialmente
      let lastError = null;
      for (const attempt of attempts) {
        try {
          return await attempt();
        } catch (error) {
          lastError = error;
          // Continuar para a próxima tentativa
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      console.error('Todas as tentativas de atualização falharam. Último erro:', lastError);
      throw lastError;
    } catch (error: any) {
      console.error('Erro geral ao atualizar cliente:', error);
      throw error;
    }
  },

  // Remover cliente
  remove: async (id: string, restaurantId: string) => {
    try {
      console.log(`Removendo cliente ${id}...`);
      
      // Tentar primeiro a rota específica
      try {
        await api.delete(`/restaurants/${restaurantId}/customers/${id}`);
        console.log('Cliente removido com sucesso via rota específica');
        return;
      } catch (specificError) {
        console.error('Erro na rota específica:', specificError);
        
        // Tentar a rota alternativa
        await api.delete(`/customers/${id}`);
        console.log('Cliente removido com sucesso via rota alternativa');
        return;
      }
    } catch (error: any) {
      console.error('API indisponível para remover cliente:', error);
      throw error;
    }
  },

  // Buscar clientes mais frequentes
  getTopCustomers: async (restaurantId: string) => {
    try {
      console.log('Buscando clientes mais frequentes...');
      
      // Tentar primeiro a rota específica
      try {
        const response = await api.get(`/restaurants/${restaurantId}/customers/top`);
    return response.data as Customer[];
      } catch (specificError) {
        console.error('Erro na rota específica:', specificError);
        
        // Tentar a rota alternativa
        const altResponse = await api.get('/customers/top');
        return altResponse.data as Customer[];
      }
    } catch (error: any) {
      console.error('API indisponível para top clientes:', error);
      return [];
    }
  },
  
  // Buscar clientes inativos (mais de 7 dias sem pedidos)
  getInactiveCustomers: async (restaurantId: string) => {
    try {
      console.log('Buscando clientes inativos...');
      
      // Tentar primeiro a rota específica
      try {
        const response = await api.get(`/restaurants/${restaurantId}/customers/inactive`);
        return response.data as any[];
      } catch (specificError) {
        console.error('Erro na rota específica:', specificError);
        
        // Tentar a rota alternativa
        const altResponse = await api.get('/customers/inactive');
        return altResponse.data as any[];
      }
    } catch (error: any) {
      console.error('API indisponível para clientes inativos:', error);
      return [];
    }
  },
  
  // Buscar clientes por termo de pesquisa
  search: async (query: string, restaurantId: string) => {
    try {
      console.log(`Buscando clientes com termo "${query}"...`);
      
      // Tentar primeiro a rota específica
      try {
        const response = await api.get(`/restaurants/${restaurantId}/customers?search=${encodeURIComponent(query)}`);
    return response.data as Customer[];
      } catch (specificError) {
        console.error('Erro na rota específica:', specificError);
        
        // Tentar a rota alternativa
        const altResponse = await api.get(`/customers/search?q=${encodeURIComponent(query)}`);
        return altResponse.data as Customer[];
      }
    } catch (error: any) {
      console.error('API indisponível para busca de clientes:', error);
      return [];
    }
  },
  
  // Excluir cliente (alias para remove)
  delete: async (id: string, restaurantId: string) => {
    return customersService.remove(id, restaurantId);
  },

  // Criar novo cliente simplificado - contorna problemas de validação
  createSimple: async (restaurantId: string, name: string, phone: string, email?: string): Promise<Customer> => {
    try {
      console.log('Criando cliente via rota simplificada');
      
      // Dados mínimos para criar um cliente
      const simpleData = {
        name: name || 'Cliente',
        phone: phone || '5511999999999',
        email: email || `cliente-${Date.now().toString().slice(-6)}@temp.com`
      };
      
      console.log('Dados simplificados:', simpleData);
      
      // Usar a rota simplificada
      const response = await api.post(`/restaurants/${restaurantId}/customers/simple`, simpleData);
      console.log('Cliente criado com sucesso via rota simplificada:', response.data);
      return response.data as Customer;
    } catch (error: any) {
      console.error('Erro na rota simplificada:', error);
      if (error.response) {
        console.error('Detalhes do erro simplificado:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      throw error;
    }
  },

  // Verificar se o restaurante padrão existe
  ensureDefaultRestaurant: async (restaurantId: string): Promise<boolean> => {
    try {
      console.log('Verificando se o restaurante padrão existe');
      
      // Verificar se o restaurante padrão existe
      const response = await api.get(`/restaurants/${restaurantId}/ensure-default-restaurant`);
      console.log('Restaurante padrão verificado:', response.data);
      return true;
    } catch (error: any) {
      console.error('Erro ao verificar restaurante padrão:', error);
      if (error.response && error.response.status === 404) {
        console.error('ATENÇÃO: Restaurante padrão não encontrado. Você precisa criar manualmente no banco de dados um restaurante com ID:', restaurantId);
        alert(`ATENÇÃO: Restaurante padrão não encontrado. ID necessário: ${restaurantId}`);
      }
      return false;
    }
  }
};

export default customersService;