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
exports.PublicOrAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const rxjs_1 = require("rxjs");
let PublicOrAuthGuard = class PublicOrAuthGuard {
    reflector;
    jwtAuthGuard;
    constructor(reflector) {
        this.reflector = reflector;
        this.jwtAuthGuard = new jwt_auth_guard_1.JwtAuthGuard(reflector);
    }
    async canActivate(context) {
        try {
            const result = await this.jwtAuthGuard.canActivate(context);
            return result instanceof rxjs_1.Observable ? await (0, rxjs_1.firstValueFrom)(result) : result;
        }
        catch (error) {
            return true;
        }
    }
};
exports.PublicOrAuthGuard = PublicOrAuthGuard;
exports.PublicOrAuthGuard = PublicOrAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PublicOrAuthGuard);
//# sourceMappingURL=public-or-auth.guard.js.map