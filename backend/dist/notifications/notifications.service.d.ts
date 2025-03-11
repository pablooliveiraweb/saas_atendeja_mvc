import { EvolutionApiService } from '../evolution-api/evolution-api.service';
export declare class NotificationsService {
    private readonly evolutionApiService;
    private readonly logger;
    private readonly senderEmail;
    private readonly senderName;
    constructor(evolutionApiService: EvolutionApiService);
    sendWhatsAppMessage(phoneNumber: string, message: string, instanceName?: string): Promise<any>;
    sendEmail(email: string, subject: string, body: string): Promise<any>;
    sendAccessCredentials(name: string, email: string, password: string, restaurantName: string): Promise<any>;
}
