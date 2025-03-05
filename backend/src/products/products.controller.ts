import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthUser } from '../auth/types/auth.types';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' })
  create(@Body() createProductDto: CreateProductDto, @Req() req: RequestWithUser) {
    return this.productsService.create(
      createProductDto,
      req.user.restaurantId as string,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos do restaurante' })
  findAll(@Req() req: RequestWithUser) {
    return this.productsService.findAll(req.user.restaurantId as string);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Listar produtos por categoria' })
  findByCategory(@Param('categoryId') categoryId: string, @Req() req: RequestWithUser) {
    return this.productsService.findByCategory(
      categoryId,
      req.user.restaurantId as string,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um produto pelo ID' })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.productsService.findOne(id, req.user.restaurantId as string);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um produto' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: RequestWithUser,
  ) {
    return this.productsService.update(
      id,
      updateProductDto,
      req.user.restaurantId as string,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um produto' })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.productsService.remove(id, req.user.restaurantId as string);
  }
}

@ApiTags('restaurant-products')
@Controller('restaurants/:restaurantId/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RestaurantProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto para um restaurante específico' })
  create(
    @Param('restaurantId') restaurantId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto, restaurantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos de um restaurante específico' })
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.productsService.findAll(restaurantId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Listar produtos por categoria em um restaurante específico' })
  findByCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.productsService.findByCategory(categoryId, restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um produto pelo ID em um restaurante específico' })
  findOne(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(id, restaurantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um produto em um restaurante específico' })
  update(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto, restaurantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um produto de um restaurante específico' })
  remove(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(id, restaurantId);
  }
}

@ApiTags('restaurant-categories-products')
@Controller('restaurants/:restaurantId/categories/:categoryId/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RestaurantCategoryProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar produtos por categoria em um restaurante específico' })
  findByCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.productsService.findByCategory(categoryId, restaurantId);
  }
} 