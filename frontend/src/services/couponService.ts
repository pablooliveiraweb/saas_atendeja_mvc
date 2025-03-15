import api from './api';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  minOrderValue?: number;
  maxUsage?: number;
  usageCount: number;
  expiresAt?: Date;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCouponDto {
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive?: boolean;
  minOrderValue?: number;
  maxUsage?: number;
  expiresAt?: Date;
  restaurantId: string;
}

export interface UpdateCouponDto {
  code?: string;
  description?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  isActive?: boolean;
  minOrderValue?: number;
  maxUsage?: number;
  expiresAt?: Date;
}

export interface ValidateCouponResponse {
  coupon: Coupon;
  discount: number;
}

const couponService = {
  // Obter todos os cupons de um restaurante
  async getCoupons(restaurantId: string): Promise<Coupon[]> {
    const response = await api.get(`/coupons?restaurantId=${restaurantId}`);
    return response.data as Coupon[];
  },

  // Obter um cupom específico
  async getCoupon(id: string): Promise<Coupon> {
    const response = await api.get(`/coupons/${id}`);
    return response.data as Coupon;
  },

  // Criar um novo cupom
  async createCoupon(couponData: CreateCouponDto): Promise<Coupon> {
    const response = await api.post('/coupons', couponData);
    return response.data as Coupon;
  },

  // Atualizar um cupom existente
  async updateCoupon(id: string, couponData: UpdateCouponDto): Promise<Coupon> {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data as Coupon;
  },

  // Excluir um cupom
  async deleteCoupon(id: string): Promise<void> {
    await api.delete(`/coupons/${id}`);
  },

  // Validar um cupom
  async validateCoupon(code: string, restaurantId: string, orderValue: number): Promise<ValidateCouponResponse> {
    try {
      const response = await api.post('/coupons/validate', {
        code,
        restaurantId,
        orderValue
      });
      return response.data as ValidateCouponResponse;
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        throw new Error(error.response.data?.message || 'Cupom inválido');
      }
      throw error;
    }
  }
};

export default couponService; 