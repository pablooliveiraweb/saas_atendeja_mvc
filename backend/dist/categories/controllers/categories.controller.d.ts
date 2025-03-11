import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(restaurantId: string, createCategoryDto: CreateCategoryDto): Promise<import("../entities/category.entity").Category>;
    findAll(restaurantId: string): Promise<import("../entities/category.entity").Category[]>;
    findOne(id: string, restaurantId: string): Promise<import("../entities/category.entity").Category>;
    update(id: string, restaurantId: string, updateCategoryDto: UpdateCategoryDto): Promise<import("../entities/category.entity").Category>;
    remove(id: string, restaurantId: string): Promise<void>;
}
