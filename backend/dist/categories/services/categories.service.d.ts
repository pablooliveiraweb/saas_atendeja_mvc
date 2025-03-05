import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
export declare class CategoriesService {
    private categoryRepository;
    private restaurantRepository;
    constructor(categoryRepository: Repository<Category>, restaurantRepository: Repository<Restaurant>);
    create(restaurantId: string, createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(restaurantId: string): Promise<Category[]>;
    findOne(id: string, restaurantId: string): Promise<Category>;
    update(id: string, restaurantId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string, restaurantId: string): Promise<void>;
}
