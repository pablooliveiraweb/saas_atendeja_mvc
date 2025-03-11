import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' })
  newPassword: string;

  @IsNotEmpty({ message: 'Confirmação da nova senha é obrigatória' })
  confirmPassword: string;
} 