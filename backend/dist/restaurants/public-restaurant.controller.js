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
exports.PublicRestaurantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("./entities/restaurant.entity");
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
}
let PublicRestaurantController = class PublicRestaurantController {
    restaurantRepository;
    constructor(restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }
    async findBySlug(slug) {
        const normalizedInputSlug = slug.toLowerCase();
        const restaurant = await this.restaurantRepository.findOne({
            where: { slug: normalizedInputSlug }
        });
        if (!restaurant) {
            const restaurants = await this.restaurantRepository.find();
            const restaurantByName = restaurants.find(r => {
                const restaurantSlug = normalizeText(r.name);
                return restaurantSlug === normalizedInputSlug;
            });
            if (restaurantByName) {
                return restaurantByName;
            }
            throw new common_1.NotFoundException(`Restaurant with slug ${slug} not found`);
        }
        return restaurant;
    }
    async findById(id) {
        const restaurant = await this.restaurantRepository.findOne({ where: { id } });
        if (!restaurant) {
            throw new common_1.NotFoundException(`Restaurant with ID ${id} not found`);
        }
        return restaurant;
    }
};
exports.PublicRestaurantController = PublicRestaurantController;
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get restaurant by slug (public)' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Restaurant slug (formatted name)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Restaurant found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurant not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicRestaurantController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get restaurant by ID (public)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Restaurant ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Restaurant found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicRestaurantController.prototype, "findById", null);
exports.PublicRestaurantController = PublicRestaurantController = __decorate([
    (0, swagger_1.ApiTags)('public-restaurants'),
    (0, common_1.Controller)('restaurants'),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PublicRestaurantController);
//# sourceMappingURL=public-restaurant.controller.js.map