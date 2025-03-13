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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
let UsersController = class UsersController {
    restaurantRepository;
    constructor(restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }
    async getMyRestaurant(req) {
        const userId = req.user.userId;
        const restaurant = await this.restaurantRepository.findOne({
            where: { owner: { id: userId } },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurante não encontrado para este usuário');
        }
        return restaurant;
    }
    async updateMyRestaurant(req, updateData) {
        const userId = req.user.userId;
        const restaurant = await this.restaurantRepository.findOne({
            where: { owner: { id: userId } },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurante não encontrado para este usuário');
        }
        if (updateData.name)
            restaurant.name = updateData.name;
        if (updateData.description)
            restaurant.description = updateData.description;
        if (updateData.address)
            restaurant.address = updateData.address;
        if (updateData.phone)
            restaurant.phone = updateData.phone;
        if (updateData.operatingHours)
            restaurant.operatingHours = updateData.operatingHours;
        if (updateData.themeColor)
            restaurant.themeColor = updateData.themeColor;
        const updatedRestaurant = await this.restaurantRepository.save(restaurant);
        return updatedRestaurant;
    }
    async uploadLogo(req, file) {
        const userId = req.user.userId;
        const restaurant = await this.restaurantRepository.findOne({
            where: { owner: { id: userId } },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurante não encontrado para este usuário');
        }
        restaurant.logo = `/uploads/restaurants/logos/${file.filename}`;
        await this.restaurantRepository.save(restaurant);
        return { logoUrl: restaurant.logo };
    }
    async uploadCover(req, file) {
        const userId = req.user.userId;
        const restaurant = await this.restaurantRepository.findOne({
            where: { owner: { id: userId } },
        });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurante não encontrado para este usuário');
        }
        restaurant.coverImage = `/uploads/restaurants/covers/${file.filename}`;
        await this.restaurantRepository.save(restaurant);
        return { coverUrl: restaurant.coverImage };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me/restaurant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obter o restaurante do usuário logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Restaurante encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurante não encontrado' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyRestaurant", null);
__decorate([
    (0, common_1.Patch)('me/restaurant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar o restaurante do usuário logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Restaurante atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurante não encontrado' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMyRestaurant", null);
__decorate([
    (0, common_1.Post)('me/restaurant/upload/logo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/restaurants/logos',
            filename: (req, file, cb) => {
                if (!fs.existsSync('./uploads/restaurants/logos')) {
                    fs.mkdirSync('./uploads/restaurants/logos', { recursive: true });
                }
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Fazer upload do logo do restaurante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logo enviado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurante não encontrado' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Post)('me/restaurant/upload/cover'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('cover', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/restaurants/covers',
            filename: (req, file, cb) => {
                if (!fs.existsSync('./uploads/restaurants/covers')) {
                    fs.mkdirSync('./uploads/restaurants/covers', { recursive: true });
                }
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Fazer upload da imagem de capa do restaurante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Imagem de capa enviada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurante não encontrado' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadCover", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersController);
//# sourceMappingURL=users.controller.js.map