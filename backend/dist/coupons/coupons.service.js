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
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("./entities/coupon.entity");
let CouponsService = class CouponsService {
    couponRepository;
    constructor(couponRepository) {
        this.couponRepository = couponRepository;
    }
    async create(createCouponDto) {
        const existingCoupon = await this.couponRepository.findOne({
            where: {
                code: createCouponDto.code,
                restaurantId: createCouponDto.restaurantId,
            },
        });
        if (existingCoupon) {
            throw new common_1.BadRequestException(`Já existe um cupom com o código ${createCouponDto.code}`);
        }
        const coupon = this.couponRepository.create(createCouponDto);
        return this.couponRepository.save(coupon);
    }
    async findAll(restaurantId) {
        return this.couponRepository.find({
            where: { restaurantId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const coupon = await this.couponRepository.findOne({
            where: { id },
        });
        if (!coupon) {
            throw new common_1.NotFoundException(`Cupom com ID ${id} não encontrado`);
        }
        return coupon;
    }
    async findByCode(code, restaurantId) {
        const coupon = await this.couponRepository.findOne({
            where: { code, restaurantId },
        });
        if (!coupon) {
            throw new common_1.NotFoundException(`Cupom com código ${code} não encontrado`);
        }
        return coupon;
    }
    async update(id, updateCouponDto) {
        const coupon = await this.findOne(id);
        if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
            const existingCoupon = await this.couponRepository.findOne({
                where: {
                    code: updateCouponDto.code,
                    restaurantId: coupon.restaurantId,
                },
            });
            if (existingCoupon) {
                throw new common_1.BadRequestException(`Já existe um cupom com o código ${updateCouponDto.code}`);
            }
        }
        Object.assign(coupon, updateCouponDto);
        return this.couponRepository.save(coupon);
    }
    async remove(id) {
        const coupon = await this.findOne(id);
        await this.couponRepository.remove(coupon);
    }
    async validateCoupon(code, restaurantId, orderValue) {
        try {
            const coupon = await this.findByCode(code, restaurantId);
            if (!coupon.isActive) {
                throw new common_1.BadRequestException('Este cupom não está mais ativo');
            }
            if (coupon.expiresAt && new Date() > coupon.expiresAt) {
                throw new common_1.BadRequestException('Este cupom expirou');
            }
            if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
                throw new common_1.BadRequestException('Este cupom atingiu o limite de uso');
            }
            if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
                throw new common_1.BadRequestException(`O valor mínimo para este cupom é de R$ ${coupon.minOrderValue}`);
            }
            return coupon;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.BadRequestException('Cupom inválido');
            }
            throw error;
        }
    }
    async applyCoupon(couponId) {
        const coupon = await this.findOne(couponId);
        coupon.usageCount += 1;
        if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
            console.log(`Cupom ${coupon.code} atingiu o limite de uso (${coupon.usageCount}/${coupon.maxUsage}) e será desativado`);
            coupon.isActive = false;
        }
        return this.couponRepository.save(coupon);
    }
    calculateDiscount(coupon, orderValue) {
        if (coupon.type === coupon_entity_1.CouponType.PERCENTAGE) {
            const percentageValue = Math.min(coupon.value, 100);
            return (orderValue * percentageValue) / 100;
        }
        else {
            return Math.min(coupon.value, orderValue);
        }
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map