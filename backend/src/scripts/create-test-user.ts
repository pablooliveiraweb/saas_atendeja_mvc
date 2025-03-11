import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // Verificar se o usuário já existe
    const existingUser = await userRepository.findOne({
      where: { email: 'admin@atende.com' },
    });

    if (existingUser) {
      console.log('Usuário de teste já existe!');
      return;
    }

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = userRepository.create({
      name: 'Administrador',
      email: 'admin@atende.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save(user);
    console.log('Usuário de teste criado com sucesso!');
    console.log('Email: admin@atende.com');
    console.log('Senha: 123456');

  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 