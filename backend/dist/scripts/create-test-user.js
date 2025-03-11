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
            console.log('Usuário de teste já existe!');
            return;
        }
        const hashedPassword = await bcrypt.hash('123456', 10);
        const user = userRepository.create({
            name: 'Administrador',
            email: 'admin@atende.com',
            password: hashedPassword,
            role: user_entity_1.UserRole.ADMIN,
            isActive: true,
        });
        await userRepository.save(user);
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
//# sourceMappingURL=create-test-user.js.map