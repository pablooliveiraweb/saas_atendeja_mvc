"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        console.log('Iniciando migração para adicionar campos da Evolution API à tabela de restaurantes...');
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
        if (hasEvolutionApiInstanceName.length === 0) {
            console.log('Adicionando coluna evolutionApiInstanceName...');
            await dataSource.query(`
        ALTER TABLE restaurants 
        ADD COLUMN "evolutionApiInstanceName" VARCHAR(255)
      `);
        }
        else {
            console.log('Coluna evolutionApiInstanceName já existe.');
        }
        if (hasEvolutionApiInstanceToken.length === 0) {
            console.log('Adicionando coluna evolutionApiInstanceToken...');
            await dataSource.query(`
        ALTER TABLE restaurants 
        ADD COLUMN "evolutionApiInstanceToken" VARCHAR(255)
      `);
        }
        else {
            console.log('Coluna evolutionApiInstanceToken já existe.');
        }
        if (hasEvolutionApiInstanceConnected.length === 0) {
            console.log('Adicionando coluna evolutionApiInstanceConnected...');
            await dataSource.query(`
        ALTER TABLE restaurants 
        ADD COLUMN "evolutionApiInstanceConnected" BOOLEAN DEFAULT FALSE
      `);
        }
        else {
            console.log('Coluna evolutionApiInstanceConnected já existe.');
        }
        console.log('Migração concluída com sucesso!');
    }
    catch (error) {
        console.error('Erro durante a migração:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=migration-add-evolution-api-fields.js.map