import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RestaurantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.restaurantId;
  },
); 