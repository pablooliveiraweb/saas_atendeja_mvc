import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/services/categories.service';
import { RestaurantService } from '../restaurants/restaurant.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;
  
  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private restaurantService: RestaurantService,
    private customersService: CustomersService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') || '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',
    });
  }

  async getAssistantResponse(
    restaurantId: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  ) {
    try {
      // Buscar informações do restaurante
      const restaurant = await this.restaurantService.findById(restaurantId);
      
      if (!restaurant) {
        throw new Error(`Restaurante não encontrado: ${restaurantId}`);
      }
      
      // Buscar produtos do restaurante
      const products = await this.productsService.findAll(restaurantId);
      
      // Buscar categorias do restaurante
      const categories = await this.categoriesService.findAll(restaurantId);
      
      // Preparar o contexto para o assistente
      const restaurantContext = {
        name: restaurant.name,
        description: restaurant.description,
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category?.name || 'Sem categoria',
        })),
        categories: categories.map(c => ({
          id: c.id,
          name: c.name,
        })),
      };
      
      // Buscar informações do cliente se disponível
      let customerInfo: { 
        id: string; 
        name: string; 
        phone: string; 
        address?: string; 
        lastOrderDate?: Date 
      } | null = null;
      
      try {
        if (conversationHistory.length > 0) {
          // Tentar encontrar o cliente pelo telefone
          const customers = await this.customersService.findAll(restaurantId);
          const customer = customers.find(c => c.phone && c.phone.includes(userMessage.split(' ')[0]));
          if (customer) {
            customerInfo = {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              // Usar a propriedade correta para a data do último pedido, se disponível
              lastOrderDate: customer.updatedAt
            };
          }
        }
      } catch (error) {
        this.logger.warn(`Não foi possível obter informações do cliente: ${error.message}`);
      }
      
      // Buscar produtos mais vendidos
      let topSellingProducts: Array<{ id: string; name: string; total?: number }> = [];
      try {
        const products = await this.productsService.findTopSelling();
        topSellingProducts = products.slice(0, 5); // Limitar aos 5 mais vendidos
      } catch (error) {
        this.logger.warn(`Não foi possível obter produtos mais vendidos: ${error.message}`);
      }
      
      // Criar a mensagem do sistema com o contexto do restaurante
      const systemMessage = {
        role: 'system',
        content: `Você é um assistente virtual amigável e atencioso do restaurante ${restaurant.name}.

DIRETRIZES GERAIS:
- Seja sempre cordial, empático e natural em suas respostas, como um atendente humano.
- Use linguagem informal e amigável, mas profissional.
- Mantenha suas respostas concisas e diretas, evitando textos muito longos.
- Responda sempre em português brasileiro.
- Lembre-se do contexto da conversa e das interações anteriores.
- Quando o cliente perguntar sobre produtos, foque apenas nos produtos sem mencionar categorias, a menos que seja especificamente solicitado.
- Se o cliente perguntar recomendações, sugira os produtos mais vendidos.
- Trate o cliente pelo nome quando identificado.
- Seja consistente com notificações anteriores - se você notificou sobre um pedido, lembre-se disso ao responder perguntas relacionadas.

INFORMAÇÕES DO RESTAURANTE:
${JSON.stringify(restaurantContext)}

${customerInfo ? `INFORMAÇÕES DO CLIENTE:
Nome: ${customerInfo.name}
Telefone: ${customerInfo.phone}
Endereço: ${customerInfo.address || 'Não informado'}
Último pedido: ${customerInfo.lastOrderDate ? new Date(customerInfo.lastOrderDate).toLocaleDateString('pt-BR') : 'Não informado'}` : ''}

${topSellingProducts.length > 0 ? `PRODUTOS MAIS VENDIDOS:
${topSellingProducts.map((p, i) => `${i+1}. ${p.name}`).join('\n')}` : ''}

INSTRUÇÕES ESPECÍFICAS:
- Quando o cliente perguntar sobre o cardápio ou produtos disponíveis, liste apenas os produtos relevantes sem mencionar as categorias, a menos que seja especificamente solicitado.
- Se o cliente perguntar sobre um produto específico, forneça detalhes sobre ele, incluindo preço e descrição.
- Se o cliente quiser fazer um pedido, oriente-o sobre os produtos disponíveis e como proceder.
- Se o cliente responder a uma notificação de status de pedido, reconheça que você enviou a notificação e responda de forma contextualizada.
- Se o cliente agradecer após uma notificação, responda de forma contextualizada, reconhecendo o motivo do agradecimento.
- Mantenha o contexto da conversa por até 24 horas, lembrando-se de interações anteriores.
- Sempre que possível, personalize a resposta usando o nome do cliente.`
      };
      
      // Combinar histórico da conversa com a nova mensagem
      const messages = [
        systemMessage,
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];
      
      // Chamar a API da OpenAI
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      this.logger.error(`Erro ao obter resposta da OpenAI: ${error.message}`);
      throw error;
    }
  }
} 