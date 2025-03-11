import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager } from 'typeorm';
import { Restaurant, RestaurantStatus, SubscriptionPlan } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { RestaurantService } from '../restaurants/restaurant.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const entityManager = app.get(EntityManager);
    const restaurantService = app.get(RestaurantService);

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
      console.log(`Instância WhatsApp: ${existingRestaurant.evolutionApiInstanceName || 'Não configurada'}`);
      return;
    }

    // Criar um novo restaurante usando o serviço
    const restaurantData: Partial<Restaurant> = {
      name: 'Restaurante Teste',
      logo: 'https://via.placeholder.com/150',
      description: 'Um restaurante de teste para desenvolvimento',
      phone: '11999999999',
      address: 'Rua Teste, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01234567',
      status: RestaurantStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.PREMIUM,
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

    // Salvar o restaurante usando o serviço
    const savedRestaurant = await restaurantService.create(restaurantData, adminUser);

    console.log('Restaurante criado com sucesso!');
    console.log(`Nome: ${savedRestaurant.name}`);
    console.log(`ID: ${savedRestaurant.id}`);
    console.log(`Instância WhatsApp: ${savedRestaurant.evolutionApiInstanceName || 'Não configurada'}`);
    
    // Tentar conectar a instância do WhatsApp
    if (savedRestaurant.evolutionApiInstanceName) {
      try {
        console.log(`Conectando instância do WhatsApp: ${savedRestaurant.evolutionApiInstanceName}`);
        await restaurantService.connectWhatsAppInstance(savedRestaurant.id);
        console.log('Instância conectada com sucesso!');
      } catch (error) {
        console.error(`Erro ao conectar instância: ${error.message}`);
        console.log('Para conectar manualmente, acesse o endpoint: POST /restaurants/:id/whatsapp/connect');
      }
    }
  } catch (error) {
    console.error('Erro ao criar restaurante de teste:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 