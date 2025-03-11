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
exports.PublicRestaurantCategoryProductsController = exports.PublicProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const swagger_1 = require("@nestjs/swagger");
let PublicProductsController = class PublicProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
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
};
exports.PublicProductsController = PublicProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os produtos de um restaurante específico (público)' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('category/:categoryId'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar produtos por categoria em um restaurante específico (público)' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicProductsController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar um produto pelo ID em um restaurante específico (público)' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicProductsController.prototype, "findOne", null);
exports.PublicProductsController = PublicProductsController = __decorate([
    (0, swagger_1.ApiTags)('public-products'),
    (0, common_1.Controller)('restaurants/:restaurantId/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], PublicProductsController);
let PublicRestaurantCategoryProductsController = class PublicRestaurantCategoryProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    findByCategory(restaurantId, categoryId) {
        return this.productsService.findByCategory(categoryId, restaurantId);
    }
};
exports.PublicRestaurantCategoryProductsController = PublicRestaurantCategoryProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar produtos por categoria em um restaurante específico (público)' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicRestaurantCategoryProductsController.prototype, "findByCategory", null);
exports.PublicRestaurantCategoryProductsController = PublicRestaurantCategoryProductsController = __decorate([
    (0, swagger_1.ApiTags)('public-restaurant-categories-products'),
    (0, common_1.Controller)('restaurants/:restaurantId/categories/:categoryId/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], PublicRestaurantCategoryProductsController);
//# sourceMappingURL=public-products.controller.js.map