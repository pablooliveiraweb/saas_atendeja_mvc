import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: string;
    phoneNumber: string;
    isActive: boolean;
    lastInteractionAt: Date;
    needsFollowUp: boolean;
    followUpSentAt: Date;
    restaurant: Restaurant;
    restaurantId: string;
    customer: Customer;
    customerId: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
