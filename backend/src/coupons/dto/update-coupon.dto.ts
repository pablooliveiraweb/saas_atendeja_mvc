import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDate, Min, Max } from 'class-validator';
import { CouponType } from '../entities/coupon.entity';
import { Type } from 'class-transformer';

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  value?: number;

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
} 