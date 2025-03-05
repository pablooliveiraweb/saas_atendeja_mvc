import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova categoria' })
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req) {
    return this.categoriesService.create(createCategoryDto, req.user.restaurantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias do restaurante' })
  findAll(@Req() req) {
    return this.categoriesService.findAll(req.user.restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma categoria pelo ID' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.categoriesService.findOne(id, req.user.restaurantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma categoria' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, req.user.restaurantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma categoria' })
  remove(@Param('id') id: string, @Req() req) {
    return this.categoriesService.remove(id, req.user.restaurantId);
  }
} 