"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const schedule_1 = require("@nestjs/schedule");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const customers_module_1 = require("./customers/customers.module");
const restaurant_module_1 = require("./restaurants/restaurant.module");
const orders_module_1 = require("./orders/orders.module");
const order_entity_1 = require("./orders/entities/order.entity");
const order_item_entity_1 = require("./orders/entities/order-item.entity");
const restaurant_entity_1 = require("./restaurants/entities/restaurant.entity");
const category_entity_1 = require("./categories/entities/category.entity");
const product_entity_1 = require("./products/entities/product.entity");
const user_entity_1 = require("./users/entities/user.entity");
const customer_entity_1 = require("./customers/entities/customer.entity");
const evolution_api_module_1 = require("./evolution-api/evolution-api.module");
const notifications_module_1 = require("./notifications/notifications.module");
const ai_module_1 = require("./ai/ai.module");
const conversation_entity_1 = require("./ai/entities/conversation.entity");
const message_entity_1 = require("./ai/entities/message.entity");
const evolution_api_config_1 = require("./config/evolution-api.config");
const core_1 = require("@nestjs/core");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [evolution_api_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST', 'localhost'),
                    port: configService.get('DATABASE_PORT', 5432),
                    username: configService.get('DATABASE_USERNAME', 'postgres'),
                    password: configService.get('DATABASE_PASSWORD', 'Cpu031191'),
                    database: configService.get('DATABASE_NAME', 'atende'),
                    entities: [restaurant_entity_1.Restaurant, category_entity_1.Category, product_entity_1.Product, user_entity_1.User, order_entity_1.Order, order_item_entity_1.OrderItem, customer_entity_1.Customer, conversation_entity_1.Conversation, message_entity_1.Message],
                    synchronize: true,
                    logging: configService.get('DATABASE_LOGGING', false),
                    ssl: false,
                }),
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
                serveStaticOptions: {
                    index: false,
                    redirect: false
                }
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([restaurant_entity_1.Restaurant, category_entity_1.Category, product_entity_1.Product, user_entity_1.User, order_entity_1.Order, order_item_entity_1.OrderItem, customer_entity_1.Customer, conversation_entity_1.Conversation, message_entity_1.Message]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            customers_module_1.CustomersModule,
            restaurant_module_1.RestaurantModule,
            orders_module_1.OrdersModule,
            evolution_api_module_1.EvolutionApiModule,
            notifications_module_1.NotificationsModule,
            ai_module_1.AIModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map