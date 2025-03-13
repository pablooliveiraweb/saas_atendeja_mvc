import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { TypeOrmModule } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Configuração de segurança
  app.use(helmet());
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  // Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Prefixo da API
  const apiPrefix = configService.get<string>('PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);
  
  // Iniciar servidor
  const port = configService.get<number>('PORT') || 3001;
  const host = configService.get<string>('HOST') || 'localhost';
  
  // Configurar a URL base da API para uso no interceptor
  const apiUrl = configService.get<string>('API_URL') || `http://${host}:${port}`;
  process.env.API_URL = apiUrl;
  
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicação rodando na porta ${port}`);
  console.log(`API disponível em: ${apiUrl}/${apiPrefix}`);
}

bootstrap();
