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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_entity_2 = require("./entities/order.entity");
const evolution_api_service_1 = require("../evolution-api/evolution-api.service");
let OrdersService = OrdersService_1 = class OrdersService {
    orderRepository;
    evolutionApiService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(orderRepository, evolutionApiService) {
        this.orderRepository = orderRepository;
        this.evolutionApiService = evolutionApiService;
    }
    async findAll() {
        return this.orderRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['restaurant', 'user']
        });
    }
    async findAllWithStatus(status) {
        this.logger.log(`Buscando pedidos com status: ${status}`);
        try {
            const orders = await this.orderRepository.find({
                where: { status },
                order: { createdAt: 'DESC' },
                relations: ['restaurant', 'user']
            });
            this.logger.log(`Encontrados ${orders.length} pedidos com status ${status}`);
            return orders;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar pedidos com status ${status}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(id) {
        if (id === 'pending') {
            throw new common_1.NotFoundException(`ID inválido: ${id} não é um UUID válido`);
        }
        this.logger.log(`Buscando pedido com ID: ${id}`);
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            this.logger.error(`ID inválido: ${id} não é um UUID válido`);
            throw new common_1.NotFoundException(`ID inválido: ${id} não é um UUID válido`);
        }
        try {
            const order = await this.orderRepository.findOne({
                where: { id },
                relations: ['restaurant', 'user']
            });
            if (!order) {
                this.logger.warn(`Pedido com ID ${id} não encontrado`);
                throw new common_1.NotFoundException(`Pedido com ID ${id} não encontrado`);
            }
            return order;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar pedido: ${error.message}`, error.stack);
            throw error;
        }
    }
    async create(orderData) {
        const order = this.orderRepository.create(orderData);
        return this.orderRepository.save(order);
    }
    async update(id, updateData) {
        const order = await this.findOne(id);
        const oldStatus = order.status;
        Object.assign(order, updateData);
        const updatedOrder = await this.orderRepository.save(order);
        if (updateData.status && oldStatus !== updateData.status) {
            await this.handleStatusChange(updatedOrder, oldStatus);
        }
        return updatedOrder;
    }
    async remove(id) {
        const order = await this.findOne(id);
        await this.orderRepository.remove(order);
    }
    async findByCustomerPhone(phone, limit = 5) {
        this.logger.log(`Buscando pedidos para o cliente com telefone: ${phone}`);
        try {
            const cleanPhone = phone.replace(/\D/g, '');
            this.logger.log(`Telefone limpo: ${cleanPhone}`);
            let phoneVariations = [cleanPhone];
            if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
                const phoneWithoutCountryCode = cleanPhone.substring(2);
                phoneVariations.push(phoneWithoutCountryCode);
                this.logger.log(`Adicionando variação sem código do país: ${phoneWithoutCountryCode}`);
                if (phoneWithoutCountryCode.length === 10) {
                    const phoneWithNine = phoneWithoutCountryCode.substring(0, 2) + '9' + phoneWithoutCountryCode.substring(2);
                    phoneVariations.push(phoneWithNine);
                    this.logger.log(`Adicionando variação com 9: ${phoneWithNine}`);
                    phoneVariations.push('55' + phoneWithNine);
                    this.logger.log(`Adicionando variação com código do país + 9: 55${phoneWithNine}`);
                }
                else if (phoneWithoutCountryCode.length === 11 && phoneWithoutCountryCode.charAt(2) === '9') {
                    const phoneWithoutNine = phoneWithoutCountryCode.substring(0, 2) + phoneWithoutCountryCode.substring(3);
                    phoneVariations.push(phoneWithoutNine);
                    this.logger.log(`Adicionando variação sem 9: ${phoneWithoutNine}`);
                    phoneVariations.push('55' + phoneWithoutNine);
                    this.logger.log(`Adicionando variação com código do país sem 9: 55${phoneWithoutNine}`);
                }
            }
            else {
                if (cleanPhone.length === 10) {
                    const phoneWithNine = cleanPhone.substring(0, 2) + '9' + cleanPhone.substring(2);
                    phoneVariations.push(phoneWithNine);
                    this.logger.log(`Adicionando variação com 9: ${phoneWithNine}`);
                    phoneVariations.push('55' + cleanPhone);
                    phoneVariations.push('55' + phoneWithNine);
                    this.logger.log(`Adicionando variações com código do país: 55${cleanPhone}, 55${phoneWithNine}`);
                }
                else if (cleanPhone.length === 11 && cleanPhone.charAt(2) === '9') {
                    const phoneWithoutNine = cleanPhone.substring(0, 2) + cleanPhone.substring(3);
                    phoneVariations.push(phoneWithoutNine);
                    this.logger.log(`Adicionando variação sem 9: ${phoneWithoutNine}`);
                    phoneVariations.push('55' + cleanPhone);
                    phoneVariations.push('55' + phoneWithoutNine);
                    this.logger.log(`Adicionando variações com código do país: 55${cleanPhone}, 55${phoneWithoutNine}`);
                }
                else {
                    phoneVariations.push('55' + cleanPhone);
                    this.logger.log(`Adicionando variação com código do país: 55${cleanPhone}`);
                }
            }
            phoneVariations = [...new Set(phoneVariations)];
            const orders = await this.orderRepository.find({
                where: [
                    ...phoneVariations.map(phoneVar => ({ customerPhone: phoneVar }))
                ],
                order: { createdAt: 'DESC' },
                take: limit,
                relations: ['orderItems', 'orderItems.product']
            });
            this.logger.log(`Encontrados ${orders.length} pedidos para o cliente com telefone ${phone} (variações testadas: ${phoneVariations.join(', ')})`);
            return orders;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar pedidos para o cliente com telefone ${phone}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleStatusChange(order, oldStatus) {
        try {
            if (!order.restaurant) {
                this.logger.warn(`Pedido ${order.id} não tem restaurante associado para enviar notificação`);
                return;
            }
            if (!order.customerPhone) {
                this.logger.warn(`Pedido ${order.id} não tem número de telefone do cliente para enviar notificação`);
                return;
            }
            if (!order.restaurant.evolutionApiInstanceName) {
                this.logger.warn(`Restaurante do pedido ${order.id} não tem instância do WhatsApp configurada`);
                return;
            }
            const statusesWithNotification = [
                order_entity_2.OrderStatus.CONFIRMED,
                order_entity_2.OrderStatus.PREPARING,
                order_entity_2.OrderStatus.READY,
                order_entity_2.OrderStatus.OUT_FOR_DELIVERY,
                order_entity_2.OrderStatus.DELIVERED
            ];
            if (!statusesWithNotification.includes(order.status)) {
                this.logger.log(`Status ${order.status} não requer notificação para o pedido ${order.id}`);
                return;
            }
            const message = this.getStatusMessage(order);
            if (!message) {
                this.logger.warn(`Não foi possível gerar mensagem para o status ${order.status} do pedido ${order.id}`);
                return;
            }
            this.logger.log(`Enviando notificação para o pedido ${order.id} com status ${order.status}`);
            const result = await this.evolutionApiService.sendText(order.restaurant.evolutionApiInstanceName, order.customerPhone, message);
            await this.orderRepository.update(order.id, { notificationSent: true });
            this.logger.log(`Notificação enviada com sucesso para o pedido ${order.id}`);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar notificação para o pedido ${order.id}: ${error.message}`);
        }
    }
    getStatusMessage(order) {
        const orderNumber = order.orderNumber || order.id.substring(0, 8);
        const restaurantName = order.restaurant?.name || 'Restaurante';
        const messages = {
            [order_entity_2.OrderStatus.CONFIRMED]: `✅ Olá! Seu pedido #${orderNumber} foi *ACEITO*! 🎉\n\nEstamos preparando tudo com muito carinho no ${restaurantName}. Em breve iniciaremos o preparo. Vamos manter você informado sobre o andamento. Obrigado pela preferência! 😊`,
            [order_entity_2.OrderStatus.PREPARING]: `✅🔥 Oba! Seu pedido #${orderNumber} foi *ACEITO e já está sendo PREPARADO*! 🎉\n\nNossa equipe do ${restaurantName} está trabalhando com todo cuidado para que sua comida chegue perfeita até você. Logo mais avisaremos quando estiver pronto! 🍔🍕\n\nAgradecemos sua preferência! 😊`,
            [order_entity_2.OrderStatus.READY]: `🎁 *PEDIDO PRONTO*! 🎉\n\nSeu pedido #${orderNumber} já está prontinho! Nossa equipe do ${restaurantName} caprichou no preparo. Aguarde, em breve organizaremos a entrega! 🚀\n\nAgradecemos a sua escolha! 😋`,
            [order_entity_2.OrderStatus.OUT_FOR_DELIVERY]: `🚚 *PEDIDO SAIU PARA ENTREGA*! 🛵\n\nSeu pedido #${orderNumber} já está a caminho! Nosso entregador saiu do ${restaurantName} e logo chegará até você. Fique atento! 📱\n\nAgradecemos a sua escolha! 😊`,
            [order_entity_2.OrderStatus.DELIVERED]: `🏠 *ENTREGA CONCLUÍDA*! ✅\n\nSeu pedido #${orderNumber} chegou! Esperamos que aproveite cada mordida! 😋\n\nFoi um prazer atender você no ${restaurantName}. Volte sempre! 👋\n\nSe puder, avalie nossa comida e serviço, sua opinião é muito importante para nós.`,
            [order_entity_2.OrderStatus.CANCELED]: `❌ Pedido #${orderNumber} *CANCELADO*\n\nInfelizmente seu pedido foi cancelado. Por favor, entre em contato com o ${restaurantName} pelo mesmo número para mais informações ou para fazer um novo pedido. Sentimos muito pelo transtorno. 🙏`
        };
        return messages[order.status] || '';
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        evolution_api_service_1.EvolutionApiService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map