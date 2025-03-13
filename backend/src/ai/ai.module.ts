import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ConversationService } from './conversation.service';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { RestaurantModule } from '../restaurants/restaurant.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { AIController } from './ai.controller';
import { CustomersModule } from '../customers/customers.module';
import { EvolutionApiModule } from '../evolution-api/evolution-api.module';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, Restaurant]),
    ProductsModule,
    CategoriesModule,
    RestaurantModule,
    CustomersModule,
    EvolutionApiModule,
    OrdersModule,
  ],
  controllers: [AIController],
  providers: [OpenAIService, ConversationService],
  exports: [OpenAIService, ConversationService],
})
export class AIModule {} 