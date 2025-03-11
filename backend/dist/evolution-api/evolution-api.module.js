"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionApiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const evolution_api_service_1 = require("./evolution-api.service");
const evolution_api_controller_1 = require("./evolution-api.controller");
const evolution_api_config_1 = require("../config/evolution-api.config");
let EvolutionApiModule = class EvolutionApiModule {
};
exports.EvolutionApiModule = EvolutionApiModule;
exports.EvolutionApiModule = EvolutionApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(evolution_api_config_1.default),
        ],
        controllers: [evolution_api_controller_1.EvolutionApiController],
        providers: [evolution_api_service_1.EvolutionApiService],
        exports: [evolution_api_service_1.EvolutionApiService],
    })
], EvolutionApiModule);
//# sourceMappingURL=evolution-api.module.js.map