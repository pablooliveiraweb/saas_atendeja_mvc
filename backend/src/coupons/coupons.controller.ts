import { Controller, Get, Post, Body, Param, Put, Delete, Query, BadRequestException } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cupom' })
  @ApiBody({ type: CreateCouponDto, description: 'Dados do cupom' })
  @ApiResponse({ status: 201, description: 'Cupom criado com sucesso' })
  async create(@Body() createCouponDto: CreateCouponDto): Promise<Coupon> {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obter todos os cupons de um restaurante' })
  @ApiQuery({ name: 'restaurantId', required: true, description: 'ID do restaurante' })
  @ApiResponse({ status: 200, description: 'Lista de cupons retornada com sucesso' })
  async findAll(@Query('restaurantId') restaurantId: string): Promise<Coupon[]> {
    if (!restaurantId) {
      throw new BadRequestException('O ID do restaurante é obrigatório');
    }
    return this.couponsService.findAll(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cupom por ID' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  @ApiResponse({ status: 200, description: 'Cupom encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  async findOne(@Param('id') id: string): Promise<Coupon> {
    return this.couponsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cupom' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  @ApiBody({ type: UpdateCouponDto, description: 'Dados do cupom' })
  @ApiResponse({ status: 200, description: 'Cupom atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cupom' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  @ApiResponse({ status: 200, description: 'Cupom removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.couponsService.remove(id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validar cupom' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        restaurantId: { type: 'string' },
        orderValue: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Cupom válido' })
  @ApiResponse({ status: 400, description: 'Cupom inválido' })
  async validateCoupon(
    @Body() body: { code: string; restaurantId: string; orderValue: number },
  ): Promise<{ coupon: Coupon; discount: number }> {
    const { code, restaurantId, orderValue } = body;
    
    if (!code || !restaurantId || orderValue === undefined) {
      throw new BadRequestException('Código do cupom, ID do restaurante e valor do pedido são obrigatórios');
    }
    
    const coupon = await this.couponsService.validateCoupon(code, restaurantId, orderValue);
    const discount = this.couponsService.calculateDiscount(coupon, orderValue);
    
    return { coupon, discount };
  }
} 