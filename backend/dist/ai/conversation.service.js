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
var ConversationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
const openai_service_1 = require("./openai.service");
const customers_service_1 = require("../customers/customers.service");
const evolution_api_service_1 = require("../evolution-api/evolution-api.service");
const restaurant_service_1 = require("../restaurants/restaurant.service");
let ConversationService = ConversationService_1 = class ConversationService {
    conversationRepository;
    messageRepository;
    openAIService;
    customersService;
    evolutionApiService;
    restaurantService;
    logger = new common_1.Logger(ConversationService_1.name);
    constructor(conversationRepository, messageRepository, openAIService, customersService, evolutionApiService, restaurantService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.openAIService = openAIService;
        this.customersService = customersService;
        this.evolutionApiService = evolutionApiService;
        this.restaurantService = restaurantService;
    }
    async handleIncomingMessage(restaurantId, phoneNumber, messageContent) {
        try {
            this.logger.log(`Recebida mensagem de ${phoneNumber} para restaurante ${restaurantId}: ${messageContent}`);
            const conversation = await this.findOrCreateConversation(restaurantId, phoneNumber);
            if ('isTemporary' in conversation && conversation.isTemporary) {
                this.logger.log(`Conversa temporária para restaurante ${restaurantId} e número ${phoneNumber}`);
                const assistantResponse = await this.openAIService.getAssistantResponse(restaurantId, messageContent, []);
                if (assistantResponse) {
                    const restaurant = await this.restaurantService.findById(restaurantId);
                    if (!restaurant || !restaurant.evolutionApiInstanceName) {
                        throw new Error(`Restaurante ${restaurantId} não possui uma instância configurada`);
                    }
                    this.logger.log(`Enviando resposta para ${phoneNumber} usando instância ${restaurant.evolutionApiInstanceName}`);
                    await this.evolutionApiService.sendText(restaurant.evolutionApiInstanceName, phoneNumber, assistantResponse);
                }
                return assistantResponse;
            }
            let recentNotifications = [];
            try {
                const recentMessages = await this.messageRepository.find({
                    where: {
                        conversationId: conversation.id,
                        role: 'assistant',
                        content: (0, typeorm_2.Like)('%PEDIDO%')
                    },
                    order: { createdAt: 'DESC' },
                    take: 3
                });
                if (recentMessages.length > 0) {
                    recentNotifications = recentMessages.map(msg => msg.content);
                    this.logger.log(`Encontradas ${recentNotifications.length} notificações recentes para a conversa ${conversation.id}`);
                }
            }
            catch (error) {
                this.logger.warn(`Erro ao buscar notificações recentes: ${error.message}`);
            }
            await this.saveMessage(conversation.id, 'user', messageContent);
            conversation.lastInteractionAt = new Date();
            conversation.needsFollowUp = false;
            await this.conversationRepository.save(conversation);
            const conversationHistory = await this.getConversationHistory(conversation.id);
            const assistantResponse = await this.openAIService.getAssistantResponse(restaurantId, messageContent, conversationHistory);
            if (assistantResponse) {
                await this.saveMessage(conversation.id, 'assistant', assistantResponse);
                const restaurant = await this.restaurantService.findById(restaurantId);
                if (!restaurant || !restaurant.evolutionApiInstanceName) {
                    throw new Error(`Restaurante ${restaurantId} não possui uma instância configurada`);
                }
                this.logger.log(`Enviando resposta para ${phoneNumber} usando instância ${restaurant.evolutionApiInstanceName}`);
                await this.evolutionApiService.sendText(restaurant.evolutionApiInstanceName, phoneNumber, assistantResponse);
            }
            return assistantResponse;
        }
        catch (error) {
            this.logger.error(`Erro ao processar mensagem: ${error.message}`);
            throw error;
        }
    }
    async findOrCreateConversation(restaurantId, phoneNumber) {
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
        this.logger.log(`Buscando conversa para o número ${cleanPhoneNumber} no restaurante ${restaurantId}`);
        let conversation = await this.conversationRepository.findOne({
            where: {
                restaurantId,
                phoneNumber: cleanPhoneNumber,
                isActive: true,
            },
        });
        if (conversation) {
            this.logger.log(`Conversa existente encontrada: ${conversation.id}`);
            return conversation;
        }
        this.logger.log(`Nenhuma conversa ativa encontrada. Criando nova conversa.`);
        try {
            let restaurantExists = false;
            try {
                const restaurant = await this.restaurantService.findById(restaurantId);
                if (restaurant) {
                    restaurantExists = true;
                    this.logger.log(`Restaurante encontrado: ${restaurant.name} (ID: ${restaurantId})`);
                }
            }
            catch (error) {
                this.logger.warn(`Restaurante com ID ${restaurantId} não encontrado: ${error.message}`);
            }
            if (!restaurantExists) {
                this.logger.warn(`Criando conversa temporária para restaurante ${restaurantId} que não existe no banco de dados`);
                const tempConversation = {
                    id: 'temp-' + Date.now(),
                    phoneNumber: cleanPhoneNumber,
                    restaurantId,
                    isActive: true,
                    lastInteractionAt: new Date(),
                    isTemporary: true,
                    needsFollowUp: false
                };
                return tempConversation;
            }
            let customerId = undefined;
            let customerName = undefined;
            try {
                this.logger.log(`Buscando cliente com telefone ${cleanPhoneNumber} para restaurante ${restaurantId}...`);
                const customer = await this.customersService.findByPhone(cleanPhoneNumber, restaurantId);
                if (customer) {
                    customerId = customer.id;
                    customerName = customer.name;
                    this.logger.log(`Cliente encontrado: ${customer.name} (ID: ${customer.id})`);
                }
            }
            catch (error) {
                this.logger.warn(`Cliente com telefone ${cleanPhoneNumber} não encontrado para o restaurante ${restaurantId}. Criando conversa sem associação a cliente.`);
            }
            conversation = this.conversationRepository.create({
                restaurantId,
                phoneNumber: cleanPhoneNumber,
                isActive: true,
                lastInteractionAt: new Date(),
                customerId,
            });
            await this.conversationRepository.save(conversation);
            this.logger.log(`Nova conversa criada para o restaurante ${restaurantId} com o número ${cleanPhoneNumber}${customerName ? ` (Cliente: ${customerName})` : ''}`);
        }
        catch (error) {
            this.logger.error(`Erro ao criar conversa: ${error.message}`);
            throw error;
        }
        return conversation;
    }
    async saveMessage(conversationId, role, content) {
        const message = this.messageRepository.create({
            conversationId,
            role,
            content,
        });
        return this.messageRepository.save(message);
    }
    async getConversationHistory(conversationId) {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const messages = await this.messageRepository.find({
            where: {
                conversationId,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(twentyFourHoursAgo)
            },
            order: { createdAt: 'ASC' },
            take: 50,
        });
        this.logger.log(`Recuperadas ${messages.length} mensagens do histórico da conversa ${conversationId}`);
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));
    }
    async identifyAbandonedConversations() {
        const threeHoursAgo = new Date();
        threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
        this.logger.log(`Buscando conversas abandonadas (sem interação desde ${threeHoursAgo.toISOString()})...`);
        const abandonedConversations = await this.conversationRepository.find({
            where: {
                isActive: true,
                lastInteractionAt: (0, typeorm_2.LessThan)(threeHoursAgo),
                needsFollowUp: false,
            },
        });
        this.logger.log(`Encontradas ${abandonedConversations.length} conversas abandonadas`);
        for (const conversation of abandonedConversations) {
            this.logger.log(`Enviando follow-up para conversa ${conversation.id} (última interação: ${conversation.lastInteractionAt.toISOString()})`);
            conversation.needsFollowUp = true;
            await this.conversationRepository.save(conversation);
            await this.sendFollowUpMessage(conversation.id);
        }
        return abandonedConversations.length;
    }
    async sendFollowUpMessage(conversationId) {
        try {
            const conversation = await this.conversationRepository.findOne({
                where: { id: conversationId },
                relations: ['restaurant'],
            });
            if (!conversation) {
                throw new Error(`Conversa não encontrada: ${conversationId}`);
            }
            let customerName = '';
            if (conversation.customerId) {
                try {
                    const customer = await this.customersService.findOne(conversation.customerId, conversation.restaurantId);
                    if (customer) {
                        customerName = customer.name;
                        this.logger.log(`Cliente encontrado para follow-up: ${customer.name}`);
                    }
                }
                catch (error) {
                    this.logger.warn(`Erro ao buscar cliente para follow-up: ${error.message}`);
                }
            }
            const discountCode = this.generateDiscountCode(conversation.restaurantId);
            const greeting = customerName ? `Olá, ${customerName}!` : 'Olá!';
            const followUpMessage = `${greeting} Notamos que você iniciou uma conversa conosco mas não finalizou. 
      Gostaríamos de oferecer um cupom de 10% de desconto para seu próximo pedido: ${discountCode}. 
      Este cupom é válido por 24 horas. Podemos ajudar com algo?`;
            const restaurant = await this.restaurantService.findById(conversation.restaurantId);
            if (!restaurant || !restaurant.evolutionApiInstanceName) {
                throw new Error(`Restaurante ${conversation.restaurantId} não possui uma instância configurada`);
            }
            await this.evolutionApiService.sendText(restaurant.evolutionApiInstanceName, conversation.phoneNumber, followUpMessage);
            await this.saveMessage(conversationId, 'assistant', followUpMessage);
            conversation.needsFollowUp = false;
            conversation.lastInteractionAt = new Date();
            await this.conversationRepository.save(conversation);
            this.logger.log(`Mensagem de follow-up enviada para a conversa ${conversationId}`);
            return { success: true, message: 'Mensagem de follow-up enviada com sucesso' };
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem de follow-up: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    generateDiscountCode(restaurantId) {
        const prefix = 'VOLTA';
        const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `${prefix}${randomPart}`;
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = ConversationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        openai_service_1.OpenAIService,
        customers_service_1.CustomersService,
        evolution_api_service_1.EvolutionApiService,
        restaurant_service_1.RestaurantService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map