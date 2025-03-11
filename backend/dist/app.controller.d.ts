import { AppService } from './app.service';
import { Repository } from 'typeorm';
import { Order } from './orders/entities/order.entity';
import { OrderType, PaymentMethod, OrderStatus } from './orders/entities/order.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { User } from './users/entities/user.entity';
import { RestaurantService } from './restaurants/restaurant.service';
import { EvolutionApiService } from './evolution-api/evolution-api.service';
import { ModuleRef } from '@nestjs/core';
import { CustomersService } from './customers/customers.service';
import { NotificationsService } from './notifications/notifications.service';
export declare class AppController {
    private readonly appService;
    private readonly orderRepository;
    private readonly restaurantRepository;
    private readonly userRepository;
    private readonly restaurantService;
    private readonly evolutionApiService;
    private readonly moduleRef;
    private readonly customersService;
    private readonly notificationsService;
    constructor(appService: AppService, orderRepository: Repository<Order>, restaurantRepository: Repository<Restaurant>, userRepository: Repository<User>, restaurantService: RestaurantService, evolutionApiService: EvolutionApiService, moduleRef: ModuleRef, customersService: CustomersService, notificationsService: NotificationsService);
    getHello(): string;
    getAllOrders(): Promise<Order[]>;
    createOrder(orderData: any): Promise<{
        items: any;
        id: string;
        orderNumber: string;
        status: OrderStatus;
        paymentMethod: PaymentMethod;
        orderType: OrderType;
        subtotal: number;
        total: number;
        notes: string;
        isPaid: boolean;
        deliveryAddress: string;
        deliveryZipCode: string;
        customerPhone: string;
        customerName: string;
        restaurant: Restaurant;
        user: User;
        orderItems: import("./orders/entities/order-item.entity").OrderItem[];
        notificationSent: boolean;
        printed: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createRestaurantOrder(restaurantId: string, orderData: any): Promise<Order>;
    getRecentOrders(): Promise<Order[]>;
    getWeeklyStats(): Promise<number[]>;
    getOrderById(id: string): Promise<Order>;
    updateOrder(id: string, updateData: any): Promise<Order>;
    updateRestaurantOrder(restaurantId: string, id: string, updateData: any): Promise<Order>;
    updateRestaurantOrderStatus(restaurantId: string, orderId: string, updateData: {
        status: OrderStatus;
    }): Promise<Order>;
    getTopProducts(): {
        name: string;
        total: number;
    }[];
    registerRestaurant(registrationData: any): Promise<{
        success: boolean;
        message: string;
        restaurant: {
            id: string;
            name: string;
            whatsappPending: boolean;
            whatsappInstance?: undefined;
        };
        user: {
            id: string;
            email: string;
            tempPassword: string;
        };
        accessInfo: {
            email: string;
            password: string;
            message: string;
        };
    } | {
        success: boolean;
        message: string;
        restaurant: {
            id: string;
            name: string;
            whatsappInstance: string | null;
            whatsappPending?: undefined;
        };
        user: {
            id: string;
            email: string;
            tempPassword: string;
        };
        accessInfo: {
            email: string;
            password: string;
            message: string;
        };
    }>;
    registerRestaurantNoWhatsapp(registrationData: any): Promise<{
        success: boolean;
        message: string;
        restaurant: {
            id: string;
            name: string;
            whatsappPending: boolean;
            whatsappInstance?: undefined;
        };
        user: {
            id: string;
            email: string;
            tempPassword: string;
        };
        accessInfo: {
            email: string;
            password: string;
            message: string;
        };
    } | {
        success: boolean;
        message: string;
        restaurant: {
            id: string;
            name: string;
            whatsappInstance: string | null;
            whatsappPending?: undefined;
        };
        user: {
            id: string;
            email: string;
            tempPassword: string;
        };
        accessInfo: {
            email: string;
            password: string;
            message: string;
        };
    }>;
}
