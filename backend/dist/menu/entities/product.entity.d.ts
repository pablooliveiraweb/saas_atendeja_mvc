import { Category } from './category.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    order: number;
    additionalOptions: string;
    category: Category;
    restaurant: Restaurant;
    createdAt: Date;
    updatedAt: Date;
}
