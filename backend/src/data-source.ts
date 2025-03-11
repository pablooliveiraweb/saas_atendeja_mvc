import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Carregar configurações do arquivo .env
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'restaurantdb',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/**/migrations/*.ts'],
  synchronize: false,
  logging: true,
}); 