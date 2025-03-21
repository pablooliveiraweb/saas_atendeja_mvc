"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const apiPrefix = configService.get('PREFIX') || 'api';
    app.setGlobalPrefix(apiPrefix);
    const port = configService.get('PORT') || 3001;
    const host = configService.get('HOST') || 'localhost';
    const apiUrl = configService.get('API_URL') || `http://${host}:${port}`;
    process.env.API_URL = apiUrl;
    await app.listen(port, '0.0.0.0');
    console.log(`Aplicação rodando na porta ${port}`);
    console.log(`API disponível em: ${apiUrl}/${apiPrefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map