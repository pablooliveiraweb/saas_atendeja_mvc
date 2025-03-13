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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const common_2 = require("@nestjs/common");
const typeorm_3 = require("typeorm");
let CustomersService = CustomersService_1 = class CustomersService {
    customerRepository;
    orderRepository;
    restaurantRepository;
    logger = new common_2.Logger(CustomersService_1.name);
    constructor(customerRepository, orderRepository, restaurantRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.restaurantRepository = restaurantRepository;
    }
    async create(createCustomerDto, restaurantId) {
        try {
            this.logger.log('Criando cliente com DTO:', JSON.stringify(createCustomerDto, null, 2));
            this.logger.log('Restaurant ID:', restaurantId);
            const restaurant = await this.findRestaurantById(restaurantId);
            if (!restaurant) {
                const errorMsg = `Restaurante com ID ${restaurantId} não encontrado.`;
                this.logger.error(errorMsg);
                throw new Error(errorMsg);
            }
            this.logger.log('Restaurante encontrado:', restaurant.name);
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
                        Object.assign(existingCustomer, createCustomerDto);
                        return await this.customerRepository.save(existingCustomer);
                    }
                }
                catch (error) {
                    this.logger.log('Erro ao verificar cliente existente:', error);
                }
            }
            const customer = this.customerRepository.create({
                ...createCustomerDto,
                restaurantId
            });
            this.logger.log('Objeto cliente criado:', JSON.stringify(customer, null, 2));
            const savedCustomer = await this.customerRepository.save(customer);
            this.logger.log('Cliente salvo com sucesso:', savedCustomer);
            return savedCustomer;
        }
        catch (error) {
            this.logger.error('Erro ao criar cliente:', error);
            throw error;
        }
    }
    async findAll(restaurantId) {
        try {
            this.logger.log(`Buscando todos os clientes para restaurante ${restaurantId}...`);
            const queryBuilder = this.customerRepository.createQueryBuilder('customer');
            if (restaurantId) {
                queryBuilder.where('customer.restaurantId = :restaurantId', { restaurantId });
            }
            queryBuilder.orderBy('customer.name', 'ASC');
            const customers = await queryBuilder.getMany();
            this.logger.log(`Encontrados ${customers.length} clientes para restaurante ${restaurantId}`);
            return customers;
        }
        catch (error) {
            this.logger.error('Erro ao buscar clientes:', error);
            return [];
        }
    }
    async findOne(id, restaurantId) {
        try {
            this.logger.log(`Buscando cliente com ID ${id} para restaurante ${restaurantId}`);
            const queryBuilder = this.customerRepository.createQueryBuilder('customer')
                .where('customer.id = :id', { id });
            if (restaurantId && restaurantId.trim() !== '' && restaurantId !== '00000000-0000-0000-0000-000000000000') {
                this.logger.log(`Adicionando filtro por restaurante ${restaurantId}`);
                queryBuilder.andWhere('customer.restaurantId = :restaurantId', { restaurantId });
            }
            else {
                this.logger.log('Restaurante não fornecido ou inválido, buscando apenas por ID');
            }
            const customer = await queryBuilder.getOne();
            if (!customer) {
                this.logger.log(`Cliente com ID ${id} não encontrado`);
                throw new common_1.NotFoundException(`Cliente com ID ${id} não encontrado`);
            }
            this.logger.log(`Cliente encontrado:`, customer);
            return customer;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Erro ao buscar cliente:', error);
            throw new Error(`Erro ao buscar cliente: ${error.message}`);
        }
    }
    async findByPhone(phone, restaurantId) {
        const cleanPhone = phone.replace(/\D/g, '');
        this.logger.log(`Telefone limpo:`);
        this.logger.log(`${cleanPhone}`);
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
        try {
            const queryBuilder = this.customerRepository.createQueryBuilder('customer');
            queryBuilder.where(new typeorm_3.Brackets(qb => {
                phoneVariations.forEach((phoneVar, index) => {
                    if (index === 0) {
                        qb.where('customer.phone = :phone' + index, { ['phone' + index]: phoneVar });
                    }
                    else {
                        qb.orWhere('customer.phone = :phone' + index, { ['phone' + index]: phoneVar });
                    }
                });
            }));
            if (restaurantId) {
                queryBuilder.andWhere('customer.restaurantId = :restaurantId', { restaurantId });
            }
            const customer = await queryBuilder.getOne();
            if (!customer) {
                this.logger.log(`Cliente com telefone ${phone} não encontrado (variações testadas: ${phoneVariations.join(', ')})`);
                throw new common_1.NotFoundException(`Cliente com telefone ${phone} não encontrado`);
            }
            return customer;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar cliente com telefone ${phone}:`);
            this.logger.error(error.message);
            throw error;
        }
    }
    async update(id, updateCustomerDto, restaurantId) {
        try {
            this.logger.log(`Atualizando cliente ${id} para restaurante ${restaurantId}:`, updateCustomerDto);
            let customer;
            try {
                customer = await this.findOne(id, restaurantId);
                this.logger.log('Cliente encontrado:', customer);
            }
            catch (error) {
                this.logger.log('Cliente não encontrado com restaurantId, tentando apenas com ID...');
                const queryBuilder = this.customerRepository.createQueryBuilder('customer')
                    .where('customer.id = :id', { id });
                customer = await queryBuilder.getOne();
                if (!customer) {
                    this.logger.error(`Cliente com ID ${id} não encontrado`);
                    throw new common_1.NotFoundException(`Cliente com ID ${id} não encontrado`);
                }
                this.logger.log('Cliente encontrado apenas com ID:', customer);
            }
            this.logger.log('Atualizando dados do cliente...');
            const updatedCustomer = Object.assign(customer, updateCustomerDto);
            if (!updatedCustomer.restaurantId && restaurantId) {
                this.logger.log(`Definindo restaurantId ${restaurantId} para o cliente`);
                updatedCustomer.restaurantId = restaurantId;
            }
            const savedCustomer = await this.customerRepository.save(updatedCustomer);
            this.logger.log('Cliente atualizado com sucesso:', savedCustomer);
            return savedCustomer;
        }
        catch (error) {
            this.logger.error('Erro ao atualizar cliente:', error);
            throw error;
        }
    }
    async remove(id, restaurantId) {
        const customer = await this.findOne(id, restaurantId);
        await this.customerRepository.remove(customer);
    }
    async search(query, restaurantId) {
        try {
            if (!query || query.trim() === '') {
                return this.findAll(restaurantId);
            }
            const queryBuilder = this.customerRepository.createQueryBuilder('customer');
            queryBuilder.where('(customer.name ILIKE :query OR customer.email ILIKE :query OR customer.phone ILIKE :query OR customer.address ILIKE :query)', { query: `%${query}%` });
            if (restaurantId) {
                queryBuilder.andWhere('customer.restaurantId = :restaurantId', { restaurantId });
            }
            queryBuilder.orderBy('customer.name', 'ASC');
            return queryBuilder.getMany();
        }
        catch (error) {
            this.logger.error('Erro ao buscar clientes:', error);
            return [];
        }
    }
    async findInactive() {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            this.logger.log('Data de 7 dias atrás:', sevenDaysAgo.toISOString());
            const orders = await this.orderRepository.find({
                select: ['id', 'customerName', 'customerPhone', 'total', 'createdAt'],
                where: { customerPhone: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                order: { createdAt: 'DESC' }
            });
            const customerMap = new Map();
            orders.forEach(order => {
                if (!order.customerPhone || !order.customerName)
                    return;
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
            const customers = Array.from(customerMap.values());
            const inactiveCustomers = customers.filter(customer => {
                const lastOrderDate = new Date(customer.lastOrderDate);
                const diffTime = Math.abs(new Date().getTime() - lastOrderDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                customer.daysSinceLastOrder = diffDays;
                return lastOrderDate < sevenDaysAgo;
            });
            inactiveCustomers.sort((a, b) => new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime());
            this.logger.log(`Encontrados ${inactiveCustomers.length} clientes inativos`);
            return inactiveCustomers;
        }
        catch (error) {
            this.logger.error('Erro ao buscar clientes inativos:', error);
            throw error;
        }
    }
    async getTopCustomers(restaurantId) {
        try {
            this.logger.log(`Buscando clientes mais frequentes para restaurante ${restaurantId}...`);
            const ordersQuery = this.orderRepository.createQueryBuilder('order')
                .select('order.customerName', 'customerName')
                .addSelect('order.customerPhone', 'customerPhone')
                .addSelect('order.id', 'orderId')
                .addSelect('order.total', 'total')
                .where('order.customerPhone IS NOT NULL');
            if (restaurantId) {
                ordersQuery.andWhere('order.restaurantId = :restaurantId', { restaurantId });
            }
            const orders = await ordersQuery.getRawMany();
            this.logger.log(`Encontrados ${orders.length} pedidos para análise`);
            const customerMap = new Map();
            orders.forEach(order => {
                const customerPhone = order.customerPhone;
                if (!customerPhone)
                    return;
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
            const topCustomers = Array.from(customerMap.values())
                .sort((a, b) => b.orderCount - a.orderCount)
                .slice(0, 10);
            this.logger.log(`Encontrados ${topCustomers.length} clientes mais frequentes`);
            return topCustomers;
        }
        catch (error) {
            this.logger.error('Erro ao buscar clientes mais frequentes:', error);
            return [];
        }
    }
    async findRestaurantById(restaurantId) {
        try {
            return await this.restaurantRepository.findOne({ where: { id: restaurantId } });
        }
        catch (error) {
            this.logger.error(`Erro ao buscar restaurante com ID ${restaurantId}:`, error);
            throw error;
        }
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = CustomersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map