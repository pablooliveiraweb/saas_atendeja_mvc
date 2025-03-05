import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('@Atende:token');
      localStorage.removeItem('@Atende:user');
      localStorage.removeItem('@Atende:restaurantId');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpa o localStorage
      localStorage.removeItem('@Atende:token');
      localStorage.removeItem('@Atende:user');
      localStorage.removeItem('@Atende:restaurantId');
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('@Atende:token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('@Atende:user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Erro ao obter usuário do localStorage:', error);
      return null;
    }
  }
}; 