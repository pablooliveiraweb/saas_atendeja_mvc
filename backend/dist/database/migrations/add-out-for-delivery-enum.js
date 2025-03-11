"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOutForDeliveryEnum1710037123000 = void 0;
class AddOutForDeliveryEnum1710037123000 {
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TYPE orders_status_enum ADD VALUE IF NOT EXISTS 'out_for_delivery' AFTER 'ready';
    `);
    }
    async down(queryRunner) {
        console.log('Down migration is not supported for removing enum values in PostgreSQL');
    }
}
exports.AddOutForDeliveryEnum1710037123000 = AddOutForDeliveryEnum1710037123000;
//# sourceMappingURL=add-out-for-delivery-enum.js.map