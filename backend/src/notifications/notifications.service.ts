import { Injectable, Logger } from '@nestjs/common';
import { EvolutionApiService } from '../evolution-api/evolution-api.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly senderEmail = 'comercial@chatcontroll.com';
  private readonly senderName = 'Atende+ | ChatControll';

  constructor(
    private readonly evolutionApiService: EvolutionApiService,
  ) {}

  /**
   * Envia uma notificação por WhatsApp
   * @param phoneNumber Número de telefone do destinatário
   * @param message Mensagem a ser enviada
   * @param instanceName Nome da instância do WhatsApp (opcional)
   * @returns Resultado do envio
   */
  async sendWhatsAppMessage(phoneNumber: string, message: string, instanceName?: string): Promise<any> {
    try {
      this.logger.log(`Enviando mensagem WhatsApp para ${phoneNumber}`);
      
      // Verificar se foi fornecido um nome de instância
      if (!instanceName) {
        throw new Error('Nome da instância não fornecido. É necessário especificar a instância do restaurante.');
      }
      
      // Enviar a mensagem usando o serviço da Evolution API
      const result = await this.evolutionApiService.sendText(instanceName, phoneNumber, message);
      
      this.logger.log(`Mensagem WhatsApp enviada com sucesso para ${phoneNumber}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem WhatsApp para ${phoneNumber}: ${error.message}`);
      // Não propagar o erro para não interromper o fluxo principal
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia uma notificação por e-mail (simulado por enquanto)
   * @param email E-mail do destinatário
   * @param subject Assunto do e-mail
   * @param body Corpo do e-mail
   * @returns Resultado do envio
   */
  async sendEmail(email: string, subject: string, body: string): Promise<any> {
    try {
      this.logger.log(`Enviando e-mail para ${email} com assunto "${subject}"`);
      
      // Por enquanto, apenas simular o envio de e-mail com logs
      // TODO: Implementar integração real com serviço de e-mail
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
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail para ${email}: ${error.message}`);
      // Não propagar o erro para não interromper o fluxo principal
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia as credenciais de acesso por e-mail
   * @param name Nome do usuário
   * @param email E-mail do usuário
   * @param password Senha temporária
   * @param restaurantName Nome do restaurante
   * @returns Resultado do envio
   */
  async sendAccessCredentials(
    name: string,
    email: string,
    password: string,
    restaurantName: string
  ): Promise<any> {
    // Preparar o corpo do e-mail
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

    // Enviar por e-mail
    const emailResult = await this.sendEmail(email, `Bem-vindo ao Atende+ - Dados de Acesso`, emailBody);
    
    return {
      email: emailResult
    };
  }
} 