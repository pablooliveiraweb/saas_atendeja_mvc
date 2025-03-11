"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPendingWhatsappStatus1741564654023 = void 0;
class AddPendingWhatsappStatus1741564654023 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TYPE "restaurants_status_enum" ADD VALUE 'pending_whatsapp' AFTER 'pending'
        `);
    }
    async down(queryRunner) {
        console.log('Aviso: O valor pending_whatsapp permanecerá no enum, pois não é possível remover valores de enums no PostgreSQL diretamente.');
    }
}
exports.AddPendingWhatsappStatus1741564654023 = AddPendingWhatsappStatus1741564654023;
//# sourceMappingURL=1741564654023-AddPendingWhatsappStatus.js.map