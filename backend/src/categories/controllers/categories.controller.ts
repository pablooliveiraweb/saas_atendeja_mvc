import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PublicOrAuthGuard } from '../../auth/guards/public-or-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar uma nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado' })
  @ApiResponse({ status: 409, description: 'Categoria com mesmo nome já existe' })
  create(
    @Param('restaurantId') restaurantId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(restaurantId, createCategoryDto);
  }

  @Get()
  @UseGuards(PublicOrAuthGuard)
  @ApiOperation({ summary: 'Listar todas as categorias de um restaurante' })
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.categoriesService.findAll(restaurantId);
  }

  @Get(':id')
  @UseGuards(PublicOrAuthGuard)
  @ApiOperation({ summary: 'Buscar uma categoria específica' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  findOne(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.categoriesService.findOne(id, restaurantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar uma categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 409, description: 'Categoria com mesmo nome já existe' })
  update(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, restaurantId, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remover uma categoria' })
  @ApiResponse({ status: 200, description: 'Categoria removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  remove(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.categoriesService.remove(id, restaurantId);
  }
} 