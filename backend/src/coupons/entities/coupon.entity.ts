import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CouponType,
    default: CouponType.PERCENTAGE
  })
  type: CouponType;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  minOrderValue: number;

  @Column({ nullable: true })
  maxUsage: number;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  expiresAt: Date;

  @ManyToOne(() => Restaurant, restaurant => restaurant.coupons)
  restaurant: Restaurant;

  @Column()
  restaurantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 