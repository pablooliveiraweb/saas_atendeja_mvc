import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Obter a URL base da API
        const apiUrl = this.configService.get<string>('API_URL') || this.getBaseUrl(context);
        
        // Processar a resposta para adicionar a URL base às imagens
        return this.processResponse(data, apiUrl);
      }),
    );
  }

  private getBaseUrl(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const { protocol, headers, hostname } = request;
    
    // Obter a porta da configuração ou usar a porta padrão
    const port = this.configService.get<string>('PORT') || '3001';
    
    // Construir a URL base
    return `${protocol}://${hostname}:${port}`;
  }

  private processResponse(data: any, apiUrl: string): any {
    // Se for um array, processar cada item
    if (Array.isArray(data)) {
      return data.map(item => this.processResponse(item, apiUrl));
    }
    
    // Se for um objeto, processar os campos de imagem
    if (data && typeof data === 'object') {
      // Processar campos de imagem
      if (data.logo && typeof data.logo === 'string' && data.logo.startsWith('/uploads')) {
        data.logo = `${apiUrl}${data.logo}`;
      }
      
      if (data.coverImage && typeof data.coverImage === 'string' && data.coverImage.startsWith('/uploads')) {
        data.coverImage = `${apiUrl}${data.coverImage}`;
      }
      
      if (data.image && typeof data.image === 'string' && data.image.startsWith('/uploads')) {
        data.image = `${apiUrl}${data.image}`;
      }
      
      // Processar campos aninhados
      for (const key in data) {
        if (data[key] && typeof data[key] === 'object') {
          data[key] = this.processResponse(data[key], apiUrl);
        }
      }
    }
    
    return data;
  }
} 