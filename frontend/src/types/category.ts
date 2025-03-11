export interface Category {
  id: string;
  name: string;
  description?: string;
  restaurantId: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
} 