import { Controller, Get, NotFoundException, Param, Post, Body, Put, HttpException, HttpStatus, Query, Patch, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders/entities/order.entity';
import { OrderType, PaymentMethod, OrderStatus } from './orders/entities/order.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { User } from './users/entities/user.entity';
import { RestaurantStatus } from './restaurants/entities/restaurant.entity';
import { RestaurantService } from './restaurants/restaurant.service';
import { EvolutionApiService } from './evolution-api/evolution-api.service';
import { ModuleRef } from '@nestjs/core';
import { SubscriptionPlan } from './restaurants/entities/restaurant.entity';
import { CustomersService } from './customers/customers.service';
import { NotificationsService } from './notifications/notifications.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly restaurantService: RestaurantService,
    private readonly evolutionApiService: EvolutionApiService,
    private readonly moduleRef: ModuleRef,
    private readonly customersService: CustomersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Returns all orders' })
  async getAllOrders() {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() orderData: any) {
    try {
      console.log('Recebendo pedido direto:', orderData);
      
      // Gerar número de pedido aleatório
      const orderNumber = Math.floor(Math.random() * 9000) + 1000;
      
      // Criar nova entidade de pedido
      const newOrder = new Order();
      
      // Preencher campos da entidade
      newOrder.status = OrderStatus.PENDING;
      newOrder.paymentMethod = PaymentMethod.CASH;
      newOrder.orderType = orderData.deliveryMethod === 'delivery' ? OrderType.DELIVERY : OrderType.PICKUP;
      newOrder.customerName = orderData.customerName;
      newOrder.customerPhone = orderData.customerPhone || null;
      newOrder.deliveryAddress = orderData.deliveryAddress || null;
      newOrder.subtotal = orderData.total || 0;
      newOrder.total = orderData.total || 0;
      
      // Processar notas do pedido
      if (orderData.notes) {
        // Se as notas já forem uma string, usar diretamente
        if (typeof orderData.notes === 'string') {
          newOrder.notes = orderData.notes;
        } 
        // Se for um objeto, converter para string legível
        else if (typeof orderData.notes === 'object') {
          try {
            newOrder.notes = JSON.stringify(orderData.notes);
          } catch (error) {
            console.error('Erro ao converter notas para string:', error);
            newOrder.notes = 'Erro ao processar notas do pedido';
          }
        }
      } else if (orderData.items && Array.isArray(orderData.items)) {
        // Se não houver notas mas houver itens, armazenar os itens como JSON
        newOrder.notes = JSON.stringify(orderData.items);
      }
      
      newOrder.isPaid = false;
      
      // Processar cupom se existir
      if (orderData.couponCode && orderData.restaurantId) {
        try {
          // Obter serviço de cupons
          const couponsService = this.moduleRef.get('CouponsService', { strict: false });
          if (couponsService) {
            // Validar cupom
            const coupon = await couponsService.validateCoupon(
              orderData.couponCode,
              orderData.restaurantId,
              newOrder.subtotal
            );
            
            // Calcular desconto
            const discount = couponsService.calculateDiscount(coupon, newOrder.subtotal);
            
            // Atualizar pedido com informações do cupom
            newOrder.couponCode = orderData.couponCode;
            newOrder.couponId = coupon.id;
            newOrder.discountValue = discount;
            newOrder.subtotal = newOrder.subtotal;
            newOrder.total = Math.max(newOrder.subtotal - discount, 0);
            
            // Incrementar contador de uso do cupom
            await couponsService.applyCoupon(coupon.id);
            
            console.log(`Cupom ${orderData.couponCode} aplicado com desconto de ${discount}`);
          }
        } catch (error) {
          console.error('Erro ao processar cupom:', error);
          // Continuar mesmo se houver erro com o cupom
        }
      }
      
      // Associar ao restaurante se existir
      if (orderData.restaurantId) {
        console.log(`Associando pedido ao restaurante ${orderData.restaurantId}`);
        const restaurant = await this.restaurantRepository.findOne({ where: { id: orderData.restaurantId } });
        if (restaurant) {
          newOrder.restaurant = restaurant;
          
          // Verificar se o cliente já existe ou criar um novo
          if (orderData.customerPhone) {
            try {
              // Verificar se o cliente já existe
              let customer: any = null;
              try {
                customer = await this.customersService.findByPhone(orderData.customerPhone, orderData.restaurantId);
                console.log('Cliente encontrado:', customer);
              } catch (error) {
                console.log('Cliente não encontrado, criando novo...');
                
                // Criar novo cliente
                const customerData = {
                  name: orderData.customerName || 'Cliente',
                  phone: orderData.customerPhone,
                  email: `${orderData.customerPhone.substring(0, 6)}@cliente.temp`,
                };
                
                customer = await this.customersService.create(customerData, orderData.restaurantId);
                console.log('Novo cliente criado:', customer);
              }
              
              // Associar ao cliente se disponível
              if (customer) {
                newOrder.customer = customer;
                newOrder.customerId = customer.id;
                console.log(`Pedido associado ao cliente ${customer.id}`);
              }
            } catch (error) {
              console.error('Erro ao processar cliente:', error);
              // Continuar mesmo se houver erro com o cliente
            }
          }
        } else {
          console.log(`Restaurante ${orderData.restaurantId} não encontrado, continuando sem associação`);
        }
      }
      
      // Salvar o pedido
      const savedOrder = await this.orderRepository.save(newOrder);
      console.log('Pedido salvo com sucesso:', savedOrder);
      
      // Retornar o pedido salvo junto com os itens
      return {
        ...savedOrder,
        items: orderData.items || []
      };
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw new HttpException(
        `Erro ao criar pedido: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('restaurants/:restaurantId/orders')
  @ApiOperation({ summary: 'Create a new order for a specific restaurant' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createRestaurantOrder(
    @Param('restaurantId') restaurantId: string,
    @Body() orderData: any,
  ) {
    try {
      console.log(`Recebendo pedido para o restaurante ${restaurantId}:`, orderData);
      
      // Verificar se o cliente já existe ou criar um novo
      let customer: any = null;
      if (orderData.customerPhone) {
        try {
          // Verificar se o cliente já existe
          try {
            customer = await this.customersService.findByPhone(orderData.customerPhone, restaurantId);
            console.log('Cliente encontrado:', customer);
          } catch (error) {
            console.log('Cliente não encontrado, criando novo...');
            
            // Criar novo cliente
            const customerData = {
              name: orderData.customerName || 'Cliente',
              phone: orderData.customerPhone,
              email: `${orderData.customerPhone.substring(0, 6)}@cliente.temp`,
            };
            
            customer = await this.customersService.create(customerData, restaurantId);
            console.log('Novo cliente criado:', customer);
          }
        } catch (error) {
          console.error('Erro ao processar cliente:', error);
          // Continuar mesmo se houver erro com o cliente
        }
      }
      
      // Criar nova entidade de pedido
      const newOrder = new Order();
      
      // Preencher campos básicos
      newOrder.status = OrderStatus.PENDING;
      newOrder.paymentMethod = orderData.paymentMethod || PaymentMethod.CASH;
      newOrder.orderType = orderData.deliveryAddress ? OrderType.DELIVERY : OrderType.PICKUP;
      newOrder.customerName = orderData.customerName;
      newOrder.customerPhone = orderData.customerPhone;
      newOrder.deliveryAddress = orderData.deliveryAddress;
      
      // Garantir que as notas sejam armazenadas como texto
      if (orderData.notes) {
        // Se as notas já forem uma string, usar diretamente
        if (typeof orderData.notes === 'string') {
          newOrder.notes = orderData.notes;
        } 
        // Se for um objeto, converter para string legível
        else if (typeof orderData.notes === 'object') {
          try {
            newOrder.notes = JSON.stringify(orderData.notes);
          } catch (error) {
            console.error('Erro ao converter notas para string:', error);
            newOrder.notes = 'Erro ao processar notas do pedido';
          }
        }
      }
      
      // Calcular valores
      let subtotal = 0;
      if (orderData.items && Array.isArray(orderData.items)) {
        subtotal = orderData.items.reduce((sum: number, item: any) => {
          return sum + (item.price * item.quantity);
        }, 0);
      }
      
      newOrder.subtotal = subtotal;
      newOrder.total = subtotal; // Valor inicial antes de aplicar cupom
      
      // Processar cupom se existir
      if (orderData.couponCode) {
        try {
          // Obter serviço de cupons
          const couponsService = this.moduleRef.get('CouponsService', { strict: false });
          if (couponsService) {
            // Validar cupom
            const coupon = await couponsService.validateCoupon(
              orderData.couponCode,
              restaurantId,
              subtotal
            );
            
            // Calcular desconto
            const discount = couponsService.calculateDiscount(coupon, subtotal);
            
            // Atualizar pedido com informações do cupom
            newOrder.couponCode = orderData.couponCode;
            newOrder.couponId = coupon.id;
            newOrder.discountValue = discount;
            newOrder.total = Math.max(subtotal - discount, 0);
            
            // Incrementar contador de uso do cupom
            await couponsService.applyCoupon(coupon.id);
            
            console.log(`Cupom ${orderData.couponCode} aplicado com desconto de ${discount}`);
          }
        } catch (error) {
          console.error('Erro ao processar cupom:', error);
          // Continuar mesmo se houver erro com o cupom
        }
      }
      
      // Associar ao restaurante
      const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
      if (!restaurant) {
        throw new NotFoundException(`Restaurante com ID ${restaurantId} não encontrado`);
      }
      newOrder.restaurant = restaurant;
      
      // Associar ao cliente se disponível
      if (customer) {
        newOrder.customer = customer;
        newOrder.customerId = customer.id;
      }
      
      // Salvar o pedido
      const savedOrder = await this.orderRepository.save(newOrder);
      
      console.log(`Pedido criado com sucesso: ${savedOrder.id}`);
      
      return savedOrder;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw new HttpException(
        `Erro ao criar pedido: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('orders/recent')
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiResponse({ status: 200, description: 'Returns recent orders' })
  async getRecentOrders() {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: 10
    });
  }

  @Get('orders/weekly-stats')
  @ApiOperation({ summary: 'Get weekly order statistics' })
  @ApiResponse({ status: 200, description: 'Returns weekly order statistics' })
  async getWeeklyStats() {
    // Dados simulados para estatísticas semanais
    return [10, 15, 8, 12, 20, 18, 14];
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string) {
    // Evitar logs repetitivos para o ID "pending"
    if (id === 'pending') {
      throw new NotFoundException(`ID inválido: ${id} não é um UUID válido`);
    }
    
    console.log(`Buscando pedido com ID: ${id}`);
    
    // Verificar se o ID é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error(`ID inválido: ${id} não é um UUID válido`);
      throw new NotFoundException(`ID inválido: ${id} não é um UUID válido`);
    }
    
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      
      if (!order) {
        console.warn(`Pedido com ID ${id} não encontrado`);
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      
      return order;
    } catch (error) {
      console.error(`Erro ao buscar pedido: ${error.message}`);
      throw error;
    }
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrder(@Param('id') id: string, @Body() updateData: any) {
    console.log(`Recebido pedido para atualizar: ${id}`, updateData);
    
    try {
      // Verificar se o pedido existe
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      
      // Atualizar os campos permitidos
      if (updateData.status) {
        order.status = updateData.status;
      }
      
      if (updateData.isPaid !== undefined) {
        order.isPaid = updateData.isPaid;
      }
      
      if (updateData.notes) {
        order.notes = updateData.notes;
      }
      
      // Salvar as alterações
      const updatedOrder = await this.orderRepository.save(order);
      console.log('Pedido atualizado com sucesso:', updatedOrder);
      
      return updatedOrder;
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw error;
    }
  }

  @Put('restaurants/:restaurantId/orders/:id')
  @ApiOperation({ summary: 'Update an order for a specific restaurant' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateRestaurantOrder(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Body() updateData: any
  ) {
    console.log(`Recebido pedido para atualizar no restaurante ${restaurantId}: ${id}`, updateData);
    
    try {
      // Verificar se o pedido existe
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      
      // Atualizar os campos permitidos
      if (updateData.status) {
        order.status = updateData.status;
      }
      
      if (updateData.isPaid !== undefined) {
        order.isPaid = updateData.isPaid;
      }
      
      if (updateData.notes) {
        order.notes = updateData.notes;
      }
      
      // Salvar as alterações
      const updatedOrder = await this.orderRepository.save(order);
      console.log('Pedido atualizado com sucesso para restaurante:', updatedOrder);
      
      return updatedOrder;
    } catch (error) {
      console.error('Erro ao atualizar pedido para restaurante:', error);
      throw error;
    }
  }

  @Patch('restaurants/:restaurantId/orders/:orderId/status')
  @ApiOperation({ summary: 'Update order status for a specific restaurant' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateRestaurantOrderStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() updateData: { status: OrderStatus },
  ) {
    try {
      console.log(`Atualizando status do pedido ${orderId} para ${updateData.status}`);
      
      // Verificar se o restaurante existe
      const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
      if (!restaurant) {
        throw new NotFoundException(`Restaurante com ID ${restaurantId} não encontrado`);
      }
      
      // Buscar o pedido
      const order = await this.orderRepository.findOne({ 
        where: { 
          id: orderId,
          restaurant: { id: restaurantId }
        },
        relations: ['restaurant']
      });
      
      if (!order) {
        throw new NotFoundException(`Pedido com ID ${orderId} não encontrado para o restaurante ${restaurantId}`);
      }
      
      // Atualizar o status
      order.status = updateData.status;
      order.updatedAt = new Date();
      
      // Salvar as alterações
      const updatedOrder = await this.orderRepository.save(order);
      
      return updatedOrder;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw new HttpException(
        `Erro ao atualizar status do pedido: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistics/top-products')
  @ApiOperation({ summary: 'Get top sold products' })
  @ApiResponse({ status: 200, description: 'Returns top sold products' })
  getTopProducts() {
    return [
      { name: 'X-Burger', total: 253 },
      { name: 'Pizza de Calabresa', total: 187 },
      { name: 'Coca-Cola 2L', total: 142 },
      { name: 'Açaí 500ml', total: 98 },
      { name: 'Batata Frita', total: 92 }
    ];
  }
  
  @Post('register-restaurant')
  @ApiOperation({ summary: 'Register a new restaurant from landing page' })
  @ApiResponse({ status: 201, description: 'Restaurant registered successfully' })
  async registerRestaurant(@Body() registrationData: any) {
    let savedUser: User | null = null;
    let savedRestaurant: Restaurant | null = null;
    let whatsappError: any = null;
    
    try {
      console.log('Recebendo solicitação de registro de restaurante:', registrationData);
      
      // Criar usuário para o proprietário
      const user = new User();
      user.name = registrationData.name || 'Usuário';
      user.email = registrationData.email || 'sem-email@exemplo.com';
      // Gerar senha aleatória
      const tempPassword = Math.random().toString(36).slice(-8);
      user.password = tempPassword;
      
      // Salvar o usuário
      savedUser = await this.userRepository.save(user);
      
      // Criar o restaurante
      const restaurant = new Restaurant();
      restaurant.name = registrationData.businessName || 'Restaurante';
      restaurant.phone = registrationData.phone || '0000000000';
      restaurant.whatsappNumber = registrationData.whatsappNumber || registrationData.phone || '0000000000';
      restaurant.city = registrationData.city || 'Cidade não informada';
      restaurant.state = registrationData.state || 'UF';
      restaurant.owner = savedUser;
      restaurant.status = RestaurantStatus.PENDING;
      restaurant.address = 'A definir';
      restaurant.postalCode = '00000000';
      restaurant.subscriptionPlan = SubscriptionPlan.BASIC;
      
      // Salvar o restaurante
      savedRestaurant = await this.restaurantRepository.save(restaurant);
      
      // Verifica se devemos tentar criar uma instância do WhatsApp
      // Usando um parâmetro opcional para indicar se deve pular a criação da instância
      const skipWhatsappSetup = registrationData.skipWhatsappSetup === true;
      
      if (skipWhatsappSetup) {
        console.log('Pulando configuração do WhatsApp conforme solicitado.');
        
        // Ainda definimos um nome de instância para uso futuro, mas não tentamos criar
        const instanceName = `restaurant_${savedRestaurant.id.substring(0, 8)}`;
        savedRestaurant.evolutionApiInstanceName = instanceName;
        savedRestaurant.status = RestaurantStatus.PENDING_WHATSAPP;
        await this.restaurantRepository.save(savedRestaurant);
        
        // Enviar credenciais de acesso por e-mail
        try {
          await this.notificationsService.sendAccessCredentials(
            savedUser.name,
            savedUser.email,
            tempPassword,
            savedRestaurant.name
          );
          console.log('Credenciais de acesso enviadas por e-mail com sucesso');
        } catch (notificationError) {
          console.error('Erro ao enviar credenciais de acesso por e-mail:', notificationError);
          // Não interromper o fluxo principal se houver erro no envio das notificações
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
      
      // Gerar um nome de instância baseado no ID do restaurante
      const instanceName = `restaurant_${savedRestaurant.id.substring(0, 8)}`;
      
      // Atualizar o restaurante com o nome da instância
      savedRestaurant.evolutionApiInstanceName = instanceName;
      
      // Salvar o restaurante atualizado
      await this.restaurantRepository.save(savedRestaurant);
      
      try {
        // Tentar criar instância na Evolution API
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
        
        // Se a resposta contiver um token, salvá-lo
        if (instanceResult && instanceResult.hash && instanceResult.hash.apikey) {
          savedRestaurant.evolutionApiInstanceToken = instanceResult.hash.apikey;
          await this.restaurantRepository.save(savedRestaurant);
        }
      } catch (evolutionApiError) {
        // Capturar o erro para log mas não falhar o registro
        console.error('Erro ao criar instância do WhatsApp:', evolutionApiError);
        whatsappError = evolutionApiError.message || 'Erro desconhecido';
        
        // Ainda assim marcar o restaurante como pendente de conexão WhatsApp
        savedRestaurant.status = RestaurantStatus.PENDING_WHATSAPP;
        await this.restaurantRepository.save(savedRestaurant);
      }
      
      // Enviar credenciais de acesso apenas por e-mail
      try {
        await this.notificationsService.sendAccessCredentials(
          savedUser.name,
          savedUser.email,
          tempPassword,
          savedRestaurant.name
        );
        console.log('Credenciais de acesso enviadas por e-mail com sucesso');
      } catch (notificationError) {
        console.error('Erro ao enviar credenciais de acesso por e-mail:', notificationError);
        // Não interromper o fluxo principal se houver erro no envio das notificações
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
          // Incluir a senha temporária apenas para facilitar o teste
          tempPassword
        },
        accessInfo: {
          email: savedUser.email,
          password: tempPassword,
          message: 'Anote estes dados! Após fechar esta janela, você só terá acesso a eles pelo e-mail informado.'
        }
      };
    } catch (error) {
      console.error('Erro ao registrar restaurante:', error);
      
      // Realizar rollback se necessário
      if (savedRestaurant && !error.message?.includes('Realizando rollback')) {
        console.log(`Realizando rollback de emergência - excluindo restaurante ID: ${savedRestaurant.id}`);
        try {
          await this.restaurantRepository.remove(savedRestaurant);
        } catch (e) {
          console.error('Erro ao tentar remover restaurante durante rollback:', e);
        }
      }
      
      if (savedUser && !error.message?.includes('Realizando rollback')) {
        console.log(`Realizando rollback de emergência - excluindo usuário ID: ${savedUser.id}`);
        try {
          await this.userRepository.remove(savedUser);
        } catch (e) {
          console.error('Erro ao tentar remover usuário durante rollback:', e);
        }
      }
      
      // Se for um HttpException já formatado, então apenas propague ele
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Erro ao registrar restaurante: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  // Endpoint adicional para registro sem WhatsApp
  @Post('register-restaurant-no-whatsapp')
  @ApiResponse({ status: 201, description: 'Restaurant registered without WhatsApp' })
  async registerRestaurantNoWhatsapp(@Body() registrationData: any) {
    // Adicionando a flag para pular a configuração do WhatsApp
    registrationData.skipWhatsappSetup = true;
    return this.registerRestaurant(registrationData);
  }
}
