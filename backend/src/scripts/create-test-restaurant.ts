import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager } from 'typeorm';
import { Restaurant, RestaurantStatus, SubscriptionPlan } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const entityManager = app.get(EntityManager);

    // Buscar o usuário admin
    const adminUser = await entityManager.findOne(User, {
      where: { email: 'admin@atende.com' },
    });

    if (!adminUser) {
      console.error('Usuário admin não encontrado. Por favor, crie o usuário admin primeiro.');
      return;
    }

    // Verificar se o usuário já tem um restaurante
    const existingRestaurant = await entityManager.findOne(Restaurant, {
      where: { owner: { id: adminUser.id } },
    });

    if (existingRestaurant) {
      console.log('O usuário admin já possui um restaurante:');
      console.log(`Nome: ${existingRestaurant.name}`);
      console.log(`ID: ${existingRestaurant.id}`);
      return;
    }

    // Criar um novo restaurante
    const restaurant = new Restaurant();
    restaurant.name = 'Restaurante Teste';
    restaurant.logo = 'https://via.placeholder.com/150';
    restaurant.description = 'Um restaurante de teste para desenvolvimento';
    restaurant.phone = '11999999999';
    restaurant.address = 'Rua Teste, 123';
    restaurant.neighborhood = 'Centro';
    restaurant.city = 'São Paulo';
    restaurant.state = 'SP';
    restaurant.postalCode = '01234567';
    restaurant.status = RestaurantStatus.ACTIVE;
    restaurant.subscriptionPlan = SubscriptionPlan.PREMIUM;
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

    // Salvar o restaurante
    const savedRestaurant = await entityManager.save(Restaurant, restaurant);

    console.log('Restaurante criado com sucesso!');
    console.log(`Nome: ${savedRestaurant.name}`);
    console.log(`ID: ${savedRestaurant.id}`);
  } catch (error) {
    console.error('Erro ao criar restaurante de teste:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 