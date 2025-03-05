"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = require("bcrypt");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const userRepository = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        const existingUser = await userRepository.findOne({
            where: { email: 'admin@atende.com' },
        });
        if (existingUser) {
            console.log('Usuário de teste já existe! Atualizando a senha...');
            const hashedPassword = await bcrypt.hash('123456', 10);
            await userRepository.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, 'admin@atende.com']);
            console.log('Senha atualizada com sucesso!');
            console.log('Email: admin@atende.com');
            console.log('Senha: 123456');
            return;
        }
        const hashedPassword = await bcrypt.hash('123456', 10);
        await userRepository.query('INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt") VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, NOW(), NOW())', ['Administrador', 'admin@atende.com', hashedPassword, user_entity_1.UserRole.ADMIN, true]);
        console.log('Usuário de teste criado com sucesso!');
        console.log('Email: admin@atende.com');
        console.log('Senha: 123456');
    }
    catch (error) {
        console.error('Erro ao criar usuário de teste:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=create-test-user-fixed.js.map