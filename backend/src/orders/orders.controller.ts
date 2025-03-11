import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './entities/order.entity';
import { Order } from './entities/order.entity';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Obter todos os pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Obter pedidos pendentes' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos pendentes retornada com sucesso' })
  async findAllPending() {
    console.log('Buscando pedidos pendentes...');
    try {
      const pendingOrders = await this.ordersService.findAllWithStatus(OrderStatus.PENDING);
      console.log(`Encontrados ${pendingOrders.length} pedidos pendentes`);
      return pendingOrders;
    } catch (error) {
      console.error('Erro ao buscar pedidos pendentes:', error);
      throw new HttpException(
        `Erro ao buscar pedidos pendentes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo pedido' })
  @ApiBody({ type: Object, description: 'Dados do pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  async create(@Body() orderData: Partial<Order>) {
    return this.ordersService.create(orderData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiBody({ type: Object, description: 'Dados para atualização' })
  @ApiResponse({ status: 200, description: 'Pedido atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async update(@Param('id') id: string, @Body() updateData: Partial<Order>) {
    return this.ordersService.update(id, updateData);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: Object.values(OrderStatus),
          example: OrderStatus.PREPARING
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Status do pedido atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.ordersService.update(id, { status: body.status });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
} 