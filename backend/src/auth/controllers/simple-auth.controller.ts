import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class SimpleAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('simple-login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    console.log('Tentando fazer login com:', loginDto);
    const result = await this.authService.login(loginDto);
    console.log('Resultado do login:', result);
    return result;
  }
}
