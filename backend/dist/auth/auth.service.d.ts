import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private restaurantsRepository;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, restaurantsRepository: Repository<Restaurant>);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
        };
        restaurant: {
            id: string;
            name: string;
            logo: string;
        } | null;
    }>;
}
