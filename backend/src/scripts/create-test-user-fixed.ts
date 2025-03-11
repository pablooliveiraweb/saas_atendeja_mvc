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
      console.log('Usuário de teste já existe! Atualizando a senha...');
      
      // Atualizar a senha diretamente no banco de dados para evitar o hash duplo
      const hashedPassword = await bcrypt.hash('123456', 10);
      await userRepository.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, 'admin@atende.com']
      );
      
      console.log('Senha atualizada com sucesso!');
      console.log('Email: admin@atende.com');
      console.log('Senha: 123456');
      return;
    }

    // Criar usuário de teste diretamente no banco de dados para evitar o hash duplo
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Criar o usuário usando uma query SQL direta para evitar os hooks @BeforeInsert
    await userRepository.query(
      'INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt") VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, NOW(), NOW())',
      ['Administrador', 'admin@atende.com', hashedPassword, UserRole.ADMIN, true]
    );

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