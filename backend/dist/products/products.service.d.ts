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
    findAll(restaurantId: string): Promise<any[]>;
    findByCategory(categoryId: string, restaurantId: string): Promise<any[]>;
    findOne(id: string, restaurantId: string): Promise<any>;
    update(id: string, updateProductDto: UpdateProductDto, restaurantId: string): Promise<any>;
    remove(id: string, restaurantId: string): Promise<Product[]>;
    findTopSelling(): Promise<any[]>;
}
