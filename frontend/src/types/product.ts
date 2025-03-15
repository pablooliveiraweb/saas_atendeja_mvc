import { Category } from './category';

export interface Option {
  id?: string;
  name: string;
  price: number;
}

export interface OptionGroup {
  name: string;
  required: boolean;
  multiple: boolean;
  options: Option[];
}

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
  additionalOptions?: OptionGroup[];
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
  additionalOptions?: OptionGroup[];
}

export interface SelectedOption {
  groupName: string;
  option: Option;
}
