import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT = 'credit',
  DEBIT = 'debit',
  PIX = 'pix',
  ONLINE = 'online',
}

export enum OrderType {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
  DINE_IN = 'dine_in',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.PICKUP,
  })
  orderType: OrderType;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ nullable: true })
  deliveryZipCode: string;

  @Column({ length: 20, nullable: true })
  customerPhone: string;

  @Column({ nullable: true })
  customerName: string;

  @ManyToOne(() => Restaurant, restaurant => restaurant.orders, { nullable: true })
  restaurant: Restaurant;

  @ManyToOne(() => User, user => user.orders, { nullable: true })
  user: User;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @Column({ default: false })
  notificationSent: boolean;

  @Column({ default: false })
  printed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 