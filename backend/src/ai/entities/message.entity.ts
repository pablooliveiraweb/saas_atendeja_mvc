import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  role: string; // 'user' ou 'assistant'

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn()
  conversation: Conversation;

  @Column()
  conversationId: string;

  @CreateDateColumn()
  createdAt: Date;
} 