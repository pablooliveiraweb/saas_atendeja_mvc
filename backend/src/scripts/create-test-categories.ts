import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Category } from '../categories/entities/category.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const entityManager = app.get(EntityManager);

    // Buscar o restaurante do usuário admin
    const restaurant = await entityManager.findOne(Restaurant, {
      where: { owner: { email: 'admin@atende.com' } },
      relations: ['owner'],
    });

    if (!restaurant) {
      console.error('Restaurante não encontrado. Por favor, crie o restaurante primeiro.');
      return;
    }

    console.log(`Restaurante encontrado: ${restaurant.name} (ID: ${restaurant.id})`);

    // Verificar se já existem categorias para este restaurante
    const existingCategories = await entityManager.find(Category, {
      where: { restaurant: { id: restaurant.id } },
    });

    if (existingCategories.length > 0) {
      console.log('O restaurante já possui categorias:');
      existingCategories.forEach((category) => {
        console.log(`- ${category.name} (ID: ${category.id})`);
      });
      return;
    }

    // Categorias para adicionar
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

    // Criar e salvar as categorias
    const savedCategories: Category[] = [];
    for (const categoryData of categoriesToAdd) {
      const category = new Category();
      category.name = categoryData.name;
      category.description = categoryData.description;
      category.order = categoryData.order;
      category.restaurant = restaurant;

      const savedCategory = await entityManager.save(Category, category);
      savedCategories.push(savedCategory);
    }

    console.log('Categorias criadas com sucesso:');
    savedCategories.forEach((category) => {
      console.log(`- ${category.name} (ID: ${category.id})`);
    });
  } catch (error) {
    console.error('Erro ao criar categorias de teste:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 