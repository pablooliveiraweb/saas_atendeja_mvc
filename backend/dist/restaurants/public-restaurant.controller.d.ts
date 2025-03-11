import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
export declare class PublicRestaurantController {
    private restaurantRepository;
    constructor(restaurantRepository: Repository<Restaurant>);
    findBySlug(slug: string): Promise<Restaurant>;
    findById(id: string): Promise<Restaurant>;
}
