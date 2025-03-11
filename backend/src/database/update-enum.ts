import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function updateEnum() {
  try {
    console.log('Conectando ao banco de dados...');
    
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'atendeja',
      synchronize: false,
      logging: true
    });

    console.log('Conexão estabelecida. Adicionando novo valor ao enum...');

    // Adicionar novo valor ao enum orders_status_enum
    await connection.query(`
      ALTER TYPE orders_status_enum ADD VALUE IF NOT EXISTS 'out_for_delivery';
    `);

    console.log('Valor adicionado com sucesso!');
    await connection.close();
    console.log('Conexão fechada.');
  } catch (error) {
    console.error('Erro durante a atualização:', error);
  }
}

updateEnum()
  .then(() => console.log('Processo finalizado.'))
  .catch(error => console.error('Erro fatal:', error)); 