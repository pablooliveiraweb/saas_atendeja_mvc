import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { OpenAIService } from './openai.service';
import { CustomersService } from '../customers/customers.service';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';
import { RestaurantService } from '../restaurants/restaurant.service';
interface TemporaryConversation {
    id: string;
    phoneNumber: string;
    restaurantId: string;
    isActive: boolean;
    lastInteractionAt: Date;
    isTemporary: true;
    needsFollowUp: boolean;
}
export declare class ConversationService {
    private conversationRepository;
    private messageRepository;
    private openAIService;
    private customersService;
    private evolutionApiService;
    private restaurantService;
    private readonly logger;
    constructor(conversationRepository: Repository<Conversation>, messageRepository: Repository<Message>, openAIService: OpenAIService, customersService: CustomersService, evolutionApiService: EvolutionApiService, restaurantService: RestaurantService);
    handleIncomingMessage(restaurantId: string, phoneNumber: string, messageContent: string): Promise<string | null>;
    findOrCreateConversation(restaurantId: string, phoneNumber: string): Promise<Conversation | TemporaryConversation>;
    saveMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message>;
    getConversationHistory(conversationId: string): Promise<{
        role: "user" | "assistant";
        content: string;
    }[]>;
    identifyAbandonedConversations(): Promise<number>;
    sendFollowUpMessage(conversationId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    private generateDiscountCode;
}
export {};
