import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponType } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    // Verificar se já existe um cupom com o mesmo código para o restaurante
    const existingCoupon = await this.couponRepository.findOne({
      where: {
        code: createCouponDto.code,
        restaurantId: createCouponDto.restaurantId,
      },
    });

    if (existingCoupon) {
      throw new BadRequestException(`Já existe um cupom com o código ${createCouponDto.code}`);
    }

    const coupon = this.couponRepository.create(createCouponDto);
    return this.couponRepository.save(coupon);
  }

  async findAll(restaurantId: string): Promise<Coupon[]> {
    return this.couponRepository.find({
      where: { restaurantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Cupom com ID ${id} não encontrado`);
    }

    return coupon;
  }

  async findByCode(code: string, restaurantId: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code, restaurantId },
    });

    if (!coupon) {
      throw new NotFoundException(`Cupom com código ${code} não encontrado`);
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);

    // Se estiver atualizando o código, verificar se já existe outro cupom com o mesmo código
    if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
      const existingCoupon = await this.couponRepository.findOne({
        where: {
          code: updateCouponDto.code,
          restaurantId: coupon.restaurantId,
        },
      });

      if (existingCoupon) {
        throw new BadRequestException(`Já existe um cupom com o código ${updateCouponDto.code}`);
      }
    }

    Object.assign(coupon, updateCouponDto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
  }

  async validateCoupon(code: string, restaurantId: string, orderValue: number): Promise<Coupon> {
    try {
      const coupon = await this.findByCode(code, restaurantId);

      // Verificar se o cupom está ativo
      if (!coupon.isActive) {
        throw new BadRequestException('Este cupom não está mais ativo');
      }

      // Verificar se o cupom expirou
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        throw new BadRequestException('Este cupom expirou');
      }

      // Verificar se o cupom atingiu o limite de uso
      if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
        throw new BadRequestException('Este cupom atingiu o limite de uso');
      }

      // Verificar se o valor mínimo do pedido foi atingido
      if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
        throw new BadRequestException(`O valor mínimo para este cupom é de R$ ${coupon.minOrderValue}`);
      }

      return coupon;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Cupom inválido');
      }
      throw error;
    }
  }

  async applyCoupon(couponId: string): Promise<Coupon> {
    const coupon = await this.findOne(couponId);
    
    // Incrementar o contador de uso
    coupon.usageCount += 1;
    
    // Verificar se atingiu o limite de uso e desativar automaticamente
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      console.log(`Cupom ${coupon.code} atingiu o limite de uso (${coupon.usageCount}/${coupon.maxUsage}) e será desativado`);
      coupon.isActive = false;
    }
    
    return this.couponRepository.save(coupon);
  }

  calculateDiscount(coupon: Coupon, orderValue: number): number {
    if (coupon.type === CouponType.PERCENTAGE) {
      // Desconto percentual (limitado a 100%)
      const percentageValue = Math.min(coupon.value, 100);
      return (orderValue * percentageValue) / 100;
    } else {
      // Desconto fixo (limitado ao valor do pedido)
      return Math.min(coupon.value, orderValue);
    }
  }
} 