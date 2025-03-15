import { CouponType } from '../entities/coupon.entity';
export declare class CreateCouponDto {
    code: string;
    description?: string;
    type: CouponType;
    value: number;
    isActive?: boolean;
    minOrderValue?: number;
    maxUsage?: number;
    expiresAt?: Date;
    restaurantId: string;
}
