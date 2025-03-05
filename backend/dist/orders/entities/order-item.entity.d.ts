import { Order } from './order.entity';
import { Product } from '../../menu/entities/product.entity';
export declare class OrderItem {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    additionalOptions: string;
    notes: string;
    order: Order;
    product: Product;
    createdAt: Date;
    updatedAt: Date;
}
