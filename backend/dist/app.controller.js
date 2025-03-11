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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./orders/entities/order.entity");
const order_entity_2 = require("./orders/entities/order.entity");
const restaurant_entity_1 = require("./restaurants/entities/restaurant.entity");
const user_entity_1 = require("./users/entities/user.entity");
const restaurant_entity_2 = require("./restaurants/entities/restaurant.entity");
const restaurant_service_1 = require("./restaurants/restaurant.service");
const evolution_api_service_1 = require("./evolution-api/evolution-api.service");
const core_1 = require("@nestjs/core");
const restaurant_entity_3 = require("./restaurants/entities/restaurant.entity");
const customers_service_1 = require("./customers/customers.service");
const notifications_service_1 = require("./notifications/notifications.service");
let AppController = class AppController {
    appService;
    orderRepository;
    restaurantRepository;
    userRepository;
    restaurantService;
    evolutionApiService;
    moduleRef;
    customersService;
    notificationsService;
    constructor(appService, orderRepository, restaurantRepository, userRepository, restaurantService, evolutionApiService, moduleRef, customersService, notificationsService) {
        this.appService = appService;
        this.orderRepository = orderRepository;
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
        this.restaurantService = restaurantService;
        this.evolutionApiService = evolutionApiService;
        this.moduleRef = moduleRef;
        this.customersService = customersService;
        this.notificationsService = notificationsService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getAllOrders() {
        return this.orderRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
    async createOrder(orderData) {
        try {
            console.log('Recebendo pedido direto:', orderData);
            const orderNumber = Math.floor(Math.random() * 9000) + 1000;
            const newOrder = new order_entity_1.Order();
            newOrder.status = order_entity_2.OrderStatus.PENDING;
            newOrder.paymentMethod = order_entity_2.PaymentMethod.CASH;
            newOrder.orderType = orderData.deliveryMethod === 'delivery' ? order_entity_2.OrderType.DELIVERY : order_entity_2.OrderType.PICKUP;
            newOrder.customerName = orderData.customerName;
            newOrder.customerPhone = orderData.customerPhone || null;
            newOrder.deliveryAddress = orderData.deliveryAddress || null;
            newOrder.subtotal = orderData.total || 0;
            newOrder.total = orderData.total || 0;
            newOrder.notes = JSON.stringify(orderData.items || []);
            newOrder.isPaid = false;
            if (orderData.restaurantId) {
                console.log(`Associando pedido ao restaurante ${orderData.restaurantId}`);
                const restaurant = await this.restaurantRepository.findOne({ where: { id: orderData.restaurantId } });
                if (restaurant) {
                    newOrder.restaurant = restaurant;
                }
                else {
                    console.log(`Restaurante ${orderData.restaurantId} não encontrado, continuando sem associação`);
                }
            }
            const savedOrder = await this.orderRepository.save(newOrder);
            console.log('Pedido salvo com sucesso:', savedOrder);
            return {
                ...savedOrder,
                items: orderData.items || []
            };
        }
        catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw new common_1.HttpException(`Erro ao criar pedido: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createRestaurantOrder(restaurantId, orderData) {
        try {
            console.log(`Recebendo pedido para o restaurante ${restaurantId}:`, orderData);
            let customer = null;
            if (orderData.customerPhone) {
                try {
                    try {
                        customer = await this.customersService.findByPhone(orderData.customerPhone, restaurantId);
                        console.log('Cliente encontrado:', customer);
                    }
                    catch (error) {
                        console.log('Cliente não encontrado, criando novo...');
                        const customerData = {
                            name: orderData.customerName || 'Cliente',
                            phone: orderData.customerPhone,
                            email: `${orderData.customerPhone.substring(0, 6)}@cliente.temp`,
                        };
                        customer = await this.customersService.create(customerData, restaurantId);
                        console.log('Novo cliente criado:', customer);
                    }
                }
                catch (error) {
                    console.error('Erro ao processar cliente:', error);
                }
            }
            const newOrder = new order_entity_1.Order();
            newOrder.status = order_entity_2.OrderStatus.PENDING;
            newOrder.paymentMethod = orderData.paymentMethod || order_entity_2.PaymentMethod.CASH;
            newOrder.orderType = orderData.deliveryAddress ? order_entity_2.OrderType.DELIVERY : order_entity_2.OrderType.PICKUP;
            newOrder.customerName = orderData.customerName;
            newOrder.customerPhone = orderData.customerPhone;
            newOrder.deliveryAddress = orderData.deliveryAddress;
            newOrder.notes = orderData.notes;
            let subtotal = 0;
            if (orderData.items && Array.isArray(orderData.items)) {
                subtotal = orderData.items.reduce((sum, item) => {
                    return sum + (item.price * item.quantity);
                }, 0);
            }
            newOrder.subtotal = subtotal;
            newOrder.total = subtotal;
            const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
            if (!restaurant) {
                throw new common_1.NotFoundException(`Restaurante com ID ${restaurantId} não encontrado`);
            }
            newOrder.restaurant = restaurant;
            if (customer) {
                newOrder.user = customer;
            }
            const savedOrder = await this.orderRepository.save(newOrder);
            console.log(`Pedido criado com sucesso: ${savedOrder.id}`);
            return savedOrder;
        }
        catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw new common_1.HttpException(`Erro ao criar pedido: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRecentOrders() {
        return this.orderRepository.find({
            order: { createdAt: 'DESC' },
            take: 10
        });
    }
    async getWeeklyStats() {
        return [10, 15, 8, 12, 20, 18, 14];
    }
    async getOrderById(id) {
        if (id === 'pending') {
            throw new common_1.NotFoundException(`ID inválido: ${id} não é um UUID válido`);
        }
        console.log(`Buscando pedido com ID: ${id}`);
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            console.error(`ID inválido: ${id} não é um UUID válido`);
            throw new common_1.NotFoundException(`ID inválido: ${id} não é um UUID válido`);
        }
        try {
            const order = await this.orderRepository.findOne({ where: { id } });
            if (!order) {
                console.warn(`Pedido com ID ${id} não encontrado`);
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            return order;
        }
        catch (error) {
            console.error(`Erro ao buscar pedido: ${error.message}`);
            throw error;
        }
    }
    async updateOrder(id, updateData) {
        console.log(`Recebido pedido para atualizar: ${id}`, updateData);
        try {
            const order = await this.orderRepository.findOne({ where: { id } });
            if (!order) {
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            if (updateData.status) {
                order.status = updateData.status;
            }
            if (updateData.isPaid !== undefined) {
                order.isPaid = updateData.isPaid;
            }
            if (updateData.notes) {
                order.notes = updateData.notes;
            }
            const updatedOrder = await this.orderRepository.save(order);
            console.log('Pedido atualizado com sucesso:', updatedOrder);
            return updatedOrder;
        }
        catch (error) {
            console.error('Erro ao atualizar pedido:', error);
            throw error;
        }
    }
    async updateRestaurantOrder(restaurantId, id, updateData) {
        console.log(`Recebido pedido para atualizar no restaurante ${restaurantId}: ${id}`, updateData);
        try {
            const order = await this.orderRepository.findOne({ where: { id } });
            if (!order) {
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            if (updateData.status) {
                order.status = updateData.status;
            }
            if (updateData.isPaid !== undefined) {
                order.isPaid = updateData.isPaid;
            }
            if (updateData.notes) {
                order.notes = updateData.notes;
            }
            const updatedOrder = await this.orderRepository.save(order);
            console.log('Pedido atualizado com sucesso para restaurante:', updatedOrder);
            return updatedOrder;
        }
        catch (error) {
            console.error('Erro ao atualizar pedido para restaurante:', error);
            throw error;
        }
    }
    async updateRestaurantOrderStatus(restaurantId, orderId, updateData) {
        try {
            console.log(`Atualizando status do pedido ${orderId} para ${updateData.status}`);
            const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
            if (!restaurant) {
                throw new common_1.NotFoundException(`Restaurante com ID ${restaurantId} não encontrado`);
            }
            const order = await this.orderRepository.findOne({
                where: {
                    id: orderId,
                    restaurant: { id: restaurantId }
                },
                relations: ['restaurant']
            });
            if (!order) {
                throw new common_1.NotFoundException(`Pedido com ID ${orderId} não encontrado para o restaurante ${restaurantId}`);
            }
            order.status = updateData.status;
            order.updatedAt = new Date();
            const updatedOrder = await this.orderRepository.save(order);
            return updatedOrder;
        }
        catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            throw new common_1.HttpException(`Erro ao atualizar status do pedido: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getTopProducts() {
        return [
            { name: 'X-Burger', total: 253 },
            { name: 'Pizza de Calabresa', total: 187 },
            { name: 'Coca-Cola 2L', total: 142 },
            { name: 'Açaí 500ml', total: 98 },
            { name: 'Batata Frita', total: 92 }
        ];
    }
    async registerRestaurant(registrationData) {
        let savedUser = null;
        let savedRestaurant = null;
        let whatsappError = null;
        try {
            console.log('Recebendo solicitação de registro de restaurante:', registrationData);
            const user = new user_entity_1.User();
            user.name = registrationData.name || 'Usuário';
            user.email = registrationData.email || 'sem-email@exemplo.com';
            const tempPassword = Math.random().toString(36).slice(-8);
            user.password = tempPassword;
            savedUser = await this.userRepository.save(user);
            const restaurant = new restaurant_entity_1.Restaurant();
            restaurant.name = registrationData.businessName || 'Restaurante';
            restaurant.phone = registrationData.phone || '0000000000';
            restaurant.whatsappNumber = registrationData.whatsappNumber || registrationData.phone || '0000000000';
            restaurant.city = registrationData.city || 'Cidade não informada';
            restaurant.state = registrationData.state || 'UF';
            restaurant.owner = savedUser;
            restaurant.status = restaurant_entity_2.RestaurantStatus.PENDING;
            restaurant.address = 'A definir';
            restaurant.postalCode = '00000000';
            restaurant.subscriptionPlan = restaurant_entity_3.SubscriptionPlan.BASIC;
            savedRestaurant = await this.restaurantRepository.save(restaurant);
            const skipWhatsappSetup = registrationData.skipWhatsappSetup === true;
            if (skipWhatsappSetup) {
                console.log('Pulando configuração do WhatsApp conforme solicitado.');
                const instanceName = `restaurant_${savedRestaurant.id.substring(0, 8)}`;
                savedRestaurant.evolutionApiInstanceName = instanceName;
                savedRestaurant.status = restaurant_entity_2.RestaurantStatus.PENDING_WHATSAPP;
                await this.restaurantRepository.save(savedRestaurant);
                try {
                    await this.notificationsService.sendAccessCredentials(savedUser.name, savedUser.email, tempPassword, savedRestaurant.name);
                    console.log('Credenciais de acesso enviadas por e-mail com sucesso');
                }
                catch (notificationError) {
                    console.error('Erro ao enviar credenciais de acesso por e-mail:', notificationError);
                }
                return {
                    success: true,
                    message: 'Restaurante registrado com sucesso! A configuração do WhatsApp será realizada posteriormente.',
                    restaurant: {
                        id: savedRestaurant.id,
                        name: savedRestaurant.name,
                        whatsappPending: true
                    },
                    user: {
                        id: savedUser.id,
                        email: savedUser.email,
                        tempPassword
                    },
                    accessInfo: {
                        email: savedUser.email,
                        password: tempPassword,
                        message: 'Anote estes dados! Após fechar esta janela, você só terá acesso a eles pelo e-mail informado.'
                    }
                };
            }
            console.log('Criando instância do WhatsApp para o restaurante...');
            const instanceName = `restaurant_${savedRestaurant.id.substring(0, 8)}`;
            savedRestaurant.evolutionApiInstanceName = instanceName;
            await this.restaurantRepository.save(savedRestaurant);
            try {
                const instanceResult = await this.evolutionApiService.createInstance(instanceName, {
                    number: registrationData.whatsappNumber || registrationData.phone || '',
                    integration: 'WHATSAPP-BAILEYS',
                    qrcode: false,
                    reject_call: true,
                    msg_call: 'Desculpe, não podemos atender chamadas neste número. Por favor, envie uma mensagem de texto.',
                    groupsIgnore: true,
                    alwaysOnline: true,
                    readMessages: true,
                    readStatus: true,
                    webhookByEvents: false,
                    webhookEvents: [],
                });
                console.log('Instância do WhatsApp criada com sucesso:', instanceName);
                if (instanceResult && instanceResult.hash && instanceResult.hash.apikey) {
                    savedRestaurant.evolutionApiInstanceToken = instanceResult.hash.apikey;
                    await this.restaurantRepository.save(savedRestaurant);
                }
            }
            catch (evolutionApiError) {
                console.error('Erro ao criar instância do WhatsApp:', evolutionApiError);
                whatsappError = evolutionApiError.message || 'Erro desconhecido';
                savedRestaurant.status = restaurant_entity_2.RestaurantStatus.PENDING_WHATSAPP;
                await this.restaurantRepository.save(savedRestaurant);
            }
            try {
                await this.notificationsService.sendAccessCredentials(savedUser.name, savedUser.email, tempPassword, savedRestaurant.name);
                console.log('Credenciais de acesso enviadas por e-mail com sucesso');
            }
            catch (notificationError) {
                console.error('Erro ao enviar credenciais de acesso por e-mail:', notificationError);
            }
            return {
                success: true,
                message: whatsappError
                    ? `Restaurante registrado com sucesso, mas houve um problema ao configurar o WhatsApp: ${whatsappError}`
                    : 'Restaurante registrado com sucesso!',
                restaurant: {
                    id: savedRestaurant.id,
                    name: savedRestaurant.name,
                    whatsappInstance: savedRestaurant.evolutionApiInstanceName || null
                },
                user: {
                    id: savedUser.id,
                    email: savedUser.email,
                    tempPassword
                },
                accessInfo: {
                    email: savedUser.email,
                    password: tempPassword,
                    message: 'Anote estes dados! Após fechar esta janela, você só terá acesso a eles pelo e-mail informado.'
                }
            };
        }
        catch (error) {
            console.error('Erro ao registrar restaurante:', error);
            if (savedRestaurant && !error.message?.includes('Realizando rollback')) {
                console.log(`Realizando rollback de emergência - excluindo restaurante ID: ${savedRestaurant.id}`);
                try {
                    await this.restaurantRepository.remove(savedRestaurant);
                }
                catch (e) {
                    console.error('Erro ao tentar remover restaurante durante rollback:', e);
                }
            }
            if (savedUser && !error.message?.includes('Realizando rollback')) {
                console.log(`Realizando rollback de emergência - excluindo usuário ID: ${savedUser.id}`);
                try {
                    await this.userRepository.remove(savedUser);
                }
                catch (e) {
                    console.error('Erro ao tentar remover usuário durante rollback:', e);
                }
            }
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Erro ao registrar restaurante: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async registerRestaurantNoWhatsapp(registrationData) {
        registrationData.skipWhatsappSetup = true;
        return this.registerRestaurant(registrationData);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is running' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all orders' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('restaurants/:restaurantId/orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order for a specific restaurant' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order created successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "createRestaurantOrder", null);
__decorate([
    (0, common_1.Get)('orders/recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns recent orders' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getRecentOrders", null);
__decorate([
    (0, common_1.Get)('orders/weekly-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get weekly order statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns weekly order statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getWeeklyStats", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the order' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Put)('restaurants/:restaurantId/orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an order for a specific restaurant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateRestaurantOrder", null);
__decorate([
    (0, common_1.Patch)('restaurants/:restaurantId/orders/:orderId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status for a specific restaurant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order status updated successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateRestaurantOrderStatus", null);
__decorate([
    (0, common_1.Get)('statistics/top-products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top sold products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns top sold products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Post)('register-restaurant'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new restaurant from landing page' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Restaurant registered successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "registerRestaurant", null);
__decorate([
    (0, common_1.Post)('register-restaurant-no-whatsapp'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Restaurant registered without WhatsApp' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "registerRestaurantNoWhatsapp", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [app_service_1.AppService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        restaurant_service_1.RestaurantService,
        evolution_api_service_1.EvolutionApiService,
        core_1.ModuleRef,
        customers_service_1.CustomersService,
        notifications_service_1.NotificationsService])
], AppController);
//# sourceMappingURL=app.controller.js.map