import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
export declare class TransformInterceptor implements NestInterceptor {
    private configService;
    constructor(configService: ConfigService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private getBaseUrl;
    private processResponse;
}
