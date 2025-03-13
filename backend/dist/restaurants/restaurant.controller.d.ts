import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
export declare class RestaurantController {
    private restaurantRepository;
    private restaurantService;
    constructor(restaurantRepository: Repository<Restaurant>, restaurantService: RestaurantService);
    findBySlug(slug: string): Promise<Restaurant>;
    findById(id: string): Promise<Restaurant>;
    connectWhatsApp(id: string): Promise<any>;
    getWhatsAppQrCode(id: string): Promise<any>;
    sendWhatsAppMessage(id: string, body: {
        number: string;
        text: string;
    }): Promise<any>;
    generateSlugs(): Promise<{
        message: string;
        results: ({
            id: string;
            name: string;
            slug: string;
            status: string;
            error?: undefined;
        } | {
            id: string;
            name: string;
            status: string;
            error: any;
            slug?: undefined;
        })[];
    }>;
}
