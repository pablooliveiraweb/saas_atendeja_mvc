import { JwtService } from '@nestjs/jwt';
export declare class TestAuthController {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
    }>;
}
