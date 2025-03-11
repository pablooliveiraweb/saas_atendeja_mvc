import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { ProductsService } from './products.service';
import { 
  ProductsController, 
  RestaurantProductsController,
  RestaurantCategoryProductsController
} from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Restaurant]),
  ],
  controllers: [
    ProductsController, 
    RestaurantProductsController,
    RestaurantCategoryProductsController
  ],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {} 