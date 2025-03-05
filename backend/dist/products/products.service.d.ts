import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';
export declare class ProductsService {
    private productsRepository;
    private categoriesRepository;
    constructor(productsRepository: Repository<Product>, categoriesRepository: Repository<Category>);
    create(createProductDto: CreateProductDto, restaurantId: string): Promise<Product>;
    findAll(restaurantId: string): Promise<Product[]>;
    findByCategory(categoryId: string, restaurantId: string): Promise<Product[]>;
    findOne(id: string, restaurantId: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto, restaurantId: string): Promise<Product>;
    remove(id: string, restaurantId: string): Promise<Product>;
}
