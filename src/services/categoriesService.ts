import { api } from './api';
import { useAuth } from '../contexts/AuthContext';

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    // Obter o restaurantId do localStorage
    const restaurant = localStorage.getItem('@Atende:restaurant');
    const restaurantId = restaurant ? JSON.parse(restaurant).id : null;
    
    if (!restaurantId) {
      return [];
    }
    
    const response = await api.get<Category[]>(`/restaurants/${restaurantId}/categories`);
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    // Obter o restaurantId do localStorage
    const restaurant = localStorage.getItem('@Atende:restaurant');
    const restaurantId = restaurant ? JSON.parse(restaurant).id : null;
    
    if (!restaurantId) {
      throw new Error('Restaurante não encontrado');
    }
    
    const response = await api.get<Category>(`/restaurants/${restaurantId}/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryData): Promise<Category> => {
    // Obter o restaurantId do localStorage
    const restaurant = localStorage.getItem('@Atende:restaurant');
    const restaurantId = restaurant ? JSON.parse(restaurant).id : null;
    
    if (!restaurantId) {
      throw new Error('Restaurante não encontrado');
    }
    
    const response = await api.post<Category>(`/restaurants/${restaurantId}/categories`, data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    // Obter o restaurantId do localStorage
    const restaurant = localStorage.getItem('@Atende:restaurant');
    const restaurantId = restaurant ? JSON.parse(restaurant).id : null;
    
    if (!restaurantId) {
      throw new Error('Restaurante não encontrado');
    }
    
    const response = await api.patch<Category>(`/restaurants/${restaurantId}/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    // Obter o restaurantId do localStorage
    const restaurant = localStorage.getItem('@Atende:restaurant');
    const restaurantId = restaurant ? JSON.parse(restaurant).id : null;
    
    if (!restaurantId) {
      throw new Error('Restaurante não encontrado');
    }
    
    await api.delete(`/restaurants/${restaurantId}/categories/${id}`);
  },
}; 