import { Restaurant } from '../../restaurants/entities/restaurant.entity';
export declare enum CouponType {
    PERCENTAGE = "percentage",
    FIXED = "fixed"
}
export declare class Coupon {
    id: string;
    code: string;
    description: string;
    type: CouponType;
    value: number;
    isActive: boolean;
    minOrderValue: number;
    maxUsage: number;
    usageCount: number;
    expiresAt: Date;
    restaurant: Restaurant;
    restaurantId: string;
    createdAt: Date;
    updatedAt: Date;
}
