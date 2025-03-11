"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    access: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        signOptions: {
            expiresIn: process.env.JWT_EXPIRATION || '1h',
        },
    },
    refresh: {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        signOptions: {
            expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
        },
    },
}));
//# sourceMappingURL=jwt.config.js.map