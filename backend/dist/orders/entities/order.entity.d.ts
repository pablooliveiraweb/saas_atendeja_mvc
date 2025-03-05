import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    DELIVERED = "delivered",
    CANCELED = "canceled"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    PIX = "pix"
}
export declare enum OrderType {
    DELIVERY = "delivery",
    PICKUP = "pickup"
}
export declare class Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    orderType: OrderType;
    subtotal: number;
    deliveryFee: number;
    total: number;
    notes: string;
    isPaid: boolean;
    deliveryAddress: string;
    deliveryZipCode: string;
    customerPhone: string;
    customerName: string;
    restaurant: Restaurant;
    customer: User;
    items: OrderItem[];
    notificationSent: boolean;
    printed: boolean;
    createdAt: Date;
    updatedAt: Date;
}
