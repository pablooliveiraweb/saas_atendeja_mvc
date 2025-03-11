import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('test-auth')
export class TestAuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    // Simulação de autenticação
    if (email === 'admin@atende.com' && password === 'admin123') {
      const payload = { email };
      const token = this.jwtService.sign(payload);
      return { accessToken: token };
    } else {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }
}
