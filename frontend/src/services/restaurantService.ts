import axios from 'axios';
import { api } from './api';

export interface Restaurant {
  themeColor?: string;
  coverImage?: string;
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

// Obter a URL base da API
// Primeiro tenta usar a variável de ambiente, depois tenta obter do servidor atual, ou usa uma URL fixa
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Tentar obter a URL base do servidor atual
  const currentUrl = window.location.origin;
  
  // Se estamos em localhost:3000 (frontend), a API provavelmente está em localhost:3001 (backend)
  if (currentUrl.includes('localhost:3000')) {
    return 'http://localhost:3001';
  }
  
  // Caso contrário, usar a mesma origem
  return currentUrl;
};

const API_URL = getBaseUrl();
console.log('API_URL em restaurantService:', API_URL);

// Função para garantir que a URL da imagem tenha o caminho completo
const getFullImageUrl = (path: string | undefined): string | undefined => {
  if (!path) return undefined;
  
  // Se já começa com http:// ou https://, já é uma URL completa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Se começa com data:, é uma URL de dados (base64)
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Garantir que o caminho comece com /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Retornar a URL completa
  return `${API_URL}${normalizedPath}`;
};

export const restaurantService = {
  // Buscar restaurante por ID
  getById: async (id: string): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    const restaurant = response.data;
    
    // Garantir que as URLs das imagens sejam completas
    if (restaurant.logo) {
      restaurant.logo = getFullImageUrl(restaurant.logo);
    }
    if (restaurant.coverImage) {
      restaurant.coverImage = getFullImageUrl(restaurant.coverImage);
    }
    
    return restaurant;
  },

  // Buscar restaurante por slug (nome formatado)
  getBySlug: async (slug: string): Promise<Restaurant> => {
    const response = await axios.get<Restaurant>(`${API_URL}/restaurants/slug/${slug}`);
    const restaurant = response.data;
    
    // Garantir que as URLs das imagens sejam completas
    if (restaurant.logo) {
      restaurant.logo = getFullImageUrl(restaurant.logo);
    }
    if (restaurant.coverImage) {
      restaurant.coverImage = getFullImageUrl(restaurant.coverImage);
    }
    
    console.log('Restaurante com URLs completas:', restaurant);
    return restaurant;
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