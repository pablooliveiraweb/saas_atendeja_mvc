import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { RestaurantModule } from './restaurants/restaurant.module';
import { OrdersModule } from './orders/orders.module';
import { CouponsModule } from './coupons/coupons.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { User } from './users/entities/user.entity';
import { Customer } from './customers/entities/customer.entity';
import { Coupon } from './coupons/entities/coupon.entity';
import { EvolutionApiModule } from './evolution-api/evolution-api.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AIModule } from './ai/ai.module';
import { Conversation } from './ai/entities/conversation.entity';
import { Message } from './ai/entities/message.entity';
import evolutionApiConfig from './config/evolution-api.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [evolutionApiConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'Cpu031191'),
        database: configService.get('DATABASE_NAME', 'atende'),
        entities: [Restaurant, Category, Product, User, Order, OrderItem, Customer, Conversation, Message, Coupon],
        synchronize: true, // Temporariamente true para criar as tabelas
        logging: configService.get<boolean>('DATABASE_LOGGING', false),
        ssl: false,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        redirect: false
      }
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Restaurant, Category, Product, User, Order, OrderItem, Customer, Conversation, Message]),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    RestaurantModule,
    OrdersModule,
    CouponsModule,
    EvolutionApiModule,
    NotificationsModule,
    AIModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
