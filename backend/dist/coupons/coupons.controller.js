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
exports.CouponsController = void 0;
const common_1 = require("@nestjs/common");
const coupons_service_1 = require("./coupons.service");
const create_coupon_dto_1 = require("./dto/create-coupon.dto");
const update_coupon_dto_1 = require("./dto/update-coupon.dto");
const swagger_1 = require("@nestjs/swagger");
let CouponsController = class CouponsController {
    couponsService;
    constructor(couponsService) {
        this.couponsService = couponsService;
    }
    async create(createCouponDto) {
        return this.couponsService.create(createCouponDto);
    }
    async findAll(restaurantId) {
        if (!restaurantId) {
            throw new common_1.BadRequestException('O ID do restaurante é obrigatório');
        }
        return this.couponsService.findAll(restaurantId);
    }
    async findOne(id) {
        return this.couponsService.findOne(id);
    }
    async update(id, updateCouponDto) {
        return this.couponsService.update(id, updateCouponDto);
    }
    async remove(id) {
        return this.couponsService.remove(id);
    }
    async validateCoupon(body) {
        const { code, restaurantId, orderValue } = body;
        if (!code || !restaurantId || orderValue === undefined) {
            throw new common_1.BadRequestException('Código do cupom, ID do restaurante e valor do pedido são obrigatórios');
        }
        const coupon = await this.couponsService.validateCoupon(code, restaurantId, orderValue);
        const discount = this.couponsService.calculateDiscount(coupon, orderValue);
        return { coupon, discount };
    }
};
exports.CouponsController = CouponsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo cupom' }),
    (0, swagger_1.ApiBody)({ type: create_coupon_dto_1.CreateCouponDto, description: 'Dados do cupom' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cupom criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter todos os cupons de um restaurante' }),
    (0, swagger_1.ApiQuery)({ name: 'restaurantId', required: true, description: 'ID do restaurante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de cupons retornada com sucesso' }),
    __param(0, (0, common_1.Query)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter cupom por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do cupom' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cupom encontrado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cupom não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar cupom' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do cupom' }),
    (0, swagger_1.ApiBody)({ type: update_coupon_dto_1.UpdateCouponDto, description: 'Dados do cupom' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cupom atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cupom não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_coupon_dto_1.UpdateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover cupom' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do cupom' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cupom removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Cupom não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validar cupom' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string' },
                restaurantId: { type: 'string' },
                orderValue: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cupom válido' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cupom inválido' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "validateCoupon", null);
exports.CouponsController = CouponsController = __decorate([
    (0, swagger_1.ApiTags)('coupons'),
    (0, common_1.Controller)('coupons'),
    __metadata("design:paramtypes", [coupons_service_1.CouponsService])
], CouponsController);
//# sourceMappingURL=coupons.controller.js.map