import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Account } from '../../accounts/entities/account.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user: Account }>();
    const account = request.user;
    if (!account?.isConfirmed || !account?.roles) {
      return false;
    }
    const isAdmin = !!account.roles.find((role) => role === 'admin');
    if (isAdmin) {
      return true;
    }
    const hasSomeRequiredRole = account.roles.some((role) =>
      account.roles?.includes(role),
    );

    return hasSomeRequiredRole;
  }
}
