import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
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
}

interface AuthState {
  token: string;
  user: User;
  restaurant: Restaurant | null;
}

interface SignInCredentials {
  email: string;
  password: string;
}

// Interface para a resposta da API de autenticação
interface AuthResponse {
  access_token: string;
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
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@Atende:token');
    const user = localStorage.getItem('@Atende:user');
    const restaurant = localStorage.getItem('@Atende:restaurant');

    if (token && user) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      return {
        token,
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
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // Usando type assertion para o objeto data
      const responseData = response.data as any;
      const access_token = responseData.access_token;
      const user = responseData.user;
      const restaurant = responseData.restaurant;

      localStorage.setItem('@Atende:token', access_token);
      localStorage.setItem('@Atende:user', JSON.stringify(user));
      
      if (restaurant) {
        localStorage.setItem('@Atende:restaurant', JSON.stringify(restaurant));
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setData({ token: access_token, user, restaurant });
    } catch (err) {
      // Tratamento de erro genérico
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
    localStorage.removeItem('@Atende:user');
    localStorage.removeItem('@Atende:restaurant');

    setData({} as AuthState);
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