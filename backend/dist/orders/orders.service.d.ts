import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order.entity';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly evolutionApiService;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, evolutionApiService: EvolutionApiService);
    findAll(): Promise<Order[]>;
    findAllWithStatus(status: OrderStatus): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    create(orderData: Partial<Order>): Promise<Order>;
    update(id: string, updateData: Partial<Order>): Promise<Order>;
    remove(id: string): Promise<void>;
    private handleStatusChange;
    private getStatusMessage;
}
