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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restaurant = exports.SubscriptionPlan = exports.RestaurantStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
var RestaurantStatus;
(function (RestaurantStatus) {
    RestaurantStatus["ACTIVE"] = "active";
    RestaurantStatus["INACTIVE"] = "inactive";
    RestaurantStatus["PENDING"] = "pending";
    RestaurantStatus["PENDING_WHATSAPP"] = "pending_whatsapp";
})(RestaurantStatus || (exports.RestaurantStatus = RestaurantStatus = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["BASIC"] = "basic";
    SubscriptionPlan["STANDARD"] = "standard";
    SubscriptionPlan["PREMIUM"] = "premium";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
let Restaurant = class Restaurant {
    id;
    name;
    logo;
    description;
    phone;
    address;
    neighborhood;
    city;
    state;
    postalCode;
    status;
    subscriptionPlan;
    stripeCustomerId;
    stripeSubscriptionId;
    deliveryEnabled;
    deliveryFee;
    minimumOrderValue;
    acceptsCash;
    acceptsCard;
    acceptsPix;
    operatingHours;
    whatsappNumber;
    whatsappNotificationsEnabled;
    autoPrintEnabled;
    printerConfigs;
    evolutionApiInstanceName;
    evolutionApiInstanceToken;
    evolutionApiInstanceConnected;
    owner;
    orders;
    createdAt;
    updatedAt;
};
exports.Restaurant = Restaurant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Restaurant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Restaurant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 14 }),
    __metadata("design:type", String)
], Restaurant.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Restaurant.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "neighborhood", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Restaurant.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2 }),
    __metadata("design:type", String)
], Restaurant.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 8 }),
    __metadata("design:type", String)
], Restaurant.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RestaurantStatus,
        default: RestaurantStatus.PENDING,
    }),
    __metadata("design:type", String)
], Restaurant.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SubscriptionPlan,
        default: SubscriptionPlan.BASIC,
    }),
    __metadata("design:type", String)
], Restaurant.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "stripeCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "stripeSubscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Restaurant.prototype, "deliveryEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Restaurant.prototype, "deliveryFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Restaurant.prototype, "minimumOrderValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Restaurant.prototype, "acceptsCash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Restaurant.prototype, "acceptsCard", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Restaurant.prototype, "acceptsPix", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '{}', type: 'json' }),
    __metadata("design:type", String)
], Restaurant.prototype, "operatingHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "whatsappNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Restaurant.prototype, "whatsappNotificationsEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Restaurant.prototype, "autoPrintEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '{}', type: 'json' }),
    __metadata("design:type", String)
], Restaurant.prototype, "printerConfigs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "evolutionApiInstanceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "evolutionApiInstanceToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Restaurant.prototype, "evolutionApiInstanceConnected", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Restaurant.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.restaurant),
    __metadata("design:type", Array)
], Restaurant.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Restaurant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Restaurant.prototype, "updatedAt", void 0);
exports.Restaurant = Restaurant = __decorate([
    (0, typeorm_1.Entity)('restaurants')
], Restaurant);
//# sourceMappingURL=restaurant.entity.js.map