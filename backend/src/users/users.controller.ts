import { Controller, Get, UseGuards, Request, NotFoundException, Patch, Body, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

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

  @Patch('me/restaurant')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar o restaurante do usuário logado' })
  @ApiResponse({ status: 200, description: 'Restaurante atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado' })
  async updateMyRestaurant(@Request() req, @Body() updateData: Partial<Restaurant>) {
    const userId = req.user.userId;
    
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: userId } },
    });
    
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado para este usuário');
    }
    
    // Atualizar apenas os campos permitidos
    if (updateData.name) restaurant.name = updateData.name;
    if (updateData.description) restaurant.description = updateData.description;
    if (updateData.address) restaurant.address = updateData.address;
    if (updateData.phone) restaurant.phone = updateData.phone;
    if (updateData.operatingHours) restaurant.operatingHours = updateData.operatingHours;
    if (updateData.themeColor) restaurant.themeColor = updateData.themeColor;
    
    const updatedRestaurant = await this.restaurantRepository.save(restaurant);
    
    return updatedRestaurant;
  }

  @Post('me/restaurant/upload/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/restaurants/logos',
        filename: (req, file, cb) => {
          // Criar diretório se não existir
          if (!fs.existsSync('./uploads/restaurants/logos')) {
            fs.mkdirSync('./uploads/restaurants/logos', { recursive: true });
          }
          
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Fazer upload do logo do restaurante' })
  @ApiResponse({ status: 200, description: 'Logo enviado com sucesso' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado' })
  async uploadLogo(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.userId;
    
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: userId } },
    });
    
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado para este usuário');
    }
    
    // Atualizar o logo do restaurante
    restaurant.logo = `/uploads/restaurants/logos/${file.filename}`;
    await this.restaurantRepository.save(restaurant);
    
    return { logoUrl: restaurant.logo };
  }

  @Post('me/restaurant/upload/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './uploads/restaurants/covers',
        filename: (req, file, cb) => {
          // Criar diretório se não existir
          if (!fs.existsSync('./uploads/restaurants/covers')) {
            fs.mkdirSync('./uploads/restaurants/covers', { recursive: true });
          }
          
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Fazer upload da imagem de capa do restaurante' })
  @ApiResponse({ status: 200, description: 'Imagem de capa enviada com sucesso' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado' })
  async uploadCover(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.userId;
    
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: userId } },
    });
    
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado para este usuário');
    }
    
    // Atualizar a imagem de capa do restaurante
    restaurant.coverImage = `/uploads/restaurants/covers/${file.filename}`;
    await this.restaurantRepository.save(restaurant);
    
    return { coverUrl: restaurant.coverImage };
  }
} 