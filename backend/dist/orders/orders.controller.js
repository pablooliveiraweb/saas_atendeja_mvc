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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const order_entity_1 = require("./entities/order.entity");
const swagger_1 = require("@nestjs/swagger");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async findAll() {
        return this.ordersService.findAll();
    }
    async findAllPending() {
        console.log('Buscando pedidos pendentes...');
        try {
            const pendingOrders = await this.ordersService.findAllWithStatus(order_entity_1.OrderStatus.PENDING);
            console.log(`Encontrados ${pendingOrders.length} pedidos pendentes`);
            return pendingOrders;
        }
        catch (error) {
            console.error('Erro ao buscar pedidos pendentes:', error);
            throw new common_1.HttpException(`Erro ao buscar pedidos pendentes: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        return this.ordersService.findOne(id);
    }
    async create(orderData) {
        return this.ordersService.create(orderData);
    }
    async update(id, updateData) {
        return this.ordersService.update(id, updateData);
    }
    async updateStatus(id, body) {
        return this.ordersService.update(id, { status: body.status });
    }
    async remove(id) {
        return this.ordersService.remove(id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter todos os pedidos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de pedidos retornada com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter pedidos pendentes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de pedidos pendentes retornada com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAllPending", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter pedido por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do pedido' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pedido encontrado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo pedido' }),
    (0, swagger_1.ApiBody)({ type: Object, description: 'Dados do pedido' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pedido criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar pedido' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do pedido' }),
    (0, swagger_1.ApiBody)({ type: Object, description: 'Dados para atualização' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pedido atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar status do pedido' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do pedido' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['status'],
            properties: {
                status: {
                    type: 'string',
                    enum: Object.values(order_entity_1.OrderStatus),
                    example: order_entity_1.OrderStatus.PREPARING
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status do pedido atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover pedido' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do pedido' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pedido removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "remove", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map