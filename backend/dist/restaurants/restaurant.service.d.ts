import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';
import { User } from '../users/entities/user.entity';
export declare class RestaurantService {
    private readonly restaurantRepository;
    private readonly evolutionApiService;
    private readonly logger;
    constructor(restaurantRepository: Repository<Restaurant>, evolutionApiService: EvolutionApiService);
    create(restaurantData: Partial<Restaurant>, owner: User): Promise<Restaurant>;
    findById(id: string): Promise<Restaurant | null>;
    update(id: string, updateData: Partial<Restaurant>): Promise<Restaurant>;
    connectWhatsAppInstance(id: string, phoneNumber?: string): Promise<any>;
    getWhatsAppQrCode(id: string): Promise<any>;
    sendWhatsAppMessage(id: string, number: string, text: string): Promise<any>;
    generateAndSaveSlug(id: string): Promise<Restaurant>;
    generateSlug(name: string): string;
}
