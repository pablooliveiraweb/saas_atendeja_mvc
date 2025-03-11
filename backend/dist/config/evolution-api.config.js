"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('evolutionApi', () => ({
    baseUrl: process.env.EVOLUTION_API_URL || 'https://evoapi.chatcontroll.com',
    apiKey: process.env.EVOLUTION_API_KEY || 'a44dfaf7d2106d716ae1c0bf3fd12b8d',
}));
//# sourceMappingURL=evolution-api.config.js.map