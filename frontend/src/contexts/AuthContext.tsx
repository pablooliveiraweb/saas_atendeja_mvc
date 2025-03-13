import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  coverImage?: string;
  evolutionApiInstanceName?: string;
  evolutionApiInstanceConnected?: boolean;
  evolutionApiInstanceToken?: string;
  description?: string;
  address?: string;
  phone?: string;
  operatingHours?: string;
  [key: string]: any;
}

interface AuthState {
  token: string;
  refreshToken: string;
  user: User;
  restaurant: Restaurant | null;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  restaurant: Restaurant | null;
}

interface AuthContextData {
  user: User;
  restaurant: Restaurant | null;
  login(credentials: SignInCredentials): Promise<void>;
  logout(): void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string;
  refreshToken: string;
  updateRestaurant(restaurant: Restaurant): void;
  checkAuth(): Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@Atende:token');
    const refreshToken = localStorage.getItem('@Atende:refreshToken');
    const user = localStorage.getItem('@Atende:user');
    const restaurant = localStorage.getItem('@Atende:restaurant');

    if (token && user) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log('Token restaurado da localStorage e configurado nos headers');
      
      return {
        token,
        refreshToken: refreshToken || '',
        user: JSON.parse(user),
        restaurant: restaurant ? JSON.parse(restaurant) : null,
      };
    }

    return {} as AuthState;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async ({ email, password }: SignInCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { access_token, refresh_token, user, restaurant } = response.data;

      localStorage.setItem('@Atende:token', access_token);
      localStorage.setItem('@Atende:refreshToken', refresh_token);
      localStorage.setItem('@Atende:user', JSON.stringify(user));
      
      if (restaurant) {
        localStorage.setItem('@Atende:restaurant', JSON.stringify(restaurant));
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      console.log('Token salvo e configurado após login bem-sucedido');

      setData({ 
        token: access_token, 
        refreshToken: refresh_token,
        user, 
        restaurant 
      });
    } catch (err) {
      const error = err as any;
      if (error && error.response && error.response.data) {
        setError(error.response.data.message || 'Erro ao fazer login');
      } else {
        setError('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('@Atende:token');
    localStorage.removeItem('@Atende:refreshToken');
    localStorage.removeItem('@Atende:user');
    localStorage.removeItem('@Atende:restaurant');
    
    // Limpar o token dos headers
    delete api.defaults.headers.common["Authorization"];
    
    setData({} as AuthState);
  };

  const updateRestaurant = (restaurant: Restaurant) => {
    localStorage.setItem('@Atende:restaurant', JSON.stringify(restaurant));
    setData(prevData => ({
      ...prevData,
      restaurant
    }));
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await api.post<AuthResponse>('/auth/check-auth');
      const { access_token, refresh_token, user, restaurant } = response.data;

      localStorage.setItem('@Atende:token', access_token);
      localStorage.setItem('@Atende:refreshToken', refresh_token);
      localStorage.setItem('@Atende:user', JSON.stringify(user));
      
      if (restaurant) {
        localStorage.setItem('@Atende:restaurant', JSON.stringify(restaurant));
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      console.log('Token renovado e configurado após verificação de autenticação');

      setData({ 
        token: access_token, 
        refreshToken: refresh_token,
        user, 
        restaurant 
      });

      return true;
    } catch (err) {
      const error = err as any;
      if (error && error.response && error.response.data) {
        setError(error.response.data.message || 'Erro ao verificar autenticação');
      } else {
        setError('Erro ao verificar autenticação');
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: data.user,
        restaurant: data.restaurant,
        login,
        logout,
        isAuthenticated: !!data.user,
        loading,
        error,
        token: data.token,
        refreshToken: data.refreshToken,
        updateRestaurant,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 