import { User } from '../../users/entities/user.entity';
export declare enum RestaurantStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending"
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
    owner: User;
    createdAt: Date;
    updatedAt: Date;
}
