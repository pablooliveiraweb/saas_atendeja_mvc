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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const config_1 = require("@nestjs/config");
let TransformInterceptor = class TransformInterceptor {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)(data => {
            const apiUrl = this.configService.get('API_URL') || this.getBaseUrl(context);
            return this.processResponse(data, apiUrl);
        }));
    }
    getBaseUrl(context) {
        const request = context.switchToHttp().getRequest();
        const { protocol, headers, hostname } = request;
        const port = this.configService.get('PORT') || '3001';
        return `${protocol}://${hostname}:${port}`;
    }
    processResponse(data, apiUrl) {
        if (Array.isArray(data)) {
            return data.map(item => this.processResponse(item, apiUrl));
        }
        if (data && typeof data === 'object') {
            if (data.logo && typeof data.logo === 'string' && data.logo.startsWith('/uploads')) {
                data.logo = `${apiUrl}${data.logo}`;
            }
            if (data.coverImage && typeof data.coverImage === 'string' && data.coverImage.startsWith('/uploads')) {
                data.coverImage = `${apiUrl}${data.coverImage}`;
            }
            if (data.image && typeof data.image === 'string' && data.image.startsWith('/uploads')) {
                data.image = `${apiUrl}${data.image}`;
            }
            for (const key in data) {
                if (data[key] && typeof data[key] === 'object') {
                    data[key] = this.processResponse(data[key], apiUrl);
                }
            }
        }
        return data;
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TransformInterceptor);
//# sourceMappingURL=transform.interceptor.js.map