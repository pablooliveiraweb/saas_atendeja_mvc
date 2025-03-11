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
exports.RestaurantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("./entities/restaurant.entity");
const public_or_auth_guard_1 = require("../auth/guards/public-or-auth.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const restaurant_service_1 = require("./restaurant.service");
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
}
let RestaurantController = class RestaurantController {
    restaurantRepository;
    restaurantService;
    constructor(restaurantRepository, restaurantService) {
        this.restaurantRepository = restaurantRepository;
        this.restaurantService = restaurantService;
    }
    async findBySlug(slug) {
        const normalizedInputSlug = slug.toLowerCase();
        const restaurants = await this.restaurantRepository.find();
        const restaurant = restaurants.find(r => {
            const restaurantSlug = normalizeText(r.name);
            return restaurantSlug === normalizedInputSlug;
        });
        if (!restaurant) {
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
    async connectWhatsApp(id) {
        try {
            const restaurant = await this.restaurantService.findById(id);
            if (!restaurant) {
                throw new common_1.NotFoundException(`Restaurante com ID ${id} não encontrado`);
            }
            return await this.restaurantService.connectWhatsAppInstance(id, restaurant.whatsappNumber);
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
    async getWhatsAppQrCode(id) {
        try {
            return await this.restaurantService.getWhatsAppQrCode(id);
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
    async sendWhatsAppMessage(id, body) {
        try {
            return await this.restaurantService.sendWhatsAppMessage(id, body.number, body.text);
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
};
exports.RestaurantController = RestaurantController;
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, common_1.UseGuards)(public_or_auth_guard_1.PublicOrAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get restaurant by slug' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Restaurant slug (formatted name)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Restaurant found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurant not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(public_or_auth_guard_1.PublicOrAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get restaurant by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Restaurant ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Restaurant found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(':id/whatsapp/connect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Conectar instância do WhatsApp' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do restaurante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Instância conectada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurante não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantController.prototype, "connectWhatsApp", null);
__decorate([
    (0, common_1.Get)(':id/whatsapp/qrcode'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obter QR Code para conectar WhatsApp' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do restaurante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'QR Code obtido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurante não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantController.prototype, "getWhatsAppQrCode", null);
__decorate([
    (0, common_1.Post)(':id/whatsapp/send'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensagem de WhatsApp' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do restaurante' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                number: { type: 'string', example: '5511999999999' },
                text: { type: 'string', example: 'Olá, tudo bem?' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensagem enviada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurante não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantController.prototype, "sendWhatsAppMessage", null);
exports.RestaurantController = RestaurantController = __decorate([
    (0, swagger_1.ApiTags)('restaurants'),
    (0, common_1.Controller)('restaurants'),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        restaurant_service_1.RestaurantService])
], RestaurantController);
//# sourceMappingURL=restaurant.controller.js.map