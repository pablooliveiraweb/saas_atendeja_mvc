import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@Controller('restaurants/:restaurantId/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Param('restaurantId') restaurantId: string,
  ) {
    try {
      console.log(`Criando novo cliente para restaurante ${restaurantId}:`, createCustomerDto);
      return this.customersService.create(createCustomerDto, restaurantId);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw new HttpException(
        `Erro ao criar cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso' })
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query('search') search?: string,
  ) {
    try {
      console.log(`Listando todos os clientes para restaurante ${restaurantId}`);
      
      if (search) {
        return this.customersService.search(search, restaurantId);
      }
      return this.customersService.findAll(restaurantId);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw new HttpException(
        `Erro ao listar clientes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar clientes por termo' })
  search(
    @Param('restaurantId') restaurantId: string,
    @Query('q') query: string
  ) {
    try {
      console.log(`Buscando clientes com termo "${query}" para restaurante ${restaurantId}`);
      return this.customersService.search(query, restaurantId);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw new HttpException(
        `Erro ao buscar clientes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Listar clientes inativos' })
  findInactive(
    @Param('restaurantId') restaurantId: string
  ) {
    try {
      console.log(`Listando clientes inativos para restaurante ${restaurantId}`);
      return this.customersService.findInactive()
        .then(result => {
          console.log(`Encontrados ${result.length} clientes inativos para restaurante ${restaurantId}`);
          return result;
        })
        .catch(error => {
          console.error(`Erro ao listar clientes inativos para restaurante ${restaurantId}:`, error);
          throw error;
        });
    } catch (error) {
      console.error('Erro ao listar clientes inativos:', error);
      throw new HttpException(
        `Erro ao listar clientes inativos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('top')
  @ApiOperation({ summary: 'Listar clientes mais frequentes' })
  findTop(
    @Param('restaurantId') restaurantId: string
  ) {
    try {
      console.log(`Listando clientes mais frequentes para restaurante ${restaurantId}`);
      return this.customersService.getTopCustomers(restaurantId)
        .then(result => {
          console.log(`Encontrados ${result.length} clientes mais frequentes para restaurante ${restaurantId}`);
          return result;
        })
        .catch(error => {
          console.error(`Erro ao listar clientes mais frequentes para restaurante ${restaurantId}:`, error);
          throw error;
        });
    } catch (error) {
      console.error('Erro ao listar clientes mais frequentes:', error);
      throw new HttpException(
        `Erro ao listar clientes mais frequentes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  findOne(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string
  ) {
    try {
      console.log(`Buscando cliente com ID ${id} para restaurante ${restaurantId}`);
      return this.customersService.findOne(id, restaurantId);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw new HttpException(
        `Erro ao buscar cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Buscar cliente por telefone' })
  findByPhone(
    @Param('restaurantId') restaurantId: string,
    @Param('phone') phone: string
  ) {
    try {
      console.log(`Buscando cliente com telefone ${phone} para restaurante ${restaurantId}`);
      return this.customersService.findByPhone(phone, restaurantId);
    } catch (error) {
      console.error('Erro ao buscar cliente por telefone:', error);
      throw new HttpException(
        `Erro ao buscar cliente por telefone: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    try {
      console.log(`Atualizando cliente ${id} para restaurante ${restaurantId} (PATCH):`, updateCustomerDto);
      return this.customersService.update(id, updateCustomerDto, restaurantId)
        .then(result => {
          console.log(`Cliente ${id} atualizado com sucesso (PATCH):`, result);
          return result;
        })
        .catch(error => {
          console.error(`Erro ao atualizar cliente ${id} (PATCH):`, error);
          throw error;
        });
    } catch (error) {
      console.error('Erro ao atualizar cliente (PATCH):', error);
      throw new HttpException(
        `Erro ao atualizar cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente (PUT)' })
  updatePut(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    try {
      console.log(`Atualizando cliente ${id} para restaurante ${restaurantId} (PUT):`, updateCustomerDto);
      return this.customersService.update(id, updateCustomerDto, restaurantId)
        .then(result => {
          console.log(`Cliente ${id} atualizado com sucesso (PUT):`, result);
          return result;
        })
        .catch(error => {
          console.error(`Erro ao atualizar cliente ${id} (PUT):`, error);
          throw error;
        });
    } catch (error) {
      console.error('Erro ao atualizar cliente (PUT):', error);
      throw new HttpException(
        `Erro ao atualizar cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cliente' })
  remove(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string
  ) {
    try {
      console.log(`Removendo cliente ${id} para restaurante ${restaurantId}`);
      return this.customersService.remove(id, restaurantId);
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      throw new HttpException(
        `Erro ao remover cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}