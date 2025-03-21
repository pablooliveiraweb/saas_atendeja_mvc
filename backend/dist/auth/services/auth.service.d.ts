import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponse, RefreshTokenResponse, LoginResponse } from '../types/auth.types';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly restaurantsRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, restaurantsRepository: Repository<Restaurant>);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<LoginResponse>;
    refreshToken(token: string): Promise<RefreshTokenResponse>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findUserById(id: string): Promise<User | null>;
    findRestaurantByUserId(userId: string): Promise<Restaurant | null>;
}
