import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';

export enum RestaurantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  PENDING_WHATSAPP = 'pending_whatsapp',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 14 })
  phone: string;

  @Column({ length: 200 })
  address: string;

  @Column({ length: 100, nullable: true })
  neighborhood: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({ length: 8 })
  postalCode: string;

  @Column({
    type: 'enum',
    enum: RestaurantStatus,
    default: RestaurantStatus.PENDING,
  })
  status: RestaurantStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.BASIC,
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ default: false })
  deliveryEnabled: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumOrderValue: number;

  @Column({ default: false })
  acceptsCash: boolean;

  @Column({ default: false })
  acceptsCard: boolean;

  @Column({ default: false })
  acceptsPix: boolean;

  @Column({ default: '{}', type: 'json' })
  operatingHours: string;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column({ default: false })
  whatsappNotificationsEnabled: boolean;

  @Column({ default: false })
  autoPrintEnabled: boolean;

  @Column({ default: '{}', type: 'json' })
  printerConfigs: string;

  // Campos para a Evolution API
  @Column({ nullable: true })
  evolutionApiInstanceName: string;

  @Column({ nullable: true })
  evolutionApiInstanceToken: string;

  @Column({ default: false })
  evolutionApiInstanceConnected: boolean;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  owner: User;

  @OneToMany(() => Order, order => order.restaurant)
  orders: Order[];

  @OneToMany(() => Coupon, coupon => coupon.restaurant)
  coupons: Coupon[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 200, nullable: true })
  baseUrl: string;

  @Column({ length: 100, nullable: true })
  slug: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ length: 50, nullable: true, default: '#3182ce' })
  themeColor: string;
} 