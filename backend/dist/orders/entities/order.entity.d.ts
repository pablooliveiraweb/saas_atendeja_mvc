import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    CANCELED = "canceled"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    PIX = "pix"
}
export declare enum OrderType {
    PICKUP = "pickup",
    DELIVERY = "delivery",
    DINE_IN = "dineIn"
}
export declare class Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    orderType: OrderType;
    subtotal: number;
    total: number;
    notes: string;
    isPaid: boolean;
    deliveryAddress: string;
    deliveryZipCode: string;
    customerPhone: string;
    customerName: string;
    restaurant: Restaurant;
    restaurantId: string;
    customer: Customer;
    customerId: string;
    orderItems: OrderItem[];
    notificationSent: boolean;
    printed: boolean;
    couponCode: string;
    couponId: string;
    discountValue: number;
    coupon: Coupon;
    createdAt: Date;
    updatedAt: Date;
}
