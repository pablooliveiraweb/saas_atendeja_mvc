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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const bcrypt = require("bcrypt");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    restaurantsRepository;
    constructor(userRepository, jwtService, restaurantsRepository) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.restaurantsRepository = restaurantsRepository;
    }
    async register(registerDto) {
        const { email } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email já está em uso');
        }
        const user = this.userRepository.create(registerDto);
        await this.userRepository.save(user);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            restaurantId: null,
        };
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                restaurantId: null,
            },
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, {
                expiresIn: '7d',
            }),
        };
    }
    async login(loginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
            select: ['id', 'email', 'password', 'name', 'role'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const restaurant = await this.restaurantsRepository.findOne({
            where: { owner: { id: user.id } },
        });
        const restaurantId = restaurant?.id || null;
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            restaurantId,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            restaurant: restaurant
                ? {
                    id: restaurant.id,
                    name: restaurant.name,
                    logo: restaurant.logo,
                }
                : null,
        };
    }
    async refreshToken(token) {
        try {
            const decoded = this.jwtService.verify(token);
            const payload = {
                sub: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                restaurantId: decoded.restaurantId,
            };
            return {
                accessToken: this.jwtService.sign(payload),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido ou expirado');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map