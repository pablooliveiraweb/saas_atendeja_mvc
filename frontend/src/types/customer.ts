export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF ou CNPJ
  address?: string;
  notes?: string;
  isActive: boolean;
  restaurantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF ou CNPJ
  address?: string;
  notes?: string;
  isActive: boolean;
  restaurantId?: string;
} 