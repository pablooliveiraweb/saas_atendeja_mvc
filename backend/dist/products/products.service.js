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
        const product = this.productsRepository.create({
            ...createProductDto,
            category,
            restaurant: { id: restaurantId },
        });
        return this.productsRepository.save(product);
    }
    async findAll(restaurantId) {
        return this.productsRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: ['category'],
            order: {
                category: { order: 'ASC' },
                order: 'ASC',
            },
        });
    }
    async findByCategory(categoryId, restaurantId) {
        return this.productsRepository.find({
            where: {
                category: { id: categoryId },
                restaurant: { id: restaurantId },
            },
            order: {
                order: 'ASC',
            },
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
        return product;
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
        Object.assign(product, updateProductDto);
        return this.productsRepository.save(product);
    }
    async remove(id, restaurantId) {
        const product = await this.findOne(id, restaurantId);
        return this.productsRepository.remove(product);
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