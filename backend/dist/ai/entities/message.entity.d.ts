import { Conversation } from './conversation.entity';
export declare class Message {
    id: string;
    content: string;
    role: string;
    conversation: Conversation;
    conversationId: string;
    createdAt: Date;
}
