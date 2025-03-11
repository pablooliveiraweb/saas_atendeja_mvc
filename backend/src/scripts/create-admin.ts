import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // Verifica se já existe um usuário admin
    const existingAdmin = await userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      console.log('Usuário administrador já existe.');
      return;
    }

    // Cria o usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = userRepository.create({
      name: 'Administrador',
      email: 'admin@atende.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save(adminUser);
    console.log('Usuário administrador criado com sucesso!');
    console.log('Email: admin@atende.com');
    console.log('Senha: admin123');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro ao criar usuário administrador:', error.message);
    } else {
      console.error('Erro ao criar usuário administrador:', error);
    }
  } finally {
    await app.close();
  }
}

bootstrap();
