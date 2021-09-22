import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Account } from '../../accounts/entities/account.entity';
import { UserJwtPayload } from '../models/jwt-payload.model';

/**
 * Get user object from Passport.js
 * - isAccount : Recover the complete Account from login method, must be used with LocalAuthGuard.
 * - !isAccount (default) : Recover the user object from jwt payload, must be used with JwtAuthGuard (included in RolesDecorator).
 */
export const User = createParamDecorator(
  (isAccount = false, context: ExecutionContext) => {
    let request: { user: Account | UserJwtPayload };

    if (isAccount) {
      request = context.switchToHttp().getRequest<{ user: Account }>();
    } else {
      request = context.switchToHttp().getRequest<{ user: UserJwtPayload }>();
    }

    return request.user;
  },
);
