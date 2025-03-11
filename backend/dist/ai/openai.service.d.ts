import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/services/categories.service';
import { RestaurantService } from '../restaurants/restaurant.service';
import { CustomersService } from '../customers/customers.service';
export declare class OpenAIService {
    private configService;
    private productsService;
    private categoriesService;
    private restaurantService;
    private customersService;
    private readonly logger;
    private openai;
    constructor(configService: ConfigService, productsService: ProductsService, categoriesService: CategoriesService, restaurantService: RestaurantService, customersService: CustomersService);
    getAssistantResponse(restaurantId: string, userMessage: string, conversationHistory: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>): Promise<string | null>;
}
