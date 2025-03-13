import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThan, LessThan, Not, IsNull } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Order } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Logger } from '@nestjs/common';
import { Brackets } from 'typeorm';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, restaurantId: string): Promise<Customer> {
    try {
      this.logger.log('Criando cliente com DTO:', JSON.stringify(createCustomerDto, null, 2));
      this.logger.log('Restaurant ID:', restaurantId);
      
      // Verificação estrita de restaurante - não criar cliente se o restaurante não existir
      const restaurant = await this.findRestaurantById(restaurantId);
      if (!restaurant) {
        const errorMsg = `Restaurante com ID ${restaurantId} não encontrado.`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      this.logger.log('Restaurante encontrado:', restaurant.name);
      
      // Verificar se o cliente já existe pelo telefone
      if (createCustomerDto.phone) {
        try {
          const existingCustomer = await this.customerRepository.findOne({
            where: { 
              phone: createCustomerDto.phone,
              restaurantId: restaurantId
            }
          });
          
          if (existingCustomer) {
            this.logger.log('Cliente já existe, atualizando dados:', existingCustomer);
            // Atualizar dados do cliente existente
            Object.assign(existingCustomer, createCustomerDto);
            return await this.customerRepository.save(existingCustomer);
          }
        } catch (error) {
          this.logger.log('Erro ao verificar cliente existente:', error);
          // Continuar com a criação do cliente
        }
      }
      
      // Criar cliente com restaurante válido
      const customer = this.customerRepository.create({
        ...createCustomerDto,
        restaurantId
      });
      
      this.logger.log('Objeto cliente criado:', JSON.stringify(customer, null, 2));
      const savedCustomer = await this.customerRepository.save(customer);
      this.logger.log('Cliente salvo com sucesso:', savedCustomer);
      
      return savedCustomer;
    } catch (error) {
      this.logger.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async findAll(restaurantId: string): Promise<Customer[]> {
    try {
      this.logger.log(`Buscando todos os clientes para restaurante ${restaurantId}...`);
      
      // Construir a consulta base
      const queryBuilder = this.customerRepository.createQueryBuilder('customer');
      
      // Adicionar filtro por restaurante se fornecido
      if (restaurantId) {
        queryBuilder.where('customer.restaurantId = :restaurantId', { restaurantId });
      }
      
      // Ordenar por nome
      queryBuilder.orderBy('customer.name', 'ASC');
      
      // Executar a consulta
      const customers = await queryBuilder.getMany();
      this.logger.log(`Encontrados ${customers.length} clientes para restaurante ${restaurantId}`);
      
      return customers;
    } catch (error) {
      this.logger.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  async findOne(id: string, restaurantId: string): Promise<Customer> {
    try {
      this.logger.log(`Buscando cliente com ID ${id} para restaurante ${restaurantId}`);
      
      // Construir a consulta base
      const queryBuilder = this.customerRepository.createQueryBuilder('customer')
        .where('customer.id = :id', { id });
      
      // Adicionar filtro por restaurante se fornecido e não for vazio
      if (restaurantId && restaurantId.trim() !== '' && restaurantId !== '00000000-0000-0000-0000-000000000000') {
        this.logger.log(`Adicionando filtro por restaurante ${restaurantId}`);
        queryBuilder.andWhere('customer.restaurantId = :restaurantId', { restaurantId });
      } else {
        this.logger.log('Restaurante não fornecido ou inválido, buscando apenas por ID');
      }
      
      // Executar a consulta
      const customer = await queryBuilder.getOne();
      
      if (!customer) {
        this.logger.log(`Cliente com ID ${id} não encontrado`);
        throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
      }
      
      this.logger.log(`Cliente encontrado:`, customer);
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Erro ao buscar cliente:', error);
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }
  }

  async findByPhone(phone: string, restaurantId?: string): Promise<Customer> {
    // Limpar o número de telefone para garantir consistência
    const cleanPhone = phone.replace(/\D/g, '');
    this.logger.log(`Telefone limpo:`);
    this.logger.log(`${cleanPhone}`);
    
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
    
    try {
      // Construir a query para buscar o cliente com qualquer uma das variações do número
      const queryBuilder = this.customerRepository.createQueryBuilder('customer');
      
      // Adicionar condição para cada variação do número
      queryBuilder.where(
        new Brackets(qb => {
          phoneVariations.forEach((phoneVar, index) => {
            if (index === 0) {
              qb.where('customer.phone = :phone' + index, { ['phone' + index]: phoneVar });
            } else {
              qb.orWhere('customer.phone = :phone' + index, { ['phone' + index]: phoneVar });
            }
          });
        })
      );
      
      // Adicionar condição de restaurante se fornecido
      if (restaurantId) {
        queryBuilder.andWhere('customer.restaurantId = :restaurantId', { restaurantId });
      }
      
      // Executar a query
      const customer = await queryBuilder.getOne();
      
      if (!customer) {
        this.logger.log(`Cliente com telefone ${phone} não encontrado (variações testadas: ${phoneVariations.join(', ')})`);
        throw new NotFoundException(`Cliente com telefone ${phone} não encontrado`);
      }
      
      return customer;
    } catch (error) {
      this.logger.error(`Erro ao buscar cliente com telefone ${phone}:`);
      this.logger.error(error.message);
      throw error;
    }
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, restaurantId: string): Promise<Customer> {
    try {
      this.logger.log(`Atualizando cliente ${id} para restaurante ${restaurantId}:`, updateCustomerDto);
      
      // Verificar se o cliente existe para o restaurante
      let customer;
      try {
        customer = await this.findOne(id, restaurantId);
        this.logger.log('Cliente encontrado:', customer);
      } catch (error) {
        // Se não encontrar com restaurantId, tentar buscar apenas pelo ID
        this.logger.log('Cliente não encontrado com restaurantId, tentando apenas com ID...');
        const queryBuilder = this.customerRepository.createQueryBuilder('customer')
          .where('customer.id = :id', { id });
        
        customer = await queryBuilder.getOne();
        
        if (!customer) {
          this.logger.error(`Cliente com ID ${id} não encontrado`);
          throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
        }
        
        this.logger.log('Cliente encontrado apenas com ID:', customer);
      }
      
      // Atualizar os dados
      this.logger.log('Atualizando dados do cliente...');
      const updatedCustomer = Object.assign(customer, updateCustomerDto);
      
      // Se o restaurantId não estiver definido, definir agora
      if (!updatedCustomer.restaurantId && restaurantId) {
        this.logger.log(`Definindo restaurantId ${restaurantId} para o cliente`);
        updatedCustomer.restaurantId = restaurantId;
      }
      
      // Salvar as alterações
      const savedCustomer = await this.customerRepository.save(updatedCustomer);
      this.logger.log('Cliente atualizado com sucesso:', savedCustomer);
      
      return savedCustomer;
    } catch (error) {
      this.logger.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async remove(id: string, restaurantId: string): Promise<void> {
    // Verificar se o cliente existe para o restaurante
    const customer = await this.findOne(id, restaurantId);
    
    // Remover o cliente
    await this.customerRepository.remove(customer);
  }

  async search(query: string, restaurantId: string): Promise<Customer[]> {
    try {
      if (!query || query.trim() === '') {
        return this.findAll(restaurantId);
      }
      
      // Construir a consulta base
      const queryBuilder = this.customerRepository.createQueryBuilder('customer');
      
      // Adicionar condições de busca
      queryBuilder.where(
        '(customer.name ILIKE :query OR customer.email ILIKE :query OR customer.phone ILIKE :query OR customer.address ILIKE :query)',
        { query: `%${query}%` }
      );
      
      // Adicionar filtro por restaurante se fornecido
      if (restaurantId) {
        queryBuilder.andWhere('customer.restaurantId = :restaurantId', { restaurantId });
      }
      
      // Ordenar por nome
      queryBuilder.orderBy('customer.name', 'ASC');
      
      // Executar a consulta
      return queryBuilder.getMany();
    } catch (error) {
      this.logger.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  async findInactive(): Promise<any[]> {
    try {
      // Calcular data de 7 dias atrás
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      this.logger.log('Data de 7 dias atrás:', sevenDaysAgo.toISOString());
      
      // Abordagem alternativa usando subconsultas para evitar problemas com nomes de colunas
      // Primeiro, buscar todos os pedidos
      const orders = await this.orderRepository.find({
        select: ['id', 'customerName', 'customerPhone', 'total', 'createdAt'],
        where: { customerPhone: Not(IsNull()) },
        order: { createdAt: 'DESC' }
      });
      
      // Agrupar por cliente e obter o último pedido de cada um
      const customerMap = new Map();
      
      orders.forEach(order => {
        if (!order.customerPhone || !order.customerName) return;
        
        // Se o cliente não existe no mapa ou este pedido é mais recente
        if (!customerMap.has(order.customerPhone) || 
            new Date(order.createdAt) > new Date(customerMap.get(order.customerPhone).lastOrderDate)) {
          customerMap.set(order.customerPhone, {
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            lastOrderId: order.id,
            lastOrderTotal: order.total,
            lastOrderDate: order.createdAt
          });
        }
      });
      
      // Converter para array
      const customers = Array.from(customerMap.values());
      
      // Filtrar clientes inativos (último pedido há mais de 7 dias)
      const inactiveCustomers = customers.filter(customer => {
        const lastOrderDate = new Date(customer.lastOrderDate);
        const diffTime = Math.abs(new Date().getTime() - lastOrderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Adicionar o número de dias ao objeto
        customer.daysSinceLastOrder = diffDays;
        
        return lastOrderDate < sevenDaysAgo;
      });
      
      // Ordenar por data do último pedido (mais antigo primeiro)
      inactiveCustomers.sort((a, b) => 
        new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime()
      );
      
      this.logger.log(`Encontrados ${inactiveCustomers.length} clientes inativos`);
      return inactiveCustomers;
    } catch (error) {
      this.logger.error('Erro ao buscar clientes inativos:', error);
      throw error;
    }
  }

  async getTopCustomers(restaurantId: string): Promise<any[]> {
    try {
      this.logger.log(`Buscando clientes mais frequentes para restaurante ${restaurantId}...`);
      
      // Abordagem alternativa usando subconsultas para evitar problemas com nomes de colunas
      // Primeiro, buscar todos os pedidos
      const ordersQuery = this.orderRepository.createQueryBuilder('order')
        .select('order.customerName', 'customerName')
        .addSelect('order.customerPhone', 'customerPhone')
        .addSelect('order.id', 'orderId')
        .addSelect('order.total', 'total')
        .where('order.customerPhone IS NOT NULL');
      
      // Adicionar filtro por restaurante se fornecido
      if (restaurantId) {
        ordersQuery.andWhere('order.restaurantId = :restaurantId', { restaurantId });
      }
      
      const orders = await ordersQuery.getRawMany();
      this.logger.log(`Encontrados ${orders.length} pedidos para análise`);
      
      // Agrupar por cliente
      const customerMap = new Map();
      
      orders.forEach(order => {
        const customerPhone = order.customerPhone;
        if (!customerPhone) return;
        
        if (!customerMap.has(customerPhone)) {
          customerMap.set(customerPhone, {
            name: order.customerName,
            phone: customerPhone,
            orderCount: 0,
            totalSpent: 0
          });
        }
        
        const customer = customerMap.get(customerPhone);
        customer.orderCount += 1;
        customer.totalSpent += parseFloat(order.total) || 0;
      });
      
      // Converter para array e ordenar por número de pedidos
      const topCustomers = Array.from(customerMap.values())
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 10);
      
      this.logger.log(`Encontrados ${topCustomers.length} clientes mais frequentes`);
      return topCustomers;
    } catch (error) {
      this.logger.error('Erro ao buscar clientes mais frequentes:', error);
      return [];
    }
  }

  /**
   * Encontrar um restaurante pelo ID
   * @param restaurantId ID do restaurante
   * @returns Restaurante encontrado ou null se não existir
   */
  async findRestaurantById(restaurantId: string): Promise<Restaurant | null> {
    try {
      return await this.restaurantRepository.findOne({ where: { id: restaurantId } });
    } catch (error) {
      this.logger.error(`Erro ao buscar restaurante com ID ${restaurantId}:`, error);
      throw error;
    }
  }
} 