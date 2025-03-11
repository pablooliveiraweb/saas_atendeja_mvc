import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponse, LoginResponse, RefreshTokenResponse, RequestWithUser } from '../types/auth.types';
import { ChangePasswordDto } from '../dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<LoginResponse>;
    refreshToken(body: {
        token: string;
    }): Promise<RefreshTokenResponse>;
    changePassword(req: RequestWithUser, changePasswordDto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
