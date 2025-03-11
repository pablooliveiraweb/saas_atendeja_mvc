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
exports.EvolutionApiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const evolution_api_service_1 = require("./evolution-api.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let EvolutionApiController = class EvolutionApiController {
    evolutionApiService;
    constructor(evolutionApiService) {
        this.evolutionApiService = evolutionApiService;
    }
    async createInstance(body) {
        return this.evolutionApiService.createInstance(body.instanceName, body);
    }
    async fetchInstances(instanceName) {
        return this.evolutionApiService.fetchInstances(instanceName);
    }
    async connectInstance(instanceName, phoneNumber) {
        return this.evolutionApiService.connectInstance(instanceName, phoneNumber);
    }
    async checkInstanceStatus(instanceName) {
        return this.evolutionApiService.checkInstanceStatus(instanceName);
    }
    async sendText(instanceName, body) {
        return this.evolutionApiService.sendText(instanceName, body.number, body.text, body.delay);
    }
    async deleteInstance(instanceName) {
        return this.evolutionApiService.deleteInstance(instanceName);
    }
    async disconnectInstance(instanceName) {
        return this.evolutionApiService.disconnectInstance(instanceName);
    }
    async getQrCode(instanceName) {
        return this.evolutionApiService.getQrCode(instanceName);
    }
};
exports.EvolutionApiController = EvolutionApiController;
__decorate([
    (0, common_1.Post)('instances'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar uma nova instância' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Instância criada com sucesso' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['instanceName'],
            properties: {
                instanceName: { type: 'string', example: 'restaurant_12345678' },
                token: { type: 'string', example: '' },
                number: { type: 'string', example: '5511999999999' },
                qrcode: { type: 'boolean', example: false },
                webhook: {
                    type: 'object',
                    properties: {
                        url: { type: 'string', example: '' },
                        enabled: { type: 'boolean', example: false },
                    },
                },
                webhook_by_events: { type: 'boolean', example: false },
                events: { type: 'array', items: { type: 'string' }, example: [] },
                reject_call: { type: 'boolean', example: false },
                msg_call: { type: 'string', example: '' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvolutionApiController.prototype, "createInstance", null);
__decorate([
    (0, common_1.Get)('instances'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar instâncias' }),
    (0, swagger_1.ApiQuery)({ name: 'instanceName', required: false, description: 'Nome da instância a ser buscada' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Instâncias encontradas' }),
    __param(0, (0, common_1.Query)('instanceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvolutionApiController.prototype, "fetchInstances", null);
__decorate([
    (0, common_1.Get)('instances/:instanceName/connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Conectar uma instância existente' }),
    (0, swagger_1.ApiParam)({ name: 'instanceName', description: 'Nome da instância' }),
    (0, swagger_1.ApiQuery)({ name: 'number', required: false, description: 'Número de telefone para conexão' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Instância conectada com sucesso' }),
    __param(0, (0, common_1.Param)('instanceName')),
    __param(1, (0, common_1.Query)('number')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EvolutionApiController.prototype, "connectInstance", null);
__decorate([
    (0, common_1.Get)('instances/:instanceName/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar o status de uma instância' }),
    (0, swagger_1.ApiParam)({ name: 'instanceName', description: 'Nome da instância' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status da instância' }),
    __param(0, (0, common_1.Param)('instanceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvolutionApiController.prototype, "checkInstanceStatus", null);
__decorate([
    (0, common_1.Post)('instances/:instanceName/send-text'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar uma mensagem de texto' }),
    (0, swagger_1.ApiParam)({ name: 'instanceName', description: 'Nome da instância' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['number', 'text'],
            properties: {
                number: { type: 'string', example: '5511999999999' },
                text: { type: 'string', example: 'Olá! Esta é uma mensagem de teste.' },
                delay: { type: 'number', example: 1200 },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensagem enviada com sucesso' }),
    __param(0, (0, common_1.Param)('instanceName')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EvolutionApiController.prototype, "sendText", null);
__decorate([
    (0, common_1.Delete)('instances/:instanceName'),
    (0, swagger_1.ApiOperation)({ summary: 'Deletar uma instância' }),
    (0, swagger_1.ApiParam)({ name: 'instanceName', description: 'Nome da instância' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Instância deletada com sucesso' }),
    __param(0, (0, common_1.Param)('instanceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvolutionApiController.prototype, "deleteInstance", null);
__decorate([
    (0, common_1.Get)('instances/:instanceName/disconnect'),
    (0, swagger_1.ApiOperation)({ summary: 'Desconectar uma instância' }),
    (0, swagger_1.ApiParam)({ name: 'instanceName', description: 'Nome da instância' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Instância desconectada com sucesso' }),
    __param(0, (0, common_1.Param)('instanceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvolutionApiController.prototype, "disconnectInstance", null);
__decorate([
    (0, common_1.Get)('instances/:instanceName/qrcode'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter o QR Code para conectar uma instância' }),
    (0, swagger_1.ApiParam)({ name: 'instanceName', description: 'Nome da instância' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'QR Code obtido com sucesso' }),
    __param(0, (0, common_1.Param)('instanceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvolutionApiController.prototype, "getQrCode", null);
exports.EvolutionApiController = EvolutionApiController = __decorate([
    (0, swagger_1.ApiTags)('evolution-api'),
    (0, common_1.Controller)('evolution-api'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [evolution_api_service_1.EvolutionApiService])
], EvolutionApiController);
//# sourceMappingURL=evolution-api.controller.js.map