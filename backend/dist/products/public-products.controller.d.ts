import { ProductsService } from './products.service';
export declare class PublicProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(restaurantId: string): Promise<any[]>;
    findByCategory(restaurantId: string, categoryId: string): Promise<any[]>;
    findOne(restaurantId: string, id: string): Promise<any>;
}
export declare class PublicRestaurantCategoryProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findByCategory(restaurantId: string, categoryId: string): Promise<any[]>;
}
