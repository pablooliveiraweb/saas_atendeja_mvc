import { Category } from '../../categories/entities/category.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isActive: boolean;
    isAvailable: boolean;
    order: number;
    category: Category;
    restaurant: Restaurant;
    createdAt: Date;
    updatedAt: Date;
}
