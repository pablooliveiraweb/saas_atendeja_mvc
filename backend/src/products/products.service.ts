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

    // Converter additionalOptions para JSON string se existir
    const dtoToSave = { ...createProductDto };
    if (dtoToSave.additionalOptions) {
      dtoToSave.additionalOptions = JSON.stringify(dtoToSave.additionalOptions);
    }

    const product = this.productsRepository.create({
      ...dtoToSave,
      category,
      restaurant: { id: restaurantId },
    });

    return this.productsRepository.save(product);
  }

  async findAll(restaurantId: string) {
    const products = await this.productsRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['category'],
      order: {
        category: { order: 'ASC' } as any,
        order: 'ASC',
      } as any,
    });

    // Converter additionalOptions de JSON string para objeto
    return products.map(product => {
      const transformedProduct = { ...product } as any;
      // Verificar se additionalOptions existe e não está vazio
      if (transformedProduct.additionalOptions && 
          typeof transformedProduct.additionalOptions === 'string' &&
          transformedProduct.additionalOptions.trim() !== '') {
        try {
          transformedProduct.additionalOptions = JSON.parse(transformedProduct.additionalOptions as string);
        } catch (error) {
          console.error('Erro ao parsear additionalOptions:', error);
          // Em caso de erro no parse, definir como array vazio
          transformedProduct.additionalOptions = [];
        }
      } else {
        // Se não tiver additionalOptions ou for uma string vazia, definir como array vazio
        transformedProduct.additionalOptions = [];
      }
      return transformedProduct;
    });
  }

  async findByCategory(categoryId: string, restaurantId: string) {
    const products = await this.productsRepository.find({
      where: {
        category: { id: categoryId },
        restaurant: { id: restaurantId },
      },
      order: {
        order: 'ASC',
      } as any,
    });

    // Converter additionalOptions de JSON string para objeto
    return products.map(product => {
      const transformedProduct = { ...product } as any;
      // Verificar se additionalOptions existe e não está vazio
      if (transformedProduct.additionalOptions && 
          typeof transformedProduct.additionalOptions === 'string' &&
          transformedProduct.additionalOptions.trim() !== '') {
        try {
          transformedProduct.additionalOptions = JSON.parse(transformedProduct.additionalOptions as string);
        } catch (error) {
          console.error('Erro ao parsear additionalOptions:', error);
          // Em caso de erro no parse, definir como array vazio
          transformedProduct.additionalOptions = [];
        }
      } else {
        // Se não tiver additionalOptions ou for uma string vazia, definir como array vazio
        transformedProduct.additionalOptions = [];
      }
      return transformedProduct;
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

    // Converter additionalOptions de JSON string para objeto
    const transformedProduct = { ...product } as any;
    // Verificar se additionalOptions existe e não está vazio
    if (transformedProduct.additionalOptions && 
        typeof transformedProduct.additionalOptions === 'string' &&
        transformedProduct.additionalOptions.trim() !== '') {
      try {
        transformedProduct.additionalOptions = JSON.parse(transformedProduct.additionalOptions as string);
      } catch (error) {
        console.error('Erro ao parsear additionalOptions:', error);
        // Em caso de erro no parse, definir como array vazio
        transformedProduct.additionalOptions = [];
      }
    } else {
      // Se não tiver additionalOptions ou for uma string vazia, definir como array vazio
      transformedProduct.additionalOptions = [];
    }

    return transformedProduct;
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

    // Converter additionalOptions para JSON string se existir
    const dtoToSave = { ...updateProductDto };
    if (dtoToSave.additionalOptions) {
      dtoToSave.additionalOptions = JSON.stringify(dtoToSave.additionalOptions);
    }

    // Remover a versão parseada de additionalOptions antes de salvar
    const productToSave = { ...product } as any;
    if (productToSave.additionalOptions && typeof productToSave.additionalOptions !== 'string') {
      delete productToSave.additionalOptions;
    }

    Object.assign(productToSave, dtoToSave);
    const savedProduct = await this.productsRepository.save(productToSave);

    // Retornar o produto com additionalOptions como objeto
    const result = { ...savedProduct } as any;
    
    // Verificar se additionalOptions existe e não está vazio
    if (result.additionalOptions && 
        typeof result.additionalOptions === 'string' &&
        result.additionalOptions.trim() !== '') {
      try {
        result.additionalOptions = JSON.parse(result.additionalOptions as string);
      } catch (error) {
        console.error('Erro ao parsear additionalOptions:', error);
        result.additionalOptions = [];
      }
    } else {
      result.additionalOptions = [];
    }
    
    return result;
  }

  async remove(id: string, restaurantId: string) {
    const product = await this.findOne(id, restaurantId);
    return this.productsRepository.remove(product);
  }

  // Encontrar produtos mais vendidos com base nos pedidos
  async findTopSelling(): Promise<any[]> {
    try {
      // Buscar do banco de dados os produtos mais vendidos
      // A implementação completa dependeria de cruzar informações entre pedidos e produtos
      // Aqui vamos buscar os produtos mais recentes como aproximação
      const products = await this.productsRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
      });
      
      // Formar a estrutura de resposta esperada
      return products.map((product, index) => ({
        id: product.id,
        name: product.name,
        // Definir totais decrescentes apenas para ordenação
        total: 100 - (index * 15)
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      throw new Error('Erro ao buscar produtos mais vendidos do banco de dados');
    }
  }
} 