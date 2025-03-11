"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("typeorm");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const category_entity_1 = require("../categories/entities/category.entity");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const entityManager = app.get(typeorm_1.EntityManager);
        const restaurant = await entityManager.findOne(restaurant_entity_1.Restaurant, {
            where: { owner: { email: 'admin@atende.com' } },
            relations: ['owner'],
        });
        if (!restaurant) {
            console.error('Restaurante não encontrado. Por favor, crie o restaurante primeiro.');
            return;
        }
        console.log(`Restaurante encontrado: ${restaurant.name} (ID: ${restaurant.id})`);
        const existingCategories = await entityManager.find(category_entity_1.Category, {
            where: { restaurant: { id: restaurant.id } },
        });
        if (existingCategories.length > 0) {
            console.log('O restaurante já possui categorias:');
            existingCategories.forEach((category) => {
                console.log(`- ${category.name} (ID: ${category.id})`);
            });
            return;
        }
        const categoriesToAdd = [
            {
                name: 'Entradas',
                description: 'Pratos para começar sua refeição',
                order: 1,
            },
            {
                name: 'Pratos Principais',
                description: 'Nossos pratos mais populares',
                order: 2,
            },
            {
                name: 'Sobremesas',
                description: 'Opções doces para finalizar',
                order: 3,
            },
            {
                name: 'Bebidas',
                description: 'Refrigerantes, sucos e outras bebidas',
                order: 4,
            },
        ];
        const savedCategories = [];
        for (const categoryData of categoriesToAdd) {
            const category = new category_entity_1.Category();
            category.name = categoryData.name;
            category.description = categoryData.description;
            category.order = categoryData.order;
            category.restaurant = restaurant;
            const savedCategory = await entityManager.save(category_entity_1.Category, category);
            savedCategories.push(savedCategory);
        }
        console.log('Categorias criadas com sucesso:');
        savedCategories.forEach((category) => {
            console.log(`- ${category.name} (ID: ${category.id})`);
        });
    }
    catch (error) {
        console.error('Erro ao criar categorias de teste:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=create-test-categories.js.map