import { ConfigService } from '@nestjs/config';
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
export declare class EvolutionApiService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(configService: ConfigService);
    createInstance(instanceName: string, options?: Partial<CreateInstanceOptions>): Promise<any>;
    connectInstance(instanceName: string, phoneNumber?: string): Promise<any>;
    checkInstanceStatus(instanceName: string): Promise<any>;
    sendText(instanceName: string, number: string, text: string, delay?: number): Promise<any>;
    deleteInstance(instanceName: string): Promise<any>;
    disconnectInstance(instanceName: string): Promise<any>;
    getQrCode(instanceName: string): Promise<any>;
    fetchInstances(instanceName?: string): Promise<any>;
    configureWebhook(instanceName: string, webhookUrl?: string, events?: string[]): Promise<any>;
}
export {};
