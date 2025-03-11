import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

// ID do restaurante padrão para compatibilidade
const DEFAULT_RESTAURANT_ID = '90655c28-4a17-408e-aece-69fde77b5d02';

@ApiTags('customers-alt')
@Controller('customers')
export class CustomersAltController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente (rota alternativa)' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    try {
      console.log('Criando novo cliente (rota alternativa):', JSON.stringify(createCustomerDto, null, 2));
      console.log('Restaurant ID padrão:', DEFAULT_RESTAURANT_ID);
      
      // Remover restaurantId se estiver presente no DTO para evitar erro de validação
      const { restaurantId, ...cleanedDto } = createCustomerDto as any;
      
      // Garantir que os campos obrigatórios estejam presentes
      const validDto = {
        name: cleanedDto.name || 'Cliente',
        email: cleanedDto.email || `${Date.now()}@cliente.temp`,
        phone: cleanedDto.phone || '5511999999999'
      };
      
      console.log('DTO validado:', validDto);
      
      // Usar o restaurantId padrão
      return this.customersService.create(validDto, DEFAULT_RESTAURANT_ID);
    } catch (error) {
      console.error('Erro ao criar cliente (rota alternativa):', error);
      throw new HttpException(
        `Erro ao criar cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes (rota alternativa)' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso' })
  findAll(@Query('search') search?: string) {
    try {
      console.log('Listando todos os clientes (rota alternativa)');
      
      if (search) {
        return this.customersService.search(search, DEFAULT_RESTAURANT_ID);
      }
      return this.customersService.findAll(DEFAULT_RESTAURANT_ID);
    } catch (error) {
      console.error('Erro ao listar clientes (rota alternativa):', error);
      throw new HttpException(
        `Erro ao listar clientes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar clientes por termo (rota alternativa)' })
  search(@Query('q') query: string) {
    try {
      console.log(`Buscando clientes com termo: ${query} (rota alternativa)`);
      return this.customersService.search(query, DEFAULT_RESTAURANT_ID);
    } catch (error) {
      console.error('Erro ao buscar clientes (rota alternativa):', error);
      throw new HttpException(
        `Erro ao buscar clientes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Listar clientes inativos (rota alternativa)' })
  findInactive() {
    try {
      console.log('Listando clientes inativos (rota alternativa)');
      return this.customersService.findInactive()
        .then(result => {
          console.log(`Encontrados ${result.length} clientes inativos (rota alternativa)`);
          return result;
        })
        .catch(error => {
          console.error('Erro ao listar clientes inativos (rota alternativa):', error);
          throw error;
        });
    } catch (error) {
      console.error('Erro ao listar clientes inativos (rota alternativa):', error);
      throw new HttpException(
        `Erro ao listar clientes inativos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('top')
  @ApiOperation({ summary: 'Listar clientes mais frequentes (rota alternativa)' })
  findTop() {
    try {
      console.log('Listando clientes mais frequentes (rota alternativa)');
      return this.customersService.getTopCustomers(DEFAULT_RESTAURANT_ID)
        .then(result => {
          console.log(`Encontrados ${result.length} clientes mais frequentes (rota alternativa)`);
          return result;
        })
        .catch(error => {
          console.error('Erro ao listar clientes mais frequentes (rota alternativa):', error);
          throw error;
        });
    } catch (error) {
      console.error('Erro ao listar clientes mais frequentes (rota alternativa):', error);
      throw new HttpException(
        `Erro ao listar clientes mais frequentes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID (rota alternativa)' })
  findOne(@Param('id') id: string) {
    try {
      console.log(`Buscando cliente com ID: ${id} (rota alternativa)`);
      return this.customersService.findOne(id, DEFAULT_RESTAURANT_ID);
    } catch (error) {
      console.error('Erro ao buscar cliente (rota alternativa):', error);
      throw new HttpException(
        `Erro ao buscar cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente (rota alternativa)' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    try {
      console.log(`Atualizando cliente ${id} (rota alternativa PATCH):`, updateCustomerDto);
      return this.customersService.update(id, updateCustomerDto, DEFAULT_RESTAURANT_ID)
        .then(result => {
          console.log(`Cliente ${id} atualizado com sucesso (rota alternativa PATCH):`, result);
          return result;
        })
        .catch(error => {
          console.error(`Erro ao atualizar cliente ${id} (rota alternativa PATCH):`, error);
          throw error;
        });
    } catch (error) {
      console.error('Erro ao atualizar cliente (rota alternativa PATCH):', error);
      throw new HttpException(
        `Erro ao atualizar cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente (PUT, rota alternativa)' })
  updatePut(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    try {
      console.log(`Atualizando cliente ${id} (rota alternativa PUT):`, updateCustomerDto);
      return this.customersService.update(id, updateCustomerDto, DEFAULT_RESTAURANT_ID)
        .then(result => {
          console.log(`Cliente ${id} atualizado com sucesso (rota alternativa PUT):`, result);
          return result;
        })
        .catch(error => {
          console.error(`Erro ao atualizar cliente ${id} (rota alternativa PUT):`, error);
          throw error;
        });
    } catch (error) {
      console.error('Erro ao atualizar cliente (rota alternativa PUT):', error);
      throw new HttpException(
        `Erro ao atualizar cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cliente (rota alternativa)' })
  remove(@Param('id') id: string) {
    try {
      console.log(`Removendo cliente ${id} (rota alternativa)`);
      return this.customersService.remove(id, DEFAULT_RESTAURANT_ID);
    } catch (error) {
      console.error('Erro ao remover cliente (rota alternativa):', error);
      throw new HttpException(
        `Erro ao remover cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('simple')
  @ApiOperation({ summary: 'Criar um novo cliente de forma simplificada' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  async createSimple(@Body() data: any) {
    try {
      console.log('Criando cliente via rota simplificada:', data);
      
      // Verificar se o restaurante existe
      try {
        const restaurant = await this.customersService.findRestaurantById(DEFAULT_RESTAURANT_ID);
        if (!restaurant) {
          throw new HttpException(
            `Restaurante com ID ${DEFAULT_RESTAURANT_ID} não encontrado`,
            HttpStatus.BAD_REQUEST
          );
        }
        
        console.log('Restaurante encontrado:', restaurant.name);
      } catch (restaurantError) {
        console.error('Erro ao verificar restaurante:', restaurantError);
        throw new HttpException(
          `Erro ao verificar restaurante: ${restaurantError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
      
      // Extrair apenas os campos básicos e ignorar outros
      const simpleDto = {
        name: data.name || 'Cliente',
        email: data.email || `cliente-${Date.now()}@temp.com`,
        phone: data.phone || '5511999999999'
      };
      
      console.log('DTO simplificado:', simpleDto);
      
      // Usar o serviço com o DTO simplificado
      return this.customersService.create(simpleDto, DEFAULT_RESTAURANT_ID);
    } catch (error) {
      console.error('Erro na rota simplificada:', error);
      throw new HttpException(
        'Erro ao criar cliente: ' + (error.message || 'erro desconhecido'),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('ensure-default-restaurant')
  @ApiOperation({ summary: 'Garantir que o restaurante padrão existe' })
  @ApiResponse({ status: 200, description: 'Restaurante padrão verificado/criado com sucesso' })
  async ensureDefaultRestaurant() {
    try {
      // Verificar se o restaurante padrão existe
      let restaurant = await this.customersService.findRestaurantById(DEFAULT_RESTAURANT_ID);
      
      if (restaurant) {
        return {
          success: true,
          message: 'Restaurante padrão já existe',
          restaurant: {
            id: restaurant.id,
            name: restaurant.name
          }
        };
      }
      
      // O restaurante não existe, vamos tentar criá-lo
      // Vamos primeiro verificar se temos acesso ao repositório de restaurantes
      console.log('Criando restaurante padrão com ID:', DEFAULT_RESTAURANT_ID);
      
      // Retornar erro, pois o restaurante padrão precisa ser criado manualmente
      throw new HttpException(
        `Restaurante padrão com ID ${DEFAULT_RESTAURANT_ID} não encontrado. Por favor, crie-o manualmente no banco de dados.`,
        HttpStatus.NOT_FOUND
      );
    } catch (error) {
      console.error('Erro ao verificar restaurante padrão:', error);
      throw new HttpException(
        'Erro ao verificar restaurante padrão: ' + (error.message || 'erro desconhecido'),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 