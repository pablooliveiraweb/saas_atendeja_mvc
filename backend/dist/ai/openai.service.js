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
const orders_service_1 = require("../orders/orders.service");
let OpenAIService = OpenAIService_1 = class OpenAIService {
    configService;
    productsService;
    categoriesService;
    restaurantService;
    customersService;
    ordersService;
    logger = new common_1.Logger(OpenAIService_1.name);
    openai;
    constructor(configService, productsService, categoriesService, restaurantService, customersService, ordersService) {
        this.configService = configService;
        this.productsService = productsService;
        this.categoriesService = categoriesService;
        this.restaurantService = restaurantService;
        this.customersService = customersService;
        this.ordersService = ordersService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY') || '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',
        });
    }
    async getAssistantResponse(restaurantId, userMessage, conversationHistory, phoneNumber) {
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
                if (phoneNumber) {
                    this.logger.log(`Buscando cliente pelo número de telefone: ${phoneNumber}`);
                    try {
                        const customer = await this.customersService.findByPhone(phoneNumber, restaurantId);
                        if (customer) {
                            this.logger.log(`Cliente encontrado: ${customer.name} (ID: ${customer.id})`);
                            let customerOrders = [];
                            try {
                                customerOrders = await this.ordersService.findByCustomerPhone(customer.phone);
                            }
                            catch (error) {
                                this.logger.warn(`Não foi possível obter os pedidos do cliente: ${error.message}`);
                            }
                            customerInfo = {
                                id: customer.id,
                                name: customer.name,
                                phone: customer.phone,
                                address: customer.address,
                                lastOrderDate: customer.updatedAt,
                                orders: customerOrders.map(order => ({
                                    id: order.id,
                                    createdAt: order.createdAt,
                                    status: order.status,
                                    total: order.total,
                                    notes: order.notes,
                                    items: order.orderItems ? order.orderItems.map(item => ({
                                        quantity: item.quantity,
                                        product: {
                                            name: item.product ? item.product.name : 'Produto não disponível',
                                            price: item.unitPrice
                                        },
                                        notes: item.notes
                                    })) : []
                                }))
                            };
                        }
                    }
                    catch (error) {
                        this.logger.warn(`Cliente não encontrado pelo número ${phoneNumber}: ${error.message}`);
                    }
                }
                if (!customerInfo && conversationHistory.length > 0) {
                    this.logger.log('Tentando método alternativo para identificar o cliente...');
                    const customers = await this.customersService.findAll(restaurantId);
                    const customer = customers.find(c => c.phone && (phoneNumber ? c.phone.includes(phoneNumber) : c.phone.includes(userMessage.split(' ')[0])));
                    if (customer) {
                        this.logger.log(`Cliente encontrado pelo método alternativo: ${customer.name}`);
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
- Se o cliente perguntar sobre pedidos anteriores, forneça as informações disponíveis sobre seus últimos pedidos.

REGRAS DE ATENDIMENTO:
1. Se o cliente perguntar sobre o cardápio ou os preços:
   - Envie o link do cardápio digital
   - Explique que todas as opções e preços estão disponíveis no cardápio digital
   - Exemplo: "Claro! Vou enviar o link do nosso cardápio digital para você. Lá você encontrará todos os nossos produtos com preços e descrições. Tem algum prato específico que gostaria de saber mais?"

2. Se o cliente perguntar diretamente sobre um produto específico:
   - Responda com detalhes sobre o produto, incluindo preço e descrição se disponíveis
   - Exemplo: "O {nomeProduto} custa R$ {precoProduto}. {descricaoProduto}. Posso ajudar com mais alguma coisa?"

3. Se o cliente quiser fazer um pedido:
   - Envie o link do cardápio digital e oriente como fazer o pedido
   - Exemplo: "Para fazer seu pedido, você pode acessar nosso cardápio digital através deste link. Lá você pode escolher os produtos e finalizar seu pedido facilmente."

4. Se o cliente agradecer ou elogiar o atendimento:
   - Agradeça de forma simpática e ofereça ajuda adicional
   - Exemplo: "De nada! Fico feliz em ajudar. Se precisar de mais alguma coisa, é só chamar! 😄"

5. Se o cliente estiver insatisfeito ou fizer uma reclamação:
   - Demonstre empatia e ofereça ajuda para resolver o problema
   - Exemplo: "Sinto muito por isso. Vou verificar o que aconteceu e ajudar a resolver essa situação o mais rápido possível. Pode me dar mais detalhes para que eu possa te ajudar melhor?"

6. Se o cliente perguntar sobre horários de funcionamento, localização ou formas de pagamento:
   - Forneça as informações precisas sobre o restaurante
   - Exemplo: "Nosso horário de funcionamento é de {horarioFuncionamento}. Estamos localizados em {enderecoRestaurante}. Aceitamos {formasPagamento}."

7. Se o cliente disser algo inesperado ou sem contexto:
   - Responda de forma educada e tente direcionar a conversa para o atendimento
   - Exemplo: "Entendo. Como posso ajudar você com nossos produtos ou serviços hoje?"

8. Se o cliente pedir o cardápio:
   - Envie o link do cardápio digital
   - Exemplo: "Claro! Aqui está o link do nosso cardápio digital. Lá você encontrará todos os nossos produtos com preços e descrições."

9. Se o cliente perguntar sobre seus pedidos anteriores:
   - Forneça informações detalhadas sobre os últimos pedidos, incluindo itens, valores e datas
   - Se o cliente perguntar sobre um pedido específico, forneça os detalhes desse pedido
   - Se o cliente quiser repetir um pedido anterior, oriente-o a acessar o cardápio digital e fazer o pedido
   - Exemplo: "Vejo que seu último pedido foi em {dataUltimoPedido}. Você pediu {itensPedido}. Gostaria de fazer um pedido semelhante? Posso enviar o link do cardápio para você."

10. Se o cliente perguntar "o que eu pedi da última vez" ou algo similar:
    - Forneça os detalhes do último pedido, incluindo os itens, quantidades e valor total
    - Seja específico sobre os itens pedidos, incluindo as quantidades e valores
    - Exemplo: "Na última vez, em {dataUltimoPedido}, você pediu {itensPedido}, totalizando R$ {valorTotal}. Gostaria de fazer o mesmo pedido novamente?"

11. Se o cliente perguntar "qual foi meu último pedido" ou "o que eu pedi antes":
    - Verifique se há informações de pedidos anteriores
    - Se houver, forneça detalhes completos do último pedido, incluindo data, itens, quantidades e valor
    - Se não houver informações de pedidos anteriores, informe educadamente e ofereça ajuda para fazer um novo pedido
    - Exemplo com pedido: "Seu último pedido foi em {dataUltimoPedido}. Você pediu {quantidadeItem}x {nomeItem} por R$ {valorItem} cada, totalizando R$ {valorTotal}. Gostaria de repetir este pedido?"
    - Exemplo sem pedido: "Não encontrei registros de pedidos anteriores associados ao seu número. Posso ajudar você a fazer um novo pedido? Gostaria de ver nosso cardápio?"

INFORMAÇÕES DO RESTAURANTE:
${JSON.stringify(restaurantContext)}

${customerInfo ? `INFORMAÇÕES DO CLIENTE:
Nome: ${customerInfo.name}
Telefone: ${customerInfo.phone}
Endereço: ${customerInfo.address || 'Não informado'}
Último pedido: ${customerInfo.lastOrderDate ? new Date(customerInfo.lastOrderDate).toLocaleDateString('pt-BR') : 'Não informado'}
${customerInfo.orders && customerInfo.orders.length > 0 ? `
PEDIDOS RECENTES:
${customerInfo.orders.map((order, i) => `Pedido ${i + 1}: Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')} - Status: ${order.status} - Valor: R$ ${parseFloat(order.total.toString()).toFixed(2)}
   ${order.notes ? `Observações: ${order.notes}` : ''}
   Itens: ${order.items.map(item => `${item.quantity}x ${item.product.name} (R$ ${parseFloat(item.product.price.toString()).toFixed(2)})`).join(', ')}`).join('\n')}` : ''}` : ''}

${topSellingProducts.length > 0 ? `PRODUTOS MAIS VENDIDOS:
${topSellingProducts.map((p, i) => `${i + 1}. ${p.name}`).join('\n')}` : ''}`
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
        customers_service_1.CustomersService,
        orders_service_1.OrdersService])
], OpenAIService);
//# sourceMappingURL=openai.service.js.map