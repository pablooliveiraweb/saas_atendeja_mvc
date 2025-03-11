import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class PublicOrAuthGuard implements CanActivate {
  private jwtAuthGuard: JwtAuthGuard;

  constructor(private reflector: Reflector) {
    this.jwtAuthGuard = new JwtAuthGuard(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Tenta autenticar com JWT
    try {
      const result = await this.jwtAuthGuard.canActivate(context);
      return result instanceof Observable ? await firstValueFrom(result) : result;
    } catch (error) {
      // Se a autenticação falhar, permite acesso público
      return true;
    }
  }
} 