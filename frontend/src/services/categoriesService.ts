// import axios from 'axios';
import { api } from './api';
import { Category, CategoryFormData } from '../types/category';

// Função auxiliar para obter o ID do restaurante do localStorage
const getRestaurantId = () => {
  try {
    // Primeiro, tentar obter do localStorage
    const restaurantData = localStorage.getItem('@Atende:restaurant');
    if (!restaurantData) {
      console.error('Restaurante não encontrado no localStorage');
      throw new Error('Restaurante não encontrado');
    }
    
    try {
      const restaurant = JSON.parse(restaurantData);
      if (!restaurant || !restaurant.id) {
        console.error('Dados do restaurante inválidos:', restaurantData);
        throw new Error('Dados do restaurante inválidos');
      }
      console.log('RestaurantId obtido com sucesso:', restaurant.id);
      return restaurant.id;
    } catch (parseError) {
      console.error('Erro ao analisar dados do restaurante:', parseError);
      throw new Error('Erro ao analisar dados do restaurante');
    }
  } catch (error) {
    console.error('Erro ao obter restaurantId:', error);
    throw error;
  }
};

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    try {
      const restaurantId = getRestaurantId();
      console.log('Buscando categorias para o restaurante:', restaurantId);
      const response = await api.get(`/restaurants/${restaurantId}/categories`);
      return response.data as Category[];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Category> => {
    const restaurantId = getRestaurantId();
    const response = await api.get(`/restaurants/${restaurantId}/categories/${id}`);
    return response.data as Category;
  },

  create: async (data: CategoryFormData): Promise<Category> => {
    const restaurantId = getRestaurantId();
    const response = await api.post(`/restaurants/${restaurantId}/categories`, data);
    return response.data as Category;
  },

  update: async (id: string, data: CategoryFormData): Promise<Category> => {
    const restaurantId = getRestaurantId();
    const response = await api.patch(`/restaurants/${restaurantId}/categories/${id}`, data);
    return response.data as Category;
  },

  delete: async (id: string): Promise<void> => {
    const restaurantId = getRestaurantId();
    await api.delete(`/restaurants/${restaurantId}/categories/${id}`);
  },
};