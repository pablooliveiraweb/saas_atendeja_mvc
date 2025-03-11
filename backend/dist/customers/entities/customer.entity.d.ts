import { Restaurant } from '../../restaurants/entities/restaurant.entity';
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
    restaurant: Restaurant;
    createdAt: Date;
    updatedAt: Date;
}
