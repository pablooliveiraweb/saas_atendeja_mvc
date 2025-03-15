import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order.entity';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly evolutionApiService: EvolutionApiService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['restaurant']
    });
  }

  async findAllWithStatus(status: OrderStatus): Promise<Order[]> {
    this.logger.log(`Buscando pedidos com status: ${status}`);
    try {
      const orders = await this.orderRepository.find({
        where: { status },
        order: { createdAt: 'DESC' },
        relations: ['restaurant']
      });
      this.logger.log(`Encontrados ${orders.length} pedidos com status ${status}`);
      return orders;
    } catch (error) {
      this.logger.error(`Erro ao buscar pedidos com status ${status}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Order> {
    // Evitar logs repetitivos para o ID "pending"
    if (id === 'pending') {
      throw new NotFoundException(`ID inválido: ${id} não é um UUID válido`);
    }
    
    this.logger.log(`Buscando pedido com ID: ${id}`);
    
    // Verificar se o ID é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      this.logger.error(`ID inválido: ${id} não é um UUID válido`);
      throw new NotFoundException(`ID inválido: ${id} não é um UUID válido`);
    }
    
    try {
      const order = await this.orderRepository.findOne({ 
        where: { id },
        relations: ['restaurant']
      });
      
      if (!order) {
        this.logger.warn(`Pedido com ID ${id} não encontrado`);
        throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
      }
      
      return order;
    } catch (error) {
      this.logger.error(`Erro ao buscar pedido: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async update(id: string, updateData: Partial<Order>): Promise<Order> {
    const order = await this.findOne(id); // Vai lançar exceção se não encontrar
    const oldStatus = order.status;
    
    // Atualizar os campos
    Object.assign(order, updateData);
    
    // Salvar as alterações
    const updatedOrder = await this.orderRepository.save(order);
    
    // Verificar se o status foi alterado
    if (updateData.status && oldStatus !== updateData.status) {
      await this.handleStatusChange(updatedOrder, oldStatus);
    }
    
    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id); // Vai lançar exceção se não encontrar
    await this.orderRepository.remove(order);
  }

  async findByCustomerPhone(phone: string, limit: number = 5): Promise<Order[]> {
    this.logger.log(`Buscando pedidos para o cliente com telefone: ${phone}`);
    
    try {
      // Limpar o número de telefone para garantir consistência
      const cleanPhone = phone.replace(/\D/g, '');
      this.logger.log(`Telefone limpo: ${cleanPhone}`);
      
      // Criar variações do número para lidar com diferentes formatos
      let phoneVariations = [cleanPhone];
      
      // Se o número começa com 55 (código do Brasil), criar variação sem o código
      if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
        const phoneWithoutCountryCode = cleanPhone.substring(2);
        phoneVariations.push(phoneWithoutCountryCode);
        this.logger.log(`Adicionando variação sem código do país: ${phoneWithoutCountryCode}`);
        
        // Se o número sem código do país tem 10 dígitos (sem o 9), adicionar variação com o 9
        if (phoneWithoutCountryCode.length === 10) {
          const phoneWithNine = phoneWithoutCountryCode.substring(0, 2) + '9' + phoneWithoutCountryCode.substring(2);
          phoneVariations.push(phoneWithNine);
          this.logger.log(`Adicionando variação com 9: ${phoneWithNine}`);
          
          // Também adicionar variação com código do país + 9
          phoneVariations.push('55' + phoneWithNine);
          this.logger.log(`Adicionando variação com código do país + 9: 55${phoneWithNine}`);
        } 
        // Se o número sem código do país tem 11 dígitos (com o 9), adicionar variação sem o 9
        else if (phoneWithoutCountryCode.length === 11 && phoneWithoutCountryCode.charAt(2) === '9') {
          const phoneWithoutNine = phoneWithoutCountryCode.substring(0, 2) + phoneWithoutCountryCode.substring(3);
          phoneVariations.push(phoneWithoutNine);
          this.logger.log(`Adicionando variação sem 9: ${phoneWithoutNine}`);
          
          // Também adicionar variação com código do país sem o 9
          phoneVariations.push('55' + phoneWithoutNine);
          this.logger.log(`Adicionando variação com código do país sem 9: 55${phoneWithoutNine}`);
        }
      } 
      // Se o número não começa com 55, verificar se precisa adicionar variações com/sem 9
      else {
        // Se o número tem 10 dígitos (sem o 9), adicionar variação com o 9
        if (cleanPhone.length === 10) {
          const phoneWithNine = cleanPhone.substring(0, 2) + '9' + cleanPhone.substring(2);
          phoneVariations.push(phoneWithNine);
          this.logger.log(`Adicionando variação com 9: ${phoneWithNine}`);
          
          // Também adicionar variações com código do país
          phoneVariations.push('55' + cleanPhone);
          phoneVariations.push('55' + phoneWithNine);
          this.logger.log(`Adicionando variações com código do país: 55${cleanPhone}, 55${phoneWithNine}`);
        } 
        // Se o número tem 11 dígitos (com o 9), adicionar variação sem o 9
        else if (cleanPhone.length === 11 && cleanPhone.charAt(2) === '9') {
          const phoneWithoutNine = cleanPhone.substring(0, 2) + cleanPhone.substring(3);
          phoneVariations.push(phoneWithoutNine);
          this.logger.log(`Adicionando variação sem 9: ${phoneWithoutNine}`);
          
          // Também adicionar variações com código do país
          phoneVariations.push('55' + cleanPhone);
          phoneVariations.push('55' + phoneWithoutNine);
          this.logger.log(`Adicionando variações com código do país: 55${cleanPhone}, 55${phoneWithoutNine}`);
        }
        // Para outros formatos, adicionar variação com código do país
        else {
          phoneVariations.push('55' + cleanPhone);
          this.logger.log(`Adicionando variação com código do país: 55${cleanPhone}`);
        }
      }
      
      // Remover duplicatas
      phoneVariations = [...new Set(phoneVariations)];
      
      // Buscar pedidos por todas as variações do número de telefone do cliente
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
    } catch (error) {
      this.logger.error(`Erro ao buscar pedidos para o cliente com telefone ${phone}: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Manipula a mudança de status de um pedido
   * @param order Pedido atualizado
   * @param oldStatus Status anterior
   */
  private async handleStatusChange(order: Order, oldStatus: OrderStatus): Promise<void> {
    try {
      // Verificar se o pedido tem um restaurante associado
      if (!order.restaurant) {
        this.logger.warn(`Pedido ${order.id} não tem restaurante associado para enviar notificação`);
        return;
      }
      
      // Verificar se o pedido tem um número de telefone do cliente
      if (!order.customerPhone) {
        this.logger.warn(`Pedido ${order.id} não tem número de telefone do cliente para enviar notificação`);
        return;
      }
      
      // Verificar se o restaurante tem uma instância do WhatsApp configurada
      if (!order.restaurant.evolutionApiInstanceName) {
        this.logger.warn(`Restaurante do pedido ${order.id} não tem instância do WhatsApp configurada`);
        return;
      }
      
      // Verificar se o status requer notificação
      const statusesWithNotification = [
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED
      ];
      
      if (!statusesWithNotification.includes(order.status)) {
        this.logger.log(`Status ${order.status} não requer notificação para o pedido ${order.id}`);
        return;
      }
      
      // Gerar a mensagem de acordo com o status
      const message = this.getStatusMessage(order);
      
      if (!message) {
        this.logger.warn(`Não foi possível gerar mensagem para o status ${order.status} do pedido ${order.id}`);
        return;
      }
      
      // Enviar a notificação via WhatsApp
      this.logger.log(`Enviando notificação para o pedido ${order.id} com status ${order.status}`);
      
      const result = await this.evolutionApiService.sendText(
        order.restaurant.evolutionApiInstanceName,
        order.customerPhone,
        message
      );
      
      // Atualizar o campo notificationSent
      await this.orderRepository.update(order.id, { notificationSent: true });
      
      this.logger.log(`Notificação enviada com sucesso para o pedido ${order.id}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar notificação para o pedido ${order.id}: ${error.message}`);
    }
  }
  
  /**
   * Gera a mensagem de status para o pedido
   * @param order Pedido
   * @returns Mensagem formatada
   */
  private getStatusMessage(order: Order): string {
    const orderNumber = order.orderNumber || order.id.substring(0, 8);
    const restaurantName = order.restaurant?.name || 'Restaurante';
    
    const messages = {
      [OrderStatus.CONFIRMED]: `✅ Olá! Seu pedido #${orderNumber} foi *ACEITO*! 🎉\n\nEstamos preparando tudo com muito carinho no ${restaurantName}. Em breve iniciaremos o preparo. Vamos manter você informado sobre o andamento. Obrigado pela preferência! 😊`,
      
      [OrderStatus.PREPARING]: `✅🔥 Oba! Seu pedido #${orderNumber} foi *ACEITO e já está sendo PREPARADO*! 🎉\n\nNossa equipe do ${restaurantName} está trabalhando com todo cuidado para que sua comida chegue perfeita até você. Logo mais avisaremos quando estiver pronto! 🍔🍕\n\nAgradecemos sua preferência! 😊`,
      
      [OrderStatus.READY]: `🎁 *PEDIDO PRONTO*! 🎉\n\nSeu pedido #${orderNumber} já está prontinho! Nossa equipe do ${restaurantName} caprichou no preparo. Aguarde, em breve organizaremos a entrega! 🚀\n\nAgradecemos a sua escolha! 😋`,
      
      [OrderStatus.OUT_FOR_DELIVERY]: `🚚 *PEDIDO SAIU PARA ENTREGA*! 🛵\n\nSeu pedido #${orderNumber} já está a caminho! Nosso entregador saiu do ${restaurantName} e logo chegará até você. Fique atento! 📱\n\nAgradecemos a sua escolha! 😊`,
      
      [OrderStatus.DELIVERED]: `🏠 *ENTREGA CONCLUÍDA*! ✅\n\nSeu pedido #${orderNumber} chegou! Esperamos que aproveite cada mordida! 😋\n\nFoi um prazer atender você no ${restaurantName}. Volte sempre! 👋\n\nSe puder, avalie nossa comida e serviço, sua opinião é muito importante para nós.`,
      
      [OrderStatus.CANCELED]: `❌ Pedido #${orderNumber} *CANCELADO*\n\nInfelizmente seu pedido foi cancelado. Por favor, entre em contato com o ${restaurantName} pelo mesmo número para mais informações ou para fazer um novo pedido. Sentimos muito pelo transtorno. 🙏`
    };
    
    return messages[order.status] || '';
  }
} 