import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';

// Função para normalizar texto para comparação
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '')         // Remove caracteres especiais
    .replace(/\s+/g, '-');           // Substitui espaços por hífens
}

@ApiTags('public-restaurants')
@Controller('restaurants')
export class PublicRestaurantController {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get restaurant by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Restaurant slug (formatted name)' })
  @ApiResponse({ status: 200, description: 'Restaurant found' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findBySlug(@Param('slug') slug: string) {
    // Normalizar o slug recebido
    const normalizedInputSlug = slug.toLowerCase();
    
    // Buscar restaurante pelo slug
    const restaurant = await this.restaurantRepository.findOne({ 
      where: { slug: normalizedInputSlug } 
    });
    
    // Se não encontrar pelo slug exato, tentar buscar pelo nome normalizado (compatibilidade)
    if (!restaurant) {
      // Buscar todos os restaurantes
      const restaurants = await this.restaurantRepository.find();
      
      // Encontrar o restaurante cujo nome normalizado corresponde ao slug
      const restaurantByName = restaurants.find(r => {
        const restaurantSlug = normalizeText(r.name);
        return restaurantSlug === normalizedInputSlug;
      });
      
      if (restaurantByName) {
        return restaurantByName;
      }
      
      throw new NotFoundException(`Restaurant with slug ${slug} not found`);
    }
    
    return restaurant;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID (public)' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant found' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findById(@Param('id') id: string) {
    const restaurant = await this.restaurantRepository.findOne({ where: { id } });
    
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    
    return restaurant;
  }
} 