import { ConversationService } from './conversation.service';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
export declare class AIController {
    private readonly conversationService;
    private readonly restaurantRepository;
    private readonly logger;
    constructor(conversationService: ConversationService, restaurantRepository: Repository<Restaurant>);
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
    checkAbandonedConversations(): Promise<void>;
}
