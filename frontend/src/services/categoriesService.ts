import axios from 'axios';
import { api } from './api';

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

// Função auxiliar para obter o ID do restaurante do localStorage
const getRestaurantId = () => {
  const restaurantData = localStorage.getItem('@Atende:restaurant');
  if (!restaurantData) {
    throw new Error('Restaurante não encontrado');
  }
  const restaurant = JSON.parse(restaurantData);
  return restaurant.id;
};

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const restaurantId = getRestaurantId();
    const response = await api.get<Category[]>(`/restaurants/${restaurantId}/categories`);
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const restaurantId = getRestaurantId();
    const response = await api.get<Category>(`/restaurants/${restaurantId}/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryData): Promise<Category> => {
    const restaurantId = getRestaurantId();
    const response = await api.post<Category>(`/restaurants/${restaurantId}/categories`, data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const restaurantId = getRestaurantId();
    const response = await api.patch<Category>(`/restaurants/${restaurantId}/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const restaurantId = getRestaurantId();
    await api.delete(`/restaurants/${restaurantId}/categories/${id}`);
  },
}; 