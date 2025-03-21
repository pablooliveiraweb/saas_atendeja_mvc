"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantId = void 0;
const common_1 = require("@nestjs/common");
exports.RestaurantId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.restaurantId;
});
//# sourceMappingURL=restaurant-id.decorator.js.map