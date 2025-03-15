"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const category_entity_1 = require("../categories/entities/category.entity");
let ProductsService = class ProductsService {
    productsRepository;
    categoriesRepository;
    constructor(productsRepository, categoriesRepository) {
        this.productsRepository = productsRepository;
        this.categoriesRepository = categoriesRepository;
    }
    async create(createProductDto, restaurantId) {
        const category = await this.categoriesRepository.findOne({
            where: {
                id: createProductDto.categoryId,
                restaurant: { id: restaurantId },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Categoria com ID ${createProductDto.categoryId} não encontrada`);
        }
        const dtoToSave = { ...createProductDto };
        if (dtoToSave.additionalOptions) {
            dtoToSave.additionalOptions = JSON.stringify(dtoToSave.additionalOptions);
        }
        const product = this.productsRepository.create({
            ...dtoToSave,
            category,
            restaurant: { id: restaurantId },
        });
        return this.productsRepository.save(product);
    }
    async findAll(restaurantId) {
        const products = await this.productsRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: ['category'],
            order: {
                category: { order: 'ASC' },
                order: 'ASC',
            },
        });
        return products.map(product => {
            const transformedProduct = { ...product };
            if (transformedProduct.additionalOptions &&
                typeof transformedProduct.additionalOptions === 'string' &&
                transformedProduct.additionalOptions.trim() !== '') {
                try {
                    transformedProduct.additionalOptions = JSON.parse(transformedProduct.additionalOptions);
                }
                catch (error) {
                    console.error('Erro ao parsear additionalOptions:', error);
                    transformedProduct.additionalOptions = [];
                }
            }
            else {
                transformedProduct.additionalOptions = [];
            }
            return transformedProduct;
        });
    }
    async findByCategory(categoryId, restaurantId) {
        const products = await this.productsRepository.find({
            where: {
                category: { id: categoryId },
                restaurant: { id: restaurantId },
            },
            order: {
                order: 'ASC',
            },
        });
        return products.map(product => {
            const transformedProduct = { ...product };
            if (transformedProduct.additionalOptions &&
                typeof transformedProduct.additionalOptions === 'string' &&
                transformedProduct.additionalOptions.trim() !== '') {
                try {
                    transformedProduct.additionalOptions = JSON.parse(transformedProduct.additionalOptions);
                }
                catch (error) {
                    console.error('Erro ao parsear additionalOptions:', error);
                    transformedProduct.additionalOptions = [];
                }
            }
            else {
                transformedProduct.additionalOptions = [];
            }
            return transformedProduct;
        });
    }
    async findOne(id, restaurantId) {
        const product = await this.productsRepository.findOne({
            where: { id, restaurant: { id: restaurantId } },
            relations: ['category'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Produto com ID ${id} não encontrado`);
        }
        const transformedProduct = { ...product };
        if (transformedProduct.additionalOptions &&
            typeof transformedProduct.additionalOptions === 'string' &&
            transformedProduct.additionalOptions.trim() !== '') {
            try {
                transformedProduct.additionalOptions = JSON.parse(transformedProduct.additionalOptions);
            }
            catch (error) {
                console.error('Erro ao parsear additionalOptions:', error);
                transformedProduct.additionalOptions = [];
            }
        }
        else {
            transformedProduct.additionalOptions = [];
        }
        return transformedProduct;
    }
    async update(id, updateProductDto, restaurantId) {
        const product = await this.findOne(id, restaurantId);
        if (updateProductDto.categoryId) {
            const category = await this.categoriesRepository.findOne({
                where: {
                    id: updateProductDto.categoryId,
                    restaurant: { id: restaurantId },
                },
            });
            if (!category) {
                throw new common_1.NotFoundException(`Categoria com ID ${updateProductDto.categoryId} não encontrada`);
            }
            product.category = category;
            delete updateProductDto.categoryId;
        }
        const dtoToSave = { ...updateProductDto };
        if (dtoToSave.additionalOptions) {
            dtoToSave.additionalOptions = JSON.stringify(dtoToSave.additionalOptions);
        }
        const productToSave = { ...product };
        if (productToSave.additionalOptions && typeof productToSave.additionalOptions !== 'string') {
            delete productToSave.additionalOptions;
        }
        Object.assign(productToSave, dtoToSave);
        const savedProduct = await this.productsRepository.save(productToSave);
        const result = { ...savedProduct };
        if (result.additionalOptions &&
            typeof result.additionalOptions === 'string' &&
            result.additionalOptions.trim() !== '') {
            try {
                result.additionalOptions = JSON.parse(result.additionalOptions);
            }
            catch (error) {
                console.error('Erro ao parsear additionalOptions:', error);
                result.additionalOptions = [];
            }
        }
        else {
            result.additionalOptions = [];
        }
        return result;
    }
    async remove(id, restaurantId) {
        const product = await this.findOne(id, restaurantId);
        return this.productsRepository.remove(product);
    }
    async findTopSelling() {
        try {
            const products = await this.productsRepository.find({
                order: { createdAt: 'DESC' },
                take: 5,
            });
            return products.map((product, index) => ({
                id: product.id,
                name: product.name,
                total: 100 - (index * 15)
            }));
        }
        catch (error) {
            console.error('Erro ao buscar produtos mais vendidos:', error);
            throw new Error('Erro ao buscar produtos mais vendidos do banco de dados');
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map