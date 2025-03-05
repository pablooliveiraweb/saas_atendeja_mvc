export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  order: number;
  additionalOptions: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  image?: File;
}
