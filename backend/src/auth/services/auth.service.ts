import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import {
  AuthResponse,
  JwtPayload,
  RefreshTokenResponse,
  AuthUser,
  LoginResponse,
} from '../types/auth.types';
import * as bcrypt from 'bcrypt';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const user = this.userRepository.create(registerDto);
    await this.userRepository.save(user);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: null, // Usuário recém-registrado não tem restaurante
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        restaurantId: null, // Usuário recém-registrado não tem restaurante
      },
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'name', 'role'],
    });
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Buscar o restaurante do usuário
    const restaurant = await this.restaurantsRepository.findOne({
      where: { owner: { id: user.id } },
    });

    const restaurantId = restaurant?.id || null;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    try {
      const decoded = this.jwtService.verify(token) as JwtPayload;
      const payload: JwtPayload = {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        restaurantId: decoded.restaurantId,
      };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
