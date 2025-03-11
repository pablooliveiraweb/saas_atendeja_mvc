import { UserRole } from '../../users/entities/user.entity';
import { Request } from 'express';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    restaurantId: string | null;
    iat?: number;
    exp?: number;
}
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    restaurantId: string | null;
}
export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string;
}
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface RequestWithUser extends Request {
    user: AuthUser;
}
export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
    };
    restaurant: {
        id: string;
        name: string;
        logo?: string;
    } | null;
}
