import { ProductsService } from './products.service';
export declare class PublicProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(restaurantId: string): Promise<import("./entities/product.entity").Product[]>;
    findByCategory(restaurantId: string, categoryId: string): Promise<import("./entities/product.entity").Product[]>;
    findOne(restaurantId: string, id: string): Promise<import("./entities/product.entity").Product>;
}
export declare class PublicRestaurantCategoryProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findByCategory(restaurantId: string, categoryId: string): Promise<import("./entities/product.entity").Product[]>;
}
