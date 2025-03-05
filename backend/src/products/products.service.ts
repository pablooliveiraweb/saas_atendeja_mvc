import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto, restaurantId: string) {
    const category = await this.categoriesRepository.findOne({
      where: {
        id: createProductDto.categoryId,
        restaurant: { id: restaurantId },
      },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoria com ID ${createProductDto.categoryId} não encontrada`,
      );
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      category,
      restaurant: { id: restaurantId },
    });

    return this.productsRepository.save(product);
  }

  async findAll(restaurantId: string) {
    return this.productsRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['category'],
      order: {
        category: { order: 'ASC' } as any,
        order: 'ASC',
      } as any,
    });
  }

  async findByCategory(categoryId: string, restaurantId: string) {
    return this.productsRepository.find({
      where: {
        category: { id: categoryId },
        restaurant: { id: restaurantId },
      },
      order: {
        order: 'ASC',
      } as any,
    });
  }

  async findOne(id: string, restaurantId: string) {
    const product = await this.productsRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    restaurantId: string,
  ) {
    const product = await this.findOne(id, restaurantId);

    if (updateProductDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: {
          id: updateProductDto.categoryId,
          restaurant: { id: restaurantId },
        },
      });

      if (!category) {
        throw new NotFoundException(
          `Categoria com ID ${updateProductDto.categoryId} não encontrada`,
        );
      }

      product.category = category;
      delete updateProductDto.categoryId;
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: string, restaurantId: string) {
    const product = await this.findOne(id, restaurantId);
    return this.productsRepository.remove(product);
  }
} 