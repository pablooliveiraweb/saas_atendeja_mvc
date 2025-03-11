import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, restaurantId: string) {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurante com ID ${restaurantId} não encontrado`,
      );
    }

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      restaurant,
    });

    return this.categoriesRepository.save(category);
  }

  async findAll(restaurantId: string) {
    return this.categoriesRepository.find({
      where: { restaurant: { id: restaurantId } },
      order: { order: 'ASC' } as any,
    });
  }

  async findOne(id: string, restaurantId: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    restaurantId: string,
  ) {
    const category = await this.findOne(id, restaurantId);
    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string, restaurantId: string) {
    const category = await this.findOne(id, restaurantId);
    return this.categoriesRepository.remove(category);
  }
} 