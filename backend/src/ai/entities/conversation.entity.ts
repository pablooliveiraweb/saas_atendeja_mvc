import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastInteractionAt: Date;

  @Column({ default: false })
  needsFollowUp: boolean;

  @Column({ nullable: true })
  followUpSentAt: Date;

  @ManyToOne(() => Restaurant)
  @JoinColumn()
  restaurant: Restaurant;

  @Column()
  restaurantId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn()
  customer: Customer;

  @Column({ nullable: true })
  customerId: string;

  @OneToMany(() => Message, (message: any) => message.conversation, { cascade: true })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 