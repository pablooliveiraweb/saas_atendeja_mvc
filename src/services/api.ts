import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@Atende:token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('@Atende:token');
      localStorage.removeItem('@Atende:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 