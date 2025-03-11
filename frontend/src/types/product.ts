import { Category } from './category';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId?: string;
  category?: Category;
  restaurantId: string;
  isActive: boolean;
  isAvailable: boolean;
  order?: number;
  additionalOptions?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
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
