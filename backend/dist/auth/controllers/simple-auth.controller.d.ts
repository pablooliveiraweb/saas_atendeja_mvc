import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
export declare class SimpleAuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<import("../types/auth.types").LoginResponse>;
}
