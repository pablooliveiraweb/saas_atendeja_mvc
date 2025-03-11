import { Controller, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  @Get('me/restaurant')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter o restaurante do usuário logado' })
  @ApiResponse({ status: 200, description: 'Restaurante encontrado' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado' })
  async getMyRestaurant(@Request() req) {
    const userId = req.user.userId;
    
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: userId } },
    });
    
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado para este usuário');
    }
    
    return restaurant;
  }
} 