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
var EvolutionApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let EvolutionApiService = EvolutionApiService_1 = class EvolutionApiService {
    configService;
    logger = new common_1.Logger(EvolutionApiService_1.name);
    baseUrl;
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = this.configService.get('evolutionApi.baseUrl') || 'https://evoapi.chatcontroll.com';
        this.apiKey = this.configService.get('evolutionApi.apiKey') || 'a44dfaf7d2106d716ae1c0bf3fd12b8d';
    }
    async createInstance(instanceName, options = {}) {
        try {
            this.logger.log(`Criando instância: ${instanceName}`);
            const restaurantId = instanceName.replace('restaurant_', '');
            this.logger.log(`ID do restaurante extraído: ${restaurantId}`);
            let webhookConfig = { enabled: false };
            if (options.webhook && options.webhook.url && options.webhook.url.trim() !== '') {
                webhookConfig = {
                    url: options.webhook.url,
                    enabled: options.webhook.enabled || false
                };
            }
            const payload = {
                instanceName,
                token: options.token || '',
                number: options.number || '',
                qrcode: options.qrcode !== undefined ? options.qrcode : false,
                integration: options.integration || 'WHATSAPP-BAILEYS',
                reject_call: options.reject_call !== undefined ? options.reject_call : true,
                msgCall: options.msg_call || 'Desculpe, não podemos atender chamadas neste número. Por favor, envie uma mensagem de texto.',
                groupsIgnore: options.groupsIgnore || true,
                alwaysOnline: options.alwaysOnline || true,
                readMessages: options.readMessages || true,
                readStatus: options.readStatus || true,
                webhookByEvents: options.webhook_by_events || false,
                webhookEvents: options.events || [],
            };
            if (webhookConfig.enabled && webhookConfig['url']) {
                payload['webhook'] = webhookConfig;
            }
            this.logger.log(`Payload da requisição para criar instância: ${JSON.stringify(payload)}`);
            this.logger.log(`URL da API: ${this.baseUrl}/instance/create`);
            this.logger.log(`API Key: ${this.apiKey}`);
            const response = await axios_1.default.post(`${this.baseUrl}/instance/create`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey,
                },
            });
            this.logger.log(`Instância criada: ${JSON.stringify(response.data)}`);
            try {
                const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3001';
                const webhookUrl = `${backendUrl}/api/ai/webhook`;
                await this.configureWebhook(instanceName, webhookUrl);
                this.logger.log(`Webhook configurado automaticamente para instância ${instanceName}`);
            }
            catch (webhookError) {
                this.logger.error(`Erro ao configurar webhook automaticamente: ${webhookError.message}`);
            }
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao criar instância: ${error.message}`);
            if (error.response) {
                this.logger.error(`Detalhes do erro: Status ${error.response.status}`);
                this.logger.error(`Resposta de erro: ${JSON.stringify(error.response.data)}`);
            }
            else {
                this.logger.error(`Erro sem resposta: ${error}`);
            }
            throw error;
        }
    }
    async connectInstance(instanceName, phoneNumber) {
        try {
            if (!instanceName) {
                throw new Error('Nome da instância não fornecido');
            }
            if (!instanceName.startsWith('restaurant_')) {
                this.logger.warn(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
                throw new Error(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
            }
            this.logger.log(`Conectando instância: ${instanceName}`);
            try {
                const statusResponse = await this.checkInstanceStatus(instanceName);
                if (statusResponse.instance?.state === 'not_found') {
                    this.logger.log(`Instância ${instanceName} não encontrada. Criando nova instância...`);
                    await this.createInstance(instanceName);
                }
            }
            catch (statusError) {
                this.logger.warn(`Erro ao verificar status da instância antes de conectar: ${statusError.message}`);
            }
            let url = `${this.baseUrl}/instance/connect/${instanceName}`;
            if (phoneNumber) {
                url += `?number=${phoneNumber}`;
            }
            const response = await axios_1.default.get(url, {
                headers: {
                    'apikey': this.apiKey,
                },
            });
            this.logger.log(`Instância conectada. Resposta inclui base64 QR code: ${response.data?.qrcode ? 'Sim' : 'Não'}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao conectar instância ${instanceName}: ${error.message}`);
            if (error.response && error.response.status === 404) {
                try {
                    this.logger.log(`Instância ${instanceName} não encontrada. Tentando criar e conectar novamente...`);
                    await this.createInstance(instanceName);
                    let retryUrl = `${this.baseUrl}/instance/connect/${instanceName}`;
                    if (phoneNumber) {
                        retryUrl += `?number=${phoneNumber}`;
                    }
                    const retryResponse = await axios_1.default.get(retryUrl, {
                        headers: {
                            'apikey': this.apiKey,
                        },
                    });
                    this.logger.log(`Instância ${instanceName} conectada após criação`);
                    return retryResponse.data;
                }
                catch (retryError) {
                    this.logger.error(`Erro ao criar instância e conectar: ${retryError.message}`);
                    throw retryError;
                }
            }
            if (error.response) {
                this.logger.error(`Detalhes do erro: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    async checkInstanceStatus(instanceName) {
        try {
            if (!instanceName) {
                throw new Error('Nome da instância não fornecido');
            }
            if (!instanceName.startsWith('restaurant_')) {
                this.logger.warn(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
                return { instance: { instanceName, state: 'invalid_name' } };
            }
            const response = await axios_1.default.get(`${this.baseUrl}/instance/connectionState/${instanceName}`, {
                headers: {
                    'apikey': this.apiKey,
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao verificar status da instância ${instanceName}: ${error.message}`);
            if (error.response && error.response.status === 404) {
                return { instance: { instanceName, state: 'not_found' } };
            }
            throw error;
        }
    }
    async sendText(instanceName, number, text, delay = 1200) {
        try {
            this.logger.log(`Enviando mensagem para ${number} usando instância ${instanceName}`);
            const formattedNumber = number.replace(/\D/g, '');
            const phoneWithPrefix = formattedNumber.startsWith('55') ? formattedNumber : `55${formattedNumber}`;
            this.logger.log(`Número formatado: ${phoneWithPrefix}`);
            const response = await axios_1.default.post(`${this.baseUrl}/message/sendText/${instanceName}`, {
                number: phoneWithPrefix,
                text,
                delay,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey,
                },
            });
            this.logger.log(`Mensagem enviada: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem: ${error.message}`);
            throw error;
        }
    }
    async deleteInstance(instanceName) {
        try {
            this.logger.log(`Deletando instância: ${instanceName}`);
            const response = await axios_1.default.delete(`${this.baseUrl}/instance/delete/${instanceName}`, {
                headers: {
                    'apikey': this.apiKey,
                },
            });
            this.logger.log(`Instância deletada: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao deletar instância: ${error.message}`);
            throw error;
        }
    }
    async disconnectInstance(instanceName) {
        try {
            this.logger.log(`Desconectando instância: ${instanceName}`);
            const response = await axios_1.default.get(`${this.baseUrl}/instance/logout/${instanceName}`, {
                headers: {
                    'apikey': this.apiKey,
                },
            });
            this.logger.log(`Instância desconectada: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao desconectar instância: ${error.message}`);
            throw error;
        }
    }
    async getQrCode(instanceName) {
        try {
            if (!instanceName) {
                throw new Error('Nome da instância não fornecido');
            }
            if (!instanceName.startsWith('restaurant_')) {
                this.logger.warn(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
                throw new Error(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
            }
            this.logger.log(`Obtendo QR Code para instância: ${instanceName}`);
            try {
                const statusResponse = await this.checkInstanceStatus(instanceName);
                if (statusResponse.instance?.state === 'not_found') {
                    this.logger.log(`Instância ${instanceName} não encontrada. Criando nova instância...`);
                    await this.createInstance(instanceName);
                }
            }
            catch (statusError) {
                this.logger.warn(`Erro ao verificar status da instância antes de obter QR Code: ${statusError.message}`);
            }
            const response = await axios_1.default.get(`${this.baseUrl}/instance/qrcode/${instanceName}`, {
                headers: {
                    'apikey': this.apiKey,
                },
            });
            this.logger.log(`QR Code obtido para instância ${instanceName}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao obter QR Code para instância ${instanceName}: ${error.message}`);
            if (error.response && error.response.status === 404) {
                try {
                    this.logger.log(`Instância ${instanceName} não encontrada. Tentando criar e obter QR code novamente...`);
                    await this.createInstance(instanceName);
                    const retryResponse = await axios_1.default.get(`${this.baseUrl}/instance/qrcode/${instanceName}`, {
                        headers: {
                            'apikey': this.apiKey,
                        },
                    });
                    this.logger.log(`QR Code obtido para instância ${instanceName} após criação`);
                    return retryResponse.data;
                }
                catch (retryError) {
                    this.logger.error(`Erro ao criar instância e obter QR code: ${retryError.message}`);
                    throw retryError;
                }
            }
            throw error;
        }
    }
    async fetchInstances(instanceName) {
        try {
            this.logger.log(`Buscando instâncias${instanceName ? `: ${instanceName}` : ''}`);
            let url = `${this.baseUrl}/instance/fetchInstances`;
            if (instanceName) {
                url += `?instanceName=${instanceName}`;
            }
            const response = await axios_1.default.get(url, {
                headers: {
                    'apikey': this.apiKey,
                },
            });
            this.logger.log(`Instâncias obtidas com sucesso`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar instâncias: ${error.message}`);
            throw error;
        }
    }
    async configureWebhook(instanceName, webhookUrl, events = ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']) {
        try {
            this.logger.log(`Iniciando configuração do webhook para instância: ${instanceName}`);
            const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3001';
            const url = webhookUrl || `${backendUrl}/api/ai/webhook`;
            this.logger.log(`URL do webhook: ${url}`);
            this.logger.log(`URL base do backend: ${backendUrl}`);
            if (url.includes('localhost')) {
                this.logger.warn(`ATENÇÃO: Você está usando localhost como URL do webhook (${url}).`);
                this.logger.warn(`A Evolution API não conseguirá acessar seu servidor local diretamente.`);
                this.logger.warn(`Considere usar o Ngrok para expor seu servidor local: ngrok http 3001`);
            }
            const validEvents = Array.isArray(events) ? events : ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'];
            const payload = {
                webhook: {
                    enabled: true,
                    url,
                    events: validEvents,
                    webhookByEvents: true,
                    webhookBase64: false
                }
            };
            this.logger.log('Payload verificado com sucesso. Prosseguindo com a configuração do webhook.');
            const response = await axios_1.default.post(`${this.baseUrl}/webhook/set/${instanceName}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey,
                },
            });
            this.logger.log(`Webhook configurado para instância ${instanceName}: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Erro ao configurar webhook: ${error.message}`);
            if (error.response) {
                this.logger.error(`Detalhes do erro: Status ${error.response.status}`);
                this.logger.error(`Resposta de erro: ${JSON.stringify(error.response.data)}`);
                if (error.response.status === 400) {
                    this.logger.error(`Erro 400: Requisição inválida. Verifique o formato dos eventos e a URL do webhook.`);
                    this.logger.error(`A URL do webhook deve ser acessível pela internet. Localhost não é acessível externamente.`);
                }
            }
            throw error;
        }
    }
};
exports.EvolutionApiService = EvolutionApiService;
exports.EvolutionApiService = EvolutionApiService = EvolutionApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EvolutionApiService);
//# sourceMappingURL=evolution-api.service.js.map