import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, MoreThanOrEqual, Like } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { OpenAIService } from './openai.service';
import { CustomersService } from '../customers/customers.service';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';
import { RestaurantService } from '../restaurants/restaurant.service';
import { addHours, subHours } from 'date-fns';

// Interface para conversa temporária
interface TemporaryConversation {
  id: string;
  phoneNumber: string;
  restaurantId: string;
  isActive: boolean;
  lastInteractionAt: Date;
  isTemporary: true;
  needsFollowUp: boolean;
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private openAIService: OpenAIService,
    private customersService: CustomersService,
    private evolutionApiService: EvolutionApiService,
    private restaurantService: RestaurantService,
  ) {}

  async handleIncomingMessage(restaurantId: string, phoneNumber: string, messageContent: string) {
    try {
      this.logger.log(`Recebida mensagem de ${phoneNumber} para restaurante ${restaurantId}: ${messageContent}`);
      
      // Encontrar ou criar uma conversa para este número e restaurante
      const conversation = await this.findOrCreateConversation(restaurantId, phoneNumber);
      
      // Se for uma conversa temporária (restaurante não existe), responder sem salvar no banco
      if ('isTemporary' in conversation && conversation.isTemporary) {
        this.logger.log(`Conversa temporária para restaurante ${restaurantId} e número ${phoneNumber}`);
        
        const assistantResponse = await this.openAIService.getAssistantResponse(
          restaurantId,
          messageContent,
          []
        );
        
        if (assistantResponse) {
          // Buscar a instância do restaurante
          const restaurant = await this.restaurantService.findById(restaurantId);
          
          if (!restaurant || !restaurant.evolutionApiInstanceName) {
            throw new Error(`Restaurante ${restaurantId} não possui uma instância configurada`);
          }
          
          // Enviar a resposta via WhatsApp usando a instância do restaurante
          this.logger.log(`Enviando resposta para ${phoneNumber} usando instância ${restaurant.evolutionApiInstanceName}`);
          
          await this.evolutionApiService.sendText(
            restaurant.evolutionApiInstanceName,
            phoneNumber,
            assistantResponse
          );
        }
        
        return assistantResponse;
      }
      
      // Verificar se há notificações recentes enviadas para este cliente
      // Isso ajudará o assistente a contextualizar respostas a notificações
      let recentNotifications: string[] = [];
      try {
        // Buscar mensagens recentes do assistente que possam ser notificações
        const recentMessages = await this.messageRepository.find({
          where: {
            conversationId: conversation.id,
            role: 'assistant',
            content: Like('%PEDIDO%') // Buscar mensagens que contenham a palavra PEDIDO (notificações)
          },
          order: { createdAt: 'DESC' },
          take: 3
        });
        
        if (recentMessages.length > 0) {
          recentNotifications = recentMessages.map(msg => msg.content);
          this.logger.log(`Encontradas ${recentNotifications.length} notificações recentes para a conversa ${conversation.id}`);
        }
      } catch (error) {
        this.logger.warn(`Erro ao buscar notificações recentes: ${error.message}`);
      }
      
      // Salvar a mensagem do usuário
      await this.saveMessage(conversation.id, 'user', messageContent);
      
      // Atualizar o timestamp da última interação
      conversation.lastInteractionAt = new Date();
      conversation.needsFollowUp = false;
      await this.conversationRepository.save(conversation);
      
      // Obter o histórico da conversa
      const conversationHistory = await this.getConversationHistory(conversation.id);
      
      // Obter resposta do assistente
      const assistantResponse = await this.openAIService.getAssistantResponse(
        restaurantId,
        messageContent,
        conversationHistory
      );
      
      if (assistantResponse) {
        // Salvar a resposta do assistente
        await this.saveMessage(conversation.id, 'assistant', assistantResponse);
        
        // Enviar a resposta via WhatsApp
        const restaurant = await this.restaurantService.findById(restaurantId);
        
        if (!restaurant || !restaurant.evolutionApiInstanceName) {
          throw new Error(`Restaurante ${restaurantId} não possui uma instância configurada`);
        }
        
        this.logger.log(`Enviando resposta para ${phoneNumber} usando instância ${restaurant.evolutionApiInstanceName}`);
        
        await this.evolutionApiService.sendText(
          restaurant.evolutionApiInstanceName,
          phoneNumber,
          assistantResponse
        );
      }
      
      return assistantResponse;
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem: ${error.message}`);
      throw error;
    }
  }

  async findOrCreateConversation(restaurantId: string, phoneNumber: string): Promise<Conversation | TemporaryConversation> {
    // Limpar o número de telefone para garantir consistência
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    this.logger.log(`Buscando conversa para o número ${cleanPhoneNumber} no restaurante ${restaurantId}`);
    
    // Buscar conversa ativa existente
    let conversation = await this.conversationRepository.findOne({
      where: {
        restaurantId,
        phoneNumber: cleanPhoneNumber,
        isActive: true,
      },
    });
    
    // Se encontrou uma conversa existente
    if (conversation) {
      this.logger.log(`Conversa existente encontrada: ${conversation.id}`);
      return conversation;
    }
    
    // Se não existir, criar uma nova
    this.logger.log(`Nenhuma conversa ativa encontrada. Criando nova conversa.`);
    
    try {
      // Verificar se o restaurante existe
      let restaurantExists = false;
      try {
        const restaurant = await this.restaurantService.findById(restaurantId);
        if (restaurant) {
          restaurantExists = true;
          this.logger.log(`Restaurante encontrado: ${restaurant.name} (ID: ${restaurantId})`);
        }
      } catch (error) {
        this.logger.warn(`Restaurante com ID ${restaurantId} não encontrado: ${error.message}`);
      }
      
      // Se o restaurante não existir, retornar uma conversa temporária
      if (!restaurantExists) {
        this.logger.warn(`Criando conversa temporária para restaurante ${restaurantId} que não existe no banco de dados`);
        const tempConversation: TemporaryConversation = {
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
      
      let customerId: string | undefined = undefined;
      let customerName: string | undefined = undefined;
      
      // Verificar se o cliente existe
      try {
        this.logger.log(`Buscando cliente com telefone ${cleanPhoneNumber} para restaurante ${restaurantId}...`);
        const customer = await this.customersService.findByPhone(cleanPhoneNumber, restaurantId);
        if (customer) {
          customerId = customer.id;
          customerName = customer.name;
          this.logger.log(`Cliente encontrado: ${customer.name} (ID: ${customer.id})`);
        }
      } catch (error) {
        // Se o cliente não for encontrado, continuamos sem associar a um cliente
        this.logger.warn(`Cliente com telefone ${cleanPhoneNumber} não encontrado para o restaurante ${restaurantId}. Criando conversa sem associação a cliente.`);
      }
      
      conversation = this.conversationRepository.create({
        restaurantId,
        phoneNumber: cleanPhoneNumber,
        isActive: true,
        lastInteractionAt: new Date(),
        customerId, // Pode ser undefined se o cliente não existir
      });
      
      await this.conversationRepository.save(conversation);
      this.logger.log(`Nova conversa criada para o restaurante ${restaurantId} com o número ${cleanPhoneNumber}${customerName ? ` (Cliente: ${customerName})` : ''}`);
    } catch (error) {
      this.logger.error(`Erro ao criar conversa: ${error.message}`);
      throw error;
    }
    
    return conversation;
  }

  async saveMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    const message = this.messageRepository.create({
      conversationId,
      role,
      content,
    });
    
    return this.messageRepository.save(message);
  }

  async getConversationHistory(conversationId: string) {
    // Calcular a data de 24 horas atrás
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Buscar mensagens das últimas 24 horas
    const messages = await this.messageRepository.find({
      where: { 
        conversationId,
        createdAt: MoreThanOrEqual(twentyFourHoursAgo) // Usar operador do TypeORM
      },
      order: { createdAt: 'ASC' },
      take: 50, // Aumentar o limite para 50 mensagens para manter mais contexto
    });
    
    this.logger.log(`Recuperadas ${messages.length} mensagens do histórico da conversa ${conversationId}`);
    
    return messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
  }

  async identifyAbandonedConversations() {
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
    
    this.logger.log(`Buscando conversas abandonadas (sem interação desde ${threeHoursAgo.toISOString()})...`);
    
    // Buscar conversas que não tiveram interação nas últimas 3 horas
    // e que ainda não foram marcadas para follow-up
    const abandonedConversations = await this.conversationRepository.find({
      where: {
        isActive: true,
        lastInteractionAt: LessThan(threeHoursAgo),
        needsFollowUp: false,
      },
    });
    
    this.logger.log(`Encontradas ${abandonedConversations.length} conversas abandonadas`);
    
    // Enviar follow-up para cada conversa abandonada
    for (const conversation of abandonedConversations) {
      this.logger.log(`Enviando follow-up para conversa ${conversation.id} (última interação: ${conversation.lastInteractionAt.toISOString()})`);
      
      // Marcar a conversa para follow-up antes de enviar a mensagem
      // para evitar múltiplos envios em caso de falha
      conversation.needsFollowUp = true;
      await this.conversationRepository.save(conversation);
      
      // Enviar mensagem de follow-up
      await this.sendFollowUpMessage(conversation.id);
    }
    
    return abandonedConversations.length;
  }

  async sendFollowUpMessage(conversationId: string) {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
        relations: ['restaurant'],
      });
      
      if (!conversation) {
        throw new Error(`Conversa não encontrada: ${conversationId}`);
      }
      
      // Verificar se há um cliente associado à conversa
      let customerName = '';
      if (conversation.customerId) {
        try {
          const customer = await this.customersService.findOne(conversation.customerId, conversation.restaurantId);
          if (customer) {
            customerName = customer.name;
            this.logger.log(`Cliente encontrado para follow-up: ${customer.name}`);
          }
        } catch (error) {
          this.logger.warn(`Erro ao buscar cliente para follow-up: ${error.message}`);
        }
      }
      
      // Gerar mensagem de follow-up com cupom de desconto
      const discountCode = this.generateDiscountCode(conversation.restaurantId);
      
      // Personalizar a mensagem com o nome do cliente, se disponível
      const greeting = customerName ? `Olá, ${customerName}!` : 'Olá!';
      
      const followUpMessage = `${greeting} Notamos que você iniciou uma conversa conosco mas não finalizou. 
      Gostaríamos de oferecer um cupom de 10% de desconto para seu próximo pedido: ${discountCode}. 
      Este cupom é válido por 24 horas. Podemos ajudar com algo?`;
      
      // Enviar mensagem via WhatsApp
      const restaurant = await this.restaurantService.findById(conversation.restaurantId);
      
      if (!restaurant || !restaurant.evolutionApiInstanceName) {
        throw new Error(`Restaurante ${conversation.restaurantId} não possui uma instância configurada`);
      }
      
      await this.evolutionApiService.sendText(
        restaurant.evolutionApiInstanceName,
        conversation.phoneNumber,
        followUpMessage
      );
      
      // Salvar a mensagem no histórico
      await this.saveMessage(conversationId, 'assistant', followUpMessage);
      
      // Atualizar a conversa
      conversation.needsFollowUp = false;
      conversation.lastInteractionAt = new Date();
      await this.conversationRepository.save(conversation);
      
      this.logger.log(`Mensagem de follow-up enviada para a conversa ${conversationId}`);
      
      return { success: true, message: 'Mensagem de follow-up enviada com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem de follow-up: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private generateDiscountCode(restaurantId: string): string {
    // Gerar um código de desconto único
    const prefix = 'VOLTA';
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}${randomPart}`;
  }
} 