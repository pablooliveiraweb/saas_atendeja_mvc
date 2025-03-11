import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPendingWhatsappStatus1741564654023 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionando o valor 'pending_whatsapp' ao enum restaurants_status_enum
        await queryRunner.query(`
            ALTER TYPE "restaurants_status_enum" ADD VALUE 'pending_whatsapp' AFTER 'pending'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Não podemos remover valores de um enum no PostgreSQL facilmente
        // A alternativa é recriar o enum, mas como isso pode ser complexo e arriscado,
        // deixamos essa parte vazia para evitar problemas.
        // Em caso de rollback, o valor permanecerá no enum, mas não será usado.
        console.log('Aviso: O valor pending_whatsapp permanecerá no enum, pois não é possível remover valores de enums no PostgreSQL diretamente.');
    }

}
