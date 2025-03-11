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
exports.RestaurantCategoryProductsController = exports.RestaurantProductsController = exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_or_auth_guard_1 = require("../auth/guards/public-or-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(createProductDto, req) {
        return this.productsService.create(createProductDto, req.user.restaurantId);
    }
    findAll(req) {
        return this.productsService.findAll(req.user.restaurantId);
    }
    findByCategory(categoryId, req) {
        return this.productsService.findByCategory(categoryId, req.user.restaurantId);
    }
    findOne(id, req) {
        return this.productsService.findOne(id, req.user.restaurantId);
    }
    update(id, updateProductDto, req) {
        return this.productsService.update(id, updateProductDto, req.user.restaurantId);
    }
    remove(id, req) {
        return this.productsService.remove(id, req.user.restaurantId);
    }
    async getTopSelling() {
        try {
            return this.productsService.findTopSelling();
        }
        catch (error) {
            throw new common_1.HttpException('Erro ao buscar produtos mais vendidos', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo produto' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os produtos do restaurante' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('category/:categoryId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar produtos por categoria' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar um produto pelo ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar um produto' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remover um produto' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('statistics/top-selling'),
    (0, common_1.UseGuards)(public_or_auth_guard_1.PublicOrAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obter produtos mais vendidos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getTopSelling", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('products'),
    (0, common_1.Controller)('products'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
let RestaurantProductsController = class RestaurantProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(restaurantId, createProductDto) {
        return this.productsService.create(createProductDto, restaurantId);
    }
    findAll(restaurantId) {
        return this.productsService.findAll(restaurantId);
    }
    findByCategory(restaurantId, categoryId) {
        return this.productsService.findByCategory(categoryId, restaurantId);
    }
    findOne(restaurantId, id) {
        return this.productsService.findOne(id, restaurantId);
    }
    update(restaurantId, id, updateProductDto) {
        return this.productsService.update(id, updateProductDto, restaurantId);
    }
    remove(restaurantId, id) {
        return this.productsService.remove(id, restaurantId);
    }
};
exports.RestaurantProductsController = RestaurantProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo produto para um restaurante específico' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], RestaurantProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(public_or_auth_guard_1.PublicOrAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os produtos de um restaurante específico' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('category/:categoryId'),
    (0, common_1.UseGuards)(public_or_auth_guard_1.PublicOrAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar produtos por categoria em um restaurante específico' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantProductsController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(public_or_auth_guard_1.PublicOrAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar um produto pelo ID em um restaurante específico' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar um produto em um restaurante específico' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], RestaurantProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remover um produto de um restaurante específico' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantProductsController.prototype, "remove", null);
exports.RestaurantProductsController = RestaurantProductsController = __decorate([
    (0, swagger_1.ApiTags)('restaurant-products'),
    (0, common_1.Controller)('restaurants/:restaurantId/products'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], RestaurantProductsController);
let RestaurantCategoryProductsController = class RestaurantCategoryProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    findByCategory(restaurantId, categoryId) {
        return this.productsService.findByCategory(categoryId, restaurantId);
    }
};
exports.RestaurantCategoryProductsController = RestaurantCategoryProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(public_or_auth_guard_1.PublicOrAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar produtos por categoria em um restaurante específico' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantCategoryProductsController.prototype, "findByCategory", null);
exports.RestaurantCategoryProductsController = RestaurantCategoryProductsController = __decorate([
    (0, swagger_1.ApiTags)('restaurant-categories-products'),
    (0, common_1.Controller)('restaurants/:restaurantId/categories/:categoryId/products'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], RestaurantCategoryProductsController);
//# sourceMappingURL=products.controller.js.map