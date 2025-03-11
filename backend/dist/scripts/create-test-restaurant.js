"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("typeorm");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const user_entity_1 = require("../users/entities/user.entity");
const restaurant_service_1 = require("../restaurants/restaurant.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const entityManager = app.get(typeorm_1.EntityManager);
        const restaurantService = app.get(restaurant_service_1.RestaurantService);
        const adminUser = await entityManager.findOne(user_entity_1.User, {
            where: { email: 'admin@atende.com' },
        });
        if (!adminUser) {
            console.error('Usuário admin não encontrado. Por favor, crie o usuário admin primeiro.');
            return;
        }
        const existingRestaurant = await entityManager.findOne(restaurant_entity_1.Restaurant, {
            where: { owner: { id: adminUser.id } },
        });
        if (existingRestaurant) {
            console.log('O usuário admin já possui um restaurante:');
            console.log(`Nome: ${existingRestaurant.name}`);
            console.log(`ID: ${existingRestaurant.id}`);
            console.log(`Instância WhatsApp: ${existingRestaurant.evolutionApiInstanceName || 'Não configurada'}`);
            return;
        }
        const restaurantData = {
            name: 'Restaurante Teste',
            logo: 'https://via.placeholder.com/150',
            description: 'Um restaurante de teste para desenvolvimento',
            phone: '11999999999',
            address: 'Rua Teste, 123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '01234567',
            status: restaurant_entity_1.RestaurantStatus.ACTIVE,
            subscriptionPlan: restaurant_entity_1.SubscriptionPlan.PREMIUM,
            deliveryEnabled: true,
            deliveryFee: 5.0,
            minimumOrderValue: 20.0,
            acceptsCash: true,
            acceptsCard: true,
            acceptsPix: true,
            operatingHours: JSON.stringify({
                monday: { open: '08:00', close: '22:00' },
                tuesday: { open: '08:00', close: '22:00' },
                wednesday: { open: '08:00', close: '22:00' },
                thursday: { open: '08:00', close: '22:00' },
                friday: { open: '08:00', close: '23:00' },
                saturday: { open: '08:00', close: '23:00' },
                sunday: { open: '08:00', close: '20:00' },
            }),
            whatsappNumber: '11999999999',
            whatsappNotificationsEnabled: true,
        };
        const savedRestaurant = await restaurantService.create(restaurantData, adminUser);
        console.log('Restaurante criado com sucesso!');
        console.log(`Nome: ${savedRestaurant.name}`);
        console.log(`ID: ${savedRestaurant.id}`);
        console.log(`Instância WhatsApp: ${savedRestaurant.evolutionApiInstanceName || 'Não configurada'}`);
        if (savedRestaurant.evolutionApiInstanceName) {
            try {
                console.log(`Conectando instância do WhatsApp: ${savedRestaurant.evolutionApiInstanceName}`);
                await restaurantService.connectWhatsAppInstance(savedRestaurant.id);
                console.log('Instância conectada com sucesso!');
            }
            catch (error) {
                console.error(`Erro ao conectar instância: ${error.message}`);
                console.log('Para conectar manualmente, acesse o endpoint: POST /restaurants/:id/whatsapp/connect');
            }
        }
    }
    catch (error) {
        console.error('Erro ao criar restaurante de teste:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=create-test-restaurant.js.map