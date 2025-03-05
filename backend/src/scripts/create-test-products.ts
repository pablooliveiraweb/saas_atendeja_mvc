import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const entityManager = app.get(EntityManager);

    // Buscar o restaurante do usuário admin
    const restaurant = await entityManager.findOne(Restaurant, {
      where: { owner: { email: 'admin@atende.com' } },
    });

    if (!restaurant) {
      console.error('Restaurante não encontrado. Por favor, crie o restaurante primeiro.');
      return;
    }

    console.log(`Restaurante encontrado: ${restaurant.name} (ID: ${restaurant.id})`);

    // Buscar as categorias do restaurante
    const categories = await entityManager.find(Category, {
      where: { restaurant: { id: restaurant.id } },
    });

    if (categories.length === 0) {
      console.error('Nenhuma categoria encontrada. Por favor, crie as categorias primeiro.');
      return;
    }

    console.log(`Encontradas ${categories.length} categorias.`);

    // Verificar se já existem produtos para este restaurante
    const existingProducts = await entityManager.find(Product, {
      where: { restaurant: { id: restaurant.id } },
    });

    if (existingProducts.length > 0) {
      console.log('O restaurante já possui produtos:');
      existingProducts.forEach((product) => {
        console.log(`- ${product.name} (ID: ${product.id})`);
      });
      return;
    }

    // Mapear categorias por nome para facilitar a referência
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category.name] = category;
    });

    // Produtos para adicionar
    const productsToAdd = [
      // Entradas
      {
        name: 'Bruschetta',
        description: 'Fatias de pão italiano com tomate, alho e manjericão',
        price: 18.90,
        category: categoryMap['Entradas'],
      },
      {
        name: 'Batata Frita',
        description: 'Porção de batatas fritas crocantes',
        price: 15.90,
        category: categoryMap['Entradas'],
      },
      {
        name: 'Bolinho de Bacalhau',
        description: 'Porção com 6 unidades',
        price: 24.90,
        category: categoryMap['Entradas'],
      },
      
      // Pratos Principais
      {
        name: 'Filé Mignon',
        description: 'Filé mignon grelhado com molho de vinho tinto, acompanha arroz e batatas',
        price: 59.90,
        category: categoryMap['Pratos Principais'],
      },
      {
        name: 'Salmão Grelhado',
        description: 'Filé de salmão grelhado com ervas, acompanha legumes e purê de batata',
        price: 65.90,
        category: categoryMap['Pratos Principais'],
      },
      {
        name: 'Risoto de Funghi',
        description: 'Risoto cremoso com mix de cogumelos e parmesão',
        price: 48.90,
        category: categoryMap['Pratos Principais'],
      },
      
      // Sobremesas
      {
        name: 'Pudim de Leite',
        description: 'Pudim de leite condensado com calda de caramelo',
        price: 12.90,
        category: categoryMap['Sobremesas'],
      },
      {
        name: 'Petit Gateau',
        description: 'Bolo de chocolate com centro derretido, acompanha sorvete de creme',
        price: 18.90,
        category: categoryMap['Sobremesas'],
      },
      {
        name: 'Cheesecake',
        description: 'Cheesecake com calda de frutas vermelhas',
        price: 16.90,
        category: categoryMap['Sobremesas'],
      },
      
      // Bebidas
      {
        name: 'Refrigerante',
        description: 'Lata 350ml (Coca-Cola, Guaraná, Sprite)',
        price: 6.90,
        category: categoryMap['Bebidas'],
      },
      {
        name: 'Suco Natural',
        description: 'Copo 300ml (Laranja, Limão, Abacaxi)',
        price: 9.90,
        category: categoryMap['Bebidas'],
      },
      {
        name: 'Água Mineral',
        description: 'Garrafa 500ml (com ou sem gás)',
        price: 4.90,
        category: categoryMap['Bebidas'],
      },
    ];

    // Criar e salvar os produtos
    const savedProducts: Product[] = [];
    for (const productData of productsToAdd) {
      const product = new Product();
      product.name = productData.name;
      product.description = productData.description;
      product.price = productData.price;
      product.category = productData.category;
      product.restaurant = restaurant;
      product.image = 'https://via.placeholder.com/300';

      const savedProduct = await entityManager.save(Product, product);
      savedProducts.push(savedProduct);
    }

    console.log(`${savedProducts.length} produtos criados com sucesso!`);
    
    // Agrupar produtos por categoria para exibição
    const productsByCategory: Record<string, Product[]> = {};
    savedProducts.forEach(product => {
      const categoryName = product.category.name;
      if (!productsByCategory[categoryName]) {
        productsByCategory[categoryName] = [];
      }
      productsByCategory[categoryName].push(product);
    });

    // Exibir produtos por categoria
    Object.keys(productsByCategory).forEach(categoryName => {
      console.log(`\nCategoria: ${categoryName}`);
      productsByCategory[categoryName].forEach(product => {
        console.log(`- ${product.name}: R$ ${product.price} (ID: ${product.id})`);
      });
    });
  } catch (error) {
    console.error('Erro ao criar produtos de teste:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 