import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { AuthUser } from '../auth/types/auth.types';
interface RequestWithUser extends Request {
    user: AuthUser;
}
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, req: RequestWithUser): Promise<import("./entities/product.entity").Product>;
    findAll(req: RequestWithUser): Promise<any[]>;
    findByCategory(categoryId: string, req: RequestWithUser): Promise<any[]>;
    findOne(id: string, req: RequestWithUser): Promise<any>;
    update(id: string, updateProductDto: UpdateProductDto, req: RequestWithUser): Promise<any>;
    remove(id: string, req: RequestWithUser): Promise<import("./entities/product.entity").Product[]>;
    getTopSelling(): Promise<any[]>;
}
export declare class RestaurantProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(restaurantId: string, createProductDto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(restaurantId: string): Promise<any[]>;
    findByCategory(restaurantId: string, categoryId: string): Promise<any[]>;
    findOne(restaurantId: string, id: string): Promise<any>;
    update(restaurantId: string, id: string, updateProductDto: UpdateProductDto): Promise<any>;
    remove(restaurantId: string, id: string): Promise<import("./entities/product.entity").Product[]>;
}
export declare class RestaurantCategoryProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findByCategory(restaurantId: string, categoryId: string): Promise<any[]>;
}
export {};
