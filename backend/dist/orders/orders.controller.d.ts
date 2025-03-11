import { OrdersService } from './orders.service';
import { OrderStatus } from './entities/order.entity';
import { Order } from './entities/order.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(): Promise<Order[]>;
    findAllPending(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    create(orderData: Partial<Order>): Promise<Order>;
    update(id: string, updateData: Partial<Order>): Promise<Order>;
    updateStatus(id: string, body: {
        status: OrderStatus;
    }): Promise<Order>;
    remove(id: string): Promise<void>;
}
