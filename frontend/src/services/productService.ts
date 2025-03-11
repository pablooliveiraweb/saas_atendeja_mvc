import axios from 'axios';
import { Product, ProductFormData } from '../types/product';
import { Category } from '../types/category';

const API_URL = process.env.REACT_APP_API_URL;

export const productService = {
  // Produtos
  async getProducts(): Promise<Product[]> {
    const response = await axios.get<Product[]>(`${API_URL}/products`);
    return response.data;
  },

  async createProduct(data: ProductFormData): Promise<Product> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'price') {
          formData.append(key, value.toString());
        } else if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const response = await axios.post<Product>(`${API_URL}/products`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'price') {
          formData.append(key, value.toString());
        } else if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const response = await axios.patch<Product>(`${API_URL}/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${API_URL}/products/${id}`);
  },

  // Categorias
  async getCategories(): Promise<Category[]> {
    const response = await axios.get<Category[]>(`${API_URL}/categories`);
    return response.data;
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const response = await axios.post<Category>(`${API_URL}/categories`, data);
    return response.data;
  },

  async updateCategory(
    id: string,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<Category> {
    const response = await axios.patch<Category>(`${API_URL}/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await axios.delete(`${API_URL}/categories/${id}`);
  },
};
