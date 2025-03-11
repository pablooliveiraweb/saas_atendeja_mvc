import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(restaurantId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Verificar se o restaurante existe
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurante com ID ${restaurantId} não encontrado`);
    }

    // Verificar se já existe uma categoria com o mesmo nome neste restaurante
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name: createCategoryDto.name,
        restaurant: { id: restaurantId },
      },
    });

    if (existingCategory) {
      throw new ConflictException(`Já existe uma categoria com o nome '${createCategoryDto.name}' neste restaurante`);
    }

    // Criar e salvar a nova categoria
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      restaurant,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(restaurantId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { restaurant: { id: restaurantId } },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string, restaurantId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        restaurant: { id: restaurantId },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    return category;
  }

  async update(id: string, restaurantId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Verificar se a categoria existe
    const category = await this.findOne(id, restaurantId);

    // Verificar se está tentando atualizar para um nome que já existe
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: {
          name: updateCategoryDto.name,
          restaurant: { id: restaurantId },
          id: Not(id), // Excluir a categoria atual da verificação
        },
      });

      if (existingCategory) {
        throw new ConflictException(`Já existe uma categoria com o nome '${updateCategoryDto.name}' neste restaurante`);
      }
    }

    // Atualizar e salvar a categoria
    this.categoryRepository.merge(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string, restaurantId: string): Promise<void> {
    // Verificar se a categoria existe
    const category = await this.findOne(id, restaurantId);

    // Remover a categoria
    await this.categoryRepository.remove(category);
  }
} 