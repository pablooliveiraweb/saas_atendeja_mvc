import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('public-categories')
@Controller('restaurants/:restaurantId/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias de um restaurante (público)' })
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso' })
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.categoriesService.findAll(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma categoria específica (público)' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  findOne(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.categoriesService.findOne(id, restaurantId);
  }
} 