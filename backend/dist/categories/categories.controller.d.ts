import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto, req: any): Promise<import("./entities/category.entity").Category>;
    findAll(req: any): Promise<import("./entities/category.entity").Category[]>;
    findOne(id: string, req: any): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, req: any): Promise<import("./entities/category.entity").Category>;
    remove(id: string, req: any): Promise<import("./entities/category.entity").Category>;
}
