import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutForDeliveryEnum1710037123000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar novo valor ao enum orders_status_enum
    await queryRunner.query(`
      ALTER TYPE orders_status_enum ADD VALUE IF NOT EXISTS 'out_for_delivery' AFTER 'ready';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não é possível remover valores de enum no PostgreSQL de forma simples
    // Se necessário, precisaria recriar o tipo enum e atualizar todas as tabelas
    console.log('Down migration is not supported for removing enum values in PostgreSQL');
  }
} 