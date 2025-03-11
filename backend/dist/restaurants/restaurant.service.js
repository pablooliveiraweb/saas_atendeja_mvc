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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RestaurantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("./entities/restaurant.entity");
const evolution_api_service_1 = require("../evolution-api/evolution-api.service");
let RestaurantService = RestaurantService_1 = class RestaurantService {
    restaurantRepository;
    evolutionApiService;
    logger = new common_1.Logger(RestaurantService_1.name);
    constructor(restaurantRepository, evolutionApiService) {
        this.restaurantRepository = restaurantRepository;
        this.evolutionApiService = evolutionApiService;
    }
    async create(restaurantData, owner) {
        try {
            this.logger.log(`Criando restaurante para o usuário ${owner.email}`);
            const restaurant = this.restaurantRepository.create({
                ...restaurantData,
                owner,
            });
            const savedRestaurant = await this.restaurantRepository.save(restaurant);
            const instanceName = `restaurant_${savedRestaurant.id.substring(0, 8)}`;
            try {
                this.logger.log(`Criando instância na Evolution API: ${instanceName}`);
                const instanceResult = await this.evolutionApiService.createInstance(instanceName, {
                    token: '',
                    number: savedRestaurant.whatsappNumber || '',
                    qrcode: false,
                    webhook: {
                        url: '',
                        enabled: false,
                    },
                    webhook_by_events: false,
                    events: [],
                    reject_call: true,
                    msg_call: 'Desculpe, não podemos atender chamadas neste número. Por favor, envie uma mensagem de texto.',
                });
                savedRestaurant.evolutionApiInstanceName = instanceName;
                savedRestaurant.evolutionApiInstanceConnected = false;
                if (instanceResult && instanceResult.hash && instanceResult.hash.apikey) {
                    savedRestaurant.evolutionApiInstanceToken = instanceResult.hash.apikey;
                }
                await this.restaurantRepository.save(savedRestaurant);
                this.logger.log(`Instância criada com sucesso: ${instanceName}`);
            }
            catch (error) {
                this.logger.error(`Erro ao criar instância na Evolution API: ${error.message}`);
            }
            return savedRestaurant;
        }
        catch (error) {
            this.logger.error(`Erro ao criar restaurante: ${error.message}`);
            throw error;
        }
    }
    async findById(id) {
        return this.restaurantRepository.findOne({ where: { id } });
    }
    async update(id, updateData) {
        await this.restaurantRepository.update(id, updateData);
        const restaurant = await this.findById(id);
        if (!restaurant) {
            throw new Error(`Restaurante com ID ${id} não encontrado`);
        }
        return restaurant;
    }
    async connectWhatsAppInstance(id, phoneNumber) {
        const restaurant = await this.findById(id);
        if (!restaurant) {
            throw new Error(`Restaurante com ID ${id} não encontrado`);
        }
        if (!restaurant.evolutionApiInstanceName) {
            throw new Error(`Restaurante não possui uma instância configurada`);
        }
        try {
            const result = await this.evolutionApiService.connectInstance(restaurant.evolutionApiInstanceName, phoneNumber);
            await this.update(id, { evolutionApiInstanceConnected: true });
            return result;
        }
        catch (error) {
            this.logger.error(`Erro ao conectar instância: ${error.message}`);
            throw error;
        }
    }
    async getWhatsAppQrCode(id) {
        const restaurant = await this.findById(id);
        if (!restaurant) {
            throw new Error(`Restaurante com ID ${id} não encontrado`);
        }
        if (!restaurant.evolutionApiInstanceName) {
            throw new Error(`Restaurante não possui uma instância configurada`);
        }
        try {
            return this.evolutionApiService.connectInstance(restaurant.evolutionApiInstanceName);
        }
        catch (error) {
            this.logger.error(`Erro ao obter QR Code: ${error.message}`);
            throw error;
        }
    }
    async sendWhatsAppMessage(id, number, text) {
        const restaurant = await this.findById(id);
        if (!restaurant) {
            throw new Error(`Restaurante com ID ${id} não encontrado`);
        }
        if (!restaurant.evolutionApiInstanceName) {
            throw new Error(`Restaurante não possui uma instância configurada`);
        }
        try {
            const statusResponse = await this.evolutionApiService.checkInstanceStatus(restaurant.evolutionApiInstanceName);
            const instanceState = statusResponse.instance?.state?.toLowerCase();
            if (instanceState !== 'open' && instanceState !== 'connected') {
                this.logger.log(`Instância ${restaurant.evolutionApiInstanceName} não está conectada (status: ${instanceState}). Tentando conectar...`);
                await this.evolutionApiService.connectInstance(restaurant.evolutionApiInstanceName);
                const newStatusResponse = await this.evolutionApiService.checkInstanceStatus(restaurant.evolutionApiInstanceName);
                const newInstanceState = newStatusResponse.instance?.state?.toLowerCase();
                if (newInstanceState !== 'open' && newInstanceState !== 'connected') {
                    throw new Error(`Não foi possível conectar a instância ${restaurant.evolutionApiInstanceName}. Status atual: ${newInstanceState}`);
                }
            }
            return this.evolutionApiService.sendText(restaurant.evolutionApiInstanceName, number, text);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem para o restaurante ${id}: ${error.message}`);
            throw error;
        }
    }
};
exports.RestaurantService = RestaurantService;
exports.RestaurantService = RestaurantService = RestaurantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        evolution_api_service_1.EvolutionApiService])
], RestaurantService);
//# sourceMappingURL=restaurant.service.js.map