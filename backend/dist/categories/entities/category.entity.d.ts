import { Restaurant } from '../../restaurants/entities/restaurant.entity';
export declare class Category {
    id: string;
    name: string;
    description: string;
    order: number;
    isActive: boolean;
    restaurant: Restaurant;
    createdAt: Date;
    updatedAt: Date;
}
