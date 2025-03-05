import { api } from './api';
import { Category } from './categoriesService';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive: boolean;
  isAvailable: boolean;
  order: number;
  category: Category;
  additionalOptions?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  order?: number;
  categoryId: string;
  additionalOptions?: any[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  order?: number;
  categoryId?: string;
  additionalOptions?: any[];
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

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const restaurantId = getRestaurantId();
    const response = await api.get<Product[]>(`/restaurants/${restaurantId}/products`);
    return response.data;
  },

  getByCategory: async (categoryId: string): Promise<Product[]> => {
    const restaurantId = getRestaurantId();
    const response = await api.get<Product[]>(`/restaurants/${restaurantId}/categories/${categoryId}/products`);
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const restaurantId = getRestaurantId();
    const response = await api.get<Product>(`/restaurants/${restaurantId}/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const restaurantId = getRestaurantId();
    const response = await api.post<Product>(`/restaurants/${restaurantId}/products`, data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductData): Promise<Product> => {
    const restaurantId = getRestaurantId();
    const response = await api.patch<Product>(`/restaurants/${restaurantId}/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const restaurantId = getRestaurantId();
    await api.delete(`/restaurants/${restaurantId}/products/${id}`);
  },
}; 