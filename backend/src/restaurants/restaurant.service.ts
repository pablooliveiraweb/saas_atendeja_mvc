import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant, RestaurantStatus } from './entities/restaurant.entity';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RestaurantService {
  private readonly logger = new Logger(RestaurantService.name);

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly evolutionApiService: EvolutionApiService,
  ) {}

  /**
   * Cria um novo restaurante e uma instância na Evolution API
   * @param restaurantData Dados do restaurante
   * @param owner Usuário proprietário do restaurante
   * @returns Restaurante criado
   */
  async create(restaurantData: Partial<Restaurant>, owner: User): Promise<Restaurant> {
    try {
      this.logger.log(`Criando restaurante para o usuário ${owner.email}`);
      
      // Criar o restaurante
      const restaurant = this.restaurantRepository.create({
        ...restaurantData,
        owner,
      });
      
      // Salvar o restaurante para obter o ID
      const savedRestaurant = await this.restaurantRepository.save(restaurant);
      
      // Gerar um nome de instância baseado no ID do restaurante
      const instanceName = `restaurant_${savedRestaurant.id.substring(0, 8)}`;
      
      try {
        // Criar instância na Evolution API com opções adicionais
        this.logger.log(`Criando instância na Evolution API: ${instanceName}`);
        const instanceResult = await this.evolutionApiService.createInstance(instanceName, {
          token: '', // Token será gerado automaticamente
          number: savedRestaurant.whatsappNumber || '', // Usar o número do restaurante se disponível
          qrcode: false, // Não gerar QR Code automaticamente
          webhook: {
            url: '',
            enabled: false,
          },
          webhook_by_events: false,
          events: [],
          reject_call: true, // Rejeitar chamadas automaticamente
          msg_call: 'Desculpe, não podemos atender chamadas neste número. Por favor, envie uma mensagem de texto.',
        });
        
        // Atualizar o restaurante com os dados da instância
        savedRestaurant.evolutionApiInstanceName = instanceName;
        savedRestaurant.evolutionApiInstanceConnected = false;
        
        // Se a resposta contiver um token, salvá-lo
        if (instanceResult && instanceResult.hash && instanceResult.hash.apikey) {
          savedRestaurant.evolutionApiInstanceToken = instanceResult.hash.apikey;
        }
        
        // Salvar o restaurante atualizado
        await this.restaurantRepository.save(savedRestaurant);
        
        this.logger.log(`Instância criada com sucesso: ${instanceName}`);
      } catch (error) {
        this.logger.error(`Erro ao criar instância na Evolution API: ${error.message}`);
        // Continuar mesmo se houver erro na criação da instância
      }
      
      return savedRestaurant;
    } catch (error) {
      this.logger.error(`Erro ao criar restaurante: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca um restaurante pelo ID
   * @param id ID do restaurante
   * @returns Restaurante encontrado ou null
   */
  async findById(id: string): Promise<Restaurant | null> {
    return this.restaurantRepository.findOne({ where: { id } });
  }

  /**
   * Atualiza um restaurante
   * @param id ID do restaurante
   * @param updateData Dados a serem atualizados
   * @returns Restaurante atualizado
   */
  async update(id: string, updateData: Partial<Restaurant>): Promise<Restaurant> {
    await this.restaurantRepository.update(id, updateData);
    const restaurant = await this.findById(id);
    if (!restaurant) {
      throw new Error(`Restaurante com ID ${id} não encontrado`);
    }
    return restaurant;
  }

  /**
   * Conecta a instância do WhatsApp do restaurante
   * @param id ID do restaurante
   * @param phoneNumber Número de telefone opcional para conexão
   * @returns Resultado da conexão
   */
  async connectWhatsAppInstance(id: string, phoneNumber?: string): Promise<any> {
    const restaurant = await this.findById(id);
    
    if (!restaurant) {
      throw new Error(`Restaurante com ID ${id} não encontrado`);
    }
    
    if (!restaurant.evolutionApiInstanceName) {
      throw new Error(`Restaurante não possui uma instância configurada`);
    }
    
    try {
      const result = await this.evolutionApiService.connectInstance(
        restaurant.evolutionApiInstanceName,
        phoneNumber
      );
      
      // Atualizar o status da conexão
      await this.update(id, { evolutionApiInstanceConnected: true });
      
      return result;
    } catch (error) {
      this.logger.error(`Erro ao conectar instância: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém o QR Code para conectar a instância do WhatsApp
   * @param id ID do restaurante
   * @returns QR Code
   */
  async getWhatsAppQrCode(id: string): Promise<any> {
    const restaurant = await this.findById(id);
    
    if (!restaurant) {
      throw new Error(`Restaurante com ID ${id} não encontrado`);
    }
    
    if (!restaurant.evolutionApiInstanceName) {
      throw new Error(`Restaurante não possui uma instância configurada`);
    }
    
    try {
      // Em vez de usar getQrCode, usamos connectInstance que retorna o QR code em base64
      return this.evolutionApiService.connectInstance(restaurant.evolutionApiInstanceName);
    } catch (error) {
      this.logger.error(`Erro ao obter QR Code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envia uma mensagem de WhatsApp usando a instância do restaurante
   * @param id ID do restaurante
   * @param number Número de telefone do destinatário
   * @param text Texto da mensagem
   * @returns Resultado do envio da mensagem
   */
  async sendWhatsAppMessage(id: string, number: string, text: string): Promise<any> {
    const restaurant = await this.findById(id);
    
    if (!restaurant) {
      throw new Error(`Restaurante com ID ${id} não encontrado`);
    }
    
    if (!restaurant.evolutionApiInstanceName) {
      throw new Error(`Restaurante não possui uma instância configurada`);
    }
    
    try {
      // Verificar o status da instância antes de enviar a mensagem
      const statusResponse = await this.evolutionApiService.checkInstanceStatus(restaurant.evolutionApiInstanceName);
      const instanceState = statusResponse.instance?.state?.toLowerCase();
      
      // Se a instância não estiver conectada, tentar conectá-la
      if (instanceState !== 'open' && instanceState !== 'connected') {
        this.logger.log(`Instância ${restaurant.evolutionApiInstanceName} não está conectada (status: ${instanceState}). Tentando conectar...`);
        
        // Tentar conectar a instância
        await this.evolutionApiService.connectInstance(restaurant.evolutionApiInstanceName);
        
        // Verificar novamente o status após tentar conectar
        const newStatusResponse = await this.evolutionApiService.checkInstanceStatus(restaurant.evolutionApiInstanceName);
        const newInstanceState = newStatusResponse.instance?.state?.toLowerCase();
        
        if (newInstanceState !== 'open' && newInstanceState !== 'connected') {
          throw new Error(`Não foi possível conectar a instância ${restaurant.evolutionApiInstanceName}. Status atual: ${newInstanceState}`);
        }
      }
      
      // Enviar a mensagem
      return this.evolutionApiService.sendText(
        restaurant.evolutionApiInstanceName,
        number,
        text,
      );
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem para o restaurante ${id}: ${error.message}`);
      throw error;
    }
  }
} 