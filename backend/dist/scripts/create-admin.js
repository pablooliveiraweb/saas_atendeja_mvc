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
        const existingAdmin = await userRepository.findOne({
            where: { role: user_entity_1.UserRole.ADMIN },
        });
        if (existingAdmin) {
            console.log('Usuário administrador já existe.');
            return;
        }
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = userRepository.create({
            name: 'Administrador',
            email: 'admin@atende.com',
            password: hashedPassword,
            role: user_entity_1.UserRole.ADMIN,
            isActive: true,
        });
        await userRepository.save(adminUser);
        console.log('Usuário administrador criado com sucesso!');
        console.log('Email: admin@atende.com');
        console.log('Senha: admin123');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Erro ao criar usuário administrador:', error.message);
        }
        else {
            console.error('Erro ao criar usuário administrador:', error);
        }
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=create-admin.js.map