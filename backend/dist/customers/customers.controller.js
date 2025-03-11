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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customers_service_1 = require("./customers.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    create(createCustomerDto, restaurantId) {
        try {
            console.log(`Criando novo cliente para restaurante ${restaurantId}:`, createCustomerDto);
            return this.customersService.create(createCustomerDto, restaurantId);
        }
        catch (error) {
            console.error('Erro ao criar cliente:', error);
            throw new common_1.HttpException(`Erro ao criar cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findAll(restaurantId, search) {
        try {
            console.log(`Listando todos os clientes para restaurante ${restaurantId}`);
            if (search) {
                return this.customersService.search(search, restaurantId);
            }
            return this.customersService.findAll(restaurantId);
        }
        catch (error) {
            console.error('Erro ao listar clientes:', error);
            throw new common_1.HttpException(`Erro ao listar clientes: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    search(restaurantId, query) {
        try {
            console.log(`Buscando clientes com termo "${query}" para restaurante ${restaurantId}`);
            return this.customersService.search(query, restaurantId);
        }
        catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw new common_1.HttpException(`Erro ao buscar clientes: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findInactive(restaurantId) {
        try {
            console.log(`Listando clientes inativos para restaurante ${restaurantId}`);
            return this.customersService.findInactive()
                .then(result => {
                console.log(`Encontrados ${result.length} clientes inativos para restaurante ${restaurantId}`);
                return result;
            })
                .catch(error => {
                console.error(`Erro ao listar clientes inativos para restaurante ${restaurantId}:`, error);
                throw error;
            });
        }
        catch (error) {
            console.error('Erro ao listar clientes inativos:', error);
            throw new common_1.HttpException(`Erro ao listar clientes inativos: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findTop(restaurantId) {
        try {
            console.log(`Listando clientes mais frequentes para restaurante ${restaurantId}`);
            return this.customersService.getTopCustomers(restaurantId)
                .then(result => {
                console.log(`Encontrados ${result.length} clientes mais frequentes para restaurante ${restaurantId}`);
                return result;
            })
                .catch(error => {
                console.error(`Erro ao listar clientes mais frequentes para restaurante ${restaurantId}:`, error);
                throw error;
            });
        }
        catch (error) {
            console.error('Erro ao listar clientes mais frequentes:', error);
            throw new common_1.HttpException(`Erro ao listar clientes mais frequentes: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findOne(restaurantId, id) {
        try {
            console.log(`Buscando cliente com ID ${id} para restaurante ${restaurantId}`);
            return this.customersService.findOne(id, restaurantId);
        }
        catch (error) {
            console.error('Erro ao buscar cliente:', error);
            throw new common_1.HttpException(`Erro ao buscar cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findByPhone(restaurantId, phone) {
        try {
            console.log(`Buscando cliente com telefone ${phone} para restaurante ${restaurantId}`);
            return this.customersService.findByPhone(phone, restaurantId);
        }
        catch (error) {
            console.error('Erro ao buscar cliente por telefone:', error);
            throw new common_1.HttpException(`Erro ao buscar cliente por telefone: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    update(restaurantId, id, updateCustomerDto) {
        try {
            console.log(`Atualizando cliente ${id} para restaurante ${restaurantId} (PATCH):`, updateCustomerDto);
            return this.customersService.update(id, updateCustomerDto, restaurantId)
                .then(result => {
                console.log(`Cliente ${id} atualizado com sucesso (PATCH):`, result);
                return result;
            })
                .catch(error => {
                console.error(`Erro ao atualizar cliente ${id} (PATCH):`, error);
                throw error;
            });
        }
        catch (error) {
            console.error('Erro ao atualizar cliente (PATCH):', error);
            throw new common_1.HttpException(`Erro ao atualizar cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    updatePut(restaurantId, id, updateCustomerDto) {
        try {
            console.log(`Atualizando cliente ${id} para restaurante ${restaurantId} (PUT):`, updateCustomerDto);
            return this.customersService.update(id, updateCustomerDto, restaurantId)
                .then(result => {
                console.log(`Cliente ${id} atualizado com sucesso (PUT):`, result);
                return result;
            })
                .catch(error => {
                console.error(`Erro ao atualizar cliente ${id} (PUT):`, error);
                throw error;
            });
        }
        catch (error) {
            console.error('Erro ao atualizar cliente (PUT):', error);
            throw new common_1.HttpException(`Erro ao atualizar cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    remove(restaurantId, id) {
        try {
            console.log(`Removendo cliente ${id} para restaurante ${restaurantId}`);
            return this.customersService.remove(id, restaurantId);
        }
        catch (error) {
            console.error('Erro ao remover cliente:', error);
            throw new common_1.HttpException(`Erro ao remover cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo cliente' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cliente criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os clientes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de clientes retornada com sucesso' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar clientes por termo' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('inactive'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes inativos' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findInactive", null);
__decorate([
    (0, common_1.Get)('top'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes mais frequentes' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findTop", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar cliente por ID' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('phone/:phone'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar cliente por telefone' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findByPhone", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar cliente' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar cliente (PUT)' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "updatePut", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover cliente' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "remove", null);
exports.CustomersController = CustomersController = __decorate([
    (0, swagger_1.ApiTags)('customers'),
    (0, common_1.Controller)('restaurants/:restaurantId/customers'),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map