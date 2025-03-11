import axios from 'axios';
import { api } from './api';

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  status: string;
  deliveryEnabled: boolean;
  deliveryFee: number;
  minimumOrderValue: number;
  acceptsCash: boolean;
  acceptsCard: boolean;
  acceptsPix: boolean;
  operatingHours: string;
  whatsappNumber?: string;
  evolutionApiInstanceName?: string;
  evolutionApiInstanceConnected?: boolean;
  evolutionApiInstanceToken?: string;
}

const API_URL = process.env.REACT_APP_API_URL;

export const restaurantService = {
  // Buscar restaurante por ID
  getById: async (id: string): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  // Buscar restaurante por slug (nome formatado)
  getBySlug: async (slug: string): Promise<Restaurant> => {
    const response = await axios.get<Restaurant>(`${API_URL}/restaurants/slug/${slug}`);
    return response.data;
  },

  // Gerar slug a partir do nome do restaurante
  generateSlug: (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '')         // Remove caracteres especiais
      .replace(/\s+/g, '-');           // Substitui espaços por hífens
  },

  // Gerar URL do cardápio digital
  getMenuUrl: (restaurant: Restaurant): string => {
    const slug = restaurantService.generateSlug(restaurant.name);
    return `/menu/${slug}`;
  }
}; 