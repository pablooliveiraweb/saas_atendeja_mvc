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
var AIController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const conversation_service_1 = require("./conversation.service");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const restaurant_service_1 = require("../restaurants/restaurant.service");
const evolution_api_service_1 = require("../evolution-api/evolution-api.service");
const config_1 = require("@nestjs/config");
let AIController = AIController_1 = class AIController {
    conversationService;
    restaurantRepository;
    restaurantService;
    evolutionApiService;
    configService;
    logger = new common_1.Logger(AIController_1.name);
    constructor(conversationService, restaurantRepository, restaurantService, evolutionApiService, configService) {
        this.conversationService = conversationService;
        this.restaurantRepository = restaurantRepository;
        this.restaurantService = restaurantService;
        this.evolutionApiService = evolutionApiService;
        this.configService = configService;
    }
    async handleWebhook(webhookData) {
        try {
            this.logger.log(`Recebido webhook: ${JSON.stringify(webhookData)}`);
            const eventName = webhookData.event;
            if (eventName === 'messages.upsert') {
                const messages = Array.isArray(webhookData.data)
                    ? webhookData.data
                    : [webhookData.data];
                this.logger.log(`Processando ${messages.length} mensagens`);
                for (const message of messages) {
                    if (message.key?.fromMe) {
                        this.logger.log('Ignorando mensagem enviada pelo bot');
                        continue;
                    }
                    if (message.message?.conversation || message.message?.extendedTextMessage?.text) {
                        const phoneNumber = message.key.remoteJid.split('@')[0];
                        const content = message.message.conversation || message.message.extendedTextMessage?.text;
                        const instanceName = webhookData.instance?.instanceName || webhookData.instance;
                        if (!instanceName) {
                            this.logger.warn('Nome da instância não encontrado no webhook');
                            continue;
                        }
                        this.logger.log(`Nome da instância recebido: ${instanceName}`);
                        let restaurantId = instanceName.replace('restaurant_', '');
                        this.logger.log(`ID do restaurante extraído: ${restaurantId}`);
                        if (!this.isValidUUID(restaurantId)) {
                            try {
                                const restaurant = await this.restaurantRepository.findOne({
                                    where: { evolutionApiInstanceName: instanceName }
                                });
                                if (restaurant) {
                                    restaurantId = restaurant.id;
                                    this.logger.log(`Restaurante encontrado pelo nome da instância: ${restaurant.name} (ID: ${restaurantId})`);
                                }
                                else {
                                    restaurantId = await this.convertToValidUUID(restaurantId);
                                    this.logger.log(`ID do restaurante convertido para: ${restaurantId}`);
                                }
                            }
                            catch (error) {
                                this.logger.error(`Erro ao buscar restaurante pelo nome da instância: ${error.message}`);
                                restaurantId = await this.convertToValidUUID(restaurantId);
                                this.logger.log(`ID do restaurante convertido para: ${restaurantId}`);
                            }
                        }
                        this.logger.log(`Processando mensagem de ${phoneNumber} para restaurante ${restaurantId}: ${content}`);
                        await this.conversationService.handleIncomingMessage(restaurantId, phoneNumber, content);
                        if (content.toLowerCase().includes('pedido')) {
                            const restaurant = await this.restaurantService.findById(restaurantId);
                            if (restaurant) {
                                const slug = this.generateSlug(restaurant.name);
                                const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
                                const fullUrl = `${baseUrl}/menu/${slug}`;
                                await this.evolutionApiService.sendText(restaurant.evolutionApiInstanceName, phoneNumber, `Acesse o cardápio digital: ${fullUrl}`);
                                this.logger.log(`Link do cardápio enviado para ${phoneNumber}: ${fullUrl}`);
                            }
                        }
                    }
                    else {
                        this.logger.log('Mensagem não é do tipo texto, ignorando');
                    }
                }
                return { success: true };
            }
            else if (eventName === 'CONNECTION_UPDATE') {
                this.logger.log(`Atualização de conexão para instância: ${webhookData.instance?.instanceName || webhookData.instance}`);
                return { success: true };
            }
            return { success: true, message: 'Evento não processável' };
        }
        catch (error) {
            this.logger.error(`Erro ao processar webhook: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    isValidUUID(id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
    }
    async convertToValidUUID(id) {
        if (this.isValidUUID(id)) {
            return id;
        }
        try {
            const restaurants = await this.restaurantRepository.find();
            for (const restaurant of restaurants) {
                if (restaurant.id.startsWith(id)) {
                    this.logger.log(`ID parcial ${id} corresponde ao restaurante ${restaurant.name} com ID completo: ${restaurant.id}`);
                    return restaurant.id;
                }
            }
            this.logger.warn(`ID parcial ${id} não corresponde a nenhum restaurante conhecido`);
        }
        catch (error) {
            this.logger.error(`Erro ao verificar ID do restaurante: ${error.message}`);
        }
        const cleanId = id.replace(/-/g, '');
        const paddedId = cleanId.padEnd(32, '0');
        return `${paddedId.substring(0, 8)}-${paddedId.substring(8, 12)}-${paddedId.substring(12, 16)}-${paddedId.substring(16, 20)}-${paddedId.substring(20, 32)}`;
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-');
    }
    async checkAbandonedConversations() {
        try {
            this.logger.log('Verificando conversas abandonadas...');
            const abandonedConversationsCount = await this.conversationService.identifyAbandonedConversations();
            this.logger.log(`Processadas ${abandonedConversationsCount} conversas abandonadas`);
        }
        catch (error) {
            this.logger.error(`Erro ao verificar conversas abandonadas: ${error.message}`);
        }
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "handleWebhook", null);
__decorate([
    (0, schedule_1.Cron)('0 */10 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "checkAbandonedConversations", null);
exports.AIController = AIController = AIController_1 = __decorate([
    (0, common_1.Controller)('ai'),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService,
        typeorm_2.Repository,
        restaurant_service_1.RestaurantService,
        evolution_api_service_1.EvolutionApiService,
        config_1.ConfigService])
], AIController);
//# sourceMappingURL=ai.controller.js.map