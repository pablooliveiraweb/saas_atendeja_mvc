import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
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
    CREDIT = "credit",
    DEBIT = "debit",
    PIX = "pix",
    ONLINE = "online"
}
export declare enum OrderType {
    DELIVERY = "delivery",
    PICKUP = "pickup",
    DINE_IN = "dine_in"
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
    user: User;
    orderItems: OrderItem[];
    notificationSent: boolean;
    printed: boolean;
    createdAt: Date;
    updatedAt: Date;
}
