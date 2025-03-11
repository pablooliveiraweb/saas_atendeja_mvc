import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
export declare class UsersController {
    private readonly restaurantRepository;
    constructor(restaurantRepository: Repository<Restaurant>);
    getMyRestaurant(req: any): Promise<Restaurant>;
}
