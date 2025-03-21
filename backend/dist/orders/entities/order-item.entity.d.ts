import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
export declare class OrderItem {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    additionalOptions: string;
    notes: string;
    order: Order;
    orderId: string;
    product: Product;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
}
