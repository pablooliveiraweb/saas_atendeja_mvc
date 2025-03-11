import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome do cliente' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @ApiProperty({ example: 'joao.silva@exemplo.com', description: 'Email do cliente' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({ example: '11987654321', description: 'Telefone do cliente' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  phone: string;

  @ApiProperty({ example: 'Rua Exemplo, 123, São Paulo - SP', description: 'Endereço do cliente' })
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Cliente VIP', description: 'Observações sobre o cliente' })
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: true, description: 'Status do cliente (ativo/inativo)' })
  @IsOptional()
  @IsBoolean({ message: 'O status deve ser um booleano' })
  isActive?: boolean;
} 