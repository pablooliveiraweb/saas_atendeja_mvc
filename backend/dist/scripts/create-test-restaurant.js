"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("typeorm");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const user_entity_1 = require("../users/entities/user.entity");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const entityManager = app.get(typeorm_1.EntityManager);
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
            return;
        }
        const restaurant = new restaurant_entity_1.Restaurant();
        restaurant.name = 'Restaurante Teste';
        restaurant.logo = 'https://via.placeholder.com/150';
        restaurant.description = 'Um restaurante de teste para desenvolvimento';
        restaurant.phone = '11999999999';
        restaurant.address = 'Rua Teste, 123';
        restaurant.neighborhood = 'Centro';
        restaurant.city = 'São Paulo';
        restaurant.state = 'SP';
        restaurant.postalCode = '01234567';
        restaurant.status = restaurant_entity_1.RestaurantStatus.ACTIVE;
        restaurant.subscriptionPlan = restaurant_entity_1.SubscriptionPlan.PREMIUM;
        restaurant.deliveryEnabled = true;
        restaurant.deliveryFee = 5.0;
        restaurant.minimumOrderValue = 20.0;
        restaurant.acceptsCash = true;
        restaurant.acceptsCard = true;
        restaurant.acceptsPix = true;
        restaurant.operatingHours = JSON.stringify({
            monday: { open: '08:00', close: '22:00' },
            tuesday: { open: '08:00', close: '22:00' },
            wednesday: { open: '08:00', close: '22:00' },
            thursday: { open: '08:00', close: '22:00' },
            friday: { open: '08:00', close: '23:00' },
            saturday: { open: '08:00', close: '23:00' },
            sunday: { open: '08:00', close: '20:00' },
        });
        restaurant.owner = adminUser;
        const savedRestaurant = await entityManager.save(restaurant_entity_1.Restaurant, restaurant);
        console.log('Restaurante criado com sucesso!');
        console.log(`Nome: ${savedRestaurant.name}`);
        console.log(`ID: ${savedRestaurant.id}`);
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