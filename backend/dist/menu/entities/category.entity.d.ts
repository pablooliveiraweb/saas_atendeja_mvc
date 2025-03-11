import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Product } from './product.entity';
export declare class Category {
    id: string;
    name: string;
    description: string;
    order: number;
    isActive: boolean;
    restaurant: Restaurant;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
