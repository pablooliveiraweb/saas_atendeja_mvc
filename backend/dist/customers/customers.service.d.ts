import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Order } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
export declare class CustomersService {
    private readonly customerRepository;
    private readonly orderRepository;
    private readonly restaurantRepository;
    private readonly logger;
    constructor(customerRepository: Repository<Customer>, orderRepository: Repository<Order>, restaurantRepository: Repository<Restaurant>);
    create(createCustomerDto: CreateCustomerDto, restaurantId: string): Promise<Customer>;
    findAll(restaurantId: string): Promise<Customer[]>;
    findOne(id: string, restaurantId: string): Promise<Customer>;
    findByPhone(phone: string, restaurantId?: string): Promise<Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, restaurantId: string): Promise<Customer>;
    remove(id: string, restaurantId: string): Promise<void>;
    search(query: string, restaurantId: string): Promise<Customer[]>;
    findInactive(): Promise<any[]>;
    getTopCustomers(restaurantId: string): Promise<any[]>;
    findRestaurantById(restaurantId: string): Promise<Restaurant | null>;
}
