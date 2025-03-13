import { ConversationService } from './conversation.service';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { RestaurantService } from '../restaurants/restaurant.service';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';
import { ConfigService } from '@nestjs/config';
export declare class AIController {
    private readonly conversationService;
    private readonly restaurantRepository;
    private readonly restaurantService;
    private readonly evolutionApiService;
    private readonly configService;
    private readonly logger;
    constructor(conversationService: ConversationService, restaurantRepository: Repository<Restaurant>, restaurantService: RestaurantService, evolutionApiService: EvolutionApiService, configService: ConfigService);
    handleWebhook(webhookData: any): Promise<{
        success: boolean;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    private isValidUUID;
    private convertToValidUUID;
    private generateSlug;
    checkAbandonedConversations(): Promise<void>;
}
