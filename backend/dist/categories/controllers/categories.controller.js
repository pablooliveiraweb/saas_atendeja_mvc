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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const categories_service_1 = require("../services/categories.service");
const create_category_dto_1 = require("../dto/create-category.dto");
const update_category_dto_1 = require("../dto/update-category.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let CategoriesController = class CategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    create(restaurantId, createCategoryDto) {
        return this.categoriesService.create(restaurantId, createCategoryDto);
    }
    findAll(restaurantId) {
        return this.categoriesService.findAll(restaurantId);
    }
    findOne(id, restaurantId) {
        return this.categoriesService.findOne(id, restaurantId);
    }
    update(id, restaurantId, updateCategoryDto) {
        return this.categoriesService.update(id, restaurantId, updateCategoryDto);
    }
    remove(id, restaurantId) {
        return this.categoriesService.remove(id, restaurantId);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar uma nova categoria' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Categoria criada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurante não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Categoria com mesmo nome já existe' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as categorias de um restaurante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de categorias retornada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar uma categoria específica' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categoria encontrada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Categoria não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar uma categoria' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categoria atualizada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Categoria não encontrada' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Categoria com mesmo nome já existe' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover uma categoria' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categoria removida com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Categoria não encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "remove", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('restaurants/:restaurantId/categories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map