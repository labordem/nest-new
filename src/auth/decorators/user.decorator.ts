import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Account } from '../../accounts/entities/account.entity';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: Account }>();

    return request.user;
  },
);
