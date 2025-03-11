import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('public-products')
@Controller('restaurants/:restaurantId/products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos de um restaurante específico (público)' })
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.productsService.findAll(restaurantId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Listar produtos por categoria em um restaurante específico (público)' })
  findByCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.productsService.findByCategory(categoryId, restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um produto pelo ID em um restaurante específico (público)' })
  findOne(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(id, restaurantId);
  }
}

@ApiTags('public-restaurant-categories-products')
@Controller('restaurants/:restaurantId/categories/:categoryId/products')
export class PublicRestaurantCategoryProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar produtos por categoria em um restaurante específico (público)' })
  findByCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.productsService.findByCategory(categoryId, restaurantId);
  }
} 