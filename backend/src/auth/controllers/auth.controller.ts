import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  AuthResponse,
  LoginResponse,
  RefreshTokenResponse,
  RequestWithUser,
  JwtPayload,
} from '../types/auth.types';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: { token: string },
  ): Promise<RefreshTokenResponse> {
    if (!body.token) {
      throw new Error('Token não fornecido');
    }
    return this.authService.refreshToken(body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-auth')
  @HttpCode(HttpStatus.OK)
  async checkAuth(@Request() req: RequestWithUser): Promise<LoginResponse> {
    // Obter o usuário autenticado
    const user = await this.authService.findUserById(req.user.id);
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    // Buscar o restaurante do usuário
    const restaurant = await this.authService.findRestaurantByUserId(user.id);
    
    // Gerar novos tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: restaurant?.id || null,
    };
    
    // Gerar token de acesso
    const access_token = this.jwtService.sign(payload);
    
    // Gerar token de atualização com validade maior
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });
    
    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      restaurant: restaurant
        ? {
            id: restaurant.id,
            name: restaurant.name,
            logo: restaurant.logo,
          }
        : null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // Verificar se as senhas coincidem
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      return {
        success: false,
        message: 'A nova senha e a confirmação não coincidem',
      };
    }

    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
