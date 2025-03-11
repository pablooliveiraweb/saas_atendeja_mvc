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
exports.CustomersAltController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customers_service_1 = require("./customers.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const DEFAULT_RESTAURANT_ID = '90655c28-4a17-408e-aece-69fde77b5d02';
let CustomersAltController = class CustomersAltController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    create(createCustomerDto) {
        try {
            console.log('Criando novo cliente (rota alternativa):', JSON.stringify(createCustomerDto, null, 2));
            console.log('Restaurant ID padrão:', DEFAULT_RESTAURANT_ID);
            const { restaurantId, ...cleanedDto } = createCustomerDto;
            const validDto = {
                name: cleanedDto.name || 'Cliente',
                email: cleanedDto.email || `${Date.now()}@cliente.temp`,
                phone: cleanedDto.phone || '5511999999999'
            };
            console.log('DTO validado:', validDto);
            return this.customersService.create(validDto, DEFAULT_RESTAURANT_ID);
        }
        catch (error) {
            console.error('Erro ao criar cliente (rota alternativa):', error);
            throw new common_1.HttpException(`Erro ao criar cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findAll(search) {
        try {
            console.log('Listando todos os clientes (rota alternativa)');
            if (search) {
                return this.customersService.search(search, DEFAULT_RESTAURANT_ID);
            }
            return this.customersService.findAll(DEFAULT_RESTAURANT_ID);
        }
        catch (error) {
            console.error('Erro ao listar clientes (rota alternativa):', error);
            throw new common_1.HttpException(`Erro ao listar clientes: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    search(query) {
        try {
            console.log(`Buscando clientes com termo: ${query} (rota alternativa)`);
            return this.customersService.search(query, DEFAULT_RESTAURANT_ID);
        }
        catch (error) {
            console.error('Erro ao buscar clientes (rota alternativa):', error);
            throw new common_1.HttpException(`Erro ao buscar clientes: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findInactive() {
        try {
            console.log('Listando clientes inativos (rota alternativa)');
            return this.customersService.findInactive()
                .then(result => {
                console.log(`Encontrados ${result.length} clientes inativos (rota alternativa)`);
                return result;
            })
                .catch(error => {
                console.error('Erro ao listar clientes inativos (rota alternativa):', error);
                throw error;
            });
        }
        catch (error) {
            console.error('Erro ao listar clientes inativos (rota alternativa):', error);
            throw new common_1.HttpException(`Erro ao listar clientes inativos: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findTop() {
        try {
            console.log('Listando clientes mais frequentes (rota alternativa)');
            return this.customersService.getTopCustomers(DEFAULT_RESTAURANT_ID)
                .then(result => {
                console.log(`Encontrados ${result.length} clientes mais frequentes (rota alternativa)`);
                return result;
            })
                .catch(error => {
                console.error('Erro ao listar clientes mais frequentes (rota alternativa):', error);
                throw error;
            });
        }
        catch (error) {
            console.error('Erro ao listar clientes mais frequentes (rota alternativa):', error);
            throw new common_1.HttpException(`Erro ao listar clientes mais frequentes: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findOne(id) {
        try {
            console.log(`Buscando cliente com ID: ${id} (rota alternativa)`);
            return this.customersService.findOne(id, DEFAULT_RESTAURANT_ID);
        }
        catch (error) {
            console.error('Erro ao buscar cliente (rota alternativa):', error);
            throw new common_1.HttpException(`Erro ao buscar cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    update(id, updateCustomerDto) {
        try {
            console.log(`Atualizando cliente ${id} (rota alternativa PATCH):`, updateCustomerDto);
            return this.customersService.update(id, updateCustomerDto, DEFAULT_RESTAURANT_ID)
                .then(result => {
                console.log(`Cliente ${id} atualizado com sucesso (rota alternativa PATCH):`, result);
                return result;
            })
                .catch(error => {
                console.error(`Erro ao atualizar cliente ${id} (rota alternativa PATCH):`, error);
                throw error;
            });
        }
        catch (error) {
            console.error('Erro ao atualizar cliente (rota alternativa PATCH):', error);
            throw new common_1.HttpException(`Erro ao atualizar cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    updatePut(id, updateCustomerDto) {
        try {
            console.log(`Atualizando cliente ${id} (rota alternativa PUT):`, updateCustomerDto);
            return this.customersService.update(id, updateCustomerDto, DEFAULT_RESTAURANT_ID)
                .then(result => {
                console.log(`Cliente ${id} atualizado com sucesso (rota alternativa PUT):`, result);
                return result;
            })
                .catch(error => {
                console.error(`Erro ao atualizar cliente ${id} (rota alternativa PUT):`, error);
                throw error;
            });
        }
        catch (error) {
            console.error('Erro ao atualizar cliente (rota alternativa PUT):', error);
            throw new common_1.HttpException(`Erro ao atualizar cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    remove(id) {
        try {
            console.log(`Removendo cliente ${id} (rota alternativa)`);
            return this.customersService.remove(id, DEFAULT_RESTAURANT_ID);
        }
        catch (error) {
            console.error('Erro ao remover cliente (rota alternativa):', error);
            throw new common_1.HttpException(`Erro ao remover cliente: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createSimple(data) {
        try {
            console.log('Criando cliente via rota simplificada:', data);
            try {
                const restaurant = await this.customersService.findRestaurantById(DEFAULT_RESTAURANT_ID);
                if (!restaurant) {
                    throw new common_1.HttpException(`Restaurante com ID ${DEFAULT_RESTAURANT_ID} não encontrado`, common_1.HttpStatus.BAD_REQUEST);
                }
                console.log('Restaurante encontrado:', restaurant.name);
            }
            catch (restaurantError) {
                console.error('Erro ao verificar restaurante:', restaurantError);
                throw new common_1.HttpException(`Erro ao verificar restaurante: ${restaurantError.message}`, common_1.HttpStatus.BAD_REQUEST);
            }
            const simpleDto = {
                name: data.name || 'Cliente',
                email: data.email || `cliente-${Date.now()}@temp.com`,
                phone: data.phone || '5511999999999'
            };
            console.log('DTO simplificado:', simpleDto);
            return this.customersService.create(simpleDto, DEFAULT_RESTAURANT_ID);
        }
        catch (error) {
            console.error('Erro na rota simplificada:', error);
            throw new common_1.HttpException('Erro ao criar cliente: ' + (error.message || 'erro desconhecido'), common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async ensureDefaultRestaurant() {
        try {
            let restaurant = await this.customersService.findRestaurantById(DEFAULT_RESTAURANT_ID);
            if (restaurant) {
                return {
                    success: true,
                    message: 'Restaurante padrão já existe',
                    restaurant: {
                        id: restaurant.id,
                        name: restaurant.name
                    }
                };
            }
            console.log('Criando restaurante padrão com ID:', DEFAULT_RESTAURANT_ID);
            throw new common_1.HttpException(`Restaurante padrão com ID ${DEFAULT_RESTAURANT_ID} não encontrado. Por favor, crie-o manualmente no banco de dados.`, common_1.HttpStatus.NOT_FOUND);
        }
        catch (error) {
            console.error('Erro ao verificar restaurante padrão:', error);
            throw new common_1.HttpException('Erro ao verificar restaurante padrão: ' + (error.message || 'erro desconhecido'), common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CustomersAltController = CustomersAltController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo cliente (rota alternativa)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cliente criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os clientes (rota alternativa)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de clientes retornada com sucesso' }),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar clientes por termo (rota alternativa)' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('inactive'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes inativos (rota alternativa)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "findInactive", null);
__decorate([
    (0, common_1.Get)('top'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes mais frequentes (rota alternativa)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "findTop", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar cliente por ID (rota alternativa)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar cliente (rota alternativa)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar cliente (PUT, rota alternativa)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "updatePut", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover cliente (rota alternativa)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersAltController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('simple'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo cliente de forma simplificada' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cliente criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersAltController.prototype, "createSimple", null);
__decorate([
    (0, common_1.Get)('ensure-default-restaurant'),
    (0, swagger_1.ApiOperation)({ summary: 'Garantir que o restaurante padrão existe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Restaurante padrão verificado/criado com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersAltController.prototype, "ensureDefaultRestaurant", null);
exports.CustomersAltController = CustomersAltController = __decorate([
    (0, swagger_1.ApiTags)('customers-alt'),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersAltController);
//# sourceMappingURL=customers-alt.controller.js.map