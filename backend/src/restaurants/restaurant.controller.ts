import { Controller, Get, Post, Param, Body, NotFoundException, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { PublicOrAuthGuard } from '../auth/guards/public-or-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RestaurantService } from './restaurant.service';

// Função para normalizar texto para comparação
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '')         // Remove caracteres especiais
    .replace(/\s+/g, '-');           // Substitui espaços por hífens
}

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantController {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private restaurantService: RestaurantService,
  ) {}

  @Get('slug/:slug')
  @UseGuards(PublicOrAuthGuard)
  @ApiOperation({ summary: 'Get restaurant by slug' })
  @ApiParam({ name: 'slug', description: 'Restaurant slug (formatted name)' })
  @ApiResponse({ status: 200, description: 'Restaurant found' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findBySlug(@Param('slug') slug: string) {
    // Normalizar o slug recebido
    const normalizedInputSlug = slug.toLowerCase();
    
    // Buscar restaurante pelo slug
    const restaurant = await this.restaurantRepository.findOne({ 
      where: { slug: normalizedInputSlug } 
    });
    
    // Se não encontrar pelo slug exato, tentar buscar pelo nome normalizado (compatibilidade)
    if (!restaurant) {
      // Buscar todos os restaurantes
      const restaurants = await this.restaurantRepository.find();
      
      // Encontrar o restaurante cujo nome normalizado corresponde ao slug
      const restaurantByName = restaurants.find(r => {
        const restaurantSlug = normalizeText(r.name);
        return restaurantSlug === normalizedInputSlug;
      });
      
      if (restaurantByName) {
        // Atualizar o slug do restaurante para futuras consultas
        if (!restaurantByName.slug) {
          await this.restaurantService.generateAndSaveSlug(restaurantByName.id);
        }
        return restaurantByName;
      }
      
      throw new NotFoundException(`Restaurant with slug ${slug} not found`);
    }
    
    return restaurant;
  }

  @Get(':id')
  @UseGuards(PublicOrAuthGuard)
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant found' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findById(@Param('id') id: string) {
    const restaurant = await this.restaurantRepository.findOne({ where: { id } });
    
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    
    return restaurant;
  }

  @Post(':id/whatsapp/connect')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Conectar instância do WhatsApp' })
  @ApiParam({ name: 'id', description: 'ID do restaurante' })
  @ApiResponse({ status: 200, description: 'Instância conectada com sucesso' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado' })
  async connectWhatsApp(@Param('id') id: string) {
    try {
      const restaurant = await this.restaurantService.findById(id);
      if (!restaurant) {
        throw new NotFoundException(`Restaurante com ID ${id} não encontrado`);
      }
      
      // Usar o número de telefone do restaurante para a conexão, se disponível
      return await this.restaurantService.connectWhatsAppInstance(id, restaurant.whatsappNumber);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get(':id/whatsapp/qrcode')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter QR Code para conectar WhatsApp' })
  @ApiParam({ name: 'id', description: 'ID do restaurante' })
  @ApiResponse({ status: 200, description: 'QR Code obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado' })
  async getWhatsAppQrCode(@Param('id') id: string) {
    try {
      return await this.restaurantService.getWhatsAppQrCode(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post(':id/whatsapp/send')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enviar mensagem de WhatsApp' })
  @ApiParam({ name: 'id', description: 'ID do restaurante' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        number: { type: 'string', example: '5511999999999' },
        text: { type: 'string', example: 'Olá, tudo bem?' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Mensagem enviada com sucesso' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado' })
  async sendWhatsAppMessage(
    @Param('id') id: string,
    @Body() body: { number: string; text: string },
  ) {
    try {
      return await this.restaurantService.sendWhatsAppMessage(id, body.number, body.text);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post('generate-slugs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate slugs for all restaurants' })
  @ApiResponse({ status: 200, description: 'Slugs generated successfully' })
  async generateSlugs() {
    // Buscar todos os restaurantes
    const restaurants = await this.restaurantRepository.find();
    
    // Gerar e salvar o slug para cada restaurante
    const results = await Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          // Verificar se o restaurante já tem um slug
          if (!restaurant.slug && restaurant.name) {
            // Gerar o slug a partir do nome do restaurante
            const slug = this.restaurantService.generateSlug(restaurant.name);
            
            // Atualizar o restaurante com o slug
            await this.restaurantRepository.update(restaurant.id, { slug });
            
            return { id: restaurant.id, name: restaurant.name, slug, status: 'success' };
          }
          
          return { id: restaurant.id, name: restaurant.name, slug: restaurant.slug, status: 'skipped' };
        } catch (error) {
          return { id: restaurant.id, name: restaurant.name, status: 'error', error: error.message };
        }
      })
    );
    
    return {
      message: 'Slugs generated successfully',
      results,
    };
  }
} 