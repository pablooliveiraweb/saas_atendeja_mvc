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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const bcrypt = require("bcrypt");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const common_2 = require("@nestjs/common");
let AuthService = AuthService_1 = class AuthService {
    userRepository;
    jwtService;
    restaurantsRepository;
    logger = new common_2.Logger(AuthService_1.name);
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
                expiresIn: '30d',
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
        const access_token = this.jwtService.sign(payload);
        const refresh_token = this.jwtService.sign(payload, {
            expiresIn: '30d',
        });
        this.logger.log(`Usuário ${user.email} logado com sucesso`);
        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
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
            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                expiresIn: '30d',
            });
            return {
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            this.logger.error(`Erro ao renovar token: ${error.message}`);
            throw new common_1.UnauthorizedException('Token inválido ou expirado');
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            this.logger.log(`Tentando alterar senha para o usuário: ${userId}`);
            if (!userId) {
                this.logger.warn('ID do usuário não fornecido');
                return {
                    success: false,
                    message: 'ID do usuário não fornecido',
                };
            }
            if (!newPassword) {
                this.logger.warn('Nova senha não fornecida');
                return {
                    success: false,
                    message: 'Nova senha não fornecida',
                };
            }
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                this.logger.warn(`Usuário não encontrado: ${userId}`);
                return {
                    success: false,
                    message: 'Usuário não encontrado',
                };
            }
            this.logger.log(`Usuário encontrado: ${user.id}, email: ${user.email}`);
            let isPasswordValid = false;
            if (currentPassword) {
                try {
                    isPasswordValid = await bcrypt.compare(currentPassword, user.password);
                    this.logger.log(`Senha atual válida: ${isPasswordValid}`);
                }
                catch (error) {
                    this.logger.error(`Erro ao comparar senhas: ${error.message}`);
                }
            }
            if (!isPasswordValid) {
                this.logger.warn(`Senha atual incorreta para o usuário: ${userId}, mas permitindo alteração mesmo assim`);
            }
            try {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                this.logger.log('Hash da nova senha gerado com sucesso');
                await this.userRepository.update({ id: userId }, { password: hashedPassword });
                this.logger.log(`Senha alterada com sucesso para o usuário: ${userId}`);
                return {
                    success: true,
                    message: 'Senha alterada com sucesso',
                };
            }
            catch (hashError) {
                this.logger.error(`Erro ao gerar hash ou atualizar senha: ${hashError.message}`);
                return {
                    success: false,
                    message: 'Erro ao criptografar ou atualizar a nova senha',
                };
            }
        }
        catch (error) {
            this.logger.error(`Erro geral ao alterar senha: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Erro ao processar a alteração de senha',
            };
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map