import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDate, IsUUID, Min, Max, IsNotEmpty } from 'class-validator';
import { CouponType } from '../entities/coupon.entity';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minOrderValue?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  maxUsage?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;
} 