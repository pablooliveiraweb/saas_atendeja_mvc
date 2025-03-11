import { api } from './api';
import { Category } from '../types/category';
import { Product, ProductFormData } from '../types/product';

// Função auxiliar para obter o ID do restaurante do localStorage
const getRestaurantId = () => {
  const restaurantData = localStorage.getItem('@Atende:restaurant');
  if (!restaurantData) {
    throw new Error('Restaurante não encontrado');
  }
  const restaurant = JSON.parse(restaurantData);
  return restaurant.id;
};

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const restaurantId = getRestaurantId();
    const response = await api.get(`/restaurants/${restaurantId}/products`);
    return response.data as Product[];
  },

  getByCategory: async (categoryId: string): Promise<Product[]> => {
    const restaurantId = getRestaurantId();
    const response = await api.get(`/restaurants/${restaurantId}/products/category/${categoryId}`);
    return response.data as Product[];
  },

  getById: async (id: string): Promise<Product> => {
    const restaurantId = getRestaurantId();
    const response = await api.get(`/restaurants/${restaurantId}/products/${id}`);
    return response.data as Product;
  },

  create: async (data: ProductFormData): Promise<Product> => {
    const restaurantId = getRestaurantId();
    const response = await api.post(`/restaurants/${restaurantId}/products`, data);
    return response.data as Product;
  },

  update: async (id: string, data: ProductFormData): Promise<Product> => {
    const restaurantId = getRestaurantId();
    const response = await api.patch(`/restaurants/${restaurantId}/products/${id}`, data);
    return response.data as Product;
  },

  delete: async (id: string): Promise<void> => {
    const restaurantId = getRestaurantId();
    await api.delete(`/restaurants/${restaurantId}/products/${id}`);
  },
};