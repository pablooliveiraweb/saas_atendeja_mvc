import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { EvolutionApiService } from './evolution-api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('evolution-api')
@Controller('evolution-api')
@UseGuards(JwtAuthGuard)
export class EvolutionApiController {
  constructor(private readonly evolutionApiService: EvolutionApiService) {}

  @Post('instances')
  @ApiOperation({ summary: 'Criar uma nova instância' })
  @ApiResponse({ status: 201, description: 'Instância criada com sucesso' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['instanceName'],
      properties: {
        instanceName: { type: 'string', example: 'restaurant_12345678' },
        token: { type: 'string', example: '' },
        number: { type: 'string', example: '5511999999999' },
        qrcode: { type: 'boolean', example: false },
        webhook: {
          type: 'object',
          properties: {
            url: { type: 'string', example: '' },
            enabled: { type: 'boolean', example: false },
          },
        },
        webhook_by_events: { type: 'boolean', example: false },
        events: { type: 'array', items: { type: 'string' }, example: [] },
        reject_call: { type: 'boolean', example: false },
        msg_call: { type: 'string', example: '' },
      },
    },
  })
  async createInstance(@Body() body: any) {
    return this.evolutionApiService.createInstance(body.instanceName, body);
  }

  @Get('instances')
  @ApiOperation({ summary: 'Buscar instâncias' })
  @ApiQuery({ name: 'instanceName', required: false, description: 'Nome da instância a ser buscada' })
  @ApiResponse({ status: 200, description: 'Instâncias encontradas' })
  async fetchInstances(@Query('instanceName') instanceName?: string) {
    return this.evolutionApiService.fetchInstances(instanceName);
  }

  @Get('instances/:instanceName/connect')
  @ApiOperation({ summary: 'Conectar uma instância existente' })
  @ApiParam({ name: 'instanceName', description: 'Nome da instância' })
  @ApiQuery({ name: 'number', required: false, description: 'Número de telefone para conexão' })
  @ApiResponse({ status: 200, description: 'Instância conectada com sucesso' })
  async connectInstance(
    @Param('instanceName') instanceName: string,
    @Query('number') phoneNumber?: string,
  ) {
    return this.evolutionApiService.connectInstance(instanceName, phoneNumber);
  }

  @Get('instances/:instanceName/status')
  @ApiOperation({ summary: 'Verificar o status de uma instância' })
  @ApiParam({ name: 'instanceName', description: 'Nome da instância' })
  @ApiResponse({ status: 200, description: 'Status da instância' })
  async checkInstanceStatus(@Param('instanceName') instanceName: string) {
    return this.evolutionApiService.checkInstanceStatus(instanceName);
  }

  @Post('instances/:instanceName/send-text')
  @ApiOperation({ summary: 'Enviar uma mensagem de texto' })
  @ApiParam({ name: 'instanceName', description: 'Nome da instância' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['number', 'text'],
      properties: {
        number: { type: 'string', example: '5511999999999' },
        text: { type: 'string', example: 'Olá! Esta é uma mensagem de teste.' },
        delay: { type: 'number', example: 1200 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Mensagem enviada com sucesso' })
  async sendText(
    @Param('instanceName') instanceName: string,
    @Body() body: { number: string; text: string; delay?: number },
  ) {
    return this.evolutionApiService.sendText(
      instanceName,
      body.number,
      body.text,
      body.delay,
    );
  }

  @Delete('instances/:instanceName')
  @ApiOperation({ summary: 'Deletar uma instância' })
  @ApiParam({ name: 'instanceName', description: 'Nome da instância' })
  @ApiResponse({ status: 200, description: 'Instância deletada com sucesso' })
  async deleteInstance(@Param('instanceName') instanceName: string) {
    return this.evolutionApiService.deleteInstance(instanceName);
  }

  @Get('instances/:instanceName/disconnect')
  @ApiOperation({ summary: 'Desconectar uma instância' })
  @ApiParam({ name: 'instanceName', description: 'Nome da instância' })
  @ApiResponse({ status: 200, description: 'Instância desconectada com sucesso' })
  async disconnectInstance(@Param('instanceName') instanceName: string) {
    return this.evolutionApiService.disconnectInstance(instanceName);
  }

  @Get('instances/:instanceName/qrcode')
  @ApiOperation({ summary: 'Obter o QR Code para conectar uma instância' })
  @ApiParam({ name: 'instanceName', description: 'Nome da instância' })
  @ApiResponse({ status: 200, description: 'QR Code obtido com sucesso' })
  async getQrCode(@Param('instanceName') instanceName: string) {
    return this.evolutionApiService.getQrCode(instanceName);
  }
} 