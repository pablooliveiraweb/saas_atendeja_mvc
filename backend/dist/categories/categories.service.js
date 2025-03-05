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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
let CategoriesService = class CategoriesService {
    categoriesRepository;
    restaurantsRepository;
    constructor(categoriesRepository, restaurantsRepository) {
        this.categoriesRepository = categoriesRepository;
        this.restaurantsRepository = restaurantsRepository;
    }
    async create(createCategoryDto, restaurantId) {
        const restaurant = await this.restaurantsRepository.findOne({
            where: { id: restaurantId },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException(`Restaurante com ID ${restaurantId} não encontrado`);
        }
        const category = this.categoriesRepository.create({
            ...createCategoryDto,
            restaurant,
        });
        return this.categoriesRepository.save(category);
    }
    async findAll(restaurantId) {
        return this.categoriesRepository.find({
            where: { restaurant: { id: restaurantId } },
            order: { order: 'ASC' },
        });
    }
    async findOne(id, restaurantId) {
        const category = await this.categoriesRepository.findOne({
            where: { id, restaurant: { id: restaurantId } },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Categoria com ID ${id} não encontrada`);
        }
        return category;
    }
    async update(id, updateCategoryDto, restaurantId) {
        const category = await this.findOne(id, restaurantId);
        Object.assign(category, updateCategoryDto);
        return this.categoriesRepository.save(category);
    }
    async remove(id, restaurantId) {
        const category = await this.findOne(id, restaurantId);
        return this.categoriesRepository.remove(category);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map