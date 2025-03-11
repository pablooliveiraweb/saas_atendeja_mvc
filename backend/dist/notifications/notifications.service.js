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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const evolution_api_service_1 = require("../evolution-api/evolution-api.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    evolutionApiService;
    logger = new common_1.Logger(NotificationsService_1.name);
    senderEmail = 'comercial@chatcontroll.com';
    senderName = 'Atende+ | ChatControll';
    constructor(evolutionApiService) {
        this.evolutionApiService = evolutionApiService;
    }
    async sendWhatsAppMessage(phoneNumber, message, instanceName) {
        try {
            this.logger.log(`Enviando mensagem WhatsApp para ${phoneNumber}`);
            if (!instanceName) {
                throw new Error('Nome da instância não fornecido. É necessário especificar a instância do restaurante.');
            }
            const result = await this.evolutionApiService.sendText(instanceName, phoneNumber, message);
            this.logger.log(`Mensagem WhatsApp enviada com sucesso para ${phoneNumber}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem WhatsApp para ${phoneNumber}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async sendEmail(email, subject, body) {
        try {
            this.logger.log(`Enviando e-mail para ${email} com assunto "${subject}"`);
            this.logger.log(`De: ${this.senderName} <${this.senderEmail}>`);
            this.logger.log(`Para: ${email}`);
            this.logger.log(`Assunto: ${subject}`);
            this.logger.log(`Conteúdo do e-mail: ${body}`);
            this.logger.log(`E-mail enviado com sucesso para ${email}`);
            return {
                success: true,
                message: 'E-mail enviado com sucesso (simulado)',
                from: `${this.senderName} <${this.senderEmail}>`,
                to: email,
                subject: subject
            };
        }
        catch (error) {
            this.logger.error(`Erro ao enviar e-mail para ${email}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async sendAccessCredentials(name, email, password, restaurantName) {
        const emailBody = `
<h1>Bem-vindo ao Atende+, ${name}!</h1>
<p>Seu restaurante <strong>${restaurantName}</strong> foi registrado com sucesso em nossa plataforma.</p>
<h2>Seus dados de acesso:</h2>
<p><strong>E-mail:</strong> ${email}</p>
<p><strong>Senha temporária:</strong> ${password}</p>
<p>Acesse nossa plataforma em: <a href="https://app.atendeplus.com.br">https://app.atendeplus.com.br</a></p>
<p>Recomendamos que você altere sua senha após o primeiro acesso.</p>
<p>Se precisar de ajuda, estamos à disposição!</p>
<br>
<p>Atenciosamente,</p>
<p><strong>Equipe Atende+</strong></p>
<p><em>Um produto ChatControll</em></p>
`;
        const emailResult = await this.sendEmail(email, `Bem-vindo ao Atende+ - Dados de Acesso`, emailBody);
        return {
            email: emailResult
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [evolution_api_service_1.EvolutionApiService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map