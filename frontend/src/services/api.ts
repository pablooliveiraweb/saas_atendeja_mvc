import axios from 'axios';

// Normalizar URL base para evitar duplicações
const normalizeBaseURL = () => {
  // Obter URL base dos .env ou usar padrão
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  // Remover barras extras no final se existir
  let normalizedURL = baseURL;
  
  // Remover '/' no final se existir
  if (normalizedURL.endsWith('/')) {
    normalizedURL = normalizedURL.slice(0, -1);
  }
  
  // Vamos manter o /api no final, se existir
  console.log('API Base URL Normalizada:', normalizedURL);
  return normalizedURL;
};

// Criar instância do axios com URL normalizada
export const api = axios.create({
  baseURL: normalizeBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Flag para controlar se já estamos tentando renovar o token
let isRefreshing = false;
// Fila de requisições que falharam por token expirado
let failedQueue: any[] = [];

// Processar a fila de requisições que falharam
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Atende:token');
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    
    // Garantir que o token seja adicionado para todas as requisições
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token adicionado na requisição:', config.url);
  } else {
    console.warn('Token não encontrado para requisição:', config.url);
    
    // Tentar recarregar o token, pode ser que tenha sido atualizado em outra aba
    const newToken = localStorage.getItem('@Atende:token');
    if (newToken && newToken !== token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${newToken}`;
      console.log('Novo token encontrado e adicionado na requisição:', config.url);
    }
  }
  
  // Certificar-se de que a URL está correta para a API
  if (config.url) {
    // Não modificar URLs absolutas (começando com http:// ou https://)
    if (!config.url.startsWith('http')) {
      // Garantir que temos uma barra no início
      if (!config.url.startsWith('/')) {
        config.url = '/' + config.url;
      }
      
      // Não vamos adicionar o prefixo '/api' aqui, pois ele já está na URL base
      console.log('URL final:', config.url);
    }
  }
  
  // Log para debug
  const fullUrl = api.defaults.baseURL + config.url;
  console.log('Request URL final:', fullUrl);
  
  return config;
});

// Interceptor para lidar com erros de resposta
api.interceptors.response.use(
  response => response,
  async error => {
    // Log detalhado do erro
    if (error.response) {
      // Erro da resposta do servidor
      console.error('Erro na API:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
        config: {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL,
          headers: error.config.headers,
          data: error.config.data
        }
      });
      
      const originalRequest = error.config;
      
      // Se o erro for 401 (Unauthorized) e não for uma requisição de login ou refresh token
      if (error.response.status === 401 && 
          !originalRequest._retry && 
          !originalRequest.url.includes('/auth/login') &&
          !originalRequest.url.includes('/auth/refresh-token')) {
        
        if (isRefreshing) {
          // Se já estamos renovando o token, adicionar esta requisição à fila
          console.log('Já estamos renovando o token, adicionando requisição à fila');
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              console.log('Token renovado, refazendo requisição original');
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => {
              console.error('Erro ao processar requisição na fila:', err);
              return Promise.reject(err);
            });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          // Tentar renovar o token
          console.log('Tentando renovar o token...');
          
          // Obter o refresh token em vez do token atual
          const refreshToken = localStorage.getItem('@Atende:refreshToken');
          
          if (!refreshToken) {
            // Se não houver refresh token, redirecionar para login
            console.log('Não há refresh token para renovar, redirecionando para login...');
            localStorage.clear(); // Limpar todos os dados da localStorage
            window.location.href = '/login';
            return Promise.reject(error);
          }
          
          // Fazer a requisição para renovar o token usando o refresh token
          const response = await axios.post<{ accessToken: string; refreshToken: string }>(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { token: refreshToken }
          );
          
          if (response.data.accessToken) {
            const newToken = response.data.accessToken;
            const newRefreshToken = response.data.refreshToken;
            
            // Salvar os novos tokens
            localStorage.setItem('@Atende:token', newToken);
            localStorage.setItem('@Atende:refreshToken', newRefreshToken);
            
            console.log('Token renovado com sucesso');
            
            // Atualizar o token no header da requisição original
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // Processar a fila de requisições que falharam
            processQueue(null, newToken);
            
            // Refazer a requisição original com o novo token
            return api(originalRequest);
          } else {
            // Se não conseguir renovar o token, redirecionar para login
            console.log('Não foi possível renovar o token, redirecionando para login...');
            localStorage.clear(); // Limpar todos os dados da localStorage
            window.location.href = '/login';
            processQueue(error, null);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // Se ocorrer um erro ao renovar o token, redirecionar para login
          console.error('Erro ao renovar o token:', refreshError);
          localStorage.clear(); // Limpar todos os dados da localStorage
          window.location.href = '/login';
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    } else if (error.request) {
      // Sem resposta do servidor
      console.error('Sem resposta do servidor:', error.request);
    } else {
      // Erro ao configurar requisição
      console.error('Erro na configuração da requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;