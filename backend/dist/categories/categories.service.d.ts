import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
export declare class CategoriesService {
    private categoriesRepository;
    private restaurantsRepository;
    constructor(categoriesRepository: Repository<Category>, restaurantsRepository: Repository<Restaurant>);
    create(createCategoryDto: CreateCategoryDto, restaurantId: string): Promise<Category>;
    findAll(restaurantId: string): Promise<Category[]>;
    findOne(id: string, restaurantId: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, restaurantId: string): Promise<Category>;
    remove(id: string, restaurantId: string): Promise<Category>;
}
