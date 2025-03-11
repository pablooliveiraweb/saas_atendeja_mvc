import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const dataSource = app.get(DataSource);
    
    console.log('Iniciando migração para adicionar campos da Evolution API à tabela de restaurantes...');
    
    // Verificar se as colunas já existem
    const hasEvolutionApiInstanceName = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' AND column_name = 'evolutionApiInstanceName'
    `);
    
    const hasEvolutionApiInstanceToken = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' AND column_name = 'evolutionApiInstanceToken'
    `);
    
    const hasEvolutionApiInstanceConnected = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' AND column_name = 'evolutionApiInstanceConnected'
    `);
    
    // Adicionar as colunas se não existirem
    if (hasEvolutionApiInstanceName.length === 0) {
      console.log('Adicionando coluna evolutionApiInstanceName...');
      await dataSource.query(`
        ALTER TABLE restaurants 
        ADD COLUMN "evolutionApiInstanceName" VARCHAR(255)
      `);
    } else {
      console.log('Coluna evolutionApiInstanceName já existe.');
    }
    
    if (hasEvolutionApiInstanceToken.length === 0) {
      console.log('Adicionando coluna evolutionApiInstanceToken...');
      await dataSource.query(`
        ALTER TABLE restaurants 
        ADD COLUMN "evolutionApiInstanceToken" VARCHAR(255)
      `);
    } else {
      console.log('Coluna evolutionApiInstanceToken já existe.');
    }
    
    if (hasEvolutionApiInstanceConnected.length === 0) {
      console.log('Adicionando coluna evolutionApiInstanceConnected...');
      await dataSource.query(`
        ALTER TABLE restaurants 
        ADD COLUMN "evolutionApiInstanceConnected" BOOLEAN DEFAULT FALSE
      `);
    } else {
      console.log('Coluna evolutionApiInstanceConnected já existe.');
    }
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 