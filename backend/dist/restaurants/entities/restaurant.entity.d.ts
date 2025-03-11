import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
export declare enum RestaurantStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    PENDING_WHATSAPP = "pending_whatsapp"
}
export declare enum SubscriptionPlan {
    BASIC = "basic",
    STANDARD = "standard",
    PREMIUM = "premium"
}
export declare class Restaurant {
    id: string;
    name: string;
    logo: string;
    description: string;
    phone: string;
    address: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    status: RestaurantStatus;
    subscriptionPlan: SubscriptionPlan;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    deliveryEnabled: boolean;
    deliveryFee: number;
    minimumOrderValue: number;
    acceptsCash: boolean;
    acceptsCard: boolean;
    acceptsPix: boolean;
    operatingHours: string;
    whatsappNumber: string;
    whatsappNotificationsEnabled: boolean;
    autoPrintEnabled: boolean;
    printerConfigs: string;
    evolutionApiInstanceName: string;
    evolutionApiInstanceToken: string;
    evolutionApiInstanceConnected: boolean;
    owner: User;
    orders: Order[];
    createdAt: Date;
    updatedAt: Date;
}
