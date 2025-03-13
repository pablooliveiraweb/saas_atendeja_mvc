import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
export declare class UsersController {
    private readonly restaurantRepository;
    constructor(restaurantRepository: Repository<Restaurant>);
    getMyRestaurant(req: any): Promise<Restaurant>;
    updateMyRestaurant(req: any, updateData: Partial<Restaurant>): Promise<Restaurant>;
    uploadLogo(req: any, file: Express.Multer.File): Promise<{
        logoUrl: string;
    }>;
    uploadCover(req: any, file: Express.Multer.File): Promise<{
        coverUrl: string;
    }>;
}
