import { Order } from '../../orders/entities/order.entity';
export declare enum UserRole {
    ADMIN = "admin",
    RESTAURANT = "restaurant",
    CUSTOMER = "customer"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    orders: Order[];
    hashPassword(): Promise<void>;
    comparePassword(attempt: string): Promise<boolean>;
}
