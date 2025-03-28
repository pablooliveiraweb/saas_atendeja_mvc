import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, file?: Express.Multer.File): Promise<import("../entities/product.entity").Product>;
    findAll(): Promise<import("../entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("../entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File): Promise<import("../entities/product.entity").Product>;
    remove(id: string): Promise<void>;
}
