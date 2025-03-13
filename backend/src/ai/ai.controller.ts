import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { RestaurantService } from '../restaurants/restaurant.service';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';
import { ConfigService } from '@nestjs/config';

@Controller('ai')
export class AIController {
  private readonly logger = new Logger(AIController.name);

  constructor(
    private readonly conversationService: ConversationService,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly restaurantService: RestaurantService,
    private readonly evolutionApiService: EvolutionApiService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Body() webhookData: any) {
    try {
      this.logger.log(`Recebido webhook: ${JSON.stringify(webhookData)}`);
      
      // Verificar o tipo de evento
      const eventName = webhookData.event;
      
      if (eventName === 'messages.upsert') {
        // Extrair as mensagens do webhook
        const messages = Array.isArray(webhookData.data) 
          ? webhookData.data 
          : [webhookData.data]; // Se não for um array, tratamos o próprio data como uma mensagem
        
        this.logger.log(`Processando ${messages.length} mensagens`);
        
        for (const message of messages) {
          // Ignorar mensagens enviadas pelo próprio bot
          if (message.key?.fromMe) {
            this.logger.log('Ignorando mensagem enviada pelo bot');
            continue;
          }
          
          // Verificar se é uma mensagem de texto
          if (message.message?.conversation || message.message?.extendedTextMessage?.text) {
            const phoneNumber = message.key.remoteJid.split('@')[0];
            const content = message.message.conversation || message.message.extendedTextMessage?.text;
            
            // Obter o nome da instância
            const instanceName = webhookData.instance?.instanceName || webhookData.instance;
            
            if (!instanceName) {
              this.logger.warn('Nome da instância não encontrado no webhook');
              continue;
            }
            
            this.logger.log(`Nome da instância recebido: ${instanceName}`);
            
            // Extrair o ID do restaurante do nome da instância
            // Formato esperado: restaurant_uuid
            let restaurantId = instanceName.replace('restaurant_', '');
            
            this.logger.log(`ID do restaurante extraído: ${restaurantId}`);
            
            // Verificar se o ID está no formato UUID completo (8-4-4-4-12)
            // Se não estiver, tentar convertê-lo para um formato válido
            if (!this.isValidUUID(restaurantId)) {
              // Buscar o restaurante pelo nome da instância
              try {
                const restaurant = await this.restaurantRepository.findOne({
                  where: { evolutionApiInstanceName: instanceName }
                });
                
                if (restaurant) {
                  restaurantId = restaurant.id;
                  this.logger.log(`Restaurante encontrado pelo nome da instância: ${restaurant.name} (ID: ${restaurantId})`);
                } else {
                  // Se não encontrar pelo nome da instância, tentar converter o ID parcial
                  restaurantId = await this.convertToValidUUID(restaurantId);
                  this.logger.log(`ID do restaurante convertido para: ${restaurantId}`);
                }
              } catch (error) {
                this.logger.error(`Erro ao buscar restaurante pelo nome da instância: ${error.message}`);
                // Continuar com a conversão padrão
                restaurantId = await this.convertToValidUUID(restaurantId);
                this.logger.log(`ID do restaurante convertido para: ${restaurantId}`);
              }
            }
            
            this.logger.log(`Processando mensagem de ${phoneNumber} para restaurante ${restaurantId}: ${content}`);
            
            // Processar a mensagem
            await this.conversationService.handleIncomingMessage(
              restaurantId,
              phoneNumber,
              content
            );

            if (content.toLowerCase().includes('pedido')) {
              const restaurant = await this.restaurantService.findById(restaurantId);
              if (restaurant) {
                // Gerar o slug a partir do nome do restaurante
                const slug = this.generateSlug(restaurant.name);
                
                // Obter a URL do projeto a partir da configuração
                const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
                
                // Construir a URL completa do menu
                const fullUrl = `${baseUrl}/menu/${slug}`;
                
                await this.evolutionApiService.sendText(restaurant.evolutionApiInstanceName, phoneNumber, `Acesse o cardápio digital: ${fullUrl}`);
                this.logger.log(`Link do cardápio enviado para ${phoneNumber}: ${fullUrl}`);
              }
            }
          } else {
            this.logger.log('Mensagem não é do tipo texto, ignorando');
          }
        }
        
        return { success: true };
      } else if (eventName === 'CONNECTION_UPDATE') {
        this.logger.log(`Atualização de conexão para instância: ${webhookData.instance?.instanceName || webhookData.instance}`);
        return { success: true };
      }
      
      return { success: true, message: 'Evento não processável' };
    } catch (error) {
      this.logger.error(`Erro ao processar webhook: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Verifica se uma string é um UUID válido
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  // Converte um ID curto para um formato UUID válido
  private async convertToValidUUID(id: string): Promise<string> {
    // Se já for um UUID válido, retornar como está
    if (this.isValidUUID(id)) {
      return id;
    }
    
    try {
      // Buscar todos os restaurantes
      const restaurants = await this.restaurantRepository.find();
      
      // Verificar se o ID parcial corresponde ao início do ID de algum restaurante
      for (const restaurant of restaurants) {
        if (restaurant.id.startsWith(id)) {
          this.logger.log(`ID parcial ${id} corresponde ao restaurante ${restaurant.name} com ID completo: ${restaurant.id}`);
          return restaurant.id;
        }
      }
      
      this.logger.warn(`ID parcial ${id} não corresponde a nenhum restaurante conhecido`);
    } catch (error) {
      this.logger.error(`Erro ao verificar ID do restaurante: ${error.message}`);
    }
    
    // Caso não encontre o restaurante, manter o comportamento anterior
    // Remover hífens se existirem
    const cleanId = id.replace(/-/g, '');
    
    // Preencher com zeros à direita até ter 32 caracteres
    const paddedId = cleanId.padEnd(32, '0');
    
    // Formatar como UUID
    return `${paddedId.substring(0, 8)}-${paddedId.substring(8, 12)}-${paddedId.substring(12, 16)}-${paddedId.substring(16, 20)}-${paddedId.substring(20, 32)}`;
  }

  // Gerar slug a partir do nome do restaurante (mesma lógica do frontend)
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '')         // Remove caracteres especiais
      .replace(/\s+/g, '-');           // Substitui espaços por hífens
  }

  @Cron('0 */10 * * * *') // Executar a cada 10 minutos
  async checkAbandonedConversations() {
    try {
      this.logger.log('Verificando conversas abandonadas...');
      
      const abandonedConversationsCount = await this.conversationService.identifyAbandonedConversations();
      
      this.logger.log(`Processadas ${abandonedConversationsCount} conversas abandonadas`);
    } catch (error) {
      this.logger.error(`Erro ao verificar conversas abandonadas: ${error.message}`);
    }
  }
} 