import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nome do produto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  name: string;

  @ApiProperty({ description: 'Descrição do produto' })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  description?: string;

  @ApiProperty({ description: 'Preço do produto' })
  @IsNotEmpty({ message: 'O preço é obrigatório' })
  @IsNumber({}, { message: 'O preço deve ser um número' })
  @Min(0, { message: 'O preço deve ser maior ou igual a zero' })
  price: number;

  @ApiProperty({ description: 'URL da imagem do produto' })
  @IsOptional()
  @IsString({ message: 'A imagem deve ser uma string' })
  image?: string;

  @ApiProperty({ description: 'Ordem de exibição do produto' })
  @IsOptional()
  @IsNumber({}, { message: 'A ordem deve ser um número' })
  order?: number;

  @ApiProperty({ description: 'Indica se o produto está ativo' })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Indica se o produto está disponível' })
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ description: 'ID da categoria do produto' })
  @IsNotEmpty({ message: 'O ID da categoria é obrigatório' })
  @IsUUID('4', { message: 'O ID da categoria deve ser um UUID válido' })
  categoryId: string;

  @ApiProperty({ 
    description: 'Opções adicionais do produto',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  additionalOptions?: any;
} 