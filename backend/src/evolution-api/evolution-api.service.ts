import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface CreateInstanceOptions {
  instanceName: string;
  token?: string;
  number?: string;
  qrcode?: boolean;
  integration?: string;
  webhook?: {
    url: string;
    enabled: boolean;
  };
  webhook_by_events?: boolean;
  events?: string[];
  reject_call?: boolean;
  msg_call?: string;
  groupsIgnore?: boolean;
  alwaysOnline?: boolean;
  readMessages?: boolean;
  readStatus?: boolean;
  webhookUrl?: string;
  webhookByEvents?: boolean;
  webhookEvents?: string[];
}

@Injectable()
export class EvolutionApiService {
  private readonly logger = new Logger(EvolutionApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('evolutionApi.baseUrl') || 'https://evoapi.chatcontroll.com';
    this.apiKey = this.configService.get<string>('evolutionApi.apiKey') || 'a44dfaf7d2106d716ae1c0bf3fd12b8d';
  }

  /**
   * Cria uma nova instância na Evolution API
   * @param instanceName Nome da instância a ser criada
   * @param options Opções adicionais para a criação da instância
   * @returns Objeto com informações da instância criada
   */
  async createInstance(instanceName: string, options: Partial<CreateInstanceOptions> = {}): Promise<any> {
    try {
      this.logger.log(`Criando instância: ${instanceName}`);
      
      // Extrair o ID do restaurante do nome da instância (formato: restaurant_uuid)
      const restaurantId = instanceName.replace('restaurant_', '');
      this.logger.log(`ID do restaurante extraído: ${restaurantId}`);
      
      // Configurar um objeto de webhook adequado
      let webhookConfig: {url?: string, enabled: boolean} = { enabled: false };
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
      
      // Só adiciona webhook ao payload se é necessário
      if (webhookConfig.enabled && webhookConfig['url']) {
        payload['webhook'] = webhookConfig;
      }
      
      // Log detalhado do payload
      this.logger.log(`Payload da requisição para criar instância: ${JSON.stringify(payload)}`);
      this.logger.log(`URL da API: ${this.baseUrl}/instance/create`);
      this.logger.log(`API Key: ${this.apiKey}`);
      
      const response = await axios.post(
        `${this.baseUrl}/instance/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
        }
      );

      this.logger.log(`Instância criada: ${JSON.stringify(response.data)}`);
      
      // Configurar webhook após criar a instância
      try {
        // Obter a URL do backend
        const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
        // Criar URL do webhook com o ID do restaurante
        const webhookUrl = `${backendUrl}/api/ai/webhook`;
        
        await this.configureWebhook(instanceName, webhookUrl);
        this.logger.log(`Webhook configurado automaticamente para instância ${instanceName}`);
      } catch (webhookError) {
        this.logger.error(`Erro ao configurar webhook automaticamente: ${webhookError.message}`);
        // Não falhar a criação da instância se o webhook falhar
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao criar instância: ${error.message}`);
      
      // Log detalhado do erro
      if (error.response) {
        this.logger.error(`Detalhes do erro: Status ${error.response.status}`);
        this.logger.error(`Resposta de erro: ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(`Erro sem resposta: ${error}`);
      }
      
      throw error;
    }
  }

  /**
   * Conecta uma instância do WhatsApp
   * @param instanceName Nome da instância a ser conectada
   * @param phoneNumber Número de telefone opcional para conexão
   * @returns Objeto com informações da conexão
   */
  async connectInstance(instanceName: string, phoneNumber?: string): Promise<any> {
    try {
      if (!instanceName) {
        throw new Error('Nome da instância não fornecido');
      }
      
      // Verificar se o nome da instância começa com "restaurant_"
      if (!instanceName.startsWith('restaurant_')) {
        this.logger.warn(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
        throw new Error(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
      }
      
      this.logger.log(`Conectando instância: ${instanceName}`);
      
      // Verificar se a instância existe
      try {
        const statusResponse = await this.checkInstanceStatus(instanceName);
        
        // Se a instância não existir, criar uma nova
        if (statusResponse.instance?.state === 'not_found') {
          this.logger.log(`Instância ${instanceName} não encontrada. Criando nova instância...`);
          await this.createInstance(instanceName);
        }
      } catch (statusError) {
        this.logger.warn(`Erro ao verificar status da instância antes de conectar: ${statusError.message}`);
        // Continuar mesmo com erro, pois o endpoint de conexão pode criar a instância se necessário
      }
      
      let url = `${this.baseUrl}/instance/connect/${instanceName}`;
      if (phoneNumber) {
        url += `?number=${phoneNumber}`;
      }
      
      const response = await axios.get(
        url,
        {
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      // Log para debug: mostrar a resposta completa que inclui o qrcode em base64
      this.logger.log(`Instância conectada. Resposta inclui base64 QR code: ${response.data?.qrcode ? 'Sim' : 'Não'}`);
      
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao conectar instância ${instanceName}: ${error.message}`);
      
      // Se a instância não existir, tentar criar e conectar novamente
      if (error.response && error.response.status === 404) {
        try {
          this.logger.log(`Instância ${instanceName} não encontrada. Tentando criar e conectar novamente...`);
          await this.createInstance(instanceName);
          
          // Tentar conectar novamente após criar a instância
          let retryUrl = `${this.baseUrl}/instance/connect/${instanceName}`;
          if (phoneNumber) {
            retryUrl += `?number=${phoneNumber}`;
          }
          
          const retryResponse = await axios.get(
            retryUrl,
            {
              headers: {
                'apikey': this.apiKey,
              },
            }
          );
          
          this.logger.log(`Instância ${instanceName} conectada após criação`);
          return retryResponse.data;
        } catch (retryError) {
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

  /**
   * Verifica o status de uma instância
   * @param instanceName Nome da instância a ser verificada
   * @returns Objeto com informações do status da instância
   */
  async checkInstanceStatus(instanceName: string): Promise<any> {
    try {
      if (!instanceName) {
        throw new Error('Nome da instância não fornecido');
      }
      
      // Verificar se o nome da instância começa com "restaurant_"
      if (!instanceName.startsWith('restaurant_')) {
        this.logger.warn(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
        return { instance: { instanceName, state: 'invalid_name' } };
      }
      
      const response = await axios.get(
        `${this.baseUrl}/instance/connectionState/${instanceName}`,
        {
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao verificar status da instância ${instanceName}: ${error.message}`);
      
      // Se a instância não existir, retornar um objeto com estado "não encontrado"
      if (error.response && error.response.status === 404) {
        return { instance: { instanceName, state: 'not_found' } };
      }
      
      throw error;
    }
  }

  /**
   * Envia uma mensagem de texto via WhatsApp
   * @param instanceName Nome da instância a ser usada
   * @param number Número de telefone do destinatário
   * @param text Texto da mensagem
   * @param delay Atraso em milissegundos (opcional)
   * @returns Objeto com informações do envio da mensagem
   */
  async sendText(instanceName: string, number: string, text: string, delay: number = 1200): Promise<any> {
    try {
      this.logger.log(`Enviando mensagem para ${number} usando instância ${instanceName}`);
      
      // Formatar o número removendo caracteres não numéricos
      const formattedNumber = number.replace(/\D/g, '');
      
      // Garantir que o número tenha o prefixo 55 (Brasil)
      const phoneWithPrefix = formattedNumber.startsWith('55') ? formattedNumber : `55${formattedNumber}`;
      
      this.logger.log(`Número formatado: ${phoneWithPrefix}`);
      
      const response = await axios.post(
        `${this.baseUrl}/message/sendText/${instanceName}`,
        {
          number: phoneWithPrefix,
          text,
          delay,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
        }
      );

      this.logger.log(`Mensagem enviada: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deleta uma instância
   * @param instanceName Nome da instância a ser deletada
   * @returns Objeto com informações da deleção
   */
  async deleteInstance(instanceName: string): Promise<any> {
    try {
      this.logger.log(`Deletando instância: ${instanceName}`);
      
      const response = await axios.delete(
        `${this.baseUrl}/instance/delete/${instanceName}`,
        {
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      this.logger.log(`Instância deletada: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao deletar instância: ${error.message}`);
      throw error;
    }
  }

  /**
   * Desconecta uma instância
   * @param instanceName Nome da instância a ser desconectada
   * @returns Objeto com informações da desconexão
   */
  async disconnectInstance(instanceName: string): Promise<any> {
    try {
      this.logger.log(`Desconectando instância: ${instanceName}`);
      
      const response = await axios.get(
        `${this.baseUrl}/instance/logout/${instanceName}`,
        {
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      this.logger.log(`Instância desconectada: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao desconectar instância: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém o QR Code para conectar uma instância
   * @param instanceName Nome da instância
   * @returns Objeto com informações do QR Code
   */
  async getQrCode(instanceName: string): Promise<any> {
    try {
      if (!instanceName) {
        throw new Error('Nome da instância não fornecido');
      }
      
      // Verificar se o nome da instância começa com "restaurant_"
      if (!instanceName.startsWith('restaurant_')) {
        this.logger.warn(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
        throw new Error(`Nome da instância inválido: ${instanceName}. Deve começar com "restaurant_"`);
      }
      
      this.logger.log(`Obtendo QR Code para instância: ${instanceName}`);
      
      // Verificar se a instância existe
      try {
        const statusResponse = await this.checkInstanceStatus(instanceName);
        
        // Se a instância não existir, criar uma nova
        if (statusResponse.instance?.state === 'not_found') {
          this.logger.log(`Instância ${instanceName} não encontrada. Criando nova instância...`);
          await this.createInstance(instanceName);
        }
      } catch (statusError) {
        this.logger.warn(`Erro ao verificar status da instância antes de obter QR Code: ${statusError.message}`);
        // Continuar mesmo com erro, pois o endpoint de QR code pode criar a instância se necessário
      }
      
      const response = await axios.get(
        `${this.baseUrl}/instance/qrcode/${instanceName}`,
        {
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      this.logger.log(`QR Code obtido para instância ${instanceName}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao obter QR Code para instância ${instanceName}: ${error.message}`);
      
      // Se a instância não existir, tentar criar e obter QR code novamente
      if (error.response && error.response.status === 404) {
        try {
          this.logger.log(`Instância ${instanceName} não encontrada. Tentando criar e obter QR code novamente...`);
          await this.createInstance(instanceName);
          
          // Tentar obter QR code novamente após criar a instância
          const retryResponse = await axios.get(
            `${this.baseUrl}/instance/qrcode/${instanceName}`,
            {
              headers: {
                'apikey': this.apiKey,
              },
            }
          );
          
          this.logger.log(`QR Code obtido para instância ${instanceName} após criação`);
          return retryResponse.data;
        } catch (retryError) {
          this.logger.error(`Erro ao criar instância e obter QR code: ${retryError.message}`);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Busca todas as instâncias ou uma específica
   * @param instanceName Nome da instância (opcional)
   * @returns Lista de instâncias ou informações de uma instância específica
   */
  async fetchInstances(instanceName?: string): Promise<any> {
    try {
      this.logger.log(`Buscando instâncias${instanceName ? `: ${instanceName}` : ''}`);
      
      let url = `${this.baseUrl}/instance/fetchInstances`;
      if (instanceName) {
        url += `?instanceName=${instanceName}`;
      }
      
      const response = await axios.get(
        url,
        {
          headers: {
            'apikey': this.apiKey,
          },
        }
      );

      this.logger.log(`Instâncias obtidas com sucesso`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar instâncias: ${error.message}`);
      throw error;
    }
  }

  /**
   * Configura um webhook para uma instância
   * @param instanceName Nome da instância
   * @param webhookUrl URL do webhook (opcional)
   * @param events Lista de eventos para o webhook (opcional)
   * @returns Objeto com informações da configuração do webhook
   */
  async configureWebhook(
    instanceName: string, 
    webhookUrl?: string,
    events: string[] = ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']
  ): Promise<any> {
    try {
      this.logger.log(`Iniciando configuração do webhook para instância: ${instanceName}`);
      
      // Se não for fornecida uma URL, usar a URL padrão do backend
      const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
      
      // Incluir o ID do restaurante na URL do webhook
      const url = webhookUrl || `${backendUrl}/api/ai/webhook`;
      
      this.logger.log(`URL do webhook: ${url}`);
      this.logger.log(`URL base do backend: ${backendUrl}`);
      
      // Verificar se a URL é localhost
      if (url.includes('localhost')) {
        this.logger.warn(`ATENÇÃO: Você está usando localhost como URL do webhook (${url}).`);
        this.logger.warn(`A Evolution API não conseguirá acessar seu servidor local diretamente.`);
        this.logger.warn(`Considere usar o Ngrok para expor seu servidor local: ngrok http 3001`);
      }
      
      // Verificar se os eventos são um array válido e inicializar se necessário
      const validEvents = Array.isArray(events) ? events : ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'];
      
      // Configurar o webhook conforme a documentação
      const payload = {
        webhook: {
          enabled: true,
          url,
          events: validEvents,
          webhookByEvents: true,
          webhookBase64: false
        }
      };
      
      // Log após verificar o payload
      this.logger.log('Payload verificado com sucesso. Prosseguindo com a configuração do webhook.');
      
      // Usar o endpoint correto conforme a documentação
      const response = await axios.post(
        `${this.baseUrl}/webhook/set/${instanceName}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
        }
      );

      this.logger.log(`Webhook configurado para instância ${instanceName}: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao configurar webhook: ${error.message}`);
      if (error.response) {
        this.logger.error(`Detalhes do erro: Status ${error.response.status}`);
        this.logger.error(`Resposta de erro: ${JSON.stringify(error.response.data)}`);
        
        // Verificar erros específicos
        if (error.response.status === 400) {
          this.logger.error(`Erro 400: Requisição inválida. Verifique o formato dos eventos e a URL do webhook.`);
          this.logger.error(`A URL do webhook deve ser acessível pela internet. Localhost não é acessível externamente.`);
        }
      }
      throw error;
    }
  }

  async sendButton(url: string, payload: any): Promise<any> {
    try {
      this.logger.log(`Enviando botão para a URL: ${url}`);
      const response = await axios.post(
        url,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
        }
      );
      this.logger.log(`Botão enviado com sucesso: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao enviar botão: ${error.message}`);
      throw error;
    }
  }
}