"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OpenAIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
const products_service_1 = require("../products/products.service");
const categories_service_1 = require("../categories/services/categories.service");
const restaurant_service_1 = require("../restaurants/restaurant.service");
const customers_service_1 = require("../customers/customers.service");
let OpenAIService = OpenAIService_1 = class OpenAIService {
    configService;
    productsService;
    categoriesService;
    restaurantService;
    customersService;
    logger = new common_1.Logger(OpenAIService_1.name);
    openai;
    constructor(configService, productsService, categoriesService, restaurantService, customersService) {
        this.configService = configService;
        this.productsService = productsService;
        this.categoriesService = categoriesService;
        this.restaurantService = restaurantService;
        this.customersService = customersService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY') || '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',
        });
    }
    async getAssistantResponse(restaurantId, userMessage, conversationHistory) {
        try {
            const restaurant = await this.restaurantService.findById(restaurantId);
            if (!restaurant) {
                throw new Error(`Restaurante não encontrado: ${restaurantId}`);
            }
            const products = await this.productsService.findAll(restaurantId);
            const categories = await this.categoriesService.findAll(restaurantId);
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
            let customerInfo = null;
            try {
                if (conversationHistory.length > 0) {
                    const customers = await this.customersService.findAll(restaurantId);
                    const customer = customers.find(c => c.phone && c.phone.includes(userMessage.split(' ')[0]));
                    if (customer) {
                        customerInfo = {
                            id: customer.id,
                            name: customer.name,
                            phone: customer.phone,
                            address: customer.address,
                            lastOrderDate: customer.updatedAt
                        };
                    }
                }
            }
            catch (error) {
                this.logger.warn(`Não foi possível obter informações do cliente: ${error.message}`);
            }
            let topSellingProducts = [];
            try {
                const products = await this.productsService.findTopSelling();
                topSellingProducts = products.slice(0, 5);
            }
            catch (error) {
                this.logger.warn(`Não foi possível obter produtos mais vendidos: ${error.message}`);
            }
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
${topSellingProducts.map((p, i) => `${i + 1}. ${p.name}`).join('\n')}` : ''}

INSTRUÇÕES ESPECÍFICAS:
- Quando o cliente perguntar sobre o cardápio ou produtos disponíveis, liste apenas os produtos relevantes sem mencionar as categorias, a menos que seja especificamente solicitado.
- Se o cliente perguntar sobre um produto específico, forneça detalhes sobre ele, incluindo preço e descrição.
- Se o cliente quiser fazer um pedido, oriente-o sobre os produtos disponíveis e como proceder.
- Se o cliente responder a uma notificação de status de pedido, reconheça que você enviou a notificação e responda de forma contextualizada.
- Se o cliente agradecer após uma notificação, responda de forma contextualizada, reconhecendo o motivo do agradecimento.
- Mantenha o contexto da conversa por até 24 horas, lembrando-se de interações anteriores.
- Sempre que possível, personalize a resposta usando o nome do cliente.`
            };
            const messages = [
                systemMessage,
                ...conversationHistory,
                { role: 'user', content: userMessage }
            ];
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: messages,
            });
            return completion.choices[0].message.content;
        }
        catch (error) {
            this.logger.error(`Erro ao obter resposta da OpenAI: ${error.message}`);
            throw error;
        }
    }
};
exports.OpenAIService = OpenAIService;
exports.OpenAIService = OpenAIService = OpenAIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        products_service_1.ProductsService,
        categories_service_1.CategoriesService,
        restaurant_service_1.RestaurantService,
        customers_service_1.CustomersService])
], OpenAIService);
//# sourceMappingURL=openai.service.js.map