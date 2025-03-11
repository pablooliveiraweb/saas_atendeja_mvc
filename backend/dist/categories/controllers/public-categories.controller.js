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
exports.PublicCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const categories_service_1 = require("../services/categories.service");
const swagger_1 = require("@nestjs/swagger");
let PublicCategoriesController = class PublicCategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    findAll(restaurantId) {
        return this.categoriesService.findAll(restaurantId);
    }
    findOne(id, restaurantId) {
        return this.categoriesService.findOne(id, restaurantId);
    }
};
exports.PublicCategoriesController = PublicCategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as categorias de um restaurante (público)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de categorias retornada com sucesso' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar uma categoria específica (público)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categoria encontrada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Categoria não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicCategoriesController.prototype, "findOne", null);
exports.PublicCategoriesController = PublicCategoriesController = __decorate([
    (0, swagger_1.ApiTags)('public-categories'),
    (0, common_1.Controller)('restaurants/:restaurantId/categories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], PublicCategoriesController);
//# sourceMappingURL=public-categories.controller.js.map