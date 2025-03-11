import { EvolutionApiService } from './evolution-api.service';
export declare class EvolutionApiController {
    private readonly evolutionApiService;
    constructor(evolutionApiService: EvolutionApiService);
    createInstance(body: any): Promise<any>;
    fetchInstances(instanceName?: string): Promise<any>;
    connectInstance(instanceName: string, phoneNumber?: string): Promise<any>;
    checkInstanceStatus(instanceName: string): Promise<any>;
    sendText(instanceName: string, body: {
        number: string;
        text: string;
        delay?: number;
    }): Promise<any>;
    deleteInstance(instanceName: string): Promise<any>;
    disconnectInstance(instanceName: string): Promise<any>;
    getQrCode(instanceName: string): Promise<any>;
}
