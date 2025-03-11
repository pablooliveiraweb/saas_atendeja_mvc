import { CategoriesService } from '../services/categories.service';
export declare class PublicCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(restaurantId: string): Promise<import("../entities/category.entity").Category[]>;
    findOne(id: string, restaurantId: string): Promise<import("../entities/category.entity").Category>;
}
