import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';
export declare class Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    isActive: boolean;
    document: string;
    restaurantId: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderAt: Date;
    restaurant: Restaurant;
    orders: Order[];
    createdAt: Date;
    updatedAt: Date;
}
