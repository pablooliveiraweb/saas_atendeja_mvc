import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/services/categories.service';
import { RestaurantService } from '../restaurants/restaurant.service';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
export declare class OpenAIService {
    private configService;
    private productsService;
    private categoriesService;
    private restaurantService;
    private customersService;
    private ordersService;
    private readonly logger;
    private openai;
    constructor(configService: ConfigService, productsService: ProductsService, categoriesService: CategoriesService, restaurantService: RestaurantService, customersService: CustomersService, ordersService: OrdersService);
    getAssistantResponse(restaurantId: string, userMessage: string, conversationHistory: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>, phoneNumber?: string): Promise<string | null>;
}
