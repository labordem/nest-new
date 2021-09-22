import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Account, Role } from '../../accounts/entities/account.entity';
import { ExceptionError } from '../../common/enums/exception-error.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user: Account }>();
    const account = request.user;
    if (!account?.isConfirmed) {
      throw new ForbiddenException({
        error: ExceptionError.FORBIDDEN_NOT_A_CONFIRMED_ACCOUNT,
      });
    }
    if (!account?.roles) {
      return false;
    }
    const isAdmin = !!account.roles.find((role) => role === 'admin');
    if (isAdmin) {
      return true;
    }
    const hasSomeRequiredRole = account.roles.some((role) =>
      requiredRoles?.includes(role),
    );

    return hasSomeRequiredRole;
  }
}
