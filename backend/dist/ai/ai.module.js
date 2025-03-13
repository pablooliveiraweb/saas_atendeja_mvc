"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const common_1 = require("@nestjs/common");
const openai_service_1 = require("./openai.service");
const conversation_service_1 = require("./conversation.service");
const products_module_1 = require("../products/products.module");
const categories_module_1 = require("../categories/categories.module");
const restaurant_module_1 = require("../restaurants/restaurant.module");
const typeorm_1 = require("@nestjs/typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
const ai_controller_1 = require("./ai.controller");
const customers_module_1 = require("../customers/customers.module");
const evolution_api_module_1 = require("../evolution-api/evolution-api.module");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const orders_module_1 = require("../orders/orders.module");
let AIModule = class AIModule {
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([conversation_entity_1.Conversation, message_entity_1.Message, restaurant_entity_1.Restaurant]),
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            restaurant_module_1.RestaurantModule,
            customers_module_1.CustomersModule,
            evolution_api_module_1.EvolutionApiModule,
            orders_module_1.OrdersModule,
        ],
        controllers: [ai_controller_1.AIController],
        providers: [openai_service_1.OpenAIService, conversation_service_1.ConversationService],
        exports: [openai_service_1.OpenAIService, conversation_service_1.ConversationService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map